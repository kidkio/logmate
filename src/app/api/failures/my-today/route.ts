import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';
import { getUserBySession } from '@/lib/user-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId') || '';
    let userId = searchParams.get('userId') || undefined;

    // 세션 쿠키에서도 userId 확인
    const token = req.cookies.get('logmate_token')?.value;
    if (token && !userId) {
      const user = await getUserBySession(token);
      if (user) userId = user.id;
    }

    if (!deviceId && !userId) {
      return NextResponse.json({ success: false, error: 'deviceId or userId is required' }, { status: 400 });
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
