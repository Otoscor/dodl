import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // 인증·세션 쿠키 만료
  response.cookies.set("dodl_auth", "", { path: "/", maxAge: 0 });
  response.cookies.set("dodl_session", "", { path: "/", maxAge: 0 });
  return response;
}
