import { NextRequest, NextResponse } from 'next/server';
import { failureStore, isFailureOwnedBy } from '@/lib/storage';
import { getUserBySession } from '@/lib/user-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { failureId, deviceId } = body;

    if (!failureId) {
      return NextResponse.json({ success: false, error: 'failureId is required' }, { status: 400 });
    }

    // 인증 세션 확인
    let userId: string | undefined;
    const token = req.cookies.get('logmate_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const user = await getUserBySession(token);
      if (user) userId = user.id;
    }

    // 대상 사연 조회 및 소유권 엄격 검증
    const targetFailure = await failureStore.getById(failureId);
    if (!targetFailure) {
      return NextResponse.json({ success: false, error: '해당 사연을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (!isFailureOwnedBy(targetFailure, deviceId, userId)) {
      return NextResponse.json(
        { success: false, error: '본인이 작성한 사연만 극복 상태를 변경할 수 있습니다.' },
        { status: 403 }
      );
    }

    const updated = await failureStore.toggleOvercome(failureId);
    return NextResponse.json({ success: true, isOvercome: updated.isOvercome });
  } catch (err) {
    const message = err instanceof Error ? err.message : '극복 상태 변경에 실패했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
