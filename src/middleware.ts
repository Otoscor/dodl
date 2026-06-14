import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'dodl_auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지와 인증 API는 통과
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET ?? '';
  const auth = request.cookies.get(AUTH_COOKIE);
  if (!secret || !auth || auth.value !== secret) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // _next 내부, favicon, public/docs 는 인증 제외
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|docs/).*)'],
};
