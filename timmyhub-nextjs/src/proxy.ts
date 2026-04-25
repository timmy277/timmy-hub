import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRoutePermissions } from '@/config/permissions';

// ─── Route groups ─────────────────────────────────────────────────────────────

/** Không cần đăng nhập */
const PUBLIC_PATHS = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/become-seller',
    '/shop/(.*)',
    '/product/(.*)',
    '/category/(.*)',
    '/search',
    '/collection/(.*)',
    '/campaign/(.*)',
];

/** Chỉ cần đăng nhập (mọi role) */
const AUTH_PATHS = [
    '/cart',
    '/checkout',
    '/profile',
    '/orders',
    '/wishlist',
    '/notifications',
    '/payment/(.*)',
];

/** Chỉ SELLER (hoặc SUPER_ADMIN) */
const SELLER_PATHS = '/seller';

/** Chỉ ADMIN (hoặc SUPER_ADMIN) */
const ADMIN_PATHS = '/admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesPath(pathname: string, patterns: string[]): boolean {
    return patterns.some(p => {
        if (p.includes('(.*)')) {
            return new RegExp(`^${p.replace('(.*)', '.*')}$`).test(pathname);
        }
        return pathname === p || pathname.startsWith(p + '/');
    });
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const normalizedPath = pathname.replace(/\/$/, '') || '/';

    // Luôn cho qua static/api
    if (normalizedPath.startsWith('/api') || normalizedPath.startsWith('/_next')) {
        return NextResponse.next();
    }

    const token = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const isLoggedIn = !!(token || refreshToken);
    const userRolesRaw = request.cookies.get('user_roles')?.value;
    const userRoles: string[] = userRolesRaw ? JSON.parse(decodeURIComponent(userRolesRaw)) : [];
    const hasRole = (role: string) => userRoles.includes(role);

    // ── 1. Public paths: luôn cho qua ────────────────────────────────────────
    if (matchesPath(normalizedPath, PUBLIC_PATHS)) {
        // Nếu đã login mà vào /login hoặc /register → redirect về trang phù hợp
        if (isLoggedIn && (normalizedPath === '/login' || normalizedPath === '/register')) {
            const dest =
                hasRole('ADMIN') || hasRole('SUPER_ADMIN')
                    ? '/admin'
                    : hasRole('SELLER')
                        ? '/seller'
                        : '/';
            return NextResponse.redirect(new URL(dest, request.url));
        }
        return NextResponse.next();
    }

    // ── 2. Chưa đăng nhập → redirect login ───────────────────────────────────
    if (!isLoggedIn) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('callbackUrl', normalizedPath);
        return NextResponse.redirect(url);
    }

    // ── 3. SUPER_ADMIN bypass tất cả ─────────────────────────────────────────
    if (hasRole('SUPER_ADMIN')) return NextResponse.next();

    // ── 4. Auth paths: chỉ cần đăng nhập ─────────────────────────────────────
    if (matchesPath(normalizedPath, AUTH_PATHS)) {
        return NextResponse.next();
    }

    // ── 5. Admin paths: chỉ ADMIN ────────────────────────────────────────────
    if (normalizedPath.startsWith(ADMIN_PATHS)) {
        if (!hasRole('ADMIN')) {
            return NextResponse.redirect(new URL('/403', request.url));
        }

        const permissionsStr = request.cookies.get('user_permissions')?.value;
        let userPermissions: string[] = [];
        try {
            if (permissionsStr) userPermissions = JSON.parse(decodeURIComponent(permissionsStr));
        } catch {
            /* ignore */
        }

        const required = getRoutePermissions(normalizedPath);
        if (required.length > 0 && !required.every(p => userPermissions.includes(p))) {
            return NextResponse.redirect(new URL('/403', request.url));
        }
        return NextResponse.next();
    }

    // ── 6. Seller paths: chỉ SELLER ──────────────────────────────────────────
    if (normalizedPath.startsWith(SELLER_PATHS)) {
        if (!hasRole('SELLER')) {
            return NextResponse.redirect(new URL('/become-seller', request.url));
        }
        return NextResponse.next();
    }

    // ── 7. Mọi route còn lại: cho qua nếu đã đăng nhập ───────────────────────
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
