import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRoutePermissions } from '@/config/permissions';

// Danh sách các route public (không cần đăng nhập)
const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/',
    '/product/(.*)',
    '/api/(.*)', // Các endpoint API thường có guard riêng hoặc public
];

// Danh sách các route yêu cầu quyền admin
const adminPaths = ['/admin(.*)'];

// Danh sách các route dành cho người bán
const sellerPaths = ['/seller(.*)'];

// Danh sách các route user thông thường (chỉ cần đăng nhập, không cần permissions đặc biệt)
const userRoutes = ['/cart', '/profile', '/orders'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Normalize pathname (remove trailing slash)
    const normalizedPathname = pathname.replace(/\/$/, '') || '/';
    
    // Cho phép API routes luôn
    if (normalizedPathname.startsWith('/api')) {
        return NextResponse.next();
    }
    
    // Cho phép user routes (chỉ cần đăng nhập)
    const isUserRoute = userRoutes.some(route => normalizedPathname.startsWith(route));
    if (isUserRoute) {
        return NextResponse.next();
    }

    // 1. Kiểm tra nếu là public path
    const isPublicPath = publicPaths.some(path => {
        if (path.includes('(.*)')) {
            const regex = new RegExp(`^${path.replace('(.*)', '.*')}$`);
            return regex.test(normalizedPathname);
        }
        return normalizedPathname === path;
    });

    // Lấy access_token và refresh_token từ cookie
    const token = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // 2. Nếu truy cập trang bảo vệ mà không có cả access_token và refresh_token -> Redirect về Login
    // Nếu chỉ thiếu access_token nhưng còn refresh_token, cho phép vào để Axios interceptor xử lý refresh
    if (!isPublicPath && !token && !refreshToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        // Lưu lại url định truy cập để sau khi login quay lại
        url.searchParams.set('callbackUrl', normalizedPathname);
        return NextResponse.redirect(url);
    }
    
    // Lấy userRole sớm để dùng cho redirect logic
    const userRole = request.cookies.get('user_role')?.value;

    // 3. Nếu đã đăng nhập mà cố vào trang Login/Register -> Redirect về trang phù hợp với role
    if (token && (normalizedPathname === '/login' || normalizedPathname === '/register')) {
        // Redirect về trang phù hợp với role của user
        const redirectPath = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' 
            ? '/admin' 
            : '/'; // CUSTOMER hoặc SELLER về trang chủ
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // 4. Kiểm tra quyền hạn nâng cao (Dựa vào User Role & Permissions)
    const permissionsStr = request.cookies.get('user_permissions')?.value;
    let userPermissions: string[] = [];

    try {
        if (permissionsStr) {
            userPermissions = JSON.parse(decodeURIComponent(permissionsStr));
        }
    } catch (e) {
        console.error('Failed to parse permissions cookie', e);
    }

    // Đặc cách cho SUPER_ADMIN
    if (userRole === 'SUPER_ADMIN') return NextResponse.next();

    if (token) {
        // A. Kiểm tra Role-based Paths
        const isAdminPath = adminPaths.some(path =>
            new RegExp(`^${path.replace('(.*)', '.*')}$`).test(normalizedPathname),
        );
        if (isAdminPath && userRole !== 'ADMIN') {
            return NextResponse.redirect(new URL('/403', request.url));
        }

        const isSellerPath = sellerPaths.some(path =>
            new RegExp(`^${path.replace('(.*)', '.*')}$`).test(normalizedPathname),
        );
        if (isSellerPath && userRole !== 'SELLER') {
            return NextResponse.redirect(new URL('/403', request.url));
        }

        // B. Kiểm tra Permission-based Paths với Permission System
        const requiredPermissions = getRoutePermissions(normalizedPathname);

        if (requiredPermissions.length > 0) {
            // Check xem user có tất cả required permissions không
            const hasAccess = requiredPermissions.every(perm =>
                userPermissions.includes(perm),
            );

            if (!hasAccess) {
                return NextResponse.redirect(new URL('/403', request.url));
            }
        }
    }

    return NextResponse.next();
}

// Cấu hình các path mà middleware sẽ chạy qua
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
