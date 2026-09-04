import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';
import { getUserBySession } from '@/lib/user-store';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`report_${ip}`, 10, 60 * 1000); // 분당 10회 제한
    if (!rate.allowed) {
      return NextResponse.json({ success: false, error: '과도한 신고 요청입니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const body = await req.json();
    const { failureId, reason } = body;
    let reporterId = typeof body.deviceId === 'string' ? body.deviceId : '';

    const token = req.cookies.get('logmate_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const user = await getUserBySession(token);
      if (user) reporterId = user.id;
    }

    if (!failureId || !reporterId) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const result = await failureStore.addReport(failureId, reporterId, reason || '부적절한 내용');
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
