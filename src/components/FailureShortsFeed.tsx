'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Failure, ReactionType } from '@/types';
import {
  Sparkles,
  ChevronUp,
  ChevronDown,
  Quote,
  Flag,
  Video,
  Ticket,
  BedDouble,
  Mail,
  Moon,
  Flame,
  Calendar,
  RotateCcw,
  Trophy,
  Medal,
  Award,
  ArrowDown,
  PenLine
} from 'lucide-react';
import { SendComfortNoteModal } from './SendComfortNoteModal';

interface FailureShortsFeedProps {
  similarFailures: Failure[];
  otherFailures: Failure[];
  myTodayFailure: Failure | null;
  similarCount: number;
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
  hasPass: boolean;
  onOpenPassModal: () => void;
  onNavigateTab?: (tab: 'today' | 'lounge' | 'archive') => void;
  onOpenWriteGate?: () => void;
}

type FeedItem =
  | { type: 'similar'; failure: Failure; rank: number }
  | { type: 'similar_exhausted'; count: number }
  | { type: 'ad'; adId: string }
  | { type: 'community'; failure: Failure }
  | { type: 'closure' }
  | { type: 'empty' };

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
    activeClass: 'bg-indigo-500/30 text-indigo-200 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]',
  },
  {
    type: 'relate',
    emoji: '🥲',
    label: '나도 그래',
    activeClass: 'bg-pink-500/30 text-pink-200 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]',
  },
  {
    type: 'kick',
    emoji: '🛌',
    label: '이불킥 방지',
    activeClass: 'bg-purple-500/30 text-purple-200 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
  },
  {
    type: 'cheer',
    emoji: '🍀',
    label: '내일은 성공',
    activeClass: 'bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
  },
];

export function FailureShortsFeed({
  similarFailures,
  otherFailures,
  myTodayFailure,
  onReaction,
  onReport,
  hasPass,
  onOpenPassModal,
  onNavigateTab,
  onOpenWriteGate,
}: FailureShortsFeedProps) {
  // 1. 알고리즘 기반 피드 구성
  const topSimilar = similarFailures.slice(0, 3);
  const others = otherFailures.filter(
    (f) => (!myTodayFailure || f.id !== myTodayFailure.id) && !topSimilar.some((sf) => sf.id === f.id)
  );

  const items: FeedItem[] = [];

  if (topSimilar.length === 0 && others.length === 0) {
    items.push({ type: 'empty' });
  } else {
    // [단계 1] 나와 가장 닮은 상위 사연 (최대 3편)
    topSimilar.forEach((failure, idx) => {
      items.push({
        type: 'similar',
        failure,
        rank: idx + 1,
      });
    });

    // [단계 2] 유사 사연 3종 직후 광고 (패스 미보유 시)
    if (!hasPass && topSimilar.length > 0) {
      items.push({ type: 'ad', adId: 'ad_post_top3' });
    }

    // [단계 3] 비슷한 사연 소진 알림 및 라운지/캘린더 유도 전환 카드!
    if (topSimilar.length > 0) {
      items.push({
        type: 'similar_exhausted',
        count: topSimilar.length,
      });
    }

    // [단계 4] 모두의 커뮤니티 사연 (반영구적 세로 스크롤) + 4편마다 광고 삽입
    others.forEach((failure, idx) => {
      items.push({ type: 'community', failure });
      if (!hasPass && (idx + 1) % 4 === 0) {
        items.push({ type: 'ad', adId: `ad_community_${idx + 1}` });
      }
    });

    // [단계 5] 피드의 마지막: 안식처 여정 완성 엔딩 카드
    items.push({ type: 'closure' });
  }

  // 스크롤 및 현재 아이템 상태 관리
  const [activeIndex, setActiveIndex] = useState(0);
  const [targetNoteFailure, setTargetNoteFailure] = useState<Failure | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 스냅 스크롤 감지 (현재 화면에 보이는 카드 인덱스 감지)
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;

    if (itemHeight > 0) {
      const newIndex = Math.round(scrollTop / itemHeight);
      if (newIndex >= 0 && newIndex < items.length && newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  }, [activeIndex, items.length]);

  // 특정 인덱스로 스크롤 이동
  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= items.length || !containerRef.current) return;
    const container = containerRef.current;
    container.scrollTo({
      top: index * container.clientHeight,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  // 키보드 위/아래 방향키 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items.length]);

  return (
    <div className="relative w-full h-full flex-1 flex flex-col min-h-0 select-none">
      {/* 1. 상단 플로팅 상태 표시기 (유튜브 숏츠 스타일) */}
      <div className="absolute top-2 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {items[activeIndex]?.type === 'similar' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-pink-300 bg-black/70 backdrop-blur-md border border-pink-500/40 px-2.5 py-0.5 rounded-full shadow-lg">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>나와 닮은 사연 {items[activeIndex].rank}위</span>
            </span>
          ) : items[activeIndex]?.type === 'similar_exhausted' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-black/70 backdrop-blur-md border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-lg">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>닮은 사연 완독</span>
            </span>
          ) : items[activeIndex]?.type === 'ad' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-black/70 backdrop-blur-md border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-lg">
              <Video className="w-3 h-3 text-amber-400" />
              <span>스폰서 꿀잠 쉼터</span>
            </span>
          ) : items[activeIndex]?.type === 'closure' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-300 bg-black/70 backdrop-blur-md border border-purple-500/40 px-2.5 py-0.5 rounded-full shadow-lg">
              <Moon className="w-3 h-3 text-purple-400" />
              <span>오늘의 안식처 완성</span>
            </span>
          ) : items[activeIndex]?.type === 'empty' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 bg-black/70 backdrop-blur-md border border-indigo-500/40 px-2.5 py-0.5 rounded-full shadow-lg">
              <Moon className="w-3 h-3 text-indigo-400" />
              <span>첫 번째 안식처</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 bg-black/70 backdrop-blur-md border border-indigo-500/40 px-2.5 py-0.5 rounded-full shadow-lg">
              <span>모두의 실패 숏츠</span>
            </span>
          )}

          {/* 아직 쓰지 않고 둘러보는 유저를 위한 글쓰기 버튼 */}
          {!myTodayFailure && onOpenWriteGate && (
            <button
              onClick={onOpenWriteGate}
              className="pointer-events-auto flex items-center gap-1 text-[10px] font-bold text-white bg-gradient-to-r from-indigo-600 to-pink-600 px-2.5 py-0.5 rounded-full shadow-lg active:scale-95 transition-all"
            >
              <PenLine className="w-3 h-3" />
              <span>나도 털어놓기</span>
            </button>
          )}
        </div>

        {/* 현재 인덱스 카운터 */}
        <span className="text-[10px] text-slate-300 font-mono bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 shadow-sm pointer-events-auto">
          {activeIndex + 1} / {items.length}
        </span>
      </div>

      {/* 2. 메인 유튜브 숏츠형 세로 스냅 피드 컨테이너 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar rounded-2xl sm:rounded-3xl border border-white/[0.08] shadow-[0_15px_50px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#070b19] via-[#050713] to-black"
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((item, idx) => {
          return (
            <div
              key={idx}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className="w-full h-full snap-start snap-always flex-shrink-0 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden"
            >
              {/* 앰비언트 글로우 배경 효과 */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* [카드 타입 A: 실패 사연 숏츠 (유사 사연 또는 커뮤니티)] */}
              {item.type === 'similar' || item.type === 'community' ? (
                <div className="w-full h-full flex flex-col justify-between pt-7 pb-2 relative z-10">
                  {/* 상단 태그 및 작성자 정보 */}
                  <div className="flex items-center justify-between gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.type === 'similar' && (
                        <span className="text-[11px] font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.4)] flex items-center gap-1">
                          {item.rank === 1 && <Trophy className="w-3 h-3 text-amber-300" />}
                          {item.rank === 2 && <Medal className="w-3 h-3 text-slate-300" />}
                          {item.rank === 3 && <Award className="w-3 h-3 text-amber-500" />}
                          <span>유사 실패 {item.rank}위</span>
                        </span>
                      )}

                      <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                        #{item.failure.category}
                      </span>

                      {item.failure.similarityScore !== undefined && (
                        <span className="text-[10px] font-bold text-pink-300 bg-pink-500/15 border border-pink-500/30 px-2 py-0.5 rounded-full">
                          나와의 공감도 {item.failure.similarityScore}%
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <span className="truncate max-w-[90px]">{item.failure.authorNickname || '익명의 친구'}</span>
                      <button
                        onClick={() => onReport(item.failure.id)}
                        className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                        title="신고"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 중앙 본문 사연 및 AI 위로 한마디 */}
                  <div className="my-auto py-3 space-y-3 pr-14 max-h-[55vh] overflow-y-auto">
                    <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed break-words whitespace-pre-wrap">
                      &ldquo;{item.failure.content}&rdquo;
                    </p>

                    {item.failure.aiComfortQuote && (
                      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2 text-xs text-indigo-200 italic shadow-inner">
                        <Quote className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5 rotate-180" />
                        <span>{item.failure.aiComfortQuote}</span>
                      </div>
                    )}
                  </div>

                  {/* 우측 세로 숏츠형 인터랙션 플로팅 바 */}
                  <div className="absolute right-1 bottom-10 flex flex-col items-center gap-2.5 z-20">
                    {REACTION_CONFIG.map(({ type, emoji, label, activeClass }) => {
                      const count = item.failure.reactions[type] || 0;
                      const isSelected = item.failure.userReactions?.includes(type);

                      return (
                        <button
                          key={type}
                          onClick={() => onReaction(item.failure.id, type)}
                          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all active:scale-90 border backdrop-blur-md ${
                            isSelected
                              ? activeClass
                              : 'bg-black/50 text-slate-300 border-white/[0.1] hover:bg-white/[0.1]'
                          }`}
                          title={label}
                        >
                          <span className="text-sm leading-none">{emoji}</span>
                          <span className="text-[9px] font-bold font-mono mt-0.5">
                            {count}
                          </span>
                        </button>
                      );
                    })}

                    {/* 💌 1초 익명 온기 쪽지 보내기 */}
                    <button
                      onClick={() => {
                        setTargetNoteFailure(item.failure);
                        setIsNoteModalOpen(true);
                      }}
                      className="w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all active:scale-90 border backdrop-blur-md bg-pink-950/70 text-pink-300 border-pink-500/40 hover:bg-pink-900/60 shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                      title="1초 익명 온기 쪽지 보내기"
                    >
                      <Mail className="w-4 h-4 text-pink-400" />
                      <span className="text-[8px] font-bold mt-0.5">온기</span>
                    </button>
                  </div>

                  {/* 하단 스와이프 안내 */}
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 pt-1 flex-shrink-0 animate-bounce">
                    <span>아래로 스와이프하여 다음 사연 보기</span>
                    <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </div>
              ) : null}

              {/* [카드 타입 B: 비슷한 사연 소진 알림 & 라운지/캘린더 유도 전환 카드] */}
              {item.type === 'similar_exhausted' ? (
                <div className="w-full h-full flex flex-col justify-between pt-7 pb-2 text-center relative z-10">
                  <div className="my-auto space-y-4 max-w-sm mx-auto">
                    <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-pink-500 blur-xl opacity-60 animate-pulse" />
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-950 to-amber-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                        <Flame className="w-7 h-7 fill-amber-400/30" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                        유사한 실패 {item.count}편 완독
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-100 leading-snug">
                        나와 가장 닮은 사연을<br />모두 만났어요
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        나와 비슷한 상처를 안고 있는 이웃들과 함께<br />
                        심야 라운지에서 온기 촛불을 밝혀보세요.<br />
                        또는 아래로 계속 넘겨 이웃들의 모든 사연을 둘러보실 수 있습니다.
                      </p>
                    </div>

                    {/* 유도 액션 버튼 2개 */}
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => onNavigateTab?.('lounge')}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 active:scale-98 transition-all"
                      >
                        <Flame className="w-3.5 h-3.5 fill-white/20" />
                        <span>🕯️ 심야 라운지에서 온기 나누기</span>
                      </button>

                      <button
                        onClick={() => onNavigateTab?.('archive')}
                        className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] flex items-center justify-center gap-2 active:scale-98 transition-all"
                      >
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>내 달빛 캘린더 & 보관함 보기</span>
                      </button>
                    </div>
                  </div>

                  {/* 하단 스와이프 유도 */}
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 pt-1 flex-shrink-0 animate-bounce">
                    <span>이웃들의 모든 사연 계속 보기</span>
                    <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </div>
              ) : null}

              {/* [카드 타입 C: 스폰서 광고 및 프리미엄 결제 유도] */}
              {item.type === 'ad' ? (
                <div className="w-full h-full flex flex-col justify-between pt-7 pb-2 text-center relative z-10">
                  <div className="my-auto space-y-4 max-w-sm mx-auto glass-card p-6 rounded-3xl border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                      <BedDouble className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        Sponsored · 꿀잠 쉼터
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-100 leading-snug">
                        “오늘 실패는 잊고 푹 주무세요”<br />
                        마음을 편안하게 해주는 심야 테라피
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        실패를 털어놓은 당신은 이미 충분히 훌륭합니다.
                      </p>
                    </div>

                    <button
                      onClick={onOpenPassModal}
                      className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 hover:opacity-95 active:scale-[0.98] shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-shimmer flex items-center justify-center gap-2"
                    >
                      <Ticket className="w-4 h-4 text-white" />
                      <span>🎟️ 광고 없이 무제한으로 보기 (이용권)</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 pt-1 flex-shrink-0 animate-bounce">
                    <span>아래로 스와이프하여 다음 이야기 보기</span>
                    <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </div>
              ) : null}

              {/* [카드 타입 D: 오늘의 안식처 완성 엔딩 카드] */}
              {item.type === 'closure' ? (
                <div className="w-full h-full flex flex-col justify-between pt-7 pb-2 text-center relative z-10">
                  <div className="my-auto space-y-4 max-w-sm mx-auto">
                    <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-60 animate-pulse" />
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 border border-white/20 flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                        <Moon className="w-7 h-7 fill-white/20 text-white" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/40 px-3 py-1 rounded-full text-[11px] font-bold text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>오늘의 안식처 여정 완료</span>
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight leading-snug">
                        오늘 하루도<br />참 고생 많으셨어요
                      </h2>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                        오늘 털어놓은 당신의 실패는 부끄러운 상처가 아닌,<br />
                        내일의 당신을 더 단단하게 만들어 줄 디딤돌입니다.<br />
                        어둠 속에서도 함께 걷는 이웃들이 곁에 있어요.
                      </p>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="space-y-2 pt-2 w-full max-w-xs mx-auto">
                      <button
                        onClick={() => onNavigateTab?.('lounge')}
                        className="w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 text-white shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:opacity-95"
                      >
                        <Flame className="w-4 h-4 text-amber-200 fill-amber-200/30 animate-pulse" />
                        <span>🕯️ 이웃들이 깨어있는 심야 라운지 가기</span>
                      </button>

                      <button
                        onClick={() => onNavigateTab?.('archive')}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>내 달빛 캘린더 & 보관함 가기</span>
                      </button>

                      <button
                        onClick={() => scrollToIndex(0)}
                        className="w-full py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>맨 처음 사연으로 다시 올라가기</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* [카드 타입 E: 사연이 아직 없을 때 안심 안내 카드] */}
              {item.type === 'empty' ? (
                <div className="w-full h-full flex flex-col justify-between pt-7 pb-2 text-center relative z-10">
                  <div className="my-auto space-y-4 max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-[0_0_25px_rgba(99,102,241,0.3)]">
                      <Moon className="w-8 h-8 fill-white/10" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                        첫 번째 안식처의 밤
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-100">
                        오늘 첫 번째 실패의<br />주인공이 되어보세요
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        아직 오늘 등록된 다른 이웃의 실패가 없습니다.<br />
                        당신의 솔직한 이야기가 곧 찾아올 이웃들에게<br />
                        가장 따뜻한 위로와 용기가 됩니다.
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      {onOpenWriteGate && (
                        <button
                          onClick={onOpenWriteGate}
                          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg flex items-center justify-center gap-2 active:scale-98"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                          <span>오늘의 실패 털어놓기</span>
                        </button>
                      )}
                      <button
                        onClick={() => onNavigateTab?.('lounge')}
                        className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-white/[0.05] text-slate-300 border border-white/[0.08] flex items-center justify-center gap-2"
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>심야 라운지 둘러보기</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* 3. 우측 데스크톱/터치 네비게이션 화살표 */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30 pointer-events-auto">
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white disabled:opacity-20 flex items-center justify-center transition-all active:scale-90"
          title="이전 이야기 (위로)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex >= items.length - 1}
          className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white disabled:opacity-20 flex items-center justify-center transition-all active:scale-90"
          title="다음 이야기 (아래로)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* 4. 1초 익명 온기 쪽지 보내기 모달 */}
      <SendComfortNoteModal
        failure={targetNoteFailure}
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setTargetNoteFailure(null);
        }}
      />
    </div>
  );
}
