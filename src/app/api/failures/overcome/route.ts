import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { failureId } = body;

    if (!failureId) {
      return NextResponse.json({ success: false, error: 'failureId is required' }, { status: 400 });
    }

    const updated = await failureStore.toggleOvercome(failureId);
    return NextResponse.json({ success: true, isOvercome: updated.isOvercome });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
