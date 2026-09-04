import { NextRequest, NextResponse } from 'next/server';
import { paymentStore } from '@/lib/payment-store';
import { getUserBySession } from '@/lib/user-store';

const DEFAULT_TEST_SECRET_KEY = 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://logmate.duckdns.org';

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(`${appUrl}/?payment=fail&message=잘못된+결제+정보입니다`);
  }

  const secretKey = process.env.TOSS_SECRET_KEY || DEFAULT_TEST_SECRET_KEY;
  const basicAuth = Buffer.from(`${secretKey}:`).toString('base64');

  try {
    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
    });

    const paymentData = await response.json();

    if (!response.ok) {
      console.error('Toss payment confirm error:', paymentData);
      const errMsg = encodeURIComponent(paymentData.message || '결제 승인 중 오류가 발생했습니다.');
      return NextResponse.redirect(`${appUrl}/?payment=fail&message=${errMsg}`);
    }

    // 주문 번호에서 플랜 분석 (LOGMATE_DAY_... / LOGMATE_MONTH_... / LOGMATE_LIFETIME_...)
    let plan = 'month';
    let durationDays = 30;

    if (orderId.includes('_DAY_')) {
      plan = 'day';
      durationDays = 1;
    } else if (orderId.includes('_LIFETIME_')) {
      plan = 'lifetime';
      durationDays = 36500;
    }

    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    // 세션 쿠키에서 사용자 식별
    let userId: string | undefined;
    const token = request.cookies.get('logmate_token')?.value;
    if (token) {
      const user = await getUserBySession(token);
      if (user) userId = user.id;
    }

    // 1. 서버 결제 저장소에 주문 정보 영구 기록
    await paymentStore.saveOrder({
      orderId,
      paymentKey,
      amount: Number(amount),
      plan: plan as 'day' | 'month' | 'lifetime',
      userId,
      status: 'DONE',
      expiresAt,
      purchasedAt: new Date().toISOString(),
    });

    // 2. 안전한 HTTP 리다이렉트 및 패스 쿠키 설정 (인라인 스크립트 XSS 위험 원천 제거)
    const isSecure = appUrl.startsWith('https:');
    const redirectUrl = new URL(`/?payment=success&plan=${encodeURIComponent(plan)}`, appUrl);
    const redirectRes = NextResponse.redirect(redirectUrl);

    redirectRes.cookies.set('logmate_has_pass', 'true', {
      path: '/',
      maxAge: durationDays * 24 * 60 * 60,
      sameSite: 'lax',
      secure: isSecure,
    });

    return redirectRes;
  } catch (error) {
    console.error('Payment confirm failed:', error);
    return NextResponse.redirect(`${appUrl}/?payment=fail&message=결제+승인+연결+실패`);
  }
}
