import { NextRequest, NextResponse } from 'next/server';
import { warmthStore } from '@/lib/warmth-store';
import { getUserBySession } from '@/lib/user-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId') || undefined;

    let userId: string | undefined;
    const token = request.cookies.get('logmate_token')?.value;
    if (token) {
      const user = await getUserBySession(token);
      if (user) userId = user.id;
    }

    const warmth = await warmthStore.getWarmth(userId, deviceId);
    return NextResponse.json({ success: true, ...warmth });
  } catch (err) {
    const message = err instanceof Error ? err.message : '온기 조회 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount = 1, clientLifetime, clientSpendable, deviceId } = body;

    let userId: string | undefined;
    const token = request.cookies.get('logmate_token')?.value;
    if (token) {
      const user = await getUserBySession(token);
      if (user) userId = user.id;
    }

    if (action === 'earn') {
      // 1회 획득 상한 제한 (50 이하)
      const safeAmount = Math.min(Math.max(1, Number(amount) || 1), 50);
      const updated = await warmthStore.addWarmth(userId, deviceId, safeAmount);
      return NextResponse.json({ success: true, ...updated });
    }

    if (action === 'spend') {
      const safeAmount = Math.max(1, Number(amount) || 1);
      const result = await warmthStore.spendWarmth(userId, deviceId, safeAmount);
      if (!result.success) {
        return NextResponse.json({ success: false, error: '보유 온기가 부족합니다.', remaining: result.remaining }, { status: 400 });
      }
      return NextResponse.json({ success: true, remaining: result.remaining });
    }

    if (action === 'sync') {
      const updated = await warmthStore.syncFromClient(
        userId,
        deviceId,
        Number(clientLifetime) || 0,
        Number(clientSpendable) || 0
      );
      return NextResponse.json({ success: true, ...updated });
    }

    return NextResponse.json({ success: false, error: '유효하지 않은 요청 액션입니다.' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '온기 처리 중 오류 발생';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
