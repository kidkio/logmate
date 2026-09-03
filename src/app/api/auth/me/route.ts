import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession } from '@/lib/user-store';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('logmate_token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, user: null });
    }

    const user = await getUserBySession(token);
    if (!user) {
      return NextResponse.json({ success: false, user: null });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      provider: user.provider,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ success: true, user: safeUser });
  } catch (err: any) {
    return NextResponse.json({ success: false, user: null, error: err.message }, { status: 500 });
  }
}
