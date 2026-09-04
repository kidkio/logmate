import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '');

  // Redirect direct port 3000 or insecure HTTP traffic on production domain to canonical HTTPS
  if (host.includes('logmate.duckdns.org:3000') || (host.includes('logmate.duckdns.org') && proto === 'http')) {
    const url = new URL(`https://logmate.duckdns.org${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
