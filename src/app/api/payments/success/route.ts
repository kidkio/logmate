import { NextRequest, NextResponse } from 'next/server';

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

    // 클라이언트 브라우저에 pass 상태를 안전하게 전달하기 위한 HTML 응답
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>LogMate 결제 완료</title>
        </head>
        <body style="background:#020617;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <h2>🎉 결제가 성공적으로 완료되었습니다!</h2>
            <p style="color:#94a3b8;font-size:14px;">프리미엄 혜택을 적용하여 안식처로 이동합니다...</p>
          </div>
          <script>
            try {
              localStorage.setItem('logmate_has_pass', 'true');
              localStorage.setItem('logmate_pass_info', JSON.stringify({
                plan: '${plan}',
                orderId: '${orderId}',
                paymentKey: '${paymentKey}',
                expiresAt: '${expiresAt}',
                purchasedAt: '${new Date().toISOString()}'
              }));
              document.cookie = 'logmate_has_pass=true; path=/; max-age=${durationDays * 24 * 60 * 60}';
            } catch (e) {
              console.error(e);
            }
            window.location.href = '/?payment=success&plan=${plan}';
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Payment confirm failed:', error);
    return NextResponse.redirect(`${appUrl}/?payment=fail&message=결제+승인+연결+실패`);
  }
}
