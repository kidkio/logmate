import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';
import { getUserBySession } from '@/lib/user-store';
import { ReactionType } from '@/types';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`reaction_${ip}`, 60, 60 * 1000); // 분당 60회 제한
    if (!rate.allowed) {
      return NextResponse.json({ success: false, error: '과도한 반응 요청입니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
    }

    const body = await req.json();
    const { failureId, reactionType } = body;
    let actorId = typeof body.deviceId === 'string' ? body.deviceId : '';

    const token = req.cookies.get('logmate_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const user = await getUserBySession(token);
      if (user) actorId = user.id;
    }

    if (!failureId || !actorId || !reactionType) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const reactions = await failureStore.addReaction(failureId, actorId, reactionType as ReactionType);
    return NextResponse.json({ success: true, reactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
