'use client';

import React from 'react';
import { Failure, ReactionType } from '@/types';
import { Users, Sparkles, CheckCircle2, Clock, HeartHandshake, Shield } from 'lucide-react';
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
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* 21st.dev 시그니처 글로우 히어로 카드 */}
      <div className="relative rounded-3xl overflow-hidden glass-glow p-5 sm:p-6 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.18)]">
        {/* 장식용 앰비언트 블러 */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          {/* 상단 완료 뱃지 & 리셋 시간 */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>오늘의 실패 기록 완료</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full font-mono">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>새벽 3시 리셋</span>
            </div>
          </div>

          {/* 핵심 지표: 나와 비슷한 실패를 경험한 사람 수 */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              실시간 유사 실패 레이더
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-slate-100 tracking-tight leading-tight">
              오늘 당신과 비슷한 실패를 겪은 친구는{' '}
              <span className="inline-block px-2.5 py-0.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black shadow-[0_0_20px_rgba(236,72,153,0.4)] ml-1">
                {similarCount}명
              </span>
              입니다
            </h2>
            <p className="text-xs text-slate-300/90 pt-1 leading-relaxed">
              당신만 그런 것이 아닙니다. 비슷한 고민을 나눈 사람들의 사연을 확인하고 서로를 토닥여주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 내가 오늘 쓴 실패 사연 */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="flex items-center gap-1.5 font-semibold text-slate-300">
            <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" />
            내가 털어놓은 오늘의 실패
          </span>
          <span className="text-[11px] text-slate-500">1일 1회 작성</span>
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
