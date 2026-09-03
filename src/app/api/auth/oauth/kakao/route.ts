import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const kakaoClientId = process.env.KAKAO_CLIENT_ID || '';
  
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const protocol = forwardedProto ? `${forwardedProto}:` : req.nextUrl.protocol;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
  const redirectUri = `${protocol}//${host}/api/auth/callback/kakao`;

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  return NextResponse.redirect(kakaoAuthUrl);
}
