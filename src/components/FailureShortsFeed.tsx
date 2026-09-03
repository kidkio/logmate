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
  ListFilter,
  X,
  Trophy,
  Medal,
  Award
} from 'lucide-react';
import { FailureCard } from './FailureCard';

interface FailureShortsFeedProps {
  similarFailures: Failure[];
  otherFailures: Failure[];
  myTodayFailure: Failure;
  similarCount: number;
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
  hasPass: boolean;
  onOpenPassModal: () => void;
}

interface FeedItem {
  type: 'similar' | 'community' | 'ad';
  failure?: Failure;
  rank?: number; // 1, 2, 3 (유사 사연 순위)
  adId?: string;
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
  similarCount,
  onReaction,
  onReport,
  hasPass,
  onOpenPassModal,
}: FailureShortsFeedProps) {
  // 1. 유사한 3종 사연을 최우선으로 배치!
  const top3 = similarFailures.slice(0, 3);
  const others = otherFailures.filter(
    (f) => f.id !== myTodayFailure.id && !top3.some((sf) => sf.id === f.id)
  );

  const items: FeedItem[] = [];

  // [1단계] 유사 사연 3종 순차 등록
  top3.forEach((failure, idx) => {
    items.push({
      type: 'similar',
      failure,
      rank: idx + 1,
    });
  });

  // [2단계] 유사 사연 3종 직후 광고 1회 자동 삽입 (패스 미보유 시)
  if (!hasPass && top3.length > 0) {
    items.push({ type: 'ad', adId: 'ad_post_top3' });
  }

  // [3단계] 그 이후 일반 커뮤니티 실패 + 3개마다 광고 삽입
  others.forEach((failure, idx) => {
    items.push({ type: 'community', failure });
    if (!hasPass && (idx + 1) % 3 === 0) {
      items.push({ type: 'ad', adId: `ad_${idx + 1}` });
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 ~ 100
  const [isHolding, setIsHolding] = useState(false);
  const [isListDrawerOpen, setIsListDrawerOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartTime = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);

  const currentItem = items[currentIndex] || items[0];
  const isAd = currentItem?.type === 'ad';
  const durationMs = isAd ? 5000 : 7000;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < items.length - 1) {
        setProgress(0);
        return prev + 1;
      }
      return prev;
    });
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        setProgress(0);
        return prev - 1;
      }
      return prev;
    });
  }, []);

  // 인스타 스타일 프로그레스 대시바 타이머
  useEffect(() => {
    if (isHolding || isListDrawerOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = 50;
    const step = (interval / durationMs) * 100;

    timerRef.current = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          goToNext();
          return 0;
        }
        return old + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHolding, isListDrawerOpen, durationMs, goToNext]);

  // 터치 및 탭 핸들러 (좌측 35% 이전, 우측 65% 다음)
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    pressStartTime.current = Date.now();
    touchStartY.current = e.clientY;
    setIsHolding(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsHolding(false);
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }

    const holdDuration = Date.now() - pressStartTime.current;

    // 수직 스와이프 감지
    if (touchStartY.current !== null) {
      const diffY = e.clientY - touchStartY.current;
      if (diffY < -40) {
        goToNext();
        return;
      } else if (diffY > 40) {
        goToPrev();
        return;
      }
    }

    // 250ms 미만 짧은 탭
    if (holdDuration < 250 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      if (clickX < rect.width * 0.35) {
        goToPrev();
      } else {
        goToNext();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative w-full h-full flex-1 flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.08] shadow-[0_15px_50px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#070b19] via-[#050713] to-black select-none cursor-pointer"
    >
      {/* 21st.dev 앰비언트 글로우 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. 상단 인스타 스타일 대시바 (상위 3종 사연은 특별 뱃지 색상 부여) */}
      <div className="relative z-20 px-3.5 pt-3 space-y-1.5 flex-shrink-0">
        <div className="flex items-center gap-1">
          {items.slice(0, 15).map((item, idx) => {
            const isTop3 = item.type === 'similar';
            return (
              <div
                key={idx}
                className="h-1 flex-1 bg-white/15 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full transition-all duration-75 ${
                    item.type === 'ad'
                      ? 'bg-amber-400'
                      : isTop3
                      ? 'bg-gradient-to-r from-pink-500 to-indigo-400'
                      : 'bg-slate-400'
                  }`}
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* 대시바 아래 실시간 상태 헤더 */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            {isAd ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                <Video className="w-3 h-3 text-amber-400" />
                <span>스폰서 광고 ({Math.ceil(((100 - progress) / 100) * 5)}s)</span>
              </span>
            ) : currentItem?.type === 'similar' ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-pink-300 bg-pink-950/80 border border-pink-500/50 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.3)]">
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>나와 가장 닮은 실패 {currentItem.rank}위</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700/50 px-2.5 py-0.5 rounded-full">
                <span>모두의 실패 피드</span>
              </span>
            )}

            <span className="text-[10px] text-slate-500 font-mono">
              {currentIndex + 1} / {items.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 3종 사연 한눈에 보기 버튼 */}
            {top3.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsListDrawerOpen(true);
                }}
                className="text-[10px] text-pink-300 hover:text-pink-200 flex items-center gap-1 bg-pink-950/40 border border-pink-700/40 px-2 py-0.5 rounded-full transition-colors"
                title="유사 사연 3종 한눈에 모아보기"
              >
                <ListFilter className="w-3 h-3" />
                <span>3종 모아보기</span>
              </button>
            )}

            {isHolding && (
              <span className="text-[10px] text-amber-300 font-medium bg-amber-950/60 border border-amber-700/50 px-2 py-0.5 rounded-full animate-pulse">
                일시정지
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. 중앙 메인 콘텐츠: [유사 사연 1~3위] or [광고] or [일반 사연] */}
      <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 sm:px-6 py-2 overflow-hidden">
        {isAd ? (
          /* [자동 삽입된 숏츠 광고 카드] */
          <div className="w-full glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-amber-500/30 text-center space-y-3 shadow-[0_0_40px_rgba(245,158,11,0.2)] animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <BedDouble className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Sponsored · 꿀잠 테라피
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-100 leading-snug">
                “오늘 실패는 잊고 푹 주무세요”<br />
                마음을 편안하게 해주는 꿀잠 필로우
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                유사 실패 3종을 모두 확인하셨습니다. 편안한 밤 되세요.
              </p>
            </div>

            {/* 이용권 구매 팝업 버튼 */}
            <div className="pt-1 space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPassModal();
                }}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 hover:opacity-95 active:scale-[0.98] shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-shimmer flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4 text-white" />
                <span>🎟️ 광고 없이 무제한으로 보기 (이용권 구매)</span>
              </button>

              <div className="text-[10px] text-slate-500 font-mono">
                {Math.ceil(((100 - progress) / 100) * 5)}초 후 자동으로 다음 이야기로 넘어갑니다
              </div>
            </div>
          </div>
        ) : currentItem?.failure ? (
          /* [실제 실패 숏폼 카드] */
          <div className="w-full flex flex-col justify-between h-full py-1">
            {/* 상단 순위 및 카테고리 태그 */}
            <div className="flex items-center justify-between gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 1, 2, 3위 유사 사연인 경우 눈에 띄는 랭킹 배지 노출 */}
                {currentItem.rank ? (
                  <span className="text-[10px] sm:text-[11px] font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.4)] flex items-center gap-1">
                    {currentItem.rank === 1 && <Trophy className="w-3 h-3 text-amber-300" />}
                    {currentItem.rank === 2 && <Medal className="w-3 h-3 text-slate-300" />}
                    {currentItem.rank === 3 && <Award className="w-3 h-3 text-amber-500" />}
                    <span>유사 실패 {currentItem.rank}위</span>
                  </span>
                ) : null}

                <span className="text-[10px] sm:text-[11px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                  #{currentItem.failure.category}
                </span>

                {currentItem.failure.similarityScore !== undefined && (
                  <span className="text-[9px] sm:text-[10px] font-bold text-pink-300 bg-pink-500/15 border border-pink-500/30 px-2 py-0.5 rounded-full">
                    나와의 공감도 {currentItem.failure.similarityScore}%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span className="truncate max-w-[90px]">{currentItem.failure.authorNickname || '익명의 친구'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentItem.failure) onReport(currentItem.failure.id);
                  }}
                  className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                  title="신고"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 중앙 본문 사연 */}
            <div className="my-auto py-2 sm:py-3 space-y-2.5 max-h-[60vh] overflow-y-auto pr-9">
              <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed break-words whitespace-pre-wrap">
                &ldquo;{currentItem.failure.content}&rdquo;
              </p>

              {/* AI 위로 한마디 */}
              {currentItem.failure.aiComfortQuote && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2 text-xs text-indigo-200 italic shadow-inner">
                  <Quote className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5 rotate-180" />
                  <span>{currentItem.failure.aiComfortQuote}</span>
                </div>
              )}
            </div>

            {/* 하단 힌트 */}
            <div className="text-center flex-shrink-0">
              <span className="text-[10px] text-slate-500">
                {currentItem.rank && currentItem.rank < 3
                  ? `화면 우측 터치 시 ${currentItem.rank + 1}위 유사 사연으로 이동`
                  : '화면 우측 터치 시 다음 이야기로 이동'}
              </span>
            </div>
          </div>
        ) : null}

        {/* 3. 우측 세로 숏츠형 인터랙션 플로팅 바 */}
        {!isAd && currentItem?.failure && (
          <div className="absolute right-2.5 bottom-4 flex flex-col items-center gap-2 z-20">
            {REACTION_CONFIG.map(({ type, emoji, label, activeClass }) => {
              const count = currentItem.failure?.reactions[type] || 0;
              const isSelected = currentItem.failure?.userReactions?.includes(type);

              return (
                <button
                  key={type}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentItem.failure) onReaction(currentItem.failure.id, type);
                  }}
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
          </div>
        )}
      </div>

      {/* 4. 하단 네비게이션 컨트롤 */}
      <div className="relative z-20 px-3 pb-2 flex items-center justify-between text-xs text-slate-500 border-t border-white/[0.05] pt-1.5 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          disabled={currentIndex === 0}
          className="flex items-center gap-0.5 text-[10px] hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none py-1 px-1.5 rounded-lg"
        >
          <ChevronUp className="w-3.5 h-3.5" />
          <span>이전</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenPassModal();
          }}
          className="text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-950/50 border border-amber-700/40 px-2 py-0.5 rounded-full"
        >
          <Ticket className="w-3 h-3" />
          <span>{hasPass ? '프리미엄' : '이용권'}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          disabled={currentIndex >= items.length - 1}
          className="flex items-center gap-0.5 text-[10px] text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:pointer-events-none py-1 px-1.5 rounded-lg font-bold"
        >
          <span>다음</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. [유사 사연 3종 한눈에 모아보기] 바텀 시트 드로어 */}
      {isListDrawerOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-bold text-slate-100">
                오늘 나와 가장 닮은 실패 3종
              </h3>
            </div>
            <button
              onClick={() => setIsListDrawerOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {top3.map((failure, idx) => (
              <div key={failure.id} className="space-y-1">
                <span className="text-[10px] font-black text-pink-400 bg-pink-950/60 border border-pink-500/30 px-2 py-0.5 rounded-full">
                  {idx + 1}위 유사 사연 (공감도 {failure.similarityScore || 75}%)
                </span>
                <FailureCard
                  failure={failure}
                  onReaction={onReaction}
                  onReport={onReport}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsListDrawerOpen(false)}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 flex-shrink-0"
          >
            숏폼 스토리로 계속 보기
          </button>
        </div>
      )}
    </div>
  );
}
