import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const protocol = forwardedProto ? `${forwardedProto}:` : req.nextUrl.protocol;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
  const redirectUri = `${protocol}//${host}/api/auth/callback/google`;

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=select_account`;

  return NextResponse.redirect(googleAuthUrl);
}
