'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Volume2, VolumeX, Moon, Heart, Send, Waves, Wind, CloudRain, Clock } from 'lucide-react';
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

export function MidnightLoungeTab({ user, deviceId }: MidnightLoungeTabProps) {
  const [activeCount, setActiveCount] = useState(42);
  const [candleCount, setCandleCount] = useState(1280);
  const [whispers, setWhispers] = useState<WhisperItem[]>([]);
  const [newWhisperText, setNewWhisperText] = useState('');
  const [isSubmittingWhisper, setIsSubmittingWhisper] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const [likedWhispers, setLikedWhispers] = useState<Set<string>>(new Set());

  // 사운드스케이프 상태
  const [soundMode, setSoundMode] = useState<SoundMode>(soundscape.getMode());
  const [volume, setVolume] = useState<number>(soundscape.getVolume());
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  // 1. 라운지 데이터 불러오기
  const fetchLoungeData = async () => {
    try {
      const res = await fetch('/api/lounge');
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
    const interval = setInterval(fetchLoungeData, 15000);
    return () => clearInterval(interval);
  }, []);

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

  // 촛불 켜기 액션
  const handleLightCandle = async () => {
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 1200);

    setCandleCount((prev) => prev + 1);

    try {
      const res = await fetch('/api/lounge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'candle' }),
      });
      const data = await res.json();
      if (data.success) {
        setCandleCount(data.candleCount);
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
        body: JSON.stringify({ action: 'like', whisperId: id }),
      });
    } catch (e) {
      console.error('Failed to like whisper:', e);
    }
  };

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between overflow-y-auto space-y-4 px-1 pb-4 text-slate-100 select-none">
      {/* 1. 상단 라이브 상태 배너 */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-indigo-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-200">심야 라이브 온기</span>
          </div>
          <p className="text-[11px] text-slate-400">
            지금 밤하늘 아래 <span className="text-indigo-400 font-bold">{activeCount}명</span>의 이웃이 함께 머무르고 있어요.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">오늘 모인 온기</span>
          <span className="text-xs font-black text-amber-300">🕯️ {candleCount.toLocaleString()}개</span>
        </div>
      </div>

      {/* 2. 중앙 온기 촛불 켜기 히어로 섹션 */}
      <div className="relative glass-card rounded-3xl p-6 text-center border border-amber-500/20 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center">
        {/* 파동 리플 애니메이션 */}
        {rippleActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border-2 border-amber-400/60 animate-ping duration-1000" />
            <div className="w-72 h-72 rounded-full border border-pink-400/40 animate-ping duration-1000 delay-150" />
          </div>
        )}

        {/* 촛불 불빛 비주얼 */}
        <div
          onClick={handleLightCandle}
          className="relative cursor-pointer group active:scale-95 transition-transform"
          title="탭하여 온기 촛불 밝히기"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/30 via-orange-500/20 to-transparent rounded-full blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-950/80 to-amber-900/40 border border-amber-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <Flame className="w-10 h-10 text-amber-400 fill-amber-400/30 animate-pulse" />
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="text-sm sm:text-base font-black text-slate-100">
            이웃들에게 작은 온기를 밝혀주세요
          </h3>
          <p className="text-[11px] text-slate-400">
            촛불을 터치하면 밤하늘 너머 다른 친구들에게 따뜻한 빛이 전해집니다.
          </p>
        </div>

        <button
          onClick={handleLightCandle}
          className="mt-3 py-2 px-4 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 hover:bg-amber-900/60 active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>온기 촛불 켜기 (+1)</span>
        </button>
      </div>

      {/* 3. 수면 앰비언트 사운드스케이프 믹서 */}
      <div className="glass-card rounded-2xl p-4 border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200">심야 수면 사운드 (ASMR)</span>
          </div>

          {soundMode !== 'off' && (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>재생 중</span>
            </span>
          )}
        </div>

        {/* 4가지 사운드 트랙 칩 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'rain', label: '차분한 빗소리', icon: CloudRain, color: 'text-sky-400' },
            { id: 'fire', label: '모닥불 불꽃', icon: Flame, color: 'text-amber-400' },
            { id: 'wave', label: '심야의 파도', icon: Waves, color: 'text-teal-400' },
            { id: 'wind', label: '창밖 밤바람', icon: Wind, color: 'text-indigo-400' },
          ].map(({ id, label, icon: Icon, color }) => {
            const isActive = soundMode === id;
            return (
              <button
                key={id}
                onClick={() => handleToggleSound(id as SoundMode)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all active:scale-95 ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                    : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : color}`} />
                <span className="text-[11px] truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {/* 볼륨 조절 & 수면 타이머 */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 flex-1 max-w-[160px]">
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {[15, 30, 60].map((mins) => (
              <button
                key={mins}
                onClick={() =>
                  setSleepTimerMinutes(sleepTimerMinutes === mins ? null : mins)
                }
                className={`text-[10px] px-1.5 py-0.5 rounded-md border transition-colors ${
                  sleepTimerMinutes === mins
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50 font-bold'
                    : 'bg-white/[0.02] text-slate-500 border-white/[0.06] hover:text-slate-300'
                }`}
              >
                {mins}분
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. 밤하늘에 띄우는 한 줄 속삭임 (Whispers) */}
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
