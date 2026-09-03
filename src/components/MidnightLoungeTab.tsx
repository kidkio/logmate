'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Volume2, VolumeX, Moon, Heart, Send, Waves, Wind, CloudRain, Clock, ThermometerSun, ExternalLink, Sliders } from 'lucide-react';
import { soundscape, SOUND_CHANNELS, SOUND_PRESETS, SoundChannel, SoundPreset } from '@/lib/soundscape';
import { User } from '@/types';
import { RewardedAdModal } from './RewardedAdModal';
import { Toast } from './Toast';

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

export function MidnightLoungeTab({ user, deviceId }: MidnightLoungeTabProps) {
  const [activeCount, setActiveCount] = useState(1);
  const [candleCount, setCandleCount] = useState(1280);
  const [whispers, setWhispers] = useState<WhisperItem[]>([]);
  const [newWhisperText, setNewWhisperText] = useState('');
  const [isSubmittingWhisper, setIsSubmittingWhisper] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const [likedWhispers, setLikedWhispers] = useState<Set<string>>(new Set());
  const [floatingSparks, setFloatingSparks] = useState<FloatingSpark[]>([]);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 사운드스케이프 멀티 채널 믹서 상태
  const [activeChannels, setActiveChannels] = useState<SoundChannel[]>(soundscape.getActiveChannels());
  const [masterVolume, setMasterVolume] = useState<number>(soundscape.getVolume());
  const [channelVolumes, setChannelVolumes] = useState<Record<SoundChannel, number>>({
    rain: soundscape.getChannelVolume('rain'),
    fire: soundscape.getChannelVolume('fire'),
    wave: soundscape.getChannelVolume('wave'),
    wind: soundscape.getChannelVolume('wind'),
  });
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

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
        setWhispers(data.whispers || []);
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

  // 촛불 켜기 액션 (하이엔드 리플 + 싱잉볼 사운드 + 부유하는 온기 스파크)
  const handleLightCandle = async () => {
    // 1. 크리스탈 싱잉볼/차임벨 음향 재생
    soundscape.playCandleChime();

    // 2. 햅틱 진동
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }

    // 3. 리플 활성화
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    // 4. 분수처럼 솟구쳐 퍼지는 온기 파티클 생성
    const burstId = Date.now();
    const sparksConfig = [
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

    setCandleCount((prev) => prev + 1);

    try {
      const res = await fetch('/api/lounge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'candle', deviceId }),
      });
      const data = await res.json();
      if (data.success) {
        setCandleCount(data.candleCount);
        if (data.activeCount) setActiveCount(data.activeCount);
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
  // 사람의 표준 체온(36.5°C)을 가장 이상적이고 따뜻한 포근함의 기준으로 삼고,
  // 쌀쌀한 새벽 공기(24.5°C)에서 오늘 켜진 온기 촛불과 실시간 이웃들의 접속에 비례하여
  // 사람의 체온처럼 포근한 온기(36.5°C ~ 38.0°C)로 따뜻하게 데워집니다.
  const baseTemp = 24.5;
  const candleBoost = Math.min(11.5, Math.sqrt(candleCount) * 0.32);
  const visitorBoost = Math.min(2.5, activeCount * 0.25);
  const warmthDegree = (baseTemp + candleBoost + visitorBoost).toFixed(1);

  const warmthStatus =
    Number(warmthDegree) >= 37.5 ? '훈훈한 온기 ♨️' :
    Number(warmthDegree) >= 36.0 ? '사람의 포근한 체온 💛' :
    Number(warmthDegree) >= 32.0 ? '은은한 온기 🕯️' : '선선한 밤하늘 🌙';

  return (
    <div className="w-full h-full flex-1 overflow-y-auto space-y-4 px-1 pb-28 pt-1 text-slate-100 select-none no-scrollbar">
      {/* 1. 상단 실제 접속자 라이브 배너 */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-indigo-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-200">심야 라이브 온기</span>
          </div>
          <p className="text-[11px] text-slate-400">
            지금 밤하늘 아래 실제 <span className="text-indigo-300 font-bold font-mono">{activeCount}명</span>의 이웃이 함께 머무르고 있어요.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">오늘 모인 온기</span>
          <span className="text-xs font-black text-amber-300 font-mono">🕯️ {candleCount.toLocaleString()}개</span>
        </div>
      </div>

      {/* 2. 중앙 온기 촛불 켜기 히어로 섹션 (실감나는 인터랙티브 캔들) */}
      <div className="relative glass-card rounded-3xl p-6 text-center border border-amber-500/20 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center">
        {/* 파동 리플 애니메이션 */}
        {rippleActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border-2 border-amber-400/80 animate-ping duration-1000" />
            <div className="w-72 h-72 rounded-full border border-pink-400/50 animate-ping duration-1000 delay-150" />
          </div>
        )}

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

        {/* 실감나는 멀티레이어 SVG 촛불 비주얼 */}
        <div
          onClick={handleLightCandle}
          className="relative cursor-pointer group active:scale-95 transition-transform my-2"
          title="탭하여 온기 촛불 밝히기 (맑은 벨소리가 울려요)"
        >
          {/* 황금빛 주변광 글로우 */}
          <div className="absolute -inset-6 bg-gradient-to-tr from-amber-500/40 via-orange-500/30 to-transparent rounded-full blur-2xl group-hover:blur-3xl transition-all animate-pulse" />

          {/* 촛불 불꽃과 촛대 컨테이너 */}
          <div className="relative flex flex-col items-center">
            {/* 춤추는 불꽃 SVG */}
            <div className="relative animate-bounce duration-1000">
              <svg viewBox="0 0 64 90" className="w-14 h-20 filter drop-shadow-[0_0_18px_rgba(245,158,11,0.95)]">
                <defs>
                  <radialGradient id="flameGrad" cx="50%" cy="80%" r="50%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="30%" stopColor="#FEF08A" />
                    <stop offset="65%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#DC2626" />
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
          </div>
        </div>

        {/* 촛불 카피 */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm sm:text-base font-black text-slate-100">
            이웃들에게 작은 온기를 밝혀주세요
          </h3>
          <p className="text-[11px] text-slate-400">
            촛불을 터치하면 맑은 싱잉볼 소리와 함께 다른 친구들에게 온기가 전해집니다.
          </p>
        </div>

        {/* 인터랙티브 탭 버튼 & 5배 부스터 */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 w-full max-w-xs justify-center">
          <button
            onClick={handleLightCandle}
            className="w-full sm:w-auto flex-1 py-2 px-4 rounded-2xl text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 hover:bg-amber-900/70 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin duration-3000" />
            <span>온기 촛불 켜기 (+1)</span>
          </button>

          <button
            onClick={() => setIsRewardedAdOpen(true)}
            className="w-full sm:w-auto py-2 px-3.5 rounded-2xl text-xs font-bold text-pink-200 bg-pink-950/70 border border-pink-500/40 hover:bg-pink-900/70 active:scale-95 transition-all shadow-[0_0_20px_rgba(236,72,153,0.25)] flex items-center justify-center gap-1.5"
            title="15초 광고 시청 후 온기 5개 즉시 충전"
          >
            <Flame className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
            <span>5배 부스터 (+5 🕯️)</span>
          </button>
        </div>

        {/* 온기 지수 게이지 */}
        <div className="w-full max-w-xs mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-slate-400">
            <ThermometerSun className="w-3.5 h-3.5 text-amber-400" />
            <span>밤하늘 온기 지수</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="font-mono text-amber-300 text-xs">{warmthDegree}°C</span>
            <span className="text-amber-400/90 text-[10px]">({warmthStatus})</span>
          </div>
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

            const iconMap = {
              rain: <CloudRain className="w-4 h-4" />,
              fire: <Flame className="w-4 h-4" />,
              wave: <Waves className="w-4 h-4" />,
              wind: <Wind className="w-4 h-4" />,
            };

            const activeColors = {
              rain: 'border-indigo-400/60 bg-indigo-950/30 shadow-[0_0_18px_rgba(99,102,241,0.25)]',
              fire: 'border-amber-400/60 bg-amber-950/30 shadow-[0_0_18px_rgba(245,158,11,0.25)]',
              wave: 'border-cyan-400/60 bg-cyan-950/30 shadow-[0_0_18px_rgba(6,182,212,0.25)]',
              wind: 'border-emerald-400/60 bg-emerald-950/30 shadow-[0_0_18px_rgba(16,185,129,0.25)]',
            };

            const iconColors = {
              rain: 'bg-indigo-500/20 text-indigo-400',
              fire: 'bg-amber-500/20 text-amber-400',
              wave: 'bg-cyan-500/20 text-cyan-400',
              wind: 'bg-emerald-500/20 text-emerald-400',
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

      {/* 5. 심야 꿀잠 테라피 큐레이션 (쿠팡 파트너스 맥락 제휴) */}
      <div className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-slate-900 to-black space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span>🍵 심야 꿀잠 테라피</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Coupang Partners</span>
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-200">
            유기농 캐모마일 & 타트체리 꿀잠 티 (40티백)
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            스트레스로 뒤척이는 밤, 뇌파를 부드럽게 이완시켜주는 따뜻한 수면 유도 허브차.
          </p>
        </div>
        <div className="flex items-center justify-between text-xs bg-black/40 px-3 py-2 rounded-xl border border-white/10">
          <span className="text-amber-300 font-bold font-mono">18,900원 (32% 특가)</span>
          <span className="text-[10px] text-slate-400">4.9 ★★★★★</span>
        </div>
        <a
          href="https://www.coupang.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
        >
          <span>로켓배송 최저가 둘러보기</span>
          <ExternalLink className="w-3 h-3" />
        </a>
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
          setCandleCount((prev) => prev + 5);
          soundscape.playCandleChime();

          const burstSparks = [
            { id: Date.now() + 1, text: '🕯️ +5 온기', vx: 0, vy: -120, rotate: 0, scale: 1.4, delay: 0 },
            { id: Date.now() + 2, text: '✨ 부스터', vx: -45, vy: -95, rotate: -15, scale: 1.1, delay: 50 },
            { id: Date.now() + 3, text: '💛 온기', vx: 50, vy: -105, rotate: 15, scale: 1.2, delay: 90 },
          ];
          setFloatingSparks((prev) => [...prev, ...burstSparks]);
          setTimeout(() => {
            setFloatingSparks((prev) => prev.filter((s) => !burstSparks.some((b) => b.id === s.id)));
          }, 1400);

          setToastMessage('온기 5배 부스터가 적용되었습니다! ✨ (+5 온기)');
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* 7. 알림 토스트 */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
