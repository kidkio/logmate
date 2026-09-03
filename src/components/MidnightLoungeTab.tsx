'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Volume2, VolumeX, Moon, Heart, Send, Waves, Wind, CloudRain, Clock, ThermometerSun } from 'lucide-react';
import { soundscape, SoundMode } from '@/lib/soundscape';
import { User } from '@/types';

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
  x: number;
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

  // 사운드스케이프 상태
  const [soundMode, setSoundMode] = useState<SoundMode>(soundscape.getMode());
  const [volume, setVolume] = useState<number>(soundscape.getVolume());
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  // 사운드스케이프 전역 상태 구독
  useEffect(() => {
    const unsub = soundscape.subscribe((mode) => setSoundMode(mode));
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
      soundscape.stop();
      setSoundMode('off');
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

    // 4. 떠오르는 온기 파티클 생성
    const newSpark: FloatingSpark = {
      id: Date.now() + Math.random(),
      text: '+1 온기 🕯️',
      x: (Math.random() - 0.5) * 60, // 좌우 살짝 흩날림
    };
    setFloatingSparks((prev) => [...prev, newSpark]);
    setTimeout(() => {
      setFloatingSparks((prev) => prev.filter((s) => s.id !== newSpark.id));
    }, 1400);

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

  // 사운드 모드 전환
  const handleToggleSound = (mode: SoundMode) => {
    if (soundMode === mode) {
      soundscape.stop();
      setSoundMode('off');
    } else {
      soundscape.play(mode);
      setSoundMode(mode);
    }
  };

  // 볼륨 변경
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundscape.setVolume(newVol);
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

  // 온기 지수 계산 (온도)
  const warmthDegree = (82 + (candleCount % 35) * 0.45).toFixed(1);

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

        {/* 떠오르는 온기 스파크 파티클들 */}
        {floatingSparks.map((spark) => (
          <div
            key={spark.id}
            className="absolute top-1/2 left-1/2 pointer-events-none z-30 font-bold text-xs text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-in fade-in"
            style={{
              transform: `translate(calc(-50% + ${spark.x}px), -80px)`,
              transition: 'all 1.3s cubic-bezier(0.16, 1, 0.3, 1)',
              animation: 'floatUp 1.3s forwards',
            }}
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

        {/* 인터랙티브 탭 버튼 */}
        <button
          onClick={handleLightCandle}
          className="mt-3 py-2 px-5 rounded-2xl text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 hover:bg-amber-900/70 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin duration-3000" />
          <span>온기 촛불 켜기 (+1)</span>
        </button>

        {/* 온기 지수 게이지 */}
        <div className="w-full max-w-xs mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-slate-400">
            <ThermometerSun className="w-3.5 h-3.5 text-amber-400" />
            <span>밤하늘 온기 지수</span>
          </div>
          <span className="font-mono font-bold text-amber-300">{warmthDegree}°C (포근함)</span>
        </div>
      </div>

      {/* 3. 4채널 고유 특성 ASMR 사운드스케이프 믹서 */}
      <div className="glass-card rounded-2xl p-4 border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">심야 수면 ASMR (특화 4채널)</span>
          </div>

          {soundMode !== 'off' && (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>재생 중</span>
            </span>
          )}
        </div>

        {/* 4채널 사운드 모드 선택 버튼 (각기 뚜렷한 음향적 개성 부여) */}
        <div className="grid grid-cols-2 gap-2">
          {/* 1. 빗소리 */}
          <button
            onClick={() => handleToggleSound('rain')}
            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 active:scale-95 ${
              soundMode === 'rain'
                ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <CloudRain className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block">창문 빗소리</span>
              <span className="text-[10px] text-slate-400 block truncate">실제 빗방울 물방울 소리</span>
            </div>
          </button>

          {/* 2. 모닥불 */}
          <button
            onClick={() => handleToggleSound('fire')}
            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 active:scale-95 ${
              soundMode === 'fire'
                ? 'bg-amber-600/30 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block">장작 모닥불</span>
              <span className="text-[10px] text-slate-400 block truncate">타닥타닥 나무 타는 소리</span>
            </div>
          </button>

          {/* 3. 밤바다 파도 */}
          <button
            onClick={() => handleToggleSound('wave')}
            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 active:scale-95 ${
              soundMode === 'wave'
                ? 'bg-cyan-600/30 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Waves className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block">밤바다 파도</span>
              <span className="text-[10px] text-slate-400 block truncate">밀물과 썰물의 깊은 호흡</span>
            </div>
          </button>

          {/* 4. 밤바람 */}
          <button
            onClick={() => handleToggleSound('wind')}
            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 active:scale-95 ${
              soundMode === 'wind'
                ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Wind className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold block">새벽 밤바람</span>
              <span className="text-[10px] text-slate-400 block truncate">나뭇잎 스치는 바람결</span>
            </div>
          </button>
        </div>

        {/* 볼륨 슬라이더 및 타이머 (재생 중일 때 노출) */}
        {soundMode !== 'off' && (
          <div className="space-y-3 pt-2 border-t border-white/[0.06] animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>볼륨 조절</span>
              <span className="font-mono text-slate-200">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
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
    </div>
  );
}
