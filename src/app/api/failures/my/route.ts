import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId') || '';
    const userId = searchParams.get('userId') || undefined;

    if (!deviceId && !userId) {
      return NextResponse.json({ success: false, error: 'deviceId or userId is required' }, { status: 400 });
    }

    const myFailures = await failureStore.getMyFailures(deviceId, userId);
    return NextResponse.json({ success: true, failures: myFailures });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
