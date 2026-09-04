// 온기 레벨 & 프로필 아바타 진화 시스템 (총 100단계 대확장)
// 10대 계급(Major Tiers) x 10개 세부 레벨 = 총 100레벨
// 쿨타임 시스템: 10 온기 획득 시 5분(300초) 쿨타임 발동
// 유저별 격리(User-Scoped): 계정 변경 및 로그아웃 시 레벨/온기/패스 완벽 분리

export interface WarmthTier {
  level: number;
  title: string;
  majorRank: string;
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

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

interface RankDefinition {
  majorRank: string;
  emoji: string;
  name: string;
  desc: string;
  perk: string;
  bgGradient: string;
  borderClass: string;
  auraGlowClass: string;
  badgeColor: string;
}

const RANK_DEFINITIONS: RankDefinition[] = [
  {
    majorRank: '새벽의 불씨',
    emoji: '🪵',
    name: '작은 불씨',
    desc: '어둠을 밝히는 첫 번째 온기',
    perk: '기본 안식처 출입 및 촛불 켜기',
    bgGradient: 'from-slate-800 to-amber-950/40',
    borderClass: 'border-slate-700/80',
    auraGlowClass: 'shadow-sm',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  {
    majorRank: '은은한 성냥불',
    emoji: '🕯️',
    name: '성냥의 온기',
    desc: '어두운 방을 처음으로 밝혀주는 작은 불빛',
    perk: '온기 촛불 터치 시 앰버 스파크 효과',
    bgGradient: 'from-amber-950/50 via-slate-900 to-stone-900',
    borderClass: 'border-amber-700/60',
    auraGlowClass: 'shadow-[0_0_10px_rgba(217,119,6,0.25)]',
    badgeColor: 'bg-amber-950/70 text-amber-300 border-amber-600/40',
  },
  {
    majorRank: '밤하늘 반딧불이',
    emoji: '🪔',
    name: '반딧불 등불',
    desc: '어두운 밤길을 걷는 이웃을 비추는 풀벌레의 온기',
    perk: '온기 상점 1일 이용권 무료 교환 자격',
    bgGradient: 'from-emerald-950/70 via-slate-900 to-amber-950/50',
    borderClass: 'border-emerald-500/50',
    auraGlowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
  },
  {
    majorRank: '아늑한 호롱불',
    emoji: '🏮',
    name: '아늑한 호롱불',
    desc: '비바람을 막아주며 잔잔하게 타오르는 등불',
    perk: '사연 작성 시 호롱불 위로 마크 부여',
    bgGradient: 'from-amber-900/60 via-orange-950/50 to-slate-900',
    borderClass: 'border-amber-500/60',
    auraGlowClass: 'shadow-[0_0_18px_rgba(245,158,11,0.4)]',
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
  },
  {
    majorRank: '마음의 촛불지기',
    emoji: '🕯️✨',
    name: '빛나는 황금 촛불',
    desc: '많은 이들의 아픔을 위로하며 영롱해진 빛',
    perk: '촛불 터치 시 골든 샤워 이펙트 강화',
    bgGradient: 'from-amber-950/80 via-yellow-950/40 to-slate-900',
    borderClass: 'border-amber-400',
    auraGlowClass: 'shadow-[0_0_22px_rgba(245,158,11,0.5)] ring-1 ring-amber-400/30',
    badgeColor: 'bg-amber-900/80 text-yellow-300 border-amber-400/60',
  },
  {
    majorRank: '타오르는 모닥불',
    emoji: '🔥',
    name: '심야 모닥불',
    desc: '추위에 지친 모두가 모여들어 몸을 녹이는 온기',
    perk: '심야 라운지 장작 타는 소리 깊이 향상',
    bgGradient: 'from-red-950/70 via-orange-950/60 to-slate-900',
    borderClass: 'border-orange-500',
    auraGlowClass: 'shadow-[0_0_24px_rgba(249,115,22,0.55)] ring-1 ring-orange-400/40',
    badgeColor: 'bg-orange-950/80 text-orange-300 border-orange-500/50',
  },
  {
    majorRank: '새벽의 등대지기',
    emoji: '🗼',
    name: '새벽 바다 등대',
    desc: '거센 파도 속에서도 침묵하며 배를 인도하는 등대',
    perk: '심야 속삭임 글 작성 시 [등대지기] 네온 배지 부여',
    bgGradient: 'from-indigo-950/80 via-blue-950/60 to-slate-900',
    borderClass: 'border-indigo-400',
    auraGlowClass: 'shadow-[0_0_28px_rgba(99,102,241,0.6)] ring-2 ring-indigo-500/40',
    badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/50',
  },
  {
    majorRank: '별빛의 파수꾼',
    emoji: '⭐✨',
    name: '수호의 북극성',
    desc: '가장 어두운 밤하늘에서 길을 밝히는 은빛 성운',
    perk: '프로필 테두리에 반짝이는 별 파티클 회전 효과',
    bgGradient: 'from-blue-950/80 via-purple-950/60 to-slate-900',
    borderClass: 'border-blue-400',
    auraGlowClass: 'shadow-[0_0_30px_rgba(96,165,250,0.65)] ring-2 ring-blue-400/40',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-400/50',
  },
  {
    majorRank: '달빛의 수호자',
    emoji: '🌙✨',
    name: '달빛 초승달',
    desc: '세상의 모든 어둠을 조용히 감싸 안는 신비로운 달빛',
    perk: '심야 라운지 상단 촛불 이펙트 2배 강화 및 달빛 펄스 오라',
    bgGradient: 'from-purple-950/90 via-pink-950/60 to-slate-900',
    borderClass: 'border-pink-400',
    auraGlowClass: 'shadow-[0_0_35px_rgba(236,72,153,0.75)] ring-2 ring-pink-500/50 animate-pulse',
    badgeColor: 'bg-pink-950/80 text-pink-300 border-pink-500/50',
  },
  {
    majorRank: '영원한 코스믹 신화',
    emoji: '🪐👑',
    name: '영원의 프리즘 절대신화',
    desc: '별과 우주를 품어 안은 무한한 사랑과 치유의 절대자',
    perk: '모든 광고 자동 영구 면제 & 전설의 무지개 성좌 테두리 영구 봉인 해제',
    bgGradient: 'from-amber-500/40 via-pink-500/30 to-cyan-500/40',
    borderClass: 'border-white',
    auraGlowClass: 'shadow-[0_0_55px_rgba(255,255,255,0.95)] ring-4 ring-amber-300/80 animate-pulse',
    badgeColor: 'bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 text-slate-950 font-black border-white',
  },
];

// 레벨별 필요 최소 온기 계산 공식 (Lv.1: 0 ~ Lv.100: ~5,240)
export function getMinWarmthForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(2.6 * Math.pow(level - 1, 1.66));
}

// 1부터 100까지 100개 레벨 자동 생성
export const WARMTH_TIERS: WarmthTier[] = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const rankIndex = Math.min(9, Math.floor((level - 1) / 10));
  const subLevel = ((level - 1) % 10) + 1;
  const rankDef = RANK_DEFINITIONS[rankIndex];

  const minWarmth = getMinWarmthForLevel(level);
  const maxWarmth = level < 100 ? getMinWarmthForLevel(level + 1) - 1 : Infinity;

  const isLevel100 = level === 100;
  const title = isLevel100
    ? '영원한 온기의 절대신화 (MAX)'
    : `${rankDef.majorRank} ${ROMAN_NUMERALS[subLevel - 1]}`;

  return {
    level,
    title,
    majorRank: rankDef.majorRank,
    minWarmth,
    maxWarmth,
    avatarEmoji: isLevel100 ? '🎆💎' : rankDef.emoji,
    avatarName: isLevel100 ? '영원의 신화' : `${rankDef.name} ${ROMAN_NUMERALS[subLevel - 1]}단계`,
    description: rankDef.desc,
    perk: rankDef.perk,
    bgGradient: rankDef.bgGradient,
    borderClass: rankDef.borderClass,
    auraGlowClass: rankDef.auraGlowClass,
    badgeColor: rankDef.badgeColor,
  };
});

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

// ==========================================
// 유저별 스코프(User-Scoped) 스토리지 키 생성기
// ==========================================
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('logmate_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      return u?.id || null;
    }
  } catch {}
  return null;
}

export function getUserScopedKey(baseKey: string, customUserId?: string | null): string {
  const uid = customUserId !== undefined ? customUserId : getCurrentUserId();
  return uid ? `${baseKey}_${uid}` : `${baseKey}_guest`;
}

// ==========================================
// 쿨타임 시스템 (10 온기당 5분 쿨다운)
// ==========================================
const STORAGE_SPENDABLE = 'logmate_user_warmth';
const STORAGE_LIFETIME = 'logmate_lifetime_warmth';
const STORAGE_CYCLE_ENERGY = 'logmate_warmth_cycle_energy';
const STORAGE_COOLDOWN_UNTIL = 'logmate_warmth_cooldown_until';

export const MAX_CYCLE_ENERGY = 10;
export const COOLDOWN_DURATION_MS = 5 * 60 * 1000; // 5분 (300초)

export interface CooldownStatus {
  inCooldown: boolean;
  remainingSeconds: number;
  currentEnergy: number;
  maxEnergy: number;
}

export function getCooldownStatus(customUserId?: string | null): CooldownStatus {
  if (typeof window === 'undefined') {
    return { inCooldown: false, remainingSeconds: 0, currentEnergy: 0, maxEnergy: MAX_CYCLE_ENERGY };
  }

  const uid = customUserId !== undefined ? customUserId : getCurrentUserId();
  const cooldownUntilKey = getUserScopedKey(STORAGE_COOLDOWN_UNTIL, uid);
  const energyKey = getUserScopedKey(STORAGE_CYCLE_ENERGY, uid);

  const cooldownUntil = parseInt(localStorage.getItem(cooldownUntilKey) || '0', 10);
  const now = Date.now();

  if (cooldownUntil > now) {
    const remainingSeconds = Math.ceil((cooldownUntil - now) / 1000);
    return {
      inCooldown: true,
      remainingSeconds,
      currentEnergy: MAX_CYCLE_ENERGY,
      maxEnergy: MAX_CYCLE_ENERGY,
    };
  }

  const energy = parseInt(localStorage.getItem(energyKey) || '0', 10);
  return {
    inCooldown: false,
    remainingSeconds: 0,
    currentEnergy: Math.min(MAX_CYCLE_ENERGY, Math.max(0, energy)),
    maxEnergy: MAX_CYCLE_ENERGY,
  };
}

export function getStoredWarmth(customUserId?: string | null): { spendable: number; lifetime: number } {
  if (typeof window === 'undefined') return { spendable: 0, lifetime: 0 };
  const uid = customUserId !== undefined ? customUserId : getCurrentUserId();
  const spendableKey = getUserScopedKey(STORAGE_SPENDABLE, uid);
  const lifetimeKey = getUserScopedKey(STORAGE_LIFETIME, uid);

  let spendableStr = localStorage.getItem(spendableKey);
  let lifetimeStr = localStorage.getItem(lifetimeKey);

  // 마이그레이션: 해당 유저의 키가 비어있고 구버전 단일 키가 있으면 1회 복사
  if (!spendableStr && !lifetimeStr && uid) {
    const legacySpendable = localStorage.getItem(STORAGE_SPENDABLE);
    const legacyLifetime = localStorage.getItem(STORAGE_LIFETIME);
    if (legacySpendable || legacyLifetime) {
      spendableStr = legacySpendable;
      lifetimeStr = legacyLifetime;
      localStorage.setItem(spendableKey, spendableStr || '0');
      localStorage.setItem(lifetimeKey, lifetimeStr || '0');
    }
  }

  const spendable = spendableStr ? parseInt(spendableStr, 10) : 0;
  const lifetime = lifetimeStr ? parseInt(lifetimeStr, 10) : Math.max(spendable, 0);

  return { spendable, lifetime };
}

export interface AddWarmthResult {
  success: boolean;
  spendable: number;
  lifetime: number;
  leveledUp: boolean;
  newTier: WarmthTier;
  cooldownTriggered: boolean;
  remainingCooldownSeconds: number;
  currentEnergy: number;
  maxEnergy: number;
}

export function addWarmth(amount: number, customUserId?: string | null): AddWarmthResult {
  const uid = customUserId !== undefined ? customUserId : getCurrentUserId();
  const current = getStoredWarmth(uid);
  const oldTier = calculateWarmthProgress(current.lifetime, current.spendable).tier;
  const cooldownStatus = getCooldownStatus(uid);

  // 쿨타임 중이면 온기 획득 불가
  if (cooldownStatus.inCooldown) {
    return {
      success: false,
      spendable: current.spendable,
      lifetime: current.lifetime,
      leveledUp: false,
      newTier: oldTier,
      cooldownTriggered: false,
      remainingCooldownSeconds: cooldownStatus.remainingSeconds,
      currentEnergy: MAX_CYCLE_ENERGY,
      maxEnergy: MAX_CYCLE_ENERGY,
    };
  }

  const newSpendable = current.spendable + amount;
  const newLifetime = current.lifetime + amount;
  const newEnergy = cooldownStatus.currentEnergy + amount;

  let cooldownTriggered = false;
  let remainingCooldownSeconds = 0;
  let finalEnergy = newEnergy;

  const cooldownUntilKey = getUserScopedKey(STORAGE_COOLDOWN_UNTIL, uid);
  const energyKey = getUserScopedKey(STORAGE_CYCLE_ENERGY, uid);
  const spendableKey = getUserScopedKey(STORAGE_SPENDABLE, uid);
  const lifetimeKey = getUserScopedKey(STORAGE_LIFETIME, uid);

  if (newEnergy >= MAX_CYCLE_ENERGY) {
    // 10 온기 달성 시 5분 쿨타임 발동!
    cooldownTriggered = true;
    const cooldownUntil = Date.now() + COOLDOWN_DURATION_MS;
    remainingCooldownSeconds = 300;
    finalEnergy = MAX_CYCLE_ENERGY;

    if (typeof window !== 'undefined') {
      localStorage.setItem(cooldownUntilKey, cooldownUntil.toString());
      localStorage.setItem(energyKey, '0');
    }
  } else {
    if (typeof window !== 'undefined') {
      localStorage.setItem(energyKey, newEnergy.toString());
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(spendableKey, newSpendable.toString());
    localStorage.setItem(lifetimeKey, newLifetime.toString());
  }

  const progress = calculateWarmthProgress(newLifetime, newSpendable);
  const leveledUp = progress.tier.level > oldTier.level;

  return {
    success: true,
    spendable: newSpendable,
    lifetime: newLifetime,
    leveledUp,
    newTier: progress.tier,
    cooldownTriggered,
    remainingCooldownSeconds,
    currentEnergy: finalEnergy,
    maxEnergy: MAX_CYCLE_ENERGY,
  };
}

export function spendWarmth(amount: number, customUserId?: string | null): { success: boolean; remaining: number } {
  const uid = customUserId !== undefined ? customUserId : getCurrentUserId();
  const current = getStoredWarmth(uid);
  if (current.spendable < amount) return { success: false, remaining: current.spendable };

  const newSpendable = current.spendable - amount;
  if (typeof window !== 'undefined') {
    localStorage.setItem(getUserScopedKey(STORAGE_SPENDABLE, uid), newSpendable.toString());
  }

  return { success: true, remaining: newSpendable };
}

// ==========================================
// 유저별 패스 및 구독 상태 관리
// ==========================================
export function getStoredPassStatus(customUserId?: string | null): { hasPass: boolean; passInfo: any } {
  if (typeof window === 'undefined') return { hasPass: false, passInfo: null };
  const uid = customUserId !== undefined ? customUserId : getCurrentUserId();
  const hasPassKey = getUserScopedKey('logmate_has_pass', uid);
  const passInfoKey = getUserScopedKey('logmate_pass_info', uid);

  let hasPass = localStorage.getItem(hasPassKey) === 'true';
  let passInfoStr = localStorage.getItem(passInfoKey);

  // 마이그레이션: 글로벌 키가 있으면 유저 키로 복사
  if (!hasPass && !passInfoStr && uid) {
    const legacyPass = localStorage.getItem('logmate_has_pass');
    const legacyInfo = localStorage.getItem('logmate_pass_info');
    if (legacyPass === 'true') {
      hasPass = true;
      passInfoStr = legacyInfo;
      localStorage.setItem(hasPassKey, 'true');
      if (passInfoStr) localStorage.setItem(passInfoKey, passInfoStr);
    }
  }

  let passInfo = null;
  if (passInfoStr) {
    try {
      passInfo = JSON.parse(passInfoStr);
    } catch {}
  }

  return { hasPass, passInfo };
}

export function saveStoredPass(passInfo: any, customUserId?: string | null) {
  if (typeof window === 'undefined') return;
  const uid = customUserId !== undefined ? customUserId : getCurrentUserId();
  const hasPassKey = getUserScopedKey('logmate_has_pass', uid);
  const passInfoKey = getUserScopedKey('logmate_pass_info', uid);

  localStorage.setItem(hasPassKey, 'true');
  localStorage.setItem(passInfoKey, JSON.stringify(passInfo));
  localStorage.setItem('logmate_has_pass', 'true');
  localStorage.setItem('logmate_pass_info', JSON.stringify(passInfo));
}

export function clearStoredPass(customUserId?: string | null) {
  if (typeof window === 'undefined') return;
  const uid = customUserId !== undefined ? customUserId : getCurrentUserId();
  const hasPassKey = getUserScopedKey('logmate_has_pass', uid);
  const passInfoKey = getUserScopedKey('logmate_pass_info', uid);

  localStorage.removeItem(hasPassKey);
  localStorage.removeItem(passInfoKey);
  localStorage.removeItem('logmate_has_pass');
  localStorage.removeItem('logmate_pass_info');
}
