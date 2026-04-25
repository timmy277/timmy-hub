import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const at = searchParams.get('at');
    const rt = searchParams.get('rt');

    if (!at || !rt) {
        return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url));
    }

    // Redirect về app sau khi set cookie
    const response = NextResponse.redirect(new URL('/auth/finalize', req.url));

    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('access_token', at, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
    });

    response.cookies.set('refresh_token', rt, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
    });

    return response;
}
