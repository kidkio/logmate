import { NextRequest, NextResponse } from 'next/server';
import { paymentStore } from '@/lib/payment-store';
import { getUserBySession } from '@/lib/user-store';

const DEFAULT_TEST_SECRET_KEY = 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentKey, cancelReason, deviceId } = body;

    if (!paymentKey) {
      return NextResponse.json(
        { success: false, message: '결제 키(paymentKey)가 필요합니다.' },
        { status: 400 }
      );
    }

    // 세션 토큰 확인 (로그인 사용자 식별)
    let userId: string | undefined;
    const token = request.cookies.get('logmate_token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const user = await getUserBySession(token);
      if (user) userId = user.id;
    }

    // 서버 저장소에 등록된 주문 내역 조회 및 권한 검증
    const order = await paymentStore.getOrderByPaymentKey(paymentKey);
    if (order) {
      if (order.status === 'CANCELED') {
        return NextResponse.json(
          { success: false, message: '이미 취소/환불 완료된 결제 건입니다.' },
          { status: 400 }
        );
      }

      // 주문 소유권 검증 (회원 주문인 경우 본인 세션과 일치해야 함)
      if (order.userId && order.userId !== userId) {
        return NextResponse.json(
          { success: false, message: '본인의 결제 건만 환불을 요청할 수 있습니다.' },
          { status: 403 }
        );
      }

      // 게스트 주문인 경우 기기 식별자 검증
      if (!order.userId && order.deviceId && deviceId && order.deviceId !== deviceId) {
        return NextResponse.json(
          { success: false, message: '결제 기기와 일치하지 않아 취소할 수 없습니다.' },
          { status: 403 }
        );
      }

      // 7일 환불 가능 기간 확인
      const purchaseTime = new Date(order.purchasedAt).getTime();
      if (Date.now() - purchaseTime > 7 * 24 * 60 * 60 * 1000) {
        return NextResponse.json(
          { success: false, message: '전자상거래법상 결제일로부터 7일이 경과하여 환불이 불가합니다.' },
          { status: 400 }
        );
      }
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

    // 서버 저장소에 취소 상태 기록
    await paymentStore.cancelOrder(paymentKey, cancelReason || '고객 요청에 의한 환불');

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
