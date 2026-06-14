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
  try {
    const body = await request.text();
    // DEBUG: return raw body to inspect
    if (process.env.VERCEL && body.includes('debug_body')) {
      return NextResponse.json({ raw: body, len: body.length, chars: [...body].map((c,i) => `${i}:${c}(${c.charCodeAt(0)})`) });
    }
    const { id, password } = JSON.parse(body);
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
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set('dodl_session', 'demo-session-001', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : '';
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
}
