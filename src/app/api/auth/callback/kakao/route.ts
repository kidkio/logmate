import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, createSession, generateAnonymousNickname } from '@/lib/user-store';
import { getCanonicalBaseUrl, getRedirectUri } from '@/lib/auth-url';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const error = req.nextUrl.searchParams.get('error');

    const homeUrl = getCanonicalBaseUrl(req);
    const redirectUri = getRedirectUri('kakao', req);

    if (error || !code) {
      return NextResponse.redirect(`${homeUrl}?auth_error=kakao_canceled`);
    }

    const kakaoClientId = process.env.KAKAO_CLIENT_ID || '';
    const kakaoClientSecret = process.env.KAKAO_CLIENT_SECRET || '';

    // 1. 인가 코드로 토큰 발급
    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: kakaoClientId,
      redirect_uri: redirectUri,
      code,
    });
    if (kakaoClientSecret) {
      bodyParams.append('client_secret', kakaoClientSecret);
    }

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: bodyParams,
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
    const kakaoNickname = generateAnonymousNickname();

    // 3. 사용자 조회 또는 생성
    let user = await getUserByEmail(kakaoEmail);
    if (!user) {
      const randomSecret = Math.random().toString(36) + Date.now().toString();
      user = await createUser(kakaoEmail, randomSecret, kakaoNickname, 'kakao');
    }

    // 4. 세션 생성 및 쿠키 발급 (세션 토큰의 URL 노출 차단, 오직 HttpOnly 쿠키로만 안전 전달)
    const token = await createSession(user.id);
    const isSecure = homeUrl.startsWith('https:');

    const redirectUrl = new URL(homeUrl);
    redirectUrl.searchParams.set('auth_provider', 'kakao');

    const response = NextResponse.redirect(redirectUrl);
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
