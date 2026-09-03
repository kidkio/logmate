import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'deviceId is required' }, { status: 400 });
    }

    const todayFailure = await failureStore.getTodaysFailure(deviceId);

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
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
