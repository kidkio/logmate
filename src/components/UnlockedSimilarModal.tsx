'use client';

import React, { useState } from 'react';
import { Failure, ReactionType } from '@/types';
import { LockOpen, Sparkles, Quote, X, ChevronRight, ChevronLeft, Heart, Mail, Share2, ArrowRight } from 'lucide-react';
import { SendComfortNoteModal } from './SendComfortNoteModal';

interface UnlockedSimilarModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedFailures: Failure[];
  onReaction?: (failureId: string, type: ReactionType) => void;
  onNavigateToFeed?: () => void;
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
    activeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.25)]',
  },
  {
    type: 'relate',
    emoji: '🥲',
    label: '나도 그래',
    activeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-[0_0_12px_rgba(236,72,153,0.25)]',
  },
  {
    type: 'kick',
    emoji: '🛌',
    label: '이불킥 방지',
    activeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
  },
  {
    type: 'cheer',
    emoji: '🍀',
    label: '내일은 성공',
    activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
  },
];

export function UnlockedSimilarModal({
  isOpen,
  onClose,
  unlockedFailures,
  onReaction,
  onNavigateToFeed,
}: UnlockedSimilarModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedForNote, setSelectedForNote] = useState<Failure | null>(null);
  const [localReactions, setLocalReactions] = useState<Record<string, Record<ReactionType, number>>>({});
  const [userReacted, setUserReacted] = useState<Record<string, Set<ReactionType>>>({});

  if (!isOpen || unlockedFailures.length === 0) return null;

  const currentStory = unlockedFailures[currentIndex] || unlockedFailures[0];

  const handleReactionClick = (type: ReactionType) => {
    if (!currentStory) return;
    const storyId = currentStory.id;

    // 로컬 상태 즉시 토글
    const reactedSet = new Set(userReacted[storyId] || []);
    const isAlready = reactedSet.has(type);

    const currentStoryReactions = {
      ...currentStory.reactions,
      ...(localReactions[storyId] || {}),
    };

    if (isAlready) {
      reactedSet.delete(type);
      currentStoryReactions[type] = Math.max(0, (currentStoryReactions[type] || 1) - 1);
    } else {
      reactedSet.add(type);
      currentStoryReactions[type] = (currentStoryReactions[type] || 0) + 1;
    }

    setUserReacted((prev) => ({ ...prev, [storyId]: reactedSet }));
    setLocalReactions((prev) => ({ ...prev, [storyId]: currentStoryReactions }));

    if (onReaction) {
      onReaction(storyId, type);
    }
  };

  const getReactionCount = (type: ReactionType): number => {
    if (!currentStory) return 0;
    return localReactions[currentStory.id]?.[type] ?? currentStory.reactions[type] ?? 0;
  };

  const hasReacted = (type: ReactionType): boolean => {
    if (!currentStory) return false;
    return userReacted[currentStory.id]?.has(type) ?? false;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="glass-card max-w-md w-full p-5 sm:p-6 rounded-3xl border border-pink-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-left space-y-4 shadow-[0_0_60px_rgba(236,72,153,0.3)] relative max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* 상단 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 flex-shrink-0 animate-pulse">
              <LockOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-pink-300 bg-pink-950/80 border border-pink-500/40 px-2 py-0.5 rounded-full inline-block mb-0.5">
                온기 해금 완료 🔓
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                숨겨진 공감 사연 3편
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3편 탭 네비게이터 */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-white/[0.06]">
          {unlockedFailures.slice(0, 3).map((f, idx) => (
            <button
              key={f.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 ${
                currentIndex === idx
                  ? 'bg-gradient-to-r from-pink-600 to-amber-600 text-white shadow-md shadow-pink-500/30 font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <span>{idx + 1}번째 비밀</span>
              <span className="text-[9px] opacity-80 truncate max-w-[80px]">
                {f.category || '공감 사연'}
              </span>
            </button>
          ))}
        </div>

        {/* 현재 선택된 사연 상세 카드 */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 border border-pink-500/40 text-pink-300">
              🏷️ {currentStory.category}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {currentStory.authorNickname || '어느 익명의 이웃'}
            </span>
          </div>

          {/* 사연 본문 */}
          <div className="text-slate-100 text-sm leading-relaxed whitespace-pre-line bg-black/40 p-3.5 rounded-xl border border-white/[0.05]">
            &ldquo;{currentStory.content}&rdquo;
          </div>

          {/* AI의 다정한 토닥임 */}
          {currentStory.aiComfortQuote && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-indigo-950/40 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-2">
              <Quote className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 rotate-180" />
              <p className="leading-snug italic">
                {currentStory.aiComfortQuote}
              </p>
            </div>
          )}

          {/* 4종 실시간 리액션 버튼 */}
          <div className="pt-1">
            <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
              이 이웃에게 마음을 전해주세요
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {REACTION_CONFIG.map((r) => {
                const count = getReactionCount(r.type);
                const active = hasReacted(r.type);
                return (
                  <button
                    key={r.type}
                    onClick={() => handleReactionClick(r.type)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 active:scale-90 ${
                      active
                        ? r.activeClass
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-sm">{r.emoji}</span>
                    <span className="text-[9px] font-semibold">{r.label}</span>
                    <span className="text-[10px] font-mono font-bold text-slate-300">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 익명 온기 쪽지 보내기 버튼 */}
          <button
            onClick={() => setSelectedForNote(currentStory)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-950/80 via-indigo-950/80 to-purple-950/80 border border-sky-500/40 hover:border-sky-400 text-sky-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
          >
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            <span>이 이웃에게 따뜻한 온기 쪽지 남기기 💌</span>
          </button>
        </div>

        {/* 이전/다음 사연 네비게이션 컨트롤 */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 사연</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500">
            {currentIndex + 1} / {unlockedFailures.length}
          </span>

          <button
            onClick={() => setCurrentIndex((prev) => Math.min(unlockedFailures.length - 1, prev + 1))}
            disabled={currentIndex === unlockedFailures.length - 1}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <span>다음 사연</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 하단 피드 이동 안내 버튼 */}
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          {onNavigateToFeed && (
            <button
              onClick={() => {
                onClose();
                onNavigateToFeed();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-pink-500/25 active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <span>숏츠 피드에서 전체 사연 계속 넘겨보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <p className="text-[10px] text-slate-500 text-center">
            *해금된 사연 3편은 오늘의 숏츠 피드에도 영구적으로 추가 합류되었습니다.
          </p>
        </div>
      </div>

      {/* 온기 쪽지 모달 연동 */}
      {selectedForNote && (
        <SendComfortNoteModal
          isOpen={!!selectedForNote}
          onClose={() => setSelectedForNote(null)}
          failure={selectedForNote}
          onSentSuccess={() => {
            setSelectedForNote(null);
          }}
        />
      )}
    </div>
  );
}
