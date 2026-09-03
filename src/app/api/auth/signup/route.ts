import { NextRequest, NextResponse } from 'next/server';
import { createUser, createSession } from '@/lib/user-store';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`signup_${ip}`, 5, 10 * 60 * 1000); // 10분에 5회 제한
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: '짧은 시간 동안 너무 많은 회원가입 요청이 발생했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' }, { status: 400 });
    }

    const user = await createUser(email, password, undefined, 'email');
    const token = await createSession(user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      provider: user.provider,
      createdAt: user.createdAt,
    };

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    const isSecure = isHttps && !host.includes('158.101.157.207') && !host.includes('localhost');

    const response = NextResponse.json({ success: true, user: safeUser, token });
    response.cookies.set('logmate_token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || '회원가입 처리 중 오류가 발생했습니다.' }, { status: 400 });
  }
}
