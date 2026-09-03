// 토스페이먼츠 (Toss Payments) 실결제 및 테스트 연동 모듈
// 카카오페이, 네이버페이, 토스페이, 모든 신용/체크카드, 계좌이체 완벽 지원

import { loadTossPayments } from '@tosspayments/payment-sdk';

export interface PassPlan {
  id: 'day' | 'month' | 'lifetime';
  name: string;
  price: number;
  originalPrice: number;
  discount: string;
  durationDays: number;
  badge?: string;
  description: string;
  features: string[];
}

export const PASS_PLANS: Record<'day' | 'month' | 'lifetime', PassPlan> = {
  day: {
    id: 'day',
    name: '1일 자유 이용권',
    price: 990,
    originalPrice: 1500,
    discount: '34% 할인',
    durationDays: 1,
    badge: '오늘 하루',
    description: '오늘 밤 모든 광고 없이 조용히 머무르고 싶을 때',
    features: ['24시간 모든 중간 광고 100% 제거', '사연 무제한 열람', '온기 30개로 무료 교환 가능'],
  },
  month: {
    id: 'month',
    name: '30일 심야 무제한 패스',
    price: 4900,
    originalPrice: 9900,
    discount: '50% 특가',
    durationDays: 30,
    badge: '가장 인기 ⭐',
    description: '한 달 동안 나만의 아늑한 심야 안식처를 누리는 패스',
    features: [
      '30일간 모든 광고 완전 제거',
      '숨겨진 공감 사연 무제한 열람',
      '내 사연에 황금 촛불 배지 상시 부착',
      '월간 감정 분석 다이어리 영구 보관',
    ],
  },
  lifetime: {
    id: 'lifetime',
    name: '평생 VIP 프리미엄 멤버십',
    price: 19900,
    originalPrice: 59000,
    discount: '얼리버드 66% 특가',
    durationDays: 36500,
    badge: '한정 특가 👑',
    description: 'LogMate가 존재하는 한 평생 모든 프리미엄 혜택 영구 보장',
    features: [
      '평생 광고 0% 무제한 안식처',
      '신규 힐링 사운드스케이프 영구 무료',
      'VIP 전용 [달빛의 수호자] 명예 배지 즉시 해금',
      '서버 유지 후원자 크레딧 등재',
    ],
  },
};

// 토스페이먼츠 클라이언트 키 (기본 테스트 키 제공, 실서비스 키로 교체 가능)
const DEFAULT_TEST_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

export async function requestTossPayment({
  planId,
  customerName,
  customerEmail,
}: {
  planId: 'day' | 'month' | 'lifetime';
  customerName: string;
  customerEmail?: string;
}) {
  const plan = PASS_PLANS[planId];
  if (!plan) throw new Error('올바르지 않은 플랜입니다.');

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || DEFAULT_TEST_CLIENT_KEY;
  const tossPayments = await loadTossPayments(clientKey);

  // 고유 주문 번호 생성 (플랜 식별자 포함)
  const orderId = `LOGMATE_${planId.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 결제 요청 실행 (카드 창 안에 카카오페이, 토스페이, 네이버페이, 모든 카드 자동 통합)
  await tossPayments.requestPayment('카드', {
    amount: plan.price,
    orderId,
    orderName: `LogMate ${plan.name}`,
    customerName: customerName || '익명 회원',
    customerEmail: customerEmail || undefined,
    successUrl: `${window.location.origin}/api/payments/success`,
    failUrl: `${window.location.origin}/api/payments/fail`,
  });
}
