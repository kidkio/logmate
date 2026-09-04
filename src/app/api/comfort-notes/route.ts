import { NextRequest, NextResponse } from 'next/server';
import { failureStore, isFailureOwnedBy } from '@/lib/storage';
import { getUserBySession } from '@/lib/user-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const notes = await failureStore.getComfortNotesForUser(userId);
    return NextResponse.json({ success: true, notes });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { failureId, targetUserId, fromNickname, message, deviceId } = body;

    if (!failureId || !message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'failureId and message are required' }, { status: 400 });
    }

    // 발신자 식별 (쿠키 세션 또는 전달된 deviceId)
    let senderUserId: string | undefined;
    const token = req.cookies.get('logmate_token')?.value;
    if (token) {
      const user = await getUserBySession(token);
      if (user) senderUserId = user.id;
    }

    const targetFailure = await failureStore.getFailure(failureId);
    if (targetFailure && isFailureOwnedBy(targetFailure, deviceId, senderUserId)) {
      return NextResponse.json(
        { success: false, error: '본인이 작성한 사연에는 온기 쪽지를 보낼 수 없습니다.' },
        { status: 400 }
      );
    }

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
