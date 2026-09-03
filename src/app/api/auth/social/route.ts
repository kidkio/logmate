import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, createSession } from '@/lib/user-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, email: clientEmail } = body;

    if (!provider || (provider !== 'kakao' && provider !== 'google')) {
      return NextResponse.json({ success: false, error: '유효하지 않은 소셜 로그인 제공자입니다.' }, { status: 400 });
    }

    // 소셜 로그인 이메일 (클라이언트 제공 또는 프로바이더 기반 고유 계정)
    const email = clientEmail || `${provider}_${Date.now().toString(36)}@logmate.social`;

    let user = await getUserByEmail(email);
    if (!user) {
      // 신규 소셜 유저 생성 (임의 비밀번호 부여)
      const randomSecret = Math.random().toString(36) + Date.now().toString();
      user = await createUser(email, randomSecret, undefined, provider);
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
    return NextResponse.json({ success: false, error: err.message || '소셜 인증 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
