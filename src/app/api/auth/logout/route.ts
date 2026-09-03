import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/user-store';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('logmate_token')?.value;
    if (token) {
      await deleteSession(token);
    }

    const response = NextResponse.json({ success: true, message: '로그아웃되었습니다.' });
    response.cookies.delete('logmate_token');
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
