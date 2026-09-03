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
    const redirectUri = `${homeUrl}/api/auth/callback/google`;

    if (error || !code) {
      return NextResponse.redirect(`${homeUrl}?auth_error=google_canceled`);
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    // 1. 인가 코드로 토큰 교환
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      return NextResponse.redirect(`${homeUrl}?auth_error=google_token_failed`);
    }

    // 2. 구글 유저 정보 조회
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();
    const googleEmail = googleUser.email;
    const googleName = googleUser.name || generateAnonymousNickname();

    if (!googleEmail) {
      return NextResponse.redirect(`${homeUrl}?auth_error=google_no_email`);
    }

    // 3. 사용자 조회 또는 생성
    let user = await getUserByEmail(googleEmail);
    if (!user) {
      const randomSecret = Math.random().toString(36) + Date.now().toString();
      user = await createUser(googleEmail, randomSecret, googleName, 'google');
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
    console.error('Google OAuth Callback error:', err);
    return NextResponse.redirect('/?auth_error=google_internal');
  }
}
