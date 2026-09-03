import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { failureId, deviceId, reason } = body;

    if (!failureId || !deviceId) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const result = await failureStore.addReport(failureId, deviceId, reason || '부적절한 내용');
    return NextResponse.json({
      success: true,
      isBlinded: result.isBlinded,
      message: result.isBlinded 
        ? '신고가 누적되어 AI 검토 후 해당 글이 비공개 처리되었습니다.' 
        : '신고가 정상 접수되었습니다. 검토 후 조치하겠습니다.'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
