import { NextRequest, NextResponse } from 'next/server';
import { getRedirectUri } from '@/lib/auth-url';

export async function GET(req: NextRequest) {
  const kakaoClientId = process.env.KAKAO_CLIENT_ID || '';
  const redirectUri = getRedirectUri('kakao', req);

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&prompt=login`;

  return NextResponse.redirect(kakaoAuthUrl);
}
