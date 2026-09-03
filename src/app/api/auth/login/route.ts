import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword, createSession } from '@/lib/user-store';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`login_${ip}`, 10, 5 * 60 * 1000); // 5분에 10회 제한
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: '너무 많은 로그인 시도가 발생했습니다. 5분 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: '이메일과 비밀번호를 모두 입력해주세요.' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, error: '가입되지 않은 이메일이거나 비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return NextResponse.json({ success: false, error: '가입되지 않은 이메일이거나 비밀번호가 일치하지 않습니다.' }, { status: 401 });
    }

    const token = await createSession(user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      provider: user.provider,
      createdAt: user.createdAt,
    };

    const isSecure = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

    const response = NextResponse.json({ success: true, user: safeUser });
    response.cookies.set('logmate_token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || '로그인 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
