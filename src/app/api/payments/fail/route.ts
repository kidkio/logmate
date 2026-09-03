import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message') || '결제가 취소되었거나 실패했습니다.';
  return NextResponse.redirect(new URL(`/?payment=fail&message=${encodeURIComponent(message)}`, request.url));
}
