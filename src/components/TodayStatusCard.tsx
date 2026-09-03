'use client';

import React from 'react';
import { Failure, ReactionType } from '@/types';
import { Users, Sparkles, CheckCircle2, Clock, HeartHandshake } from 'lucide-react';
import { FailureCard } from './FailureCard';

interface TodayStatusCardProps {
  failure: Failure;
  similarCount: number;
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
}

export function TodayStatusCard({
  failure,
  similarCount,
  onReaction,
  onReport,
}: TodayStatusCardProps) {
  return (
    <div className="w-full bg-gradient-to-b from-indigo-950/50 via-slate-900 to-slate-900 rounded-2xl p-5 sm:p-6 border border-indigo-500/30 shadow-2xl shadow-indigo-950/40 space-y-4">
      {/* 1일 1회 기록 완료 뱃지 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            오늘의 실패 기록 완료
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>매일 새벽 3시 다음 작성 가능</span>
        </div>
      </div>

      {/* 핵심 메인 배너: 비슷한 실패를 경험한 사람의 수 */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-4 sm:p-5 text-white shadow-lg shadow-indigo-500/25 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              오늘의 공감 레이더
            </span>
            <h2 className="text-base sm:text-xl font-extrabold tracking-tight">
              오늘 당신과 비슷한 실패를 겪은 친구는{' '}
              <span className="underline decoration-yellow-300 underline-offset-4 font-black text-yellow-300 text-lg sm:text-2xl ml-1">
                {similarCount}명
              </span>
              입니다
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 pt-0.5">
              혼자 자책하지 마세요. 아래에서 같은 실수를 한 사람들의 이야기를 확인해 보세요.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 내가 오늘 작성한 실패 내용 카드 */}
      <div className="pt-1">
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" />
          <span>내가 털어놓은 오늘의 이야기</span>
        </div>
        <FailureCard
          failure={failure}
          onReaction={onReaction}
          onReport={onReport}
        />
      </div>
    </div>
  );
}
