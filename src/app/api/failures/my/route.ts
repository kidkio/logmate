import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';
import { getUserBySession } from '@/lib/user-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId') || '';

    // 세션 토큰 확인 (로그인 사용자 식별)
    let userId: string | undefined;
    const token = req.cookies.get('logmate_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const user = await getUserBySession(token);
      if (user) {
        userId = user.id;
      }
    }

    // 로그인하지 않은 경우 쿼리 파라미터의 userId는 절대 인정하지 않음 (타인 사연 탈취 방지)
    if (!deviceId && !userId) {
      return NextResponse.json({ success: false, error: '인증 정보 또는 deviceId가 필요합니다.' }, { status: 400 });
    }

    const myFailures = await failureStore.getMyFailures(deviceId, userId);
    return NextResponse.json({ success: true, failures: myFailures });
  } catch (error) {
    const message = error instanceof Error ? error.message : '실패 목록을 불러오지 못했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
