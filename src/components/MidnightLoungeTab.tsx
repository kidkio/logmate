'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Flame, Sparkles, Volume2, VolumeX, Moon, Heart, Send, Waves, Wind, CloudRain, Clock, ThermometerSun, ExternalLink, Sliders, Target, Trophy, Compass, Star, TrendingUp } from 'lucide-react';
import { soundscape, SOUND_CHANNELS, SOUND_PRESETS, SoundChannel, SoundPreset } from '@/lib/soundscape';
import { User, Failure, ReactionType } from '@/types';
import { RewardedAdModal } from './RewardedAdModal';
import { Toast } from './Toast';
import { WarmthShopModal } from './WarmthShopModal';
import { 
  calculateWarmthProgress, 
  getStoredWarmth, 
  addWarmth, 
  spendWarmth, 
  getCooldownStatus,
  CooldownStatus,
  getBoosterStatus,
  activateBooster,
  BoosterStatus,
  saveStoredPass,
  WarmthProgress,
  WARMTH_SHOP_PRICES 
} from '@/lib/warmthSystem';
import { WarmthAvatar } from './WarmthAvatar';
import { WarmthLevelModal } from './WarmthLevelModal';
import { TarotModal } from './TarotModal';
import { UnlockedSimilarModal } from './UnlockedSimilarModal';
import {
  getTodayBlessing,
  isBlessingClaimed,
  claimBlessing,
  DailyBlessing,
} from '@/lib/dailyBlessings';

export interface WarmthEvent {
  id: string;
  nickname: string;
  amount: number;
  type: 'candle' | 'fever' | 'bonus' | 'milestone' | 'whisper';
  createdAt: string;
}

interface WhisperItem {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  likes: number;
}

interface MidnightLoungeTabProps {
  user: User | null;
  deviceId: string;
  onNavigateTab?: (tab: 'today' | 'lounge' | 'archive') => void;
}

interface FloatingSpark {
  id: number;
  text: string;
  vx: number;
  vy: number;
  rotate: number;
  scale: number;
  delay: number;
}

export function MidnightLoungeTab({ user, deviceId, onNavigateTab }: MidnightLoungeTabProps) {
  const [activeCount, setActiveCount] = useState(1);
  const [candleCount, setCandleCount] = useState(1280);
  const [whispers, setWhispers] = useState<WhisperItem[]>([]);
  const [newWhisperText, setNewWhisperText] = useState('');
  const [isSubmittingWhisper, setIsSubmittingWhisper] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const [likedWhispers, setLikedWhispers] = useState<Set<string>>(new Set());
  const [floatingSparks, setFloatingSparks] = useState<FloatingSpark[]>([]);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [isWarmthShopOpen, setIsWarmthShopOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 온기로 해금된 숨겨진 공감 사연 3편 상태
  const [unlockedFailures, setUnlockedFailures] = useState<Failure[]>([]);
  const [isUnlockedModalOpen, setIsUnlockedModalOpen] = useState(false);

  // 온기 레벨 & 진척도 상태
  const [warmthProgress, setWarmthProgress] = useState<WarmthProgress>(() => {
    const stored = getStoredWarmth(user?.id);
    return calculateWarmthProgress(stored.lifetime, stored.spendable);
  });
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isTarotModalOpen, setIsTarotModalOpen] = useState(false);
  const [cooldownStatus, setCooldownStatus] = useState<CooldownStatus>(() => getCooldownStatus(user?.id));
  const [boosterStatus, setBoosterStatus] = useState<BoosterStatus>(() => getBoosterStatus(user?.id));

  // 회원수·접속자 연동 동적 마일스톤 목표 & 오늘의 은하수 축복 상태
  const [milestoneGoal, setMilestoneGoal] = useState<number>(3500);
  const [memberCount, setMemberCount] = useState<number>(15);
  const [todayBlessing, setTodayBlessing] = useState<DailyBlessing>(() => getTodayBlessing());
  const [isBlessingClaimedToday, setIsBlessingClaimedToday] = useState<boolean>(false);
  const [showBlessingModal, setShowBlessingModal] = useState<boolean>(false);

  // 유저 변경 시 해당 유저의 온기/레벨/쿨타임/부스터/축복수령여부/해금사연 즉시 재동기화
  useEffect(() => {
    const stored = getStoredWarmth(user?.id);
    setWarmthProgress(calculateWarmthProgress(stored.lifetime, stored.spendable));
    setCooldownStatus(getCooldownStatus(user?.id));
    setBoosterStatus(getBoosterStatus(user?.id));
    const blessing = getTodayBlessing();
    setTodayBlessing(blessing);
    setIsBlessingClaimedToday(isBlessingClaimed(blessing.id, user?.id));

    if (typeof window !== 'undefined') {
      try {
        const unlockedKey = `logmate_unlocked_stories_${user?.id || deviceId || 'guest'}`;
        const storedStories = localStorage.getItem(unlockedKey);
        if (storedStories) {
          const parsed = JSON.parse(storedStories);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUnlockedFailures(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to parse unlocked stories in lounge:', e);
      }
    }
  }, [user?.id, deviceId]);

  // 1초 주기로 쿨타임 및 피버 부스터 카운트다운 갱신
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldownStatus(getCooldownStatus(user?.id));
      setBoosterStatus(getBoosterStatus(user?.id));
    }, 1000);
    return () => clearInterval(timer);
  }, [user?.id]);

  const formatCooldown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 사운드스케이프 멀티 채널 믹서 상태
  const [activeChannels, setActiveChannels] = useState<SoundChannel[]>(soundscape.getActiveChannels());
  const [masterVolume, setMasterVolume] = useState<number>(soundscape.getVolume());
  const [channelVolumes, setChannelVolumes] = useState<Record<SoundChannel, number>>({
    rain: soundscape.getChannelVolume('rain'),
    fire: soundscape.getChannelVolume('fire'),
    wave: soundscape.getChannelVolume('wave'),
    wind: soundscape.getChannelVolume('wind'),
    snow: soundscape.getChannelVolume('snow'),
  });
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  // 실시간 참여 유도 & 온기 지수 반응 상태
  const [recentEvents, setRecentEvents] = useState<WarmthEvent[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const [comboMessage, setComboMessage] = useState<string | null>(null);
  const [shootingStars, setShootingStars] = useState<{ id: number; top: number; right: number }[]>([]);
  const [localTempBoost, setLocalTempBoost] = useState(0);
  const [tempSurgeActive, setTempSurgeActive] = useState(false);
  const [todayContribution, setTodayContribution] = useState<number>(0);
  const [luckyWhisper, setLuckyWhisper] = useState<{ text: string; bonus?: number } | null>(null);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 오늘 내가 밝힌 온기 로컬 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const todayStr = new Date().toISOString().split('T')[0];
      const key = `logmate_today_contrib_${todayStr}_${user?.id || 'guest'}`;
      setTodayContribution(parseInt(localStorage.getItem(key) || '0', 10));
    }
  }, [user?.id]);

  // 사운드스케이프 전역 상태 구독
  useEffect(() => {
    const unsub = soundscape.subscribe((channels) => setActiveChannels(channels));
    return unsub;
  }, []);

  // 1. 실제 접속자 하트비트 및 라운지 데이터 실시간 동기화
  const fetchLoungeData = async () => {
    try {
      const res = await fetch(`/api/lounge?deviceId=${encodeURIComponent(deviceId)}`);
      const data = await res.json();
      if (data.success) {
        setCandleCount(data.candleCount);
        setActiveCount(data.activeCount);
        if (data.milestoneGoal) setMilestoneGoal(data.milestoneGoal);
        if (data.memberCount) setMemberCount(data.memberCount);
        setWhispers(data.whispers || []);
        if (data.recentEvents && data.recentEvents.length > 0) {
          setRecentEvents(data.recentEvents);
        }
      }
    } catch (e) {
      console.error('Failed to fetch lounge data:', e);
    }
  };

  useEffect(() => {
    fetchLoungeData();
    // 15초 주기로 실제 접속자 하트비트 전송
    const interval = setInterval(fetchLoungeData, 15000);
    return () => clearInterval(interval);
  }, [deviceId]);

  // 수면 타이머
  useEffect(() => {
    if (!sleepTimerMinutes) return;
    const timer = setTimeout(() => {
      soundscape.stopAll();
      setSleepTimerMinutes(null);
    }, sleepTimerMinutes * 60 * 1000);

    return () => clearTimeout(timer);
  }, [sleepTimerMinutes]);

  // 별똥별 파티클 발동 함수
  const triggerShootingStars = () => {
    const starId = Date.now();
    const newStars = [
      { id: starId + 1, top: 10, right: 12 },
      { id: starId + 2, top: 28, right: 35 },
      { id: starId + 3, top: 18, right: 55 },
    ];
    setShootingStars((prev) => [...prev, ...newStars]);
    setTimeout(() => {
      setShootingStars((prev) => prev.filter((s) => !newStars.some((ns) => ns.id === s.id)));
    }, 1200);
  };

  // 오늘의 은하수 축복 수령 핸들러
  const handleClaimBlessing = () => {
    const res = claimBlessing(todayBlessing, user?.id);
    if (res.success) {
      setIsBlessingClaimedToday(true);
      triggerShootingStars();
      soundscape.playCandleChime(7);
      const updated = getStoredWarmth(user?.id);
      setWarmthProgress(calculateWarmthProgress(updated.lifetime, updated.spendable));
      setShowBlessingModal(true);
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4500);
    } else {
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  // 촛불 켜기 액션 (하이엔드 리플 + 연타 콤보 멜로디 + 즉각적 체온 상승 + 행운의 위로 카드)
  const handleLightCandle = async () => {
    // 0. 쿨타임 상태 검사: 부스터 미적용 상태에서 숨고르는 중이면 모든 진동/소리/콤보 차단
    if (!boosterStatus.isActive && cooldownStatus.inCooldown) {
      setToastMessage(`⏳ 촛불이 숨을 고르는 중입니다. (${formatCooldown(cooldownStatus.remainingSeconds)} 후 다시 밝힐 수 있어요)`);
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    // 1. 햅틱 진동
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }

    // 2. 리플 활성화
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    // 3. 연타 콤보 계산 & 맑은 펜타토닉 음계 연주
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
    }
    const nextCombo = comboCount + 1;
    setComboCount(nextCombo);
    soundscape.playCandleChime(nextCombo);

    if (nextCombo === 3) {
      setComboMessage('🔥 3연타 온기 콤보! 불꽃이 더 영롱해집니다.');
    } else if (nextCombo === 5) {
      setComboMessage('✨ 5 COMBO! 밤하늘에 따스한 온기가 가득합니다.');
    } else if (nextCombo === 7) {
      setComboMessage('🌠 7 COMBO! 밤하늘에 별똥별이 쏟아집니다!');
      triggerShootingStars();
    } else if (nextCombo >= 10 && nextCombo % 5 === 0) {
      setComboMessage(`🎆 ${nextCombo} MAX COMBO! 전설적인 온기 장인!`);
      triggerShootingStars();
    }

    comboTimerRef.current = setTimeout(() => {
      setComboCount(0);
      setComboMessage(null);
    }, 2300);

    // 4. 분수처럼 솟구쳐 퍼지는 온기 파티클 생성 (피버 모드 시 화려한 불꽃 효과)
    const isFever = boosterStatus.isActive;
    const multiplier = isFever ? boosterStatus.multiplier : 1;
    const burstId = Date.now();

    const sparksConfig = isFever ? [
      { text: `🔥 +${multiplier} 온기 (피버!)`, vx: 0, vy: -135, scale: 1.35, rotate: 0 },
      { text: '💥 피버!', vx: -42, vy: -140, scale: 1.2, rotate: -15 },
      { text: `🔥 +${multiplier}`, vx: 42, vy: -135, scale: 1.25, rotate: 15 },
      { text: '✨', vx: -72, vy: -95, scale: 1.0, rotate: -25 },
      { text: '🔥', vx: 72, vy: -100, scale: 1.1, rotate: 25 },
      { text: '🌟', vx: -22, vy: -155, scale: 1.3, rotate: -8 },
      { text: '💛', vx: 22, vy: -150, scale: 1.2, rotate: 8 },
      { text: `+${multiplier}`, vx: -52, vy: -110, scale: 1.1, rotate: -18 },
      { text: `+${multiplier}`, vx: 52, vy: -115, scale: 1.1, rotate: 18 },
    ] : [
      { text: '+1 온기 🕯️', vx: 0, vy: -125, scale: 1.15, rotate: 0 },
      { text: '✨', vx: -42, vy: -140, scale: 1.1, rotate: -15 },
      { text: '💛', vx: 42, vy: -135, scale: 1.1, rotate: 15 },
      { text: '🕯️', vx: -72, vy: -95, scale: 0.95, rotate: -25 },
      { text: '🔥', vx: 72, vy: -100, scale: 0.95, rotate: 25 },
      { text: '✨', vx: -22, vy: -155, scale: 1.2, rotate: -8 },
      { text: '🌟', vx: 22, vy: -150, scale: 1.2, rotate: 8 },
      { text: '+1', vx: -52, vy: -110, scale: 0.9, rotate: -18 },
      { text: '+1', vx: 52, vy: -115, scale: 0.9, rotate: 18 },
    ];

    const newSparks: FloatingSpark[] = sparksConfig.map((item, idx) => ({
      id: burstId + idx,
      text: item.text,
      vx: item.vx + (Math.random() - 0.5) * 14,
      vy: item.vy + (Math.random() - 0.5) * 18,
      scale: item.scale,
      rotate: item.rotate + (Math.random() - 0.5) * 12,
      delay: idx * 25,
    }));

    setFloatingSparks((prev) => [...prev, ...newSparks]);
    setTimeout(() => {
      setFloatingSparks((prev) => prev.filter((s) => !newSparks.some((ns) => ns.id === s.id)));
    }, 1500);

    const warmthRes = addWarmth(1, user?.id);
    if (!warmthRes.success) {
      setToastMessage(`⏳ 촛불이 숨을 고르는 중입니다. (${formatCooldown(warmthRes.remainingCooldownSeconds)} 후 재충전)`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const effectiveAdd = warmthRes.effectiveAmount || 1;
    setCandleCount((prev) => prev + effectiveAdd);
    setCooldownStatus(getCooldownStatus(user?.id));
    setBoosterStatus(getBoosterStatus(user?.id));
    setWarmthProgress(calculateWarmthProgress(warmthRes.lifetime, warmthRes.spendable));

    // 5. 실시간 체온 즉각 반응 (+0.1°C 또는 피버 시 +0.3°C)
    const tempIncrement = isFever ? 0.3 : 0.1;
    setLocalTempBoost((prev) => Math.min(6.0, Number((prev + tempIncrement).toFixed(1))));
    setTempSurgeActive(true);
    setTimeout(() => setTempSurgeActive(false), 900);

    // 6. 오늘 내가 밝힌 온기 저장
    if (typeof window !== 'undefined') {
      const todayStr = new Date().toISOString().split('T')[0];
      const key = `logmate_today_contrib_${todayStr}_${user?.id || 'guest'}`;
      const updatedContrib = todayContribution + effectiveAdd;
      setTodayContribution(updatedContrib);
      localStorage.setItem(key, updatedContrib.toString());
    }

    // 7. 행운의 위로 포춘 카드 (12% 확률 발동)
    if (Math.random() < 0.12) {
      const comfortQuotes = [
        { text: '오늘 하루도 충분히 애썼어요. 작은 실수에 너무 아파하지 마세요 🌿' },
        { text: '당신의 온기가 방금 외로운 누군가의 밤을 따뜻하게 데웠습니다 💛' },
        { text: '실패는 멈춤이 아니라, 더 멀리 도약하기 위한 웅크림일 뿐이에요 🌱' },
        { text: '잠시 깊게 숨을 들이쉬고 내쉬어보세요. 모든 아픔은 결국 지나갑니다 🌙' },
        { text: '서툴러도 괜찮아요. 우리 모두 이번 생은 처음 살아보는 거잖아요 🕊️' },
        { text: '오늘 밤 흘린 눈물은 내일 당신을 더 단단하게 피워낼 거름이 됩니다 ✨' },
        { text: '🎁 깜짝 보너스! 온기 요정이 응원의 온기 +3개를 선물했습니다!', bonus: 3 },
      ];
      const selectedQuote = comfortQuotes[Math.floor(Math.random() * comfortQuotes.length)];
      if (selectedQuote.bonus) {
        addWarmth(selectedQuote.bonus, user?.id);
        const stored = getStoredWarmth(user?.id);
        setWarmthProgress(calculateWarmthProgress(stored.lifetime, stored.spendable));
      }
      setLuckyWhisper(selectedQuote);
      setTimeout(() => setLuckyWhisper(null), 5000);
    }

    // 8. 내 활동을 로컬 실시간 온기 물결에 즉시 반영
    const myNickname = user?.nickname || '어느 밤의 이웃';
    const myNewEvent: WarmthEvent = {
      id: `my_${Date.now()}`,
      nickname: myNickname,
      amount: effectiveAdd,
      type: isFever ? 'fever' : 'candle',
      createdAt: new Date().toISOString(),
    };
    setRecentEvents((prev) => [myNewEvent, ...prev.slice(0, 19)]);

    if (warmthRes.cooldownTriggered) {
      setToastMessage(`🔥 10 온기를 가득 채웠습니다! 촛불이 15분간 숨을 고릅니다.`);
      setTimeout(() => setToastMessage(null), 3500);
    } else if (warmthRes.leveledUp) {
      setToastMessage(`🎉 축하합니다! Lv.${warmthRes.newTier.level} [${warmthRes.newTier.title}]로 승급하셨습니다! 아바타 ${warmthRes.newTier.avatarEmoji} 해금!`);
      setTimeout(() => setToastMessage(null), 3500);
    }

    try {
      const res = await fetch('/api/lounge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'candle', 
          deviceId,
          amount: effectiveAdd,
          isFever,
          nickname: myNickname,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCandleCount(data.candleCount);
        if (data.activeCount) setActiveCount(data.activeCount);
        if (data.recentEvents && data.recentEvents.length > 0) {
          setRecentEvents(data.recentEvents);
        }
      }
    } catch (e) {
      console.error('Failed to light candle:', e);
    }
  };

  // 개별 채널 토글 (멀티 트랙 조합)
  const handleToggleChannel = (channel: SoundChannel) => {
    soundscape.toggleChannel(channel);
  };

  // 개별 채널 볼륨 변경
  const handleChannelVolumeChange = (channel: SoundChannel, val: number) => {
    soundscape.setChannelVolume(channel, val);
    setChannelVolumes((prev) => ({ ...prev, [channel]: val }));
  };

  // 마스터 볼륨 변경
  const handleMasterVolumeChange = (newVol: number) => {
    setMasterVolume(newVol);
    soundscape.setVolume(newVol);
  };

  // 추천 조합 프리셋 적용
  const handlePresetClick = (preset: SoundPreset) => {
    soundscape.playPreset(preset);
  };

  // 모든 소리 끄기
  const handleStopAll = () => {
    soundscape.stopAll();
  };

  // 속삭임 등록
  const handleSubmitWhisper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhisperText.trim() || isSubmittingWhisper) return;

    setIsSubmittingWhisper(true);
    const authorNickname = user?.nickname || '어느 밤의 이웃';

    try {
      const res = await fetch('/api/lounge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'whisper',
          text: newWhisperText.trim(),
          nickname: authorNickname,
          deviceId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWhispers(data.whispers);
        setNewWhisperText('');
      }
    } catch (e) {
      console.error('Failed to post whisper:', e);
    } finally {
      setIsSubmittingWhisper(false);
    }
  };

  // 속삭임 공감
  const handleLikeWhisper = async (id: string) => {
    if (likedWhispers.has(id)) return;

    setLikedWhispers((prev) => new Set(prev).add(id));
    setWhispers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, likes: w.likes + 1 } : w))
    );

    try {
      await fetch('/api/lounge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', whisperId: id, deviceId }),
      });
    } catch (e) {
      console.error('Failed to like whisper:', e);
    }
  };

  // 논리적 밤하늘 온기 지수:
  // 사람의 표준 체온(36.5°C)을 기본 안식처 온도로 삼고,
  // 오늘 켜진 온기 촛불, 실시간 이웃들의 접속, 그리고 내가 클릭할 때마다 더해지는 실시간 온기 부스트로
  // 36.5°C ~ 42.0°C(기적의 치유 온도)까지 실시간으로 따뜻하게 가열됩니다.
  const baseTemp = 36.5;
  const candleBoost = Math.min(2.5, Math.floor(candleCount / 200) * 0.15);
  const visitorBoost = Math.min(1.0, activeCount * 0.15);
  const warmthDegree = (baseTemp + candleBoost + visitorBoost + localTempBoost).toFixed(1);

  const warmthStatus =
    Number(warmthDegree) >= 39.5 ? '기적의 온기 오로라 🌟' :
    Number(warmthDegree) >= 38.0 ? '타오르는 온기 열정 🔥' :
    Number(warmthDegree) >= 37.2 ? '훈훈한 모닥불 온기 ♨️' :
    Number(warmthDegree) >= 36.5 ? '사람의 포근한 체온 💛' : '선선한 새벽 공기 🌙';

  // 오늘 밤 커뮤니티 온기 마일스톤 목표 (회원수·접속자 연동 동적 산출)
  const milestonePercent = Math.min(100, Math.round((candleCount / milestoneGoal) * 100));
  const isGoalAchieved = candleCount >= milestoneGoal;
  const tier1Goal = Math.round(milestoneGoal * 0.3);
  const tier2Goal = Math.round(milestoneGoal * 0.65);
  const tier3Goal = milestoneGoal;

  return (
    <div className="relative w-full h-full flex-1 overflow-y-auto space-y-4 px-1 pb-28 pt-1 text-slate-100 select-none no-scrollbar">
      {/* 0. 오늘 밤하늘 목표 달성 시 밤하늘 전체에 개화하는 은하수 오로라 & 별빛 배경 */}
      {isGoalAchieved && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden rounded-3xl">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-b from-purple-600/40 via-indigo-600/30 to-teal-500/15 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute top-1/4 -left-16 w-72 h-72 bg-teal-400/25 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute top-1/3 -right-16 w-72 h-72 bg-pink-500/25 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-35" />
        </div>
      )}

      {/* 0-1. 은하수 목표 100% 개화 축하 스페셜 엠블럼 배너 */}
      {isGoalAchieved && (
        <div className="w-full p-4 rounded-3xl bg-gradient-to-r from-purple-950/95 via-indigo-950/95 to-amber-950/90 border border-purple-400/70 shadow-[0_0_40px_rgba(168,85,247,0.45)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 animate-pulse" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-amber-400 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(216,180,254,0.7)] flex-shrink-0 animate-bounce">
              🌌
            </div>
            <div className="space-y-0.5 text-left flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/60 text-[10px] font-black text-purple-200 shadow-sm">
                  ✨ 은하수 개화 축복 100% 발동!
                </span>
                <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {todayBlessing.badge}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-slate-100 truncate">
                {todayBlessing.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-tight">
                {todayBlessing.buffDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. 상단 실제 접속자 라이브 배너 */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-indigo-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-200">심야 라이브 온기</span>
          </div>
          <p className="text-[11px] text-slate-400">
            지금 밤하늘 아래 라이브 <span className="text-indigo-300 font-bold font-mono">{activeCount}명</span> · 총 <span className="text-amber-300 font-bold font-mono">{memberCount}명</span>의 이웃이 함께 머무르고 있어요.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">오늘 모인 온기</span>
          <span className="text-xs font-black text-amber-300 font-mono">🕯️ {candleCount.toLocaleString()}개</span>
        </div>
      </div>

      {/* 1-2. 실시간 온기 물결 라이브 티커 */}
      {recentEvents.length > 0 && (
        <div className="glass-card rounded-xl px-3 py-2 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/50 to-amber-950/30 flex items-center gap-2 overflow-hidden text-[11px] shadow-sm">
          <span className="flex-shrink-0 flex items-center gap-1 font-bold text-amber-300 text-[10px] bg-amber-950/70 border border-amber-500/40 px-1.5 py-0.5 rounded-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>온기 물결</span>
          </span>
          <div className="flex-1 truncate text-slate-300 animate-in fade-in duration-300">
            {recentEvents[0].type === 'fever' ? (
              <span>🔥 <strong className="text-orange-300 font-semibold">{recentEvents[0].nickname}</strong>님이 2배 피버 탭으로 밤하늘을 밝혔습니다! (+{recentEvents[0].amount} 🕯️)</span>
            ) : recentEvents[0].type === 'whisper' ? (
              <span>🌙 <strong className="text-pink-300 font-semibold">{recentEvents[0].nickname}</strong>님이 밤하늘에 한 줄 소망을 띄웠습니다</span>
            ) : recentEvents[0].type === 'bonus' ? (
              <span>🎁 <strong className="text-amber-300 font-semibold">{recentEvents[0].nickname}</strong>님이 행운의 온기 카드를 발견했습니다 (+{recentEvents[0].amount} 🌟)</span>
            ) : (
              <span>🕯️ <strong className="text-amber-200 font-semibold">{recentEvents[0].nickname}</strong>님이 온기 촛불을 켰습니다 (+{recentEvents[0].amount} 🕯️)</span>
            )}
          </div>
        </div>
      )}

      {/* 1-3. 오늘 밤 커뮤니티 온기 마일스톤 게이지 바 */}
      <div className={`glass-card rounded-2xl p-3.5 border transition-all duration-500 space-y-2 ${
        isGoalAchieved
          ? 'border-purple-500/50 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
          : 'border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {isGoalAchieved ? (
              <>
                <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
                <span className="font-bold text-purple-200">오늘 밤하늘 은하수 목표 100% 달성! 🌌</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-slate-200">오늘 밤하늘 목표: {milestoneGoal.toLocaleString()} 온기</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 font-mono font-bold text-xs">
            <span className={isGoalAchieved ? 'text-purple-300 font-black' : 'text-amber-300'}>
              {candleCount.toLocaleString()}
            </span>
            <span className={isGoalAchieved ? 'text-purple-400 font-semibold' : 'text-slate-500 font-normal'}>
              / {milestoneGoal.toLocaleString()} ({milestonePercent}% {isGoalAchieved ? '완료' : ''})
            </span>
          </div>
        </div>

        {/* 게이지 바 */}
        <div className="relative w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-700 relative ${
              isGoalAchieved
                ? 'bg-gradient-to-r from-teal-400 via-purple-400 to-amber-300 shadow-[0_0_16px_rgba(168,85,247,0.8)]'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
            }`}
            style={{ width: `${milestonePercent}%` }}
          >
            <div className="absolute inset-0 bg-white/25 animate-pulse" />
          </div>
        </div>

        {/* 마일스톤 3단계 뱃지 (회원수·접속자 연동 동적 산출) */}
        <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
          <div className={`p-1.5 rounded-lg border text-center transition-all ${
            candleCount >= tier1Goal
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-white/[0.02] border-white/[0.05] text-slate-500'
          }`}>
            <span className="block font-bold">{tier1Goal.toLocaleString()} 온기</span>
            <span className="text-[9px]">🌙 새벽 미명 {candleCount >= tier1Goal ? '✓' : ''}</span>
          </div>
          <div className={`p-1.5 rounded-lg border text-center transition-all ${
            candleCount >= tier2Goal
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-white/[0.02] border-white/[0.05] text-slate-500'
          }`}>
            <span className="block font-bold">{tier2Goal.toLocaleString()} 온기</span>
            <span className="text-[9px]">🕯️ 모닥불 {candleCount >= tier2Goal ? '✓' : ''}</span>
          </div>
          <div className={`p-1.5 rounded-lg border text-center transition-all ${
            candleCount >= tier3Goal
              ? 'bg-purple-950/80 border-purple-400/70 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.5)] font-bold'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
          }`}>
            <span className="block font-bold">{tier3Goal.toLocaleString()} 온기</span>
            <span className="text-[9px]">🌟 은하수 {candleCount >= tier3Goal ? '개화 완료! ✓' : `보너스+${todayBlessing.rewardAmount}`}</span>
          </div>
        </div>
      </div>

      {/* 1-4. [오늘의 은하수 축복 & 데일리 목표 보상 카드] (매일 랜덤/순환 교체) */}
      <div className={`glass-card rounded-2xl p-4 border transition-all duration-500 relative overflow-hidden ${
        isGoalAchieved
          ? `bg-gradient-to-br ${todayBlessing.gradient} ${todayBlessing.border} ${todayBlessing.glow}`
          : 'bg-gradient-to-br from-indigo-950/30 via-slate-900/50 to-purple-950/30 border-white/[0.08]'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border flex-shrink-0 shadow-md ${
              isGoalAchieved
                ? 'bg-purple-500/30 border-purple-400/50 shadow-purple-500/30 animate-bounce'
                : 'bg-white/[0.04] border-white/[0.08]'
            }`}>
              {todayBlessing.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {todayBlessing.dayName}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isGoalAchieved
                    ? 'bg-purple-500/30 text-purple-200 border-purple-400/50 animate-pulse'
                    : 'bg-white/[0.05] text-slate-400 border-white/10'
                }`}>
                  {isGoalAchieved ? '✨ 은하수 축복 개화 완료' : '🔒 목표 달성 시 해금'}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
                <span>{todayBlessing.title}</span>
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {todayBlessing.description}
              </p>
              <p className="text-[10px] text-amber-300/90 font-medium">
                🎁 보상 혜택: <strong>{todayBlessing.rewardLabel}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* 축복 수령 / 상태 버튼 */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            {isGoalAchieved
              ? '오늘 밤 3시까지 모든 안식처 이웃에게 적용됩니다'
              : `목표까지 ${Math.max(0, milestoneGoal - candleCount).toLocaleString()} 온기 남음`}
          </span>

          {isGoalAchieved ? (
            isBlessingClaimedToday ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                <span>✓ 축복 수령 완료 (적용 중)</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleClaimBlessing}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:opacity-90 active:scale-95 shadow-lg shadow-purple-500/30 transition-all flex items-center gap-1.5 animate-pulse"
              >
                <span>🎁 축복 수령하기</span>
              </button>
            )
          ) : (
            <span className="text-[10px] font-mono font-semibold text-slate-500 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06]">
              달성률 {milestonePercent}%
            </span>
          )}
        </div>
      </div>

      {/* 2. 중앙 온기 촛불 켜기 히어로 섹션 (실감나는 인터랙티브 캔들 + 앰비언트 글로우) */}
      <div className={`relative glass-card rounded-3xl p-6 text-center border overflow-hidden transition-all duration-700 flex flex-col items-center justify-center ${
        Number(warmthDegree) >= 38.0
          ? 'border-amber-400/50 shadow-[0_10px_45px_rgba(245,158,11,0.25)] bg-gradient-to-b from-amber-950/40 via-slate-900 to-black'
          : 'border-amber-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.7)]'
      }`}>
        {/* 파동 리플 애니메이션 */}
        {rippleActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border-2 border-amber-400/80 animate-ping duration-1000" />
            <div className="w-72 h-72 rounded-full border border-pink-400/50 animate-ping duration-1000 delay-150" />
          </div>
        )}

        {/* 별똥별 떨어짐 이펙트 (7 콤보 이상 발동) */}
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="absolute pointer-events-none w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] z-20"
            style={{
              top: `${star.top}%`,
              right: `${star.right}%`,
              animation: 'shootingStar 0.9s ease-out forwards',
            }}
          />
        ))}

        {/* 연타 콤보 플로팅 뱃지 */}
        {comboCount >= 2 && (
          <div className="mb-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-black text-xs shadow-[0_0_18px_rgba(245,158,11,0.8)] animate-bounce flex items-center gap-1.5 select-none">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>{comboCount} COMBO!</span>
            {comboMessage && <span className="text-[10px] font-medium opacity-90 hidden sm:inline">| {comboMessage}</span>}
          </div>
        )}

        {/* 행운의 위로 포춘 카드: 레이아웃 시프트(클릭 위치 흔들림) 방지를 위해 상단 플로팅 절대 위치(absolute)로 렌더링 */}
        {luckyWhisper && (
          <div className="absolute top-3 left-4 right-4 z-40 p-2.5 rounded-2xl bg-gradient-to-br from-amber-950/95 via-slate-900/95 to-indigo-950/95 border border-amber-400/70 shadow-[0_4px_30px_rgba(245,158,11,0.6)] backdrop-blur-md text-center animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-none">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-300 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>오늘 밤 당신에게 닿은 행운의 위로</span>
            </div>
            <p className="text-xs text-amber-100 font-medium leading-relaxed">
              &ldquo;{luckyWhisper.text}&rdquo;
            </p>
          </div>
        )}

        {/* 상단 콤보 & 피버 상태 고정 영역 (레이아웃 시프트 방지) */}
        <div className="h-8 flex items-center justify-center mb-1 w-full max-w-xs">
          {boosterStatus.isActive ? (
            <div className="w-full py-1 px-3 rounded-full bg-gradient-to-r from-red-950/90 via-orange-900/90 to-amber-950/90 border border-orange-500/80 shadow-[0_0_20px_rgba(249,115,22,0.5)] flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-200">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-bounce" />
                <span>🔥 2배 온기 피버 모드!</span>
              </div>
              <span className="font-mono font-black text-[11px] text-orange-300 bg-black/50 px-2 py-0.5 rounded-full border border-orange-400/40">
                {formatCooldown(boosterStatus.remainingSeconds)}
              </span>
            </div>
          ) : comboCount >= 2 ? (
            <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-black text-xs shadow-[0_0_18px_rgba(245,158,11,0.8)] animate-bounce flex items-center gap-1.5 select-none">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>{comboCount} COMBO!</span>
              {comboMessage && <span className="text-[10px] font-medium opacity-90 hidden sm:inline">| {comboMessage}</span>}
            </div>
          ) : null}
        </div>

        {/* 분수처럼 솟구쳐 퍼지는 온기 스파크 파티클들 */}
        {floatingSparks.map((spark) => (
          <div
            key={spark.id}
            className="absolute top-1/2 left-1/2 pointer-events-none z-30 font-bold text-xs text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.95)] select-none"
            style={{
              animation: `fountainBurst 1.3s cubic-bezier(0.12, 0.8, 0.32, 1) forwards`,
              animationDelay: `${spark.delay}ms`,
              '--target-vx': `${spark.vx}px`,
              '--target-vy': `${spark.vy}px`,
              '--target-rot': `${spark.rotate}deg`,
              '--target-scale': spark.scale,
            } as React.CSSProperties}
          >
            {spark.text}
          </div>
        ))}

        {/* 은하수 개화 축복 활성화 엠블럼 */}
        {isGoalAchieved && (
          <div className="mb-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-amber-500/30 border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center gap-1.5 animate-pulse select-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span className="text-[10px] font-extrabold text-purple-200">
              은하수 개화 축복 발동 중 🌌
            </span>
          </div>
        )}

        {/* 실감나는 멀티레이어 SVG 촛불 비주얼 (쿨타임 시 클릭 불가 및 휴식 모드 전환) */}
        <div
          onClick={!boosterStatus.isActive && cooldownStatus.inCooldown ? undefined : handleLightCandle}
          className={`relative transition-all my-2 select-none ${
            boosterStatus.isActive
              ? 'cursor-pointer group active:scale-95 scale-105'
              : cooldownStatus.inCooldown
              ? 'cursor-not-allowed opacity-75'
              : 'cursor-pointer group active:scale-95'
          }`}
          title={
            boosterStatus.isActive
              ? '🔥 2배 온기 피버 탭! (+2 🕯️)'
              : cooldownStatus.inCooldown
              ? `⏳ 촛불이 숨을 고르는 중입니다 (${formatCooldown(cooldownStatus.remainingSeconds)} 후 재충전)`
              : '탭하여 온기 촛불 밝히기 (연타 시 맑은 멜로디가 울려요)'
          }
        >
          {/* 황금빛 / 피버 화염 주변광 글로우 / 은하수 개화 오라 */}
          <div
            className={`absolute -inset-6 rounded-full transition-all ${
              boosterStatus.isActive
                ? 'bg-gradient-to-tr from-red-600/60 via-orange-500/50 to-amber-400/40 blur-3xl animate-pulse'
                : cooldownStatus.inCooldown
                ? 'bg-indigo-950/40 blur-xl opacity-40'
                : isGoalAchieved
                ? 'bg-gradient-to-tr from-purple-500/50 via-amber-400/50 to-teal-400/40 blur-3xl animate-[pulse_2s_ease-in-out_infinite]'
                : 'bg-gradient-to-tr from-amber-500/40 via-orange-500/30 to-transparent blur-2xl group-hover:blur-3xl animate-pulse'
            }`}
          />

          {/* 촛불 불꽃과 촛대 컨테이너 */}
          <div className="relative flex flex-col items-center">
            {/* 춤추는 불꽃 SVG / 쿨타임 시 조용한 쉼의 불꽃 */}
            <div className={`relative duration-1000 ${
              boosterStatus.isActive
                ? 'animate-bounce scale-110'
                : cooldownStatus.inCooldown
                ? 'scale-90 opacity-60'
                : isGoalAchieved
                ? 'animate-bounce scale-105'
                : 'animate-bounce'
            }`}>
              {/* 은하수 개화 시 불꽃 주위를 회전하는 천상의 별빛 궤도 */}
              {isGoalAchieved && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border border-purple-400/50 animate-[spin_12s_linear_infinite] pointer-events-none flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                  <span className="text-[10px] absolute -top-1">✨</span>
                  <span className="text-[10px] absolute -bottom-1">🌟</span>
                  <span className="text-[10px] absolute -left-1">💫</span>
                  <span className="text-[10px] absolute -right-1">⭐</span>
                </div>
              )}
              <svg
                viewBox="0 0 64 90"
                className={`w-14 h-20 filter ${
                  boosterStatus.isActive
                    ? 'drop-shadow-[0_0_26px_rgba(239,68,68,0.95)]'
                    : cooldownStatus.inCooldown
                    ? 'drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]'
                    : isGoalAchieved
                    ? 'drop-shadow-[0_0_24px_rgba(168,85,247,0.9)]'
                    : 'drop-shadow-[0_0_18px_rgba(245,158,11,0.95)]'
                }`}
              >
                <defs>
                  <radialGradient id="flameGrad" cx="50%" cy="80%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="30%" stopColor={cooldownStatus.inCooldown && !boosterStatus.isActive ? '#94A3B8' : '#FEF08A'} />
                    <stop offset="65%" stopColor={cooldownStatus.inCooldown && !boosterStatus.isActive ? '#64748B' : '#F97316'} />
                    <stop offset="100%" stopColor={cooldownStatus.inCooldown && !boosterStatus.isActive ? '#475569' : '#DC2626'} />
                  </radialGradient>
                  <radialGradient id="blueCore" cx="50%" cy="90%" r="35%">
                    <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* 외곽 흔들리는 유기적 불꽃 형태 */}
                <path
                  d="M32 6 C36 28 52 46 52 66 C52 82 42 88 32 88 C22 88 12 82 12 66 C12 46 28 28 32 6 Z"
                  fill="url(#flameGrad)"
                  className="animate-pulse"
                />
                {/* 불꽃 하단 산소 코어 푸른빛 */}
                <ellipse cx="32" cy="74" rx="9" ry="11" fill="url(#blueCore)" />
              </svg>
            </div>

            {/* 심지 */}
            <div className="w-1 h-3 bg-neutral-900 rounded-t -mt-1 shadow-sm" />

            {/* 캔들 왁스 기둥 바디 */}
            <div className="relative w-16 h-14 rounded-b-2xl rounded-t-lg bg-gradient-to-b from-amber-100/90 via-amber-200/80 to-amber-900/60 border border-amber-300/40 shadow-inner overflow-hidden">
              {/* 왁스 상단 녹아내림 하이라이트 */}
              <div className="w-full h-2 bg-amber-50/90 rounded-full blur-[0.5px]" />
              <div className="absolute top-1 left-2 w-1.5 h-6 bg-amber-100/70 rounded-full blur-[0.5px]" />
            </div>

            {/* 쿨타임 중 숨고르기 미니 배지 */}
            {cooldownStatus.inCooldown && !boosterStatus.isActive && (
              <div className="absolute -bottom-2.5 px-2 py-0.5 rounded-full bg-slate-900/95 border border-amber-500/40 text-[9px] font-bold text-amber-300 shadow-md flex items-center gap-1 z-20 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>숨고르는 중 ({formatCooldown(cooldownStatus.remainingSeconds)})</span>
              </div>
            )}
          </div>
        </div>

        {/* 촛불 카피 */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm sm:text-base font-black text-slate-100">
            {boosterStatus.isActive
              ? '🔥 2배 온기 피버 모드가 가동 중입니다!'
              : cooldownStatus.inCooldown
              ? '🕯️ 촛불이 편안하게 숨을 고르는 중입니다'
              : '이웃들에게 작은 온기를 밝혀주세요'}
          </h3>
          <p className="text-[11px] text-slate-400">
            {boosterStatus.isActive
              ? '촛불을 터치할 때마다 +2 온기가 차곡차곡 쌓입니다. 마음껏 터치하세요!'
              : cooldownStatus.inCooldown
              ? '10 온기를 충전하여 15분간 휴식 중입니다. 2배 부스터 시청 시 즉시 피버 모드로 깨어납니다.'
              : '촛불을 터치할 때마다 맑은 멜로디와 함께 실시간 온기 지수가 따뜻하게 데워집니다.'}
          </p>
        </div>

        {/* 온기 충전 게이지 & 쿨타임 & 피버 인디케이터 */}
        <div className="w-full max-w-xs mt-3 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-white/[0.06] flex items-center justify-between text-[11px]">
          {boosterStatus.isActive ? (
            <div className="flex items-center justify-between w-full text-orange-300 font-bold">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-bounce" />
                <span>피버 모드 (터치당 +2 🕯️ 무제한)</span>
              </div>
              <span className="font-mono text-xs text-orange-200 font-black">
                {formatCooldown(boosterStatus.remainingSeconds)}
              </span>
            </div>
          ) : cooldownStatus.inCooldown ? (
            <div className="flex items-center gap-1.5 text-amber-300 font-mono w-full justify-center">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>촛불이 숨을 고르는 중...</span>
              <strong className="text-amber-200 font-bold">{formatCooldown(cooldownStatus.remainingSeconds)}</strong>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 text-slate-400">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>온기 충전 게이지</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${(cooldownStatus.currentEnergy / 10) * 100}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-amber-300 text-[10px]">
                  {cooldownStatus.currentEnergy}/10
                </span>
              </div>
            </>
          )}
        </div>

        {/* 인터랙티브 탭 버튼 & 2배 피버 부스터 */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 w-full max-w-xs justify-center">
          <button
            onClick={handleLightCandle}
            disabled={!boosterStatus.isActive && cooldownStatus.inCooldown}
            className={`w-full sm:w-auto flex-1 py-2 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              boosterStatus.isActive
                ? 'text-white bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 active:scale-95 shadow-[0_0_25px_rgba(249,115,22,0.6)] animate-pulse font-black'
                : cooldownStatus.inCooldown
                ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                : 'text-amber-300 bg-amber-950/70 border border-amber-500/40 hover:bg-amber-900/70 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
            }`}
          >
            {boosterStatus.isActive ? (
              <>
                <Flame className="w-4 h-4 fill-white text-white animate-bounce" />
                <span>🔥 2배 피버 탭! (+2 🕯️)</span>
              </>
            ) : cooldownStatus.inCooldown ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                <span>휴식 중 ({formatCooldown(cooldownStatus.remainingSeconds)})</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin duration-3000" />
                <span>온기 촛불 켜기 (+1)</span>
              </>
            )}
          </button>

          {boosterStatus.isActive ? (
            <div
              className="w-full sm:w-auto py-2 px-3.5 rounded-2xl text-xs font-bold bg-orange-950/50 border border-orange-500/40 text-orange-300 flex items-center justify-center gap-1.5 select-none shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              title="30초간 2배 온기 피버 모드가 가동 중입니다"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 animate-spin" />
              <span>피버 중 ({formatCooldown(boosterStatus.remainingSeconds)})</span>
            </div>
          ) : (
            <button
              onClick={() => setIsRewardedAdOpen(true)}
              className="w-full sm:w-auto py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-pink-200 bg-pink-950/70 border border-pink-500/40 hover:bg-pink-900/70 active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.25)]"
              title="15초 광고 시청 후 30초간 터치당 온기 2배 피버 모드 발동"
            >
              <Flame className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
              <span>2배 피버 부스터 🔥</span>
            </button>
          )}
        </div>

        {/* 내 온기 레벨 & 잔액 & 상점 진입 버튼 */}
        <div className="w-full max-w-xs mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <div
            onClick={() => setIsLevelModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer group"
            title="온기 레벨 & 도감 보기"
          >
            <WarmthAvatar tier={warmthProgress.tier} size="sm" />
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                  Lv.{warmthProgress.tier.level} {warmthProgress.tier.title}
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                보유 {warmthProgress.spendableWarmth}개
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsWarmthShopOpen(true)}
            className="py-1.5 px-3 rounded-xl text-[11px] font-bold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>온기 상점 🎁</span>
          </button>
        </div>

        {/* 온기 지수 게이지 (터치 시 실시간 온도 상승 반응) */}
        <div className="w-full max-w-xs mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="relative">
              <ThermometerSun className={`w-3.5 h-3.5 ${Number(warmthDegree) >= 38 ? 'text-orange-400 animate-pulse' : 'text-amber-400'}`} />
              {tempSurgeActive && (
                <span className="absolute -top-3.5 -right-3 text-[9px] font-black text-amber-300 animate-bounce tracking-tighter">
                  ▲+0.1°
                </span>
              )}
            </div>
            <span>밤하늘 온기 지수</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="font-mono text-amber-300 text-xs">{warmthDegree}°C</span>
            <span className="text-amber-400/90 text-[10px]">({warmthStatus})</span>
          </div>
        </div>

        {/* 오늘 내가 밝힌 온기 기여도 표시 */}
        <div className="w-full max-w-xs mt-1.5 px-3 py-1 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" />
            <span>오늘 내가 피운 온기</span>
          </span>
          <span className="font-mono font-bold text-amber-300">🕯️ {todayContribution}개 기여</span>
        </div>
      </div>

      {/* 3. 4채널 멀티 트랙 조합 ASMR 사운드스케이프 믹서 */}
      <div className="glass-card rounded-2xl p-4 border border-white/[0.08] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">심야 수면 ASMR 믹서 (나만의 소리 조합)</span>
          </div>

          {activeChannels.length > 0 && (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeChannels.length}개 소리 동시 조합 중</span>
            </span>
          )}
        </div>

        {/* 추천 조합 프리셋 바 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>추천 조합:</span>
          </span>
          {SOUND_PRESETS.map((p) => {
            const isCurrent =
              p.channels.length === activeChannels.length &&
              p.channels.every((c) => activeChannels.includes(c));

            return (
              <button
                key={p.id}
                onClick={() => handlePresetClick(p)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex-shrink-0 flex items-center gap-1 active:scale-95 ${
                  isCurrent
                    ? 'bg-indigo-600/40 text-indigo-200 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                    : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                <span>{p.emoji}</span>
                <span>{p.name}</span>
              </button>
            );
          })}

          {activeChannels.length > 0 && (
            <button
              onClick={handleStopAll}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 flex-shrink-0 active:scale-95 transition-all"
            >
              ⏹️ 모두 끄기
            </button>
          )}
        </div>

        {/* 4채널 독립 믹서 카드 (각 소리를 자유롭게 켜고 끄며 개별 볼륨 조절) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(Object.keys(SOUND_CHANNELS) as SoundChannel[]).map((ch) => {
            const info = SOUND_CHANNELS[ch];
            const isActive = activeChannels.includes(ch);

            const iconMap: Record<SoundChannel, React.ReactNode> = {
              rain: <CloudRain className="w-4 h-4" />,
              fire: <Flame className="w-4 h-4" />,
              wave: <Waves className="w-4 h-4" />,
              wind: <Wind className="w-4 h-4" />,
              snow: <Sparkles className="w-4 h-4" />,
            };

            const activeColors: Record<SoundChannel, string> = {
              rain: 'border-indigo-400/60 bg-indigo-950/30 shadow-[0_0_18px_rgba(99,102,241,0.25)]',
              fire: 'border-amber-400/60 bg-amber-950/30 shadow-[0_0_18px_rgba(245,158,11,0.25)]',
              wave: 'border-cyan-400/60 bg-cyan-950/30 shadow-[0_0_18px_rgba(6,182,212,0.25)]',
              wind: 'border-emerald-400/60 bg-emerald-950/30 shadow-[0_0_18px_rgba(16,185,129,0.25)]',
              snow: 'border-teal-400/60 bg-teal-950/30 shadow-[0_0_18px_rgba(45,212,191,0.25)]',
            };

            const iconColors: Record<SoundChannel, string> = {
              rain: 'bg-indigo-500/20 text-indigo-400',
              fire: 'bg-amber-500/20 text-amber-400',
              wave: 'bg-cyan-500/20 text-cyan-400',
              wind: 'bg-emerald-500/20 text-emerald-400',
              snow: 'bg-teal-500/20 text-teal-400',
            };

            return (
              <div
                key={ch}
                className={`p-3 rounded-2xl border transition-all space-y-2 ${
                  isActive
                    ? activeColors[ch]
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                }`}
              >
                {/* 상단 클릭 토글 헤더 */}
                <div
                  onClick={() => handleToggleChannel(ch)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[ch]}`}>
                      {iconMap[ch]}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block text-slate-100">{info.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{info.description}</span>
                    </div>
                  </div>

                  {/* 활성화 상태 배지 */}
                  <div className="flex-shrink-0 pl-2">
                    {isActive ? (
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>ON</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-full">
                        OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* 활성화 시 개별 채널 볼륨 슬라이더 */}
                {isActive && (
                  <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 text-[10px] text-slate-400 animate-in fade-in">
                    <Sliders className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="flex-shrink-0">음량</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={channelVolumes[ch]}
                      onChange={(e) => handleChannelVolumeChange(ch, parseFloat(e.target.value))}
                      className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <span className="font-mono text-slate-300 w-7 text-right flex-shrink-0">
                      {Math.round(channelVolumes[ch] * 100)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 마스터 볼륨 및 수면 타이머 (1개 이상 재생 중일 때 노출) */}
        {activeChannels.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-white/[0.08] animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>전체 마스터 볼륨</span>
              </span>
              <span className="font-mono text-slate-200 font-bold">{Math.round(masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />

            {/* 수면 타이머 */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>수면 타이머</span>
              </div>
              <div className="flex items-center gap-1">
                {[15, 30, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() => setSleepTimerMinutes(sleepTimerMinutes === min ? null : min)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                      sleepTimerMinutes === min
                        ? 'bg-indigo-600 text-white border-indigo-400'
                        : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-slate-200'
                    }`}
                  >
                    {min}분
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. 밤하늘의 속삭임 (익명 한 줄 롤링 보드) */}
      <div className="glass-card rounded-2xl p-4 border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs font-bold text-slate-200">밤하늘의 속삭임</span>
          </div>
          <span className="text-[10px] text-slate-500">한 줄 소망과 따뜻한 밤인사</span>
        </div>

        {/* 속삭임 입력창 */}
        <form onSubmit={handleSubmitWhisper} className="flex gap-2">
          <input
            type="text"
            value={newWhisperText}
            onChange={(e) => setNewWhisperText(e.target.value)}
            placeholder="오늘 밤하늘에 띄우고 싶은 따뜻한 한 줄..."
            maxLength={50}
            className="flex-1 bg-black/40 text-slate-200 text-xs px-3 py-2 rounded-xl border border-white/[0.1] focus:border-indigo-500 outline-none placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={!newWhisperText.trim() || isSubmittingWhisper}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40 transition-all flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            <span>띄우기</span>
          </button>
        </form>

        {/* 실시간 속삭임 리스트 */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {whispers.map((w) => {
            const isLiked = likedWhispers.has(w.id);
            return (
              <div
                key={w.id}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-2 animate-in fade-in"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-200 leading-snug break-words">
                    &ldquo;{w.text}&rdquo;
                  </p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {w.author}
                  </span>
                </div>

                <button
                  onClick={() => handleLikeWhisper(w.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-90 ${
                    isLiked
                      ? 'bg-pink-950/60 text-pink-300 border-pink-500/50'
                      : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-slate-200'
                  }`}
                >
                  <Heart className={`w-3 h-3 ${isLiked ? 'fill-pink-400 text-pink-400' : ''}`} />
                  <span>{w.likes}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 심야 꿀잠 테라피 큐레이션 (쿠팡 파트너스 공식 실시간 다이나믹 배너) */}
      <div className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-slate-900 to-black space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span>🍵 심야 꿀잠 & 힐링 큐레이션</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Coupang Partners</span>
        </div>

        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-200">
            오늘 밤 지친 나를 위한 숙면 & 힐링 특가
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            스트레스로 뒤척이는 밤, 실시간 쿠팡 로켓배송 인기 힐링 아이템을 만나보세요.
          </p>
        </div>

        {/* 쿠팡 파트너스 공식 실시간 다이나믹 캐러셀 위젯 */}
        <div className="w-full overflow-hidden rounded-xl bg-slate-950/80 border border-white/[0.08] min-h-[140px] flex items-center justify-center">
          <iframe
            src="https://ads-partners.coupang.com/widgets.html?id=1025741&template=carousel&trackingCode=AF4101329&subId=&width=100%&height=140px&tsource="
            width="100%"
            height="140"
            frameBorder="0"
            scrolling="no"
            referrerPolicy="unsafe-url"
            title="Coupang Dynamic Banner"
            className="w-full h-[140px] rounded-xl"
          />
        </div>

        <p className="text-[9px] text-slate-500 text-center leading-tight">
          *이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </p>
      </div>

      {/* 6. 15초 리워드 보상형 동영상 광고 모달 */}
      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        rewardType="candle"
        onRewardClaimed={() => {
          const newBooster = activateBooster(30, 2, user?.id);
          setBoosterStatus(newBooster);
          setCooldownStatus(getCooldownStatus(user?.id));
          soundscape.playCandleChime();

          const burstSparks = [
            { id: Date.now() + 1, text: '🔥 2배 피버 START!', vx: 0, vy: -130, rotate: 0, scale: 1.4, delay: 0 },
            { id: Date.now() + 2, text: '⚡ 30초간 +2 🕯️', vx: -45, vy: -100, rotate: -15, scale: 1.2, delay: 50 },
            { id: Date.now() + 3, text: '🔥 마음껏 터치하세요!', vx: 50, vy: -110, rotate: 15, scale: 1.2, delay: 90 },
          ];
          setFloatingSparks((prev) => [...prev, ...burstSparks]);
          setTimeout(() => {
            setFloatingSparks((prev) => prev.filter((s) => !burstSparks.some((b) => b.id === s.id)));
          }, 1600);

          setToastMessage('🔥 30초간 2배 온기 피버 모드가 시작되었습니다! 촛불을 마음껏 터치하세요!');
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      {/* 7. 온기 보상 상점 모달 */}
      <WarmthShopModal
        isOpen={isWarmthShopOpen}
        onClose={() => setIsWarmthShopOpen(false)}
        userWarmth={warmthProgress.spendableWarmth}
        unlockedCount={unlockedFailures.length}
        onOpenUnlockedModal={() => setIsUnlockedModalOpen(true)}
        onRedeemPass={() => {
          const res = spendWarmth(WARMTH_SHOP_PRICES.PASS_1DAY, user?.id);
          if (!res.success) return;
          const updated = getStoredWarmth(user?.id);
          setWarmthProgress(calculateWarmthProgress(updated.lifetime, updated.spendable));
          saveStoredPass({
            plan: 'day',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            purchasedAt: new Date().toISOString(),
          }, user?.id);
          setToastMessage('🎉 축하합니다! 광고 없는 1일 이용권이 활성화되었습니다.');
          setTimeout(() => setToastMessage(null), 3000);
          setIsWarmthShopOpen(false);
        }}
        onRedeemTarot={() => {
          const res = spendWarmth(WARMTH_SHOP_PRICES.TAROT_DRAW, user?.id);
          if (!res.success) return;
          const updated = getStoredWarmth(user?.id);
          setWarmthProgress(calculateWarmthProgress(updated.lifetime, updated.spendable));
          setIsWarmthShopOpen(false);
          setIsTarotModalOpen(true);
        }}
        onRedeemSimilar={async () => {
          const res = spendWarmth(WARMTH_SHOP_PRICES.SIMILAR_UNLOCK, user?.id);
          if (!res.success) return;
          const updated = getStoredWarmth(user?.id);
          setWarmthProgress(calculateWarmthProgress(updated.lifetime, updated.spendable));
          setIsWarmthShopOpen(false);

          // 실제 숨겨진 공감 사연 3편 누적 로드
          try {
            const unlockedKey = `logmate_unlocked_stories_${user?.id || deviceId || 'guest'}`;
            let currentUnlocked: Failure[] = [];
            if (typeof window !== 'undefined') {
              try {
                const stored = localStorage.getItem(unlockedKey);
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (Array.isArray(parsed)) currentUnlocked = parsed;
                }
              } catch {}
            }

            const params = new URLSearchParams();
            if (deviceId) params.set('deviceId', deviceId);
            if (user?.id) params.set('userId', user.id);
            if (currentUnlocked.length > 0) {
              params.set('excludeIds', currentUnlocked.map((f) => f.id).join(','));
            }

            const apiRes = await fetch(`/api/failures/unlocked-similar?${params.toString()}`);
            const data = await apiRes.json();
            if (data.success && data.unlockedFailures && data.unlockedFailures.length > 0) {
              const existingIds = new Set(currentUnlocked.map((f) => f.id));
              const newlyAdded = data.unlockedFailures.filter((f: Failure) => !existingIds.has(f.id));
              const updatedList = [...currentUnlocked, ...newlyAdded];
              setUnlockedFailures(updatedList);
              setIsUnlockedModalOpen(true);
              if (typeof window !== 'undefined') {
                localStorage.setItem(unlockedKey, JSON.stringify(updatedList));
              }
              setToastMessage(`🔓 새로운 공감 사연 3편이 추가 해금되었습니다! (총 ${updatedList.length}편 보유)`);
            } else {
              if (currentUnlocked.length > 0) {
                setUnlockedFailures(currentUnlocked);
                setIsUnlockedModalOpen(true);
                setToastMessage(`✨ 이미 모든 공감 사연(${currentUnlocked.length}편)을 해금하셨습니다!`);
              } else {
                setToastMessage('아직 해금할 수 있는 사연이 없습니다.');
              }
            }
          } catch (e) {
            console.error('Failed to fetch unlocked stories:', e);
            setToastMessage('🔓 숨겨진 공감 사연이 잠금 해제되었습니다!');
          }
          setTimeout(() => setToastMessage(null), 3500);
        }}
        onRedeemNotePack={() => {
          const res = spendWarmth(WARMTH_SHOP_PRICES.NOTE_PACK_3, user?.id);
          if (!res.success) return;
          const updated = getStoredWarmth(user?.id);
          setWarmthProgress(calculateWarmthProgress(updated.lifetime, updated.spendable));
          if (typeof window !== 'undefined') {
            const key = user?.id ? `logmate_note_tickets_${user.id}` : 'logmate_note_tickets_guest';
            const count = parseInt(localStorage.getItem(key) || '0', 10);
            localStorage.setItem(key, (count + 3).toString());
          }
          setToastMessage('💌 익명 온기 쪽지 발송권 3장이 지급되었습니다!');
          setTimeout(() => setToastMessage(null), 3000);
          setIsWarmthShopOpen(false);
        }}
        onRedeemGoldenCandle={() => {
          const res = spendWarmth(WARMTH_SHOP_PRICES.GOLDEN_CANDLE, user?.id);
          if (!res.success) return;
          const updated = getStoredWarmth(user?.id);
          setWarmthProgress(calculateWarmthProgress(updated.lifetime, updated.spendable));
          setToastMessage('🌟 오늘 내 사연에 황금 온기 촛불이 부착되었습니다!');
          setTimeout(() => setToastMessage(null), 3000);
          setIsWarmthShopOpen(false);
        }}
        onRedeemHiddenSound={() => {
          const res = spendWarmth(WARMTH_SHOP_PRICES.HIDDEN_SOUND, user?.id);
          if (!res.success) return;
          const updated = getStoredWarmth(user?.id);
          setWarmthProgress(calculateWarmthProgress(updated.lifetime, updated.spendable));
          soundscape.startChannel('snow');
          setToastMessage('🎧 VIP 히든 ASMR [새벽 설원 자작나무 숲] 사운드가 해금되어 재생됩니다!');
          setTimeout(() => setToastMessage(null), 3500);
          setIsWarmthShopOpen(false);
        }}
      />

      {/* 8. AI 실패 극복 힐링 타로 모달 */}
      <TarotModal
        isOpen={isTarotModalOpen}
        onClose={() => setIsTarotModalOpen(false)}
        userWarmth={warmthProgress.spendableWarmth}
        onDrawAgain={() => {
          const res = spendWarmth(WARMTH_SHOP_PRICES.TAROT_DRAW, user?.id);
          if (res.success) {
            const updated = getStoredWarmth(user?.id);
            setWarmthProgress(calculateWarmthProgress(updated.lifetime, updated.spendable));
          }
        }}
      />

      {/* 8. 온기 레벨 & 프로필 도감 모달 */}
      <WarmthLevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        progress={warmthProgress}
        onOpenBooster={() => setIsRewardedAdOpen(true)}
      />

      {/* 9. 온기 해금 숨겨진 공감 사연 3편 전용 모달 */}
      <UnlockedSimilarModal
        isOpen={isUnlockedModalOpen}
        onClose={() => setIsUnlockedModalOpen(false)}
        unlockedFailures={unlockedFailures}
        onNavigateToFeed={() => {
          if (onNavigateTab) {
            onNavigateTab('today');
          }
        }}
      />

      {/* 9-1. 은하수 개화 축복 축하 및 보상 수령 모달 */}
      {showBlessingModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="glass-card max-w-sm w-full p-6 rounded-3xl border border-purple-400/60 text-center space-y-4 shadow-[0_0_60px_rgba(168,85,247,0.4)] relative overflow-hidden animate-in zoom-in-95">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-amber-500/10 to-teal-500/10 pointer-events-none" />
            
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-amber-400 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-bounce">
              {todayBlessing.icon}
            </div>

            <div className="space-y-1.5 relative z-10">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/50">
                🌌 {todayBlessing.dayName}
              </span>
              <h3 className="text-base font-black text-slate-100">
                {todayBlessing.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                이웃들의 따뜻한 온기가 모여 오늘 밤하늘 목표를 완벽히 달성했습니다!<br />
                은하수 개화 축복 보상이 당신의 안식처에 깃들었습니다.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 text-left space-y-1 font-mono text-xs">
              <div className="text-[10px] text-purple-300 font-sans font-bold">수령된 은하수 보상:</div>
              <div className="text-amber-300 font-bold flex items-center gap-1.5">
                <span>✨</span>
                <span>{todayBlessing.rewardLabel}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans pt-0.5">
                {todayBlessing.buffDescription}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBlessingModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-purple-600/30"
            >
              은하수 축복과 함께 머무르기
            </button>
          </div>
        </div>
      )}

      {/* 10. 알림 토스트 */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
