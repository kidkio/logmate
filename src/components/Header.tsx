'use client';

import React from 'react';
import { Moon, Sparkles, HeartHandshake, History, Clock } from 'lucide-react';

interface HeaderProps {
  todaysCount: number;
  totalComforts: number;
  onOpenMyFailures: () => void;
  myFailuresCount: number;
}

export function Header({
  todaysCount,
  totalComforts,
  onOpenMyFailures,
  myFailuresCount,
}: HeaderProps) {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Moon className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold tracking-wider text-indigo-400 uppercase">
                  LogMate
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  · 로그메이트
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                오늘 당신의 실패를 공유하세요
              </h1>
            </div>
          </div>

          <button
            onClick={onOpenMyFailures}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all"
            title="내가 쓴 실패 모아보기"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>내 기록</span>
            {myFailuresCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-[10px] text-white flex items-center justify-center font-bold">
                {myFailuresCount}
              </span>
            )}
          </button>
        </div>

        {/* 심리적 안정감 유도 카피 & 실시간 통계 바 */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>매일 새벽 3시 리셋</span>
            <span className="text-slate-500 mx-1">·</span>
            <span className="text-slate-400">실패는 털어놓고 훌훌 털어내세요</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>오늘 등록된 실패:</span>
              <strong className="text-indigo-300 font-semibold">{todaysCount}개</strong>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
              <span>나눈 토닥임:</span>
              <strong className="text-pink-300 font-semibold">{totalComforts}회</strong>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
