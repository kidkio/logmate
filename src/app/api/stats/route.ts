import { NextRequest, NextResponse } from 'next/server';
import { failureStore, getToday3AMKSTCutoff } from '@/lib/storage';

export async function GET() {
  try {
    const cutoff = getToday3AMKSTCutoff();
    const all = await failureStore.getAll();
    const todays = all.filter((f) => new Date(f.createdAt) >= cutoff);

    let totalComforts = 0;
    for (const f of all) {
      totalComforts += f.reactions.comfort + f.reactions.relate + f.reactions.cheer + f.reactions.kick;
    }

    return NextResponse.json({
      success: true,
      todaysCount: todays.length,
      totalCount: all.length,
      totalComforts,
      cutoff3AM: cutoff.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
