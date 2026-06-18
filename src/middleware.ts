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
  // _next 내부, favicon, public/docs, 정적 이미지 파일은 인증 제외
  // (정적 이미지 제외: next/image 최적화기의 내부 fetch에는 인증 쿠키가 없어
  //  public 이미지가 /login 으로 리다이렉트되면 "유효한 이미지가 아님" 400이 발생)
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|docs/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico)$).*)'],
};
