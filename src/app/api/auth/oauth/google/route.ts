import { NextRequest, NextResponse } from 'next/server';
import { getRedirectUri } from '@/lib/auth-url';

export async function GET(req: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  const redirectUri = getRedirectUri('google', req);

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=select_account`;

  return NextResponse.redirect(googleAuthUrl);
}
