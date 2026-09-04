import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';
import { getUserBySession } from '@/lib/user-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId') || '';

    // 세션 쿠키를 통해 인증된 회원 식별 (클라이언트 query parameter의 userId 조작 원천 차단)
    let userId: string | undefined;
    const token = req.cookies.get('logmate_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const user = await getUserBySession(token);
      if (user) userId = user.id;
    }

    if (!deviceId && !userId) {
      return NextResponse.json({ success: false, error: 'deviceId 또는 유효한 인증 정보가 필요합니다.' }, { status: 400 });
    }

    const todayFailure = await failureStore.getTodaysFailure(deviceId, userId);

    if (!todayFailure) {
      return NextResponse.json({
        success: true,
        hasPostedToday: false,
      });
    }

    // 이미 등록된 오늘의 실패가 있다면 유사 실패 정보도 함께 계산하여 반환
    const similarData = await failureStore.findSimilar(todayFailure);

    return NextResponse.json({
      success: true,
      hasPostedToday: true,
      failure: todayFailure,
      similarCount: similarData.similarCount,
      similarFailures: similarData.similarFailures,
      categoryCount: similarData.categoryCount,
      aiPeerStory: similarData.aiPeerStory,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '실패 사연을 불러오지 못했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
