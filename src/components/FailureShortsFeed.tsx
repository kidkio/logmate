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
  PenLine,
  ExternalLink,
  LockOpen
} from 'lucide-react';
import { SendComfortNoteModal } from './SendComfortNoteModal';

import { RewardedAdModal } from './RewardedAdModal';
import { Toast } from './Toast';

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

interface CoupangProduct {
  id: string;
  badge: string;
  title: string;
  description: string;
  price: string;
  discount: string;
  rating: string;
  cta: string;
  url: string;
  icon: string;
  color: string;
  border: string;
}

const COUPANG_AFFILIATE_PRODUCTS: CoupangProduct[] = [
  {
    id: 'tea_sleep',
    badge: '심야 숙면 1위',
    title: '유기농 캐모마일 & 타트체리 꿀잠 티 (40티백)',
    description: '불안과 자책으로 뒤척이는 밤, 뇌파를 이완시켜주는 따뜻한 잠자리 허브티. 오늘 밤 나에게 편안한 수면을 선물하세요.',
    price: '18,900원',
    discount: '32% 특가',
    rating: '4.9 ★★★★★ (2,410개 꿀잠 후기)',
    cta: '쿠팡 로켓배송 최저가 보기',
    url: 'https://www.coupang.com',
    icon: '🍵',
    color: 'from-amber-950/70 to-emerald-950/70',
    border: 'border-amber-500/40',
  },
  {
    id: 'book_comfort',
    badge: '치유 베스트셀러',
    title: '내가 틀릴 수도 있습니다 (비욘 나티코 린데블라드 저)',
    description: '17년간 숲속 승려로 살며 배운 "자책하지 않고 나를 용서하는 법". 지친 밤 마음에 완전한 평화를 주는 도서.',
    price: '16,200원',
    discount: '10% 할인',
    rating: '4.9 ★★★★★ (4,820개 독자 평점)',
    cta: '쿠팡 도서 상세 보기',
    url: 'https://www.coupang.com',
    icon: '📖',
    color: 'from-purple-950/70 to-indigo-950/70',
    border: 'border-purple-500/40',
  },
  {
    id: 'candle_mist',
    badge: '아로마 테라피',
    title: '천연 라벤더 아로마 소이 캔들 & 필로우 미스트 세트',
    description: '베개에 한 번 뿌려주면 침실 가득 퍼지는 라벤더 숲의 향기. 깊은 호흡과 함께 긴장이 사르르 녹아내립니다.',
    price: '21,500원',
    discount: '25% 할인',
    rating: '4.8 ★★★★★ (1,150개 만족 후기)',
    cta: '힐링 아로마 키트 보기',
    url: 'https://www.coupang.com',
    icon: '🕯️',
    color: 'from-pink-950/70 to-rose-950/70',
    border: 'border-pink-500/40',
  },
];

type FeedItem =
  | { type: 'similar'; failure: Failure; rank: number }
  | { type: 'similar_exhausted'; count: number }
  | { type: 'ad_adsense' }
  | { type: 'ad_coupang'; product: CoupangProduct }
  | { type: 'ad_reward' }
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

    // [단계 2] 유사 사연 3종 직후 광고 (패스 미보유 시): 구글 애드센스 네이티브 인피드
    if (!hasPass && topSimilar.length > 0) {
      items.push({ type: 'ad_adsense' });
    }

    // [단계 3] 비슷한 사연 소진 알림 및 라운지/캘린더 유도 전환 카드!
    if (topSimilar.length > 0) {
      items.push({
        type: 'similar_exhausted',
        count: topSimilar.length,
      });
    }

    // [단계 4] 모두의 커뮤니티 사연 (반영구적 세로 스크롤) + 3가지 광고 모델 순차 교차 삽입
    others.forEach((failure, idx) => {
      items.push({ type: 'community', failure });
      if (!hasPass && (idx + 1) % 3 === 0) {
        const cycle = Math.floor((idx + 1) / 3) % 3;
        if (cycle === 1) {
          // 쿠팡 파트너스 심야 힐링 상품
          const pIdx = Math.floor((idx + 1) / 6) % COUPANG_AFFILIATE_PRODUCTS.length;
          items.push({ type: 'ad_coupang', product: COUPANG_AFFILIATE_PRODUCTS[pIdx] });
        } else if (cycle === 2) {
          // 보상형 동영상 리워드 광고 (사연 3개 추가 해금)
          items.push({ type: 'ad_reward' });
        } else {
          // 구글 애드센스 인피드 단위
          items.push({ type: 'ad_adsense' });
        }
      }
    });

    // [단계 5] 피드의 마지막: 안식처 여정 완성 엔딩 카드
    items.push({ type: 'closure' });
  }

  // 스크롤 및 현재 아이템 상태 관리
  const [activeIndex, setActiveIndex] = useState(0);
  const [targetNoteFailure, setTargetNoteFailure] = useState<Failure | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
          ) : items[activeIndex]?.type === 'ad_adsense' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 bg-black/70 backdrop-blur-md border border-indigo-500/40 px-2.5 py-0.5 rounded-full shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Google AdSense · 스폰서</span>
            </span>
          ) : items[activeIndex]?.type === 'ad_coupang' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-black/70 backdrop-blur-md border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-lg">
              <span>🍵 심야 힐링 제휴 쉼터</span>
            </span>
          ) : items[activeIndex]?.type === 'ad_reward' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-pink-300 bg-black/70 backdrop-blur-md border border-pink-500/40 px-2.5 py-0.5 rounded-full shadow-lg">
              <Video className="w-3 h-3 text-pink-400" />
              <span>15초 리워드 보상</span>
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
              <span>모두의 사연 피드</span>
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

              {/* [카드 타입 C-1: 구글 애드센스 반응형 인피드 광고 단위] */}
              {item.type === 'ad_adsense' ? (
                <div className="w-full h-full flex flex-col justify-between pt-7 pb-2 text-center relative z-10">
                  <div className="my-auto space-y-3.5 max-w-sm mx-auto glass-card p-5 sm:p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/70 via-slate-900 to-black shadow-[0_0_40px_rgba(99,102,241,0.25)]">
                    {/* 상단 스폰서 배지 & 카테고리 */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-indigo-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <span>Google AdSense · In-Feed</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">후원 스폰서</span>
                    </div>

                    {/* 애드센스 컨테이너 */}
                    <div className="rounded-2xl bg-black/50 border border-white/[0.08] p-4 text-left space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-mono">AD #3037502282</span>
                        <span className="bg-white/[0.05] px-1.5 py-0.5 rounded text-[9px]">Google</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 leading-snug">
                        오늘 밤, 마음의 쉼표를 찍는 안식처
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        불안과 고민을 덜어내는 심야 멘탈 웰니스 및 맞춤형 스폰서 추천 공간입니다.
                      </p>
                      <div className="pt-1">
                        <span className="text-[11px] text-indigo-400 font-medium">
                          맞춤형 파트너 솔루션 둘러보기 &rarr;
                        </span>
                      </div>
                    </div>

                    {/* 이용권 결제 유도 */}
                    <button
                      onClick={onOpenPassModal}
                      className="w-full py-2 rounded-xl font-semibold text-[11px] text-slate-400 hover:text-slate-200 bg-black/40 hover:bg-black/60 border border-white/10 active:scale-[0.98] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Ticket className="w-3.5 h-3.5 text-amber-400" />
                      <span>🎟️ 광고 없이 무제한으로 보기 (이용권)</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 pt-1 flex-shrink-0 animate-bounce">
                    <span>아래로 스와이프하여 사연 계속 보기</span>
                    <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </div>
              ) : null}

              {/* [카드 타입 C-2: 쿠팡 파트너스 공식 실시간 다이나믹 배너 & 힐링 큐레이션] */}
              {item.type === 'ad_coupang' ? (
                <div className="w-full h-full flex flex-col justify-between pt-7 pb-2 text-center relative z-10">
                  <div className="my-auto space-y-3.5 max-w-sm mx-auto glass-card p-4 sm:p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-950/70 via-slate-900 to-black shadow-[0_0_40px_rgba(0,0,0,0.5)] text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-300 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5">
                        <span>🍵 심야 숙면 & 힐링 큐레이션</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Coupang Partners
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-black text-slate-100 leading-snug">
                        오늘 밤 지친 나를 위한 맞춤 힐링 아이템
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        스트레스로 뒤척이는 밤, 나에게 꼭 필요한 숙면 및 테라피 상품을 둘러보세요.
                      </p>
                    </div>

                    {/* 쿠팡 파트너스 공식 실시간 다이나믹 캐러셀 배너 */}
                    <div className="w-full overflow-hidden rounded-2xl bg-slate-950/90 border border-white/10 min-h-[140px] flex items-center justify-center shadow-inner">
                      <iframe
                        src="https://ads-partners.coupang.com/widgets.html?id=1025741&template=carousel&trackingCode=AF4101329&subId=&width=100%&height=140px&tsource="
                        width="100%"
                        height="140"
                        frameBorder="0"
                        scrolling="no"
                        referrerPolicy="unsafe-url"
                        title="Coupang Feed Dynamic Banner"
                        className="w-full h-[140px] rounded-2xl"
                      />
                    </div>

                    <p className="text-[9px] text-slate-500 text-center leading-tight pt-1">
                      *이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 pt-1 flex-shrink-0 animate-bounce">
                    <span>아래로 스와이프하여 사연 계속 보기</span>
                    <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </div>
              ) : null}

              {/* [카드 타입 C-3: 보상형 동영상 광고 모달 트리거 카드] */}
              {item.type === 'ad_reward' ? (
                <div className="w-full h-full flex flex-col justify-between pt-7 pb-2 text-center relative z-10">
                  <div className="my-auto space-y-4 max-w-sm mx-auto glass-card p-6 rounded-3xl border border-pink-500/40 bg-gradient-to-b from-pink-950/70 via-slate-900 to-black shadow-[0_0_50px_rgba(236,72,153,0.25)] text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 animate-pulse">
                      <LockOpen className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-pink-300 bg-pink-950/80 border border-pink-500/40 px-2.5 py-0.5 rounded-full">
                        Google AdSense · 리워드 스폰서
                      </span>
                      <h3 className="text-base font-black text-slate-100">
                        숨겨진 공감 사연 3편 더 열어보기
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        15초의 짧은 힐링 영상을 시청하시면 나와 가장 닮은 특별 사연 3편이 즉시 잠금 해제됩니다.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsRewardedAdOpen(true)}
                      className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 active:scale-[0.98] shadow-lg shadow-pink-500/30 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Video className="w-3.5 h-3.5 text-white" />
                      <span>15초 영상 보고 사연 열기</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 pt-1 flex-shrink-0 animate-bounce">
                    <span>아래로 스와이프하여 사연 계속 보기</span>
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

      {/* 5. 15초 리워드 보상형 동영상 광고 모달 */}
      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        rewardType="similar_failures"
        onRewardClaimed={() => {
          setToastMessage('🎉 보상 획득! 숨겨진 공감 사연 3편이 열렸습니다 🔓');
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* 6. 알림 토스트 */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
