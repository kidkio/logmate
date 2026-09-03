// 경량 인메모리 IP 기반 슬라이딩 윈도우 레이트 리미터
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitRecord>();

// 오래된 기록 주기적 가비지 컬렉션 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipMap.entries()) {
    if (record.resetAt <= now) {
      ipMap.delete(key);
    }
  }
}, 60 * 1000);

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = ipMap.get(identifier);

  if (!record || record.resetAt <= now) {
    ipMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
