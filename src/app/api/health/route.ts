import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  let ollamaStatus = 'unknown';

  // 로컬 Ollama AI 데몬 연결 상태 확인
  try {
    const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const res = await fetch(`${ollamaHost}/api/version`, {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      ollamaStatus = `healthy (version: ${data.version || 'ok'})`;
    } else {
      ollamaStatus = `unhealthy (status: ${res.status})`;
    }
  } catch (err: any) {
    ollamaStatus = `disconnected (${err.message})`;
  }

  const memoryUsage = process.memoryUsage();

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    latencyMs: Date.now() - startTime,
    environment: process.env.NODE_ENV || 'production',
    system: {
      memory: {
        rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
    },
    services: {
      web: 'healthy',
      aiEngine: {
        provider: 'ollama-local',
        status: ollamaStatus,
      },
    },
  });
}
