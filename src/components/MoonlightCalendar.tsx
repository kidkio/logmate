'use client';

import React from 'react';
import { Failure } from '@/types';
import { Sparkles, Star, Moon, Calendar as CalendarIcon } from 'lucide-react';

interface MoonlightCalendarProps {
  failures: Failure[];
  onSelectFailure?: (failure: Failure) => void;
}

export function MoonlightCalendar({ failures, onSelectFailure }: MoonlightCalendarProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // 해당 월의 첫 날과 마지막 날 계산
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0(일) ~ 6(토)

  // 날짜별 실패 매핑
  const dateFailureMap = new Map<number, Failure>();
  failures.forEach((f) => {
    const d = new Date(f.createdAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      dateFailureMap.set(d.getDate(), f);
    }
  });

  const overcomeCount = failures.filter((f) => f.isOvercome).length;
  const growthRate = failures.length > 0 ? Math.round((overcomeCount / failures.length) * 100) : 0;

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i);

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-3.5">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
              <span>{year}년 {month + 1}월 달빛 캘린더</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </h3>
            <p className="text-[10px] text-slate-400">
              실패를 마주하고 극복해가는 나의 성장 궤적
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold">
          <span className="text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-full">
            🌙 기록 {dateFailureMap.size}일
          </span>
          {overcomeCount > 0 && (
            <span className="text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
              ⭐ 극복 {growthRate}%
            </span>
          )}
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 font-semibold">
        {['일', '월', '화', '수', '목', '금', '토'].map((w, idx) => (
          <div key={idx} className={idx === 0 ? 'text-rose-400/80' : idx === 6 ? 'text-blue-400/80' : ''}>
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="h-8 sm:h-9" />
        ))}

        {daysArray.map((day) => {
          const failure = dateFailureMap.get(day);
          const isToday = now.getDate() === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => failure && onSelectFailure && onSelectFailure(failure)}
              disabled={!failure}
              className={`h-8 sm:h-9 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                failure?.isOvercome
                  ? 'bg-amber-500/20 border border-amber-400/60 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)] hover:scale-105'
                  : failure
                  ? 'bg-indigo-600/30 border border-indigo-400/50 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.25)] hover:scale-105'
                  : isToday
                  ? 'bg-white/[0.06] border border-white/[0.15] text-slate-200'
                  : 'text-slate-500 hover:bg-white/[0.02]'
              }`}
            >
              <span className="text-[10px] font-mono leading-none">{day}</span>
              {failure?.isOvercome ? (
                <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300 mt-0.5" />
              ) : failure ? (
                <Moon className="w-2.5 h-2.5 text-indigo-300 fill-indigo-300 mt-0.5" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* 범례 안내 */}
      <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-slate-500 border-t border-white/[0.05]">
        <div className="flex items-center gap-1">
          <Moon className="w-3 h-3 text-indigo-400 fill-indigo-400" />
          <span>기록한 날</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>극복 완료 🌟</span>
        </div>
      </div>
    </div>
  );
}
