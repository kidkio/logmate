// 온기 레벨 & 프로필 아바타 진화 시스템
// 사용자가 촛불과 부스터 광고를 통해 온기를 모을수록 프로필 아바타와 칭호, 오라가 화려하게 진화합니다.

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
    maxWarmth: 9,
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
    title: '밤하늘 반딧불이',
    minWarmth: 10,
    maxWarmth: 29,
    avatarEmoji: '🪔',
    avatarName: '반딧불 등불',
    description: '어두운 밤을 홀로 걷는 이웃을 비추는 은은한 등불',
    perk: '온기 촛불 탭 시 에메랄드 스파크 발생',
    bgGradient: 'from-emerald-950/70 via-slate-900 to-amber-950/50',
    borderClass: 'border-emerald-500/50',
    auraGlowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  },
  {
    level: 3,
    title: '마음의 촛불지기',
    minWarmth: 30,
    maxWarmth: 69,
    avatarEmoji: '🕯️',
    avatarName: '황금 촛불',
    description: '많은 이들의 아픔을 위로하며 단단해진 온기',
    perk: '온기 보상 상점 무료 패스권 교환 자격 획득',
    bgGradient: 'from-amber-950/80 via-orange-950/40 to-slate-900',
    borderClass: 'border-amber-400/70',
    auraGlowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.45)] ring-1 ring-amber-400/30',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
  },
  {
    level: 4,
    title: '새벽의 등대지기',
    minWarmth: 70,
    maxWarmth: 149,
    avatarEmoji: '🏮',
    avatarName: '새벽 등대',
    description: '거센 비바람에도 흔들리지 않고 모두의 밤을 비추는 등대',
    perk: '심야 속삭임 글 작성 시 [등대지기] 황금 배지 자동 부여',
    bgGradient: 'from-indigo-950/80 via-purple-950/60 to-slate-900',
    borderClass: 'border-indigo-400',
    auraGlowClass: 'shadow-[0_0_25px_rgba(99,102,241,0.55)] ring-2 ring-indigo-500/40',
    badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50',
  },
  {
    level: 5,
    title: '달빛의 수호자',
    minWarmth: 150,
    maxWarmth: 299,
    avatarEmoji: '🌙',
    avatarName: '신비의 초승달',
    description: '수많은 실패를 따뜻하게 품어낸 전설적인 치유자',
    perk: '심야 라운지 상단 온기 촛불 이펙트 3배 강화 & 신비한 오라',
    bgGradient: 'from-purple-950/80 via-pink-950/60 to-slate-900',
    borderClass: 'border-pink-400',
    auraGlowClass: 'shadow-[0_0_30px_rgba(236,72,153,0.6)] ring-2 ring-pink-500/50 animate-pulse',
    badgeColor: 'bg-pink-950/80 text-pink-300 border-pink-500/50',
  },
  {
    level: 6,
    title: '영원한 온기 마스터',
    minWarmth: 300,
    maxWarmth: Infinity,
    avatarEmoji: '☀️✨',
    avatarName: '태양과 성좌',
    description: '어떤 시련도 녹여내는 영원하고 찬란한 온기의 절대자',
    perk: '명예의 전당 등극 및 프로필 황금 성좌 테두리 영구 적용',
    bgGradient: 'from-amber-600/30 via-yellow-500/20 to-purple-950/60',
    borderClass: 'border-yellow-300',
    auraGlowClass: 'shadow-[0_0_35px_rgba(250,204,21,0.8)] ring-3 ring-amber-400/60 animate-pulse',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 font-black',
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
  // 기존에 저장된 온기가 있다면 라이프타임 기본값으로 승계
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
