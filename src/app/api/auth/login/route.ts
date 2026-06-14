import { NextRequest, NextResponse } from 'next/server';

function getUsers(): Record<string, string> {
  const raw = process.env.AUTH_USERS ?? '';
  return Object.fromEntries(
    raw.split(',').flatMap((entry) => {
      const [id, pw] = entry.split(':');
      return id && pw ? [[id.trim(), pw.trim()]] : [];
    })
  );
}

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();
  const users = getUsers();
  const secret = process.env.AUTH_SECRET ?? '';

  if (!secret || !id || users[id] !== password) {
    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('dodl_auth', secret, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
  return response;
}
