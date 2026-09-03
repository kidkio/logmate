// 온기 레벨 & 프로필 아바타 진화 시스템 (총 15단계 방대한 성장 트리)
// 사용자가 촛불과 부스터 광고를 통해 온기를 모을수록 새로운 아바타와 칭호가 해금됩니다.
// 미달성 등급은 실루엣과 비밀(???)로 잠겨 있어 호기심과 수집욕을 자극합니다.

export interface WarmthTier {
  level: number;
  title: string;
  minWarmth: number;
  maxWarmth: number;
  avatarEmoji: string;
  avatarName: string;
  description: string;
  perk: string;
  bgGradient: string;
  borderClass: string;
  auraGlowClass: string;
  badgeColor: string;
}

export const WARMTH_TIERS: WarmthTier[] = [
  {
    level: 1,
    title: '새벽의 불씨',
    minWarmth: 0,
    maxWarmth: 4,
    avatarEmoji: '🪵',
    avatarName: '작은 불씨',
    description: '작지만 꺼지지 않는 소중한 마음의 온기',
    perk: '기본 안식처 출입 및 촛불 켜기',
    bgGradient: 'from-slate-800 to-amber-950/40',
    borderClass: 'border-slate-700/80',
    auraGlowClass: 'shadow-sm',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  {
    level: 2,
    title: '은은한 성냥불',
    minWarmth: 5,
    maxWarmth: 14,
    avatarEmoji: '🕯️',
    avatarName: '성냥의 온기',
    description: '어두운 방을 처음으로 밝혀주는 작은 불빛',
    perk: '온기 촛불 터치 시 첫 주황빛 파티클 해금',
    bgGradient: 'from-amber-950/50 via-slate-900 to-stone-900',
    borderClass: 'border-amber-700/60',
    auraGlowClass: 'shadow-[0_0_10px_rgba(217,119,6,0.25)]',
    badgeColor: 'bg-amber-950/70 text-amber-300 border-amber-600/40',
  },
  {
    level: 3,
    title: '밤하늘 반딧불이',
    minWarmth: 15,
    maxWarmth: 29,
    avatarEmoji: '🪔',
    avatarName: '반딧불 등불',
    description: '어두운 밤길을 걷는 이웃을 비추는 풀벌레의 온기',
    perk: '촛불 터치 시 에메랄드 스파크 발생',
    bgGradient: 'from-emerald-950/70 via-slate-900 to-amber-950/50',
    borderClass: 'border-emerald-500/50',
    auraGlowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  },
  {
    level: 4,
    title: '아늑한 호롱불',
    minWarmth: 30,
    maxWarmth: 59,
    avatarEmoji: '🏮',
    avatarName: '작은 호롱불',
    description: '비바람을 막아주며 잔잔하게 타오르는 등불',
    perk: '온기 상점에서 1일 이용권 무료 교환 자격 부여',
    bgGradient: 'from-amber-900/60 via-orange-950/50 to-slate-900',
    borderClass: 'border-amber-500/60',
    auraGlowClass: 'shadow-[0_0_18px_rgba(245,158,11,0.4)]',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
  },
  {
    level: 5,
    title: '마음의 촛불지기',
    minWarmth: 60,
    maxWarmth: 99,
    avatarEmoji: '🕯️✨',
    avatarName: '빛나는 황금 촛불',
    description: '많은 이들의 아픔을 위로하며 단단해진 온기',
    perk: '촛불 터치 시 골든 샤워 이펙트 강화',
    bgGradient: 'from-amber-950/80 via-yellow-950/40 to-slate-900',
    borderClass: 'border-amber-400',
    auraGlowClass: 'shadow-[0_0_22px_rgba(245,158,11,0.5)] ring-1 ring-amber-400/30',
    badgeColor: 'bg-amber-900/80 text-yellow-300 border-amber-400/60',
  },
  {
    level: 6,
    title: '타오르는 모닥불',
    minWarmth: 100,
    maxWarmth: 159,
    avatarEmoji: '🔥',
    avatarName: '심야 모닥불',
    description: '추위에 지친 모두가 모여들어 몸을 녹이는 온기',
    perk: '피드 내 내 사연에 모닥불 아이콘 자동 표기',
    bgGradient: 'from-red-950/70 via-orange-950/60 to-slate-900',
    borderClass: 'border-orange-500',
    auraGlowClass: 'shadow-[0_0_24px_rgba(249,115,22,0.55)] ring-1 ring-orange-400/40',
    badgeColor: 'bg-orange-950/80 text-orange-300 border-orange-500/50',
  },
  {
    level: 7,
    title: '깊은 숲의 등불',
    minWarmth: 160,
    maxWarmth: 239,
    avatarEmoji: '🌲💡',
    avatarName: '숲속 수호등',
    description: '짙은 안개 낀 방황의 숲에서 길을 잃지 않게 돕는 빛',
    perk: '심야 라운지 ASMR 숲길 테마 사운드 볼륨 1.2배 증폭',
    bgGradient: 'from-teal-950/80 via-emerald-950/60 to-slate-900',
    borderClass: 'border-teal-400',
    auraGlowClass: 'shadow-[0_0_25px_rgba(45,212,191,0.5)] ring-1 ring-teal-400/40',
    badgeColor: 'bg-teal-950/80 text-teal-300 border-teal-500/50',
  },
  {
    level: 8,
    title: '밤바다 등대지기',
    minWarmth: 240,
    maxWarmth: 349,
    avatarEmoji: '🗼',
    avatarName: '새벽 등대',
    description: '거센 파도 속에서도 침묵하며 배를 인도하는 등대',
    perk: '심야 속삭임 글 작성 시 [등대지기] 네온 배지 자동 부여',
    bgGradient: 'from-indigo-950/80 via-blue-950/60 to-slate-900',
    borderClass: 'border-indigo-400',
    auraGlowClass: 'shadow-[0_0_28px_rgba(99,102,241,0.6)] ring-2 ring-indigo-500/40',
    badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50',
  },
  {
    level: 9,
    title: '별빛의 파수꾼',
    minWarmth: 350,
    maxWarmth: 499,
    avatarEmoji: '⭐✨',
    avatarName: '수호의 북극성',
    description: '가장 맑고 어두운 하늘에서 방향을 알려주는 별빛',
    perk: '프로필 테두리에 반짝이는 별 파티클 회전 효과',
    bgGradient: 'from-blue-950/80 via-purple-950/60 to-slate-900',
    borderClass: 'border-blue-400',
    auraGlowClass: 'shadow-[0_0_30px_rgba(96,165,250,0.65)] ring-2 ring-blue-400/40',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-400/50',
  },
  {
    level: 10,
    title: '은하수의 순례자',
    minWarmth: 500,
    maxWarmth: 699,
    avatarEmoji: '🌌',
    avatarName: '은하수 흐름',
    description: '수만 개의 별들이 모여 거대한 위로의 강을 이룬 온기',
    perk: '내 서재 감정 달력에 신비로운 은하수 배경 테마 활성화',
    bgGradient: 'from-purple-950/90 via-fuchsia-950/60 to-slate-900',
    borderClass: 'border-purple-400',
    auraGlowClass: 'shadow-[0_0_32px_rgba(192,132,252,0.7)] ring-2 ring-purple-400/50',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-400/50',
  },
  {
    level: 11,
    title: '달빛의 수호자',
    minWarmth: 700,
    maxWarmth: 999,
    avatarEmoji: '🌙✨',
    avatarName: '달빛 초승달',
    description: '세상의 모든 어둠을 조용히 감싸 안는 신비로운 달빛',
    perk: '심야 라운지 상단 촛불 이펙트 2배 강화 및 달빛 펄스 오라',
    bgGradient: 'from-fuchsia-950/80 via-pink-950/60 to-slate-900',
    borderClass: 'border-pink-400',
    auraGlowClass: 'shadow-[0_0_35px_rgba(236,72,153,0.75)] ring-2 ring-pink-500/50 animate-pulse',
    badgeColor: 'bg-pink-950/80 text-pink-300 border-pink-500/50',
  },
  {
    level: 12,
    title: '찬란한 오로라',
    minWarmth: 1000,
    maxWarmth: 1499,
    avatarEmoji: '🌠',
    avatarName: '빛의 오로라 커튼',
    description: '밤하늘 전체를 형형색색의 기적으로 뒤덮는 극광의 온기',
    perk: '프로필 아바타에 에메랄드-마젠타 듀얼 오로라 애니메이션',
    bgGradient: 'from-emerald-900/60 via-teal-950/60 to-pink-950/60',
    borderClass: 'border-cyan-300',
    auraGlowClass: 'shadow-[0_0_38px_rgba(103,232,249,0.8)] ring-3 ring-cyan-400/50 animate-pulse',
    badgeColor: 'bg-gradient-to-r from-emerald-600 to-cyan-500 text-slate-950 font-black border-cyan-300',
  },
  {
    level: 13,
    title: '태양의 불꽃',
    minWarmth: 1500,
    maxWarmth: 2199,
    avatarEmoji: '☀️🔥',
    avatarName: '태양의 심장',
    description: '어떤 절망과 시련도 단번에 녹여내는 불멸의 태양',
    perk: '온기 5배 부스터 시청 시 보너스 온기 +2 추가 (+7 온기)',
    bgGradient: 'from-amber-600/40 via-red-600/30 to-slate-900',
    borderClass: 'border-amber-400',
    auraGlowClass: 'shadow-[0_0_40px_rgba(251,191,36,0.85)] ring-3 ring-amber-400/60 animate-pulse',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black border-amber-300',
  },
  {
    level: 14,
    title: '코스믹 성좌의 절대자',
    minWarmth: 2200,
    maxWarmth: 2999,
    avatarEmoji: '🪐👑',
    avatarName: '성좌의 왕관',
    description: '온 우주의 별자리를 다스리는 위대한 치유의 군주',
    perk: '심야 라운지 명예의 전당 최상단 황금 등극 영구 보장',
    bgGradient: 'from-indigo-900/50 via-purple-900/50 to-pink-900/50',
    borderClass: 'border-yellow-200',
    auraGlowClass: 'shadow-[0_0_45px_rgba(250,204,21,0.9)] ring-4 ring-yellow-400/60 animate-pulse',
    badgeColor: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-slate-950 font-black border-yellow-200',
  },
  {
    level: 15,
    title: '영원한 온기의 신화',
    minWarmth: 3000,
    maxWarmth: Infinity,
    avatarEmoji: '🎆💎',
    avatarName: '영원의 프리즘 신화',
    description: '인간의 영역을 넘어선, 밤하늘 영원한 구원의 크리스탈',
    perk: '모든 광고 자동 영구 면제 & 전설의 무지개 성좌 테두리 영구 봉인 해제',
    bgGradient: 'from-amber-500/40 via-pink-500/30 to-cyan-500/40',
    borderClass: 'border-white',
    auraGlowClass: 'shadow-[0_0_55px_rgba(255,255,255,0.95)] ring-4 ring-amber-300/80 animate-pulse',
    badgeColor: 'bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 text-slate-950 font-black border-white',
  },
];

export interface WarmthProgress {
  tier: WarmthTier;
  lifetimeWarmth: number;
  spendableWarmth: number;
  nextTier: WarmthTier | null;
  progressPct: number;
  warmthToNext: number;
  isMaxLevel: boolean;
}

export function calculateWarmthProgress(lifetimeWarmth: number, spendableWarmth: number): WarmthProgress {
  const currentTierIndex = WARMTH_TIERS.findIndex(
    (t) => lifetimeWarmth >= t.minWarmth && lifetimeWarmth <= t.maxWarmth
  );
  const tier = currentTierIndex !== -1 ? WARMTH_TIERS[currentTierIndex] : WARMTH_TIERS[0];
  const nextTier = currentTierIndex < WARMTH_TIERS.length - 1 ? WARMTH_TIERS[currentTierIndex + 1] : null;

  let progressPct = 100;
  let warmthToNext = 0;

  if (nextTier) {
    const range = nextTier.minWarmth - tier.minWarmth;
    const currentInRange = lifetimeWarmth - tier.minWarmth;
    progressPct = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
    warmthToNext = Math.max(0, nextTier.minWarmth - lifetimeWarmth);
  }

  return {
    tier,
    lifetimeWarmth,
    spendableWarmth,
    nextTier,
    progressPct,
    warmthToNext,
    isMaxLevel: !nextTier,
  };
}

const STORAGE_SPENDABLE = 'logmate_user_warmth';
const STORAGE_LIFETIME = 'logmate_lifetime_warmth';

export function getStoredWarmth(): { spendable: number; lifetime: number } {
  if (typeof window === 'undefined') return { spendable: 0, lifetime: 0 };
  const spendableStr = localStorage.getItem(STORAGE_SPENDABLE);
  const lifetimeStr = localStorage.getItem(STORAGE_LIFETIME);

  const spendable = spendableStr ? parseInt(spendableStr, 10) : 0;
  const lifetime = lifetimeStr ? parseInt(lifetimeStr, 10) : Math.max(spendable, 0);

  return { spendable, lifetime };
}

export function addWarmth(amount: number): { spendable: number; lifetime: number; leveledUp: boolean; newTier: WarmthTier } {
  const current = getStoredWarmth();
  const oldTier = calculateWarmthProgress(current.lifetime, current.spendable).tier;

  const newSpendable = current.spendable + amount;
  const newLifetime = current.lifetime + amount;

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SPENDABLE, newSpendable.toString());
    localStorage.setItem(STORAGE_LIFETIME, newLifetime.toString());
  }

  const progress = calculateWarmthProgress(newLifetime, newSpendable);
  const leveledUp = progress.tier.level > oldTier.level;

  return {
    spendable: newSpendable,
    lifetime: newLifetime,
    leveledUp,
    newTier: progress.tier,
  };
}

export function spendWarmth(amount: number): { success: boolean; remaining: number } {
  const current = getStoredWarmth();
  if (current.spendable < amount) return { success: false, remaining: current.spendable };

  const newSpendable = current.spendable - amount;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SPENDABLE, newSpendable.toString());
  }

  return { success: true, remaining: newSpendable };
}
