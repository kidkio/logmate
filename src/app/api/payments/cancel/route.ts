import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_TEST_SECRET_KEY = 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, cancelReason } = body;

    if (!paymentKey) {
      return NextResponse.json(
        { success: false, message: '결제 키(paymentKey)가 필요합니다.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.TOSS_SECRET_KEY || DEFAULT_TEST_SECRET_KEY;
    const basicAuth = Buffer.from(`${secretKey}:`).toString('base64');

    // 토스페이먼츠 결제 취소(환불) API 호출
    const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancelReason: cancelReason || '고객 요청에 의한 환불',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Toss payment cancel failed:', data);
      return NextResponse.json(
        { success: false, message: data.message || '환불 처리에 실패했습니다.' },
        { status: 400 }
      );
    }

    // 쿠키에서 pass 상태 만료 처리
    const res = NextResponse.json({
      success: true,
      message: '결제가 성공적으로 취소 및 전액 환불되었습니다.',
      data: {
        status: data.status,
        cancels: data.cancels,
      },
    });

    res.cookies.set({
      name: 'logmate_has_pass',
      value: '',
      path: '/',
      expires: new Date(0),
    });

    return res;
  } catch (error) {
    console.error('Payment cancel api error:', error);
    return NextResponse.json(
      { success: false, message: '환불 처리 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
