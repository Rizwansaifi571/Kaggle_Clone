import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/settings', '/2fa/setup'];
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  let isValid = false;
  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'kagglelite_super_secret_key_32_bytes!');
      await jwtVerify(accessToken, secret);
      isValid = true;
    } catch (e) {
      isValid = false;
    }
  }

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuth = authRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !isValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && isValid) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
