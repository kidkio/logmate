'use client';

import React, { useState } from 'react';
import { Failure, ReactionType } from '@/types';
import { Flag, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface FailureCardProps {
  failure: Failure;
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
  isCompact?: boolean;
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
    activeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/20',
  },
  {
    type: 'relate',
    emoji: '🥲',
    label: '나도 그래',
    activeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-sm shadow-pink-500/20',
  },
  {
    type: 'kick',
    emoji: '🛌',
    label: '이불킥 방지',
    activeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm shadow-purple-500/20',
  },
  {
    type: 'cheer',
    emoji: '🍀',
    label: '내일은 성공',
    activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  '업무/취업': 'bg-blue-950/60 text-blue-300 border-blue-800/60',
  '건강/다이어트': 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  '일상/실수': 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  '연애/인간관계': 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  '공부/시험': 'bg-purple-950/60 text-purple-300 border-purple-800/60',
  '소비/재테크': 'bg-teal-950/60 text-teal-300 border-teal-800/60',
  '기타': 'bg-slate-800/80 text-slate-300 border-slate-700',
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
}: FailureCardProps) {
  const [showAiQuote, setShowAiQuote] = useState(false);

  const categoryStyle =
    CATEGORY_COLORS[failure.category] || CATEGORY_COLORS['기타'];

  return (
    <article className="w-full bg-slate-900/70 hover:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-800/90 transition-all shadow-md shadow-black/20">
      {/* 상단 태그 및 시간 바 */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center flex-wrap gap-1.5">
          <span
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${categoryStyle}`}
          >
            #{failure.category}
          </span>

          {failure.similarityScore !== undefined && (
            <span className="text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-full">
              유사도 {failure.similarityScore}%
            </span>
          )}

          {failure.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">
            {formatTimeAgo(failure.createdAt)}
          </span>
          <button
            onClick={() => onReport(failure.id)}
            className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors"
            title="신고하기"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 본문 내용 */}
      <p className="text-slate-100 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
        {failure.content}
      </p>

      {/* AI 위로 토닥임 (아코디언 토글) */}
      {failure.aiComfortQuote && !isCompact && (
        <div className="mt-3">
          <button
            onClick={() => setShowAiQuote((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs text-indigo-400/90 hover:text-indigo-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI의 토닥임 보기</span>
            {showAiQuote ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          {showAiQuote && (
            <div className="mt-2 p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-xs sm:text-sm text-indigo-200 leading-relaxed italic animate-in fade-in duration-150">
              &ldquo;{failure.aiComfortQuote}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* 이모지 리액션 버튼 그리드 */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center flex-wrap gap-1.5 sm:gap-2">
        {REACTION_CONFIG.map(({ type, emoji, label, activeClass }) => {
          const count = failure.reactions[type] || 0;
          const isSelected = failure.userReactions?.includes(type);

          return (
            <button
              key={type}
              onClick={() => onReaction(failure.id, type)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                isSelected
                  ? activeClass
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-200'
              }`}
              title={label}
            >
              <span className="text-sm">{emoji}</span>
              <span className="text-[11px] hidden sm:inline">{label}</span>
              <span className={`text-xs font-semibold ${isSelected ? 'font-bold' : ''}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
