import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';
import { ReactionType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { failureId, deviceId, reactionType } = body;

    if (!failureId || !deviceId || !reactionType) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const reactions = await failureStore.addReaction(failureId, deviceId, reactionType as ReactionType);
    return NextResponse.json({ success: true, reactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
