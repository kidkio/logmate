'use client';

import React from 'react';
import { Failure, CategoryType, ReactionType } from '@/types';
import { FailureCard } from './FailureCard';
import { Flame, Clock3, Inbox, Lock, Play, Ticket, Sparkles } from 'lucide-react';

interface FailureFeedProps {
  failures: Failure[];
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  activeSort: 'latest' | 'popular';
  onSelectSort: (sort: 'latest' | 'popular') => void;
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
  isLoading: boolean;
  unlockedCount: number;
  onOpenAdModal: () => void;
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
  unlockedCount,
  onOpenAdModal,
}: FailureFeedProps) {
  const visibleFailures = failures.slice(0, unlockedCount);
  const lockedCount = Math.max(0, failures.length - unlockedCount);

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
          {/* 기본 무료 열람 카드 (최대 unlockedCount개, 기본 3개) */}
          {visibleFailures.map((failure) => (
            <FailureCard
              key={failure.id}
              failure={failure}
              onReaction={onReaction}
              onReport={onReport}
            />
          ))}

          {/* 잠긴 실패 카드 및 잠금 해제 CTA 영역 */}
          {lockedCount > 0 && (
            <div className="relative pt-2">
              {/* 블러 처리된 카드 프리뷰 */}
              <div className="relative rounded-2xl overflow-hidden border border-indigo-900/40 bg-slate-900/40 p-4 select-none pointer-events-none filter blur-[3px] opacity-40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">#비밀_실패</span>
                  <span className="text-xs text-slate-500">10분 전</span>
                </div>
                <p className="text-sm text-slate-300">
                  오늘 중요한 미팅에서 프레젠테이션 자료를 완전히 잘못 열어서 모두가 침묵에 빠졌습니다...
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400">🫂 토닥토닥 48</span>
                  <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400">🥲 나도 그래 72</span>
                </div>
              </div>

              {/* 블러 위에 얹히는 언락 배너 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                <div className="bg-slate-950/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md max-w-md w-full space-y-3.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
                    <Lock className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-100">
                      기본 3명의 실패를 모두 읽으셨습니다
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      오늘 등록된 <strong className="text-pink-400">{lockedCount}개</strong>의 비슷한 실패 이야기가 더 기다리고 있어요.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                    <button
                      onClick={onOpenAdModal}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>광고 보고 3개 더 보기</span>
                    </button>

                    <button
                      onClick={onOpenAdModal}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all border border-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Ticket className="w-3.5 h-3.5 text-pink-400" />
                      <span>이용권으로 전체 열람</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
