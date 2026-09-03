'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sparkles, History, VolumeX } from 'lucide-react';
import { soundscape, SoundMode } from '@/lib/soundscape';

interface HeaderProps {
  todaysCount: number;
  totalComforts: number;
  onOpenMyFailures: () => void;
  myFailuresCount: number;
  userNickname?: string;
}

const SOUND_LABELS: Record<SoundMode, string> = {
  off: '',
  rain: '빗소리 🌧️',
  fire: '모닥불 🔥',
  wave: '파도 🌊',
  wind: '밤바람 🍃',
};

export function Header({
  todaysCount,
  totalComforts,
  onOpenMyFailures,
  myFailuresCount,
  userNickname,
}: HeaderProps) {
  const [playingSound, setPlayingSound] = useState<SoundMode>('off');

  useEffect(() => {
    const unsub = soundscape.subscribe((mode) => {
      setPlayingSound(mode);
    });
    return unsub;
  }, []);

  return (
    <header className="w-full border-b border-white/[0.08] bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 flex-shrink-0">
      <div className="max-w-3xl mx-auto px-3 py-2 flex items-center justify-between">
        {/* 좌측 로고 및 슬림 타이틀 */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Moon className="w-3.5 h-3.5 fill-white/20" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-black tracking-wider text-indigo-400 uppercase">
              LogMate
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              익명 실패 안식처
            </span>
          </div>
        </div>

        {/* 우측 액션: ASMR 끄기 플로팅 알약 + 온기 배지 + 내 기록 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* ASMR 재생 중일 때: 어느 탭에서든 즉시 끌 수 있는 탑 바 버튼 */}
          {playingSound !== 'off' && (
            <button
              onClick={() => soundscape.stop()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse hover:bg-emerald-900/70 active:scale-95 transition-all"
              title="현재 재생 중인 ASMR 끄기"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{SOUND_LABELS[playingSound]} 끄기</span>
              <VolumeX className="w-3 h-3 text-emerald-300" />
            </button>
          )}

          {totalComforts > 0 && (
            <div className="hidden xs:flex items-center gap-1 text-[10px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>온기 <strong className="text-pink-300 font-mono">{totalComforts}</strong>회</span>
            </div>
          )}

          <button
            onClick={onOpenMyFailures}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] transition-all max-w-[120px] truncate active:scale-95"
            title="내가 쓴 실패 모아보기"
          >
            <History className="w-3 h-3 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{userNickname || '내 기록'}</span>
            {myFailuresCount > 0 && (
              <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 text-[9px] text-white flex items-center justify-center font-bold flex-shrink-0">
                {myFailuresCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
