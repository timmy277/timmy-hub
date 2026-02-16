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

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Kiểm tra nếu là public path
    const isPublicPath = publicPaths.some(path => {
        if (path.includes('(.*)')) {
            const regex = new RegExp(`^${path.replace('(.*)', '.*')}$`);
            return regex.test(pathname);
        }
        return pathname === path;
    });

    // Lấy access_token từ cookie
    const token = request.cookies.get('access_token')?.value;

    // 2. Nếu truy cập trang bảo vệ mà không có token -> Redirect về Login
    if (!isPublicPath && !token) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        // Lưu lại url định truy cập để sau khi login quay lại
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    // 3. Nếu đã đăng nhập mà cố vào trang Login/Register -> Redirect về Home/Dashboard (bây giờ là /admin)
    if (token && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // 4. Kiểm tra quyền hạn nâng cao (Dựa vào User Role & Permissions)
    const userRole = request.cookies.get('user_role')?.value;
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
            new RegExp(`^${path.replace('(.*)', '.*')}$`).test(pathname),
        );
        if (isAdminPath && userRole !== 'ADMIN') {
            return NextResponse.redirect(new URL('/403', request.url));
        }

        const isSellerPath = sellerPaths.some(path =>
            new RegExp(`^${path.replace('(.*)', '.*')}$`).test(pathname),
        );
        if (isSellerPath && userRole !== 'SELLER') {
            return NextResponse.redirect(new URL('/403', request.url));
        }

        // B. Kiểm tra Permission-based Paths với Permission System
        const requiredPermissions = getRoutePermissions(pathname);
        
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
