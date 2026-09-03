import { NextRequest, NextResponse } from 'next/server';
import { createUser, createSession } from '@/lib/user-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, nickname } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: '올바른 이메일 주소를 입력해주세요.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' }, { status: 400 });
    }

    const user = await createUser(email, password, nickname, 'email');
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
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || '회원가입 처리 중 오류가 발생했습니다.' }, { status: 400 });
  }
}
