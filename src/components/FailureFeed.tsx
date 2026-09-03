'use client';

import React from 'react';
import { Failure, CategoryType, ReactionType } from '@/types';
import { FailureCard } from './FailureCard';
import { Filter, Flame, Clock3, Inbox } from 'lucide-react';

interface FailureFeedProps {
  failures: Failure[];
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  activeSort: 'latest' | 'popular';
  onSelectSort: (sort: 'latest' | 'popular') => void;
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
  isLoading: boolean;
}

const CATEGORIES: CategoryType[] = [
  '전체',
  '업무/취업',
  '건강/다이어트',
  '일상/실수',
  '연애/인간관계',
  '공부/시험',
  '소비/재테크',
];

export function FailureFeed({
  failures,
  activeCategory,
  onSelectCategory,
  activeSort,
  onSelectSort,
  onReaction,
  onReport,
  isLoading,
}: FailureFeedProps) {
  return (
    <section className="w-full space-y-4">
      {/* 카테고리 필터 스크롤 바 */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 flex-nowrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200 border border-slate-700/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 정렬 토글 */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 flex-shrink-0">
          <button
            onClick={() => onSelectSort('latest')}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors ${
              activeSort === 'latest'
                ? 'bg-slate-800 text-indigo-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock3 className="w-3 h-3" />
            <span>최신</span>
          </button>
          <button
            onClick={() => onSelectSort('popular')}
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-md transition-colors ${
              activeSort === 'popular'
                ? 'bg-slate-800 text-pink-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>공감순</span>
          </button>
        </div>
      </div>

      {/* 피드 목록 */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full h-32 bg-slate-900/60 rounded-xl border border-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : failures.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-6 space-y-2">
          <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">
            아직 등록된 실패가 없습니다
          </h3>
          <p className="text-xs text-slate-500">
            첫 번째로 오늘 있었던 실패를 털어놓고 사람들과 위로를 나눠보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {failures.map((failure) => (
            <FailureCard
              key={failure.id}
              failure={failure}
              onReaction={onReaction}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </section>
  );
}
