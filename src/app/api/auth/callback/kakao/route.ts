import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, createSession, generateAnonymousNickname } from '@/lib/user-store';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const error = req.nextUrl.searchParams.get('error');

    const forwardedProto = req.headers.get('x-forwarded-proto');
    const protocol = forwardedProto ? `${forwardedProto}:` : req.nextUrl.protocol;
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
    const homeUrl = `${protocol}//${host}`;
    const redirectUri = `${homeUrl}/api/auth/callback/kakao`;

    if (error || !code) {
      return NextResponse.redirect(`${homeUrl}?auth_error=kakao_canceled`);
    }

    const kakaoClientId = process.env.KAKAO_CLIENT_ID || '';

    // 1. 인가 코드로 토큰 발급
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: kakaoClientId,
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Kakao token exchange failed:', tokenData);
      return NextResponse.redirect(`${homeUrl}?auth_error=kakao_token_failed`);
    }

    // 2. 카카오 프로필 조회
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const kakaoUser = await userRes.json();
    const kakaoId = kakaoUser.id;
    const kakaoEmail = kakaoUser.kakao_account?.email || `kakao_${kakaoId}@logmate.social`;
    const kakaoNickname =
      kakaoUser.properties?.nickname ||
      kakaoUser.kakao_account?.profile?.nickname ||
      generateAnonymousNickname();

    // 3. 사용자 조회 또는 생성
    let user = await getUserByEmail(kakaoEmail);
    if (!user) {
      const randomSecret = Math.random().toString(36) + Date.now().toString();
      user = await createUser(kakaoEmail, randomSecret, kakaoNickname, 'kakao');
    }

    // 4. 세션 생성 및 쿠키 발급
    const token = await createSession(user.id);
    const isSecure = protocol === 'https:';

    const response = NextResponse.redirect(homeUrl);
    response.cookies.set('logmate_token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    return response;
  } catch (err) {
    console.error('Kakao OAuth Callback error:', err);
    return NextResponse.redirect('/?auth_error=kakao_internal');
  }
}
