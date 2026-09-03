import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';

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
    const { failureId, targetUserId, fromNickname, message } = body;

    if (!failureId || !message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'failureId and message are required' }, { status: 400 });
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
