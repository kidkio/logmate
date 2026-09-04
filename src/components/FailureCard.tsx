'use client';

import React, { useState } from 'react';
import { Failure, ReactionType } from '@/types';
import { Flag, Sparkles, ChevronDown, ChevronUp, Quote } from 'lucide-react';

interface FailureCardProps {
  failure: Failure;
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
  isCompact?: boolean;
  isMine?: boolean;
}

const REACTION_CONFIG: {
  type: ReactionType;
  emoji: string;
  label: string;
  activeClass: string;
}[] = [
  {
    type: 'comfort',
    emoji: '🫂',
    label: '토닥토닥',
    activeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.25)]',
  },
  {
    type: 'relate',
    emoji: '🥲',
    label: '나도 그래',
    activeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.25)]',
  },
  {
    type: 'kick',
    emoji: '🛌',
    label: '이불킥 방지',
    activeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
  },
  {
    type: 'cheer',
    emoji: '🍀',
    label: '내일은 성공',
    activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  '업무/취업': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  '건강/다이어트': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  '일상/실수': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  '연애/인간관계': 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  '공부/시험': 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  '소비/재테크': 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  '기타': 'bg-white/[0.04] text-slate-300 border-white/[0.08]',
};

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export function FailureCard({
  failure,
  onReaction,
  onReport,
  isCompact = false,
  isMine = false,
}: FailureCardProps) {
  const [showAiQuote, setShowAiQuote] = useState(false);

  const categoryStyle =
    CATEGORY_COLORS[failure.category] || CATEGORY_COLORS['기타'];

  return (
    <article className="w-full glass-card rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:border-white/15 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden">
      {/* 상단 태그 및 시간 바 */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center flex-wrap gap-1.5">
          {isMine && (
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              내 사연
            </span>
          )}

          <span
            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${categoryStyle}`}
          >
            #{failure.category}
          </span>

          {failure.similarityScore !== undefined && (
            <span className="text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              유사도 {failure.similarityScore}%
            </span>
          )}

          {failure.authorNickname && (
            <span className="text-[10px] text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full font-medium">
              {failure.authorNickname}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-mono">
            {formatTimeAgo(failure.createdAt)}
          </span>
          {!isMine && (
            <button
              onClick={() => onReport(failure.id)}
              className="text-slate-600 hover:text-rose-400 p-1 rounded-lg hover:bg-white/[0.04] transition-colors"
              title="신고하기"
            >
              <Flag className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 본문 내용 */}
      <p className="text-slate-100 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap font-normal">
        {failure.content}
      </p>

      {/* AI 위로 토닥임 (21st.dev 아코디언) */}
      {failure.aiComfortQuote && !isCompact && (
        <div className="mt-3">
          <button
            onClick={() => setShowAiQuote((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs text-indigo-400/90 hover:text-indigo-300 transition-colors py-0.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium">AI 토닥임 한마디</span>
            {showAiQuote ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {showAiQuote && (
            <div className="mt-2 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs sm:text-sm text-indigo-200 leading-relaxed italic animate-in fade-in duration-150 flex items-start gap-2">
              <Quote className="w-4 h-4 text-indigo-400/80 flex-shrink-0 mt-0.5 rotate-180" />
              <span>&ldquo;{failure.aiComfortQuote}&rdquo;</span>
            </div>
          )}
        </div>
      )}

      {/* 이모지 리액션 (내가 쓴 글인 경우: 받은 공감 통계 표시, 타인의 글인 경우: 공감 버튼) */}
      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center flex-wrap gap-1.5 sm:gap-2">
        {isMine && (
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-400">이웃들에게 받은 따뜻한 공감</span>
            <span className="text-[10px] text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              총 {Object.values(failure.reactions).reduce((a, b) => a + b, 0)}개
            </span>
          </div>
        )}
        {REACTION_CONFIG.map(({ type, emoji, label, activeClass }) => {
          const count = failure.reactions[type] || 0;
          const isSelected = failure.userReactions?.includes(type);

          if (isMine) {
            return (
              <div
                key={type}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border ${
                  count > 0
                    ? 'bg-white/[0.06] text-slate-200 border-white/10'
                    : 'bg-white/[0.02] text-slate-500 border-white/[0.04]'
                }`}
                title={`받은 ${label} ${count}개`}
              >
                <span className="text-sm leading-none">{emoji}</span>
                <span className="text-[11px] hidden sm:inline">{label}</span>
                <span className={`text-[11px] font-bold font-mono ${count > 0 ? 'text-amber-300' : 'text-slate-500'}`}>
                  {count}
                </span>
              </div>
            );
          }

          return (
            <button
              key={type}
              onClick={() => onReaction(failure.id, type)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all active:scale-95 ${
                isSelected
                  ? activeClass
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-slate-200'
              }`}
              title={label}
            >
              <span className="text-sm leading-none">{emoji}</span>
              <span className="text-[11px] hidden sm:inline">{label}</span>
              <span className={`text-[11px] font-bold font-mono ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
