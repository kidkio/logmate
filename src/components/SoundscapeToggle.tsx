'use client';

import React, { useState, useEffect } from 'react';
import { Headphones, Volume2, VolumeX, CloudRain, Flame } from 'lucide-react';
import { soundscape, SoundMode } from '@/lib/soundscape';

export function SoundscapeToggle() {
  const [mode, setMode] = useState<SoundMode>('off');

  const cycleMode = () => {
    let nextMode: SoundMode = 'off';
    if (mode === 'off') nextMode = 'rain';
    else if (mode === 'rain') nextMode = 'fire';
    else nextMode = 'off';

    soundscape.play(nextMode);
    setMode(nextMode);
  };

  return (
    <button
      onClick={cycleMode}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 border ${
        mode === 'rain'
          ? 'bg-blue-950/80 text-blue-300 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse'
          : mode === 'fire'
          ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
          : 'bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-slate-200 hover:bg-white/[0.08]'
      }`}
      title="밤의 앰비언트 ASMR 켜기 (빗소리 / 모닥불)"
    >
      {mode === 'rain' ? (
        <>
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px]">빗소리 🌧️</span>
        </>
      ) : mode === 'fire' ? (
        <>
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-[10px]">모닥불 🔥</span>
        </>
      ) : (
        <>
          <Headphones className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] hidden sm:inline">ASMR</span>
        </>
      )}
    </button>
  );
}
