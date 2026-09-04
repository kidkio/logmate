import { NextRequest } from 'next/server';

/**
 * LogMate Canonical Base URL Resolver
 * 
 * Ensures that OAuth redirect URIs and auth callbacks strictly resolve to
 * the official canonical HTTPS domain (https://logmate.duckdns.org) in production,
 * completely preventing KOE006 (Redirect URI mismatch) errors caused by
 * direct port 3000 access or HTTP reverse-proxy header discrepancies.
 */
export function getCanonicalBaseUrl(req?: NextRequest): string {
  // 1. Explicit NEXT_PUBLIC_APP_URL environment variable takes highest priority
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. If running in local development (localhost / 127.0.0.1)
  if (req) {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host || '';
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      const forwardedProto = req.headers.get('x-forwarded-proto');
      const protocol = forwardedProto ? `${forwardedProto}:` : req.nextUrl.protocol;
      return `${protocol}//${host}`;
    }
  }

  // 3. Always fallback to official production HTTPS domain (never HTTP, never port 3000)
  return 'https://logmate.duckdns.org';
}

/**
 * Returns the exact registered redirect URI for OAuth providers.
 * Kakao Developer Console registered: https://logmate.duckdns.org/api/auth/callback/kakao
 * Google Cloud Console registered: https://logmate.duckdns.org/api/auth/callback/google
 */
export function getRedirectUri(provider: 'kakao' | 'google', req?: NextRequest): string {
  const base = getCanonicalBaseUrl(req);
  return `${base}/api/auth/callback/${provider}`;
}
