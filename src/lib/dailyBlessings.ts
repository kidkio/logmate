// 오늘의 밤하늘 은하수 개화 축복 및 요일별 랜덤/순환 보상 시스템
// 3 AM KST 기준으로 요일별 축복과 목표 보상이 매일 다채롭게 순환됩니다.

import { grantBonusWarmth } from './warmthSystem';

export interface DailyBlessing {
  id: string;
  dayIndex: number; // 0: 일, 1: 월, ..., 6: 토
  dayName: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  gradient: string;
  border: string;
  glow: string;
  description: string;
  buffDescription: string;
  rewardType: 'warmth' | 'note_pack' | 'tarot_ticket' | 'cooldown_cut' | 'fever_boost' | 'fortune_triple';
  rewardAmount: number;
  rewardLabel: string;
}

export const DAILY_BLESSINGS_POOL: DailyBlessing[] = [
  {
    id: 'sunday_comfort',
    dayIndex: 0,
    dayName: '일요일의 고요한 치유',
    title: '🌿 치유의 오로라 & 온기 선물',
    subtitle: '한 주를 차분히 마무리하는 평온한 쉼과 온기 보급',
    badge: '주말 안식',
    icon: '🕊️',
    gradient: 'from-emerald-950/80 via-teal-950/60 to-slate-900',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]',
    description: '월요일을 앞둔 지친 마음을 어루만져 주는 은하수 힐링 오로라가 밤하늘 가득 펼쳐집니다.',
    buffDescription: '목표 달성 시 참여자 전원에게 넉넉한 보너스 온기 선물과 사운드 힐링 파동이 내려앉습니다.',
    rewardType: 'warmth',
    rewardAmount: 25,
    rewardLabel: '보너스 온기 +25개 즉시 지급',
  },
  {
    id: 'monday_spark',
    dayIndex: 1,
    dayName: '월요일의 힘찬 출발',
    title: '🎁 안식의 온기 세례 +35',
    subtitle: '새로운 한 주를 든든하게 시작하는 온기 보급소',
    badge: '온기 세례',
    icon: '🌟',
    gradient: 'from-amber-950/80 via-indigo-950/60 to-slate-900',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]',
    description: '월요병과 현실의 무게에 힘겨웠을 오늘 밤, 은하수가 따뜻한 온기 선물 보따리를 엽니다.',
    buffDescription: '목표 달성 시 참여자 전원에게 보너스 온기 +35개를 즉시 충전해 드립니다.',
    rewardType: 'warmth',
    rewardAmount: 35,
    rewardLabel: '보너스 온기 +35개 즉시 지급',
  },
  {
    id: 'tuesday_tarot',
    dayIndex: 2,
    dayName: '화요일의 별빛 점성술',
    title: '🔮 심야 별빛 타로의 예지',
    subtitle: '운명의 밤하늘이 내면의 길을 비추어줍니다',
    badge: '운명 해금',
    icon: '🌙',
    gradient: 'from-purple-950/80 via-indigo-950/60 to-slate-900',
    border: 'border-purple-500/40',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)]',
    description: '은하수 별자리가 맞물려 오늘 밤 당신에게 필요한 가장 따스한 해답을 비춰줍니다.',
    buffDescription: '심야 타로 무료 복채권 1회와 함께 보너스 온기 +20개가 지급됩니다.',
    rewardType: 'tarot_ticket',
    rewardAmount: 20,
    rewardLabel: '무료 타로 1회권 + 온기 20개 지급',
  },
  {
    id: 'wednesday_notes',
    dayIndex: 3,
    dayName: '수요일의 달빛 우체부',
    title: '💌 달빛 온기 쪽지팩 증정',
    subtitle: '외로운 이웃들에게 마음을 전하는 온기 편지 배달',
    badge: '우체통 선물',
    icon: '🕊️',
    gradient: 'from-pink-950/80 via-purple-950/60 to-slate-900',
    border: 'border-pink-500/40',
    glow: 'shadow-[0_0_25px_rgba(236,72,153,0.3)]',
    description: '지쳐가는 주중 한가운데, 서로에게 힘이 되는 따스한 한마디를 나눌 수 있도록 편지지를 채워드립니다.',
    buffDescription: '익명 온기 쪽지 발송권 3장 즉시 충전 (이웃 사연에 편지 발송 가능)',
    rewardType: 'note_pack',
    rewardAmount: 3,
    rewardLabel: '익명 온기 쪽지 발송권 3장 즉시 지급',
  },
  {
    id: 'thursday_cooldown',
    dayIndex: 4,
    dayName: '목요일의 황금 불꽃',
    title: '⚡ 촛불 쿨타임 50% 단축 축복',
    subtitle: '숨고르기 시간 단축으로 더 빠르게 밝히는 불꽃',
    badge: '급속 회복',
    icon: '🕯️',
    gradient: 'from-cyan-950/80 via-indigo-950/60 to-slate-900',
    border: 'border-cyan-500/40',
    glow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)]',
    description: '은하수의 마르지 않는 에너지가 주입되어 촛불이 숨을 고르는 쿨다운 시간이 15분에서 7분 30초로 단축됩니다.',
    buffDescription: '오늘 밤 남은 시간 동안 쿨타임 50% 단축 버프와 함께 보너스 온기 +20개가 지급됩니다.',
    rewardType: 'cooldown_cut',
    rewardAmount: 20,
    rewardLabel: '쿨타임 50% 단축 버프 + 온기 20개',
  },
  {
    id: 'friday_fever',
    dayIndex: 5,
    dayName: '금요일의 은하수 피버',
    title: '🌌 불타는 금요일 은하수 대축제',
    subtitle: '모든 터치가 불꽃으로 터져 나오는 황홀한 축제',
    badge: '피버 대축제',
    icon: '🔥',
    gradient: 'from-orange-950/80 via-pink-950/60 to-purple-950/80',
    border: 'border-orange-500/50',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.4)]',
    description: '한 주 동안 치열하게 버틴 당신을 위해 밤하늘 전체가 화려한 피버 모드로 물듭니다.',
    buffDescription: '온기 촛불 터치 시 2배 피버 부스터 무제한 발동 & 연타 콤보 폭발 + 온기 30개 선물!',
    rewardType: 'fever_boost',
    rewardAmount: 30,
    rewardLabel: '무제한 2배 피버 부스터 + 온기 30개',
  },
  {
    id: 'saturday_fortune',
    dayIndex: 6,
    dayName: '토요일의 황금빛 행운',
    title: '🍀 행운의 포춘 카드 3배 대개화',
    subtitle: '쏟아지는 위로의 카드와 깜짝 보너스 온기 폭포',
    badge: '행운 만발',
    icon: '✨',
    gradient: 'from-amber-950/80 via-yellow-950/50 to-indigo-950/80',
    border: 'border-yellow-500/50',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]',
    description: '온기 촛불을 켤 때마다 행운의 조언 카드와 깜짝 보너스 온기가 3배 높은 확률로 쏟아집니다.',
    buffDescription: '행운의 위로 카드 등장 확률 12% ➔ 36%로 폭증 & 온기 +25개 즉시 지급!',
    rewardType: 'fortune_triple',
    rewardAmount: 25,
    rewardLabel: '포춘 카드 3배 버프 + 온기 25개',
  },
];

// 새벽 3시(KST) 컷오프 기준 현재 요일 인덱스 산출
export function getKST3AMDayIndex(): { dayIndex: number; dateStr: string } {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstTime = new Date(now.getTime() + kstOffset);

  // 새벽 3시 이전이면 전날 밤하늘에 속함
  if (kstTime.getUTCHours() < 3) {
    kstTime.setUTCDate(kstTime.getUTCDate() - 1);
  }

  const dateStr = kstTime.toISOString().split('T')[0];
  const dayIndex = kstTime.getUTCDay(); // 0 (일) ~ 6 (토)

  return { dayIndex, dateStr };
}

// 오늘 밤의 은하수 축복 가져오기
export function getTodayBlessing(): DailyBlessing {
  const { dayIndex } = getKST3AMDayIndex();
  return DAILY_BLESSINGS_POOL[dayIndex] || DAILY_BLESSINGS_POOL[0];
}

// 오늘 축복 수령 여부 확인
export function isBlessingClaimed(blessingId: string, customUserId?: string | null): boolean {
  if (typeof window === 'undefined') return false;
  const { dateStr } = getKST3AMDayIndex();
  const uid = customUserId || 'guest';
  const key = `logmate_blessing_claimed_${dateStr}_${uid}_${blessingId}`;
  return localStorage.getItem(key) === 'true';
}

// 오늘 축복 수령하기 처리
export function claimBlessing(
  blessing: DailyBlessing,
  customUserId?: string | null
): { success: boolean; message: string } {
  if (typeof window === 'undefined') return { success: false, message: '클라이언트 환경이 아닙니다.' };

  const { dateStr } = getKST3AMDayIndex();
  const uid = customUserId || 'guest';
  const key = `logmate_blessing_claimed_${dateStr}_${uid}_${blessing.id}`;

  if (localStorage.getItem(key) === 'true') {
    return { success: false, message: '오늘의 은하수 축복을 이미 수령하셨습니다.' };
  }

  // 1. 보상 유형별 지급 처리
  if (blessing.rewardType === 'warmth') {
    grantBonusWarmth(blessing.rewardAmount, customUserId);
  } else if (blessing.rewardType === 'tarot_ticket') {
    grantBonusWarmth(blessing.rewardAmount, customUserId);
    const tarotTicketKey = customUserId ? `logmate_tarot_free_${customUserId}` : 'logmate_tarot_free_guest';
    const current = parseInt(localStorage.getItem(tarotTicketKey) || '0', 10);
    localStorage.setItem(tarotTicketKey, (current + 1).toString());
  } else if (blessing.rewardType === 'note_pack') {
    const noteKey = customUserId ? `logmate_note_tickets_${customUserId}` : 'logmate_note_tickets_guest';
    const current = parseInt(localStorage.getItem(noteKey) || '0', 10);
    localStorage.setItem(noteKey, (current + blessing.rewardAmount).toString());
  } else if (blessing.rewardType === 'cooldown_cut') {
    grantBonusWarmth(blessing.rewardAmount, customUserId);
    const buffKey = `logmate_buff_cooldown_cut_${dateStr}_${uid}`;
    localStorage.setItem(buffKey, 'true');
  } else if (blessing.rewardType === 'fever_boost') {
    grantBonusWarmth(blessing.rewardAmount, customUserId);
    const buffKey = `logmate_buff_infinite_fever_${dateStr}_${uid}`;
    localStorage.setItem(buffKey, 'true');
  } else if (blessing.rewardType === 'fortune_triple') {
    grantBonusWarmth(blessing.rewardAmount, customUserId);
    const buffKey = `logmate_buff_fortune_triple_${dateStr}_${uid}`;
    localStorage.setItem(buffKey, 'true');
  }

  // 2. 수령 완료 플래그 기록
  localStorage.setItem(key, 'true');

  return {
    success: true,
    message: `🎉 [${blessing.title}] 축복이 성공적으로 적용되었습니다! (${blessing.rewardLabel})`,
  };
}
