import { NextRequest, NextResponse } from 'next/server';
import { failureStore, isFailureOwnedBy } from '@/lib/storage';
import { getUserBySession } from '@/lib/user-store';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('logmate_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: '로그인이 필요한 서비스입니다.' }, { status: 401 });
    }

    const user = await getUserBySession(token);
    if (!user) {
      return NextResponse.json({ success: false, error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    // 쿼리 파라미터의 userId 대신, 반드시 인증된 세션의 사용자 본인 쪽지만 조회
    const notes = await failureStore.getComfortNotesForUser(user.id);
    return NextResponse.json({ success: true, notes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { failureId, fromNickname, message, deviceId } = body;

    if (!failureId || !message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'failureId and message are required' }, { status: 400 });
    }

    // 발신자 식별 (쿠키 세션)
    let senderUserId: string | undefined;
    const token = req.cookies.get('logmate_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const user = await getUserBySession(token);
      if (user) senderUserId = user.id;
    }

    const targetFailure = await failureStore.getById(failureId);
    if (!targetFailure) {
      return NextResponse.json({ success: false, error: '해당 사연을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 본인 작성 사연에는 쪽지 발송 불가
    if (isFailureOwnedBy(targetFailure, deviceId, senderUserId)) {
      return NextResponse.json(
        { success: false, error: '본인이 작성한 사연에는 온기 쪽지를 보낼 수 없습니다.' },
        { status: 400 }
      );
    }

    // 수신자(targetUserId)는 클라이언트 조작값을 신뢰하지 않고, 사연 실제 작성자 ID로 서버에서 안전하게 바인딩
    const targetUserId = targetFailure.userId;

    const note = await failureStore.addComfortNote({
      failureId,
      targetUserId,
      fromNickname: fromNickname || '익명의 이웃',
      message: message.trim(),
    });

    return NextResponse.json({ success: true, note });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
