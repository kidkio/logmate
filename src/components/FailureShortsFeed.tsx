'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Failure, ReactionType } from '@/types';
import { 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Pause, 
  Quote, 
  Flag, 
  Video, 
  Ticket, 
  CheckCircle2, 
  RefreshCw,
  Flame,
  Volume2,
  Clock
} from 'lucide-react';

interface FailureShortsFeedProps {
  failures: Failure[];
  myTodayFailure: Failure;
  similarCount: number;
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
  unlockedCount: number;
  onUnlockMore: (count: number) => void;
  onUnlockAll: () => void;
  onWriteNew?: () => void;
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
  failures,
  myTodayFailure,
  similarCount,
  onReaction,
  onReport,
  unlockedCount,
  onUnlockMore,
  onUnlockAll,
}: FailureShortsFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0); // 0 ~ 100
  const [isHolding, setIsHolding] = useState(false);

  // 인-숏츠 광고 재생 상태 (5초 카운트다운)
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);

  const touchStartY = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastWheelTime = useRef<number>(0);

  // 피드 목록: 내 오늘 실패를 제외한 다른 사람들의 실패 리스트
  const feedList = failures.filter((f) => f.id !== myTodayFailure.id);
  const totalItems = feedList.length;

  // 다음 카드로 이동
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < totalItems) {
        setProgress(0);
        return prev + 1;
      }
      return prev;
    });
  }, [totalItems]);

  // 이전 카드로 이동
  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        setProgress(0);
        return prev - 1;
      }
      return prev;
    });
  }, []);

  // 현재 인덱스가 잠금 기준(unlockedCount)에 도달했는지 확인
  const isAtPaywall = currentIndex >= unlockedCount;

  // 7초 자동 넘김 타이머 (사용자가 터치 홀드 중이거나 광고 카드에 도달하면 일시정지)
  useEffect(() => {
    if (!isAutoPlay || isHolding || isAtPaywall || isWatchingAd) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 70; // 7초 = 7000ms / 100틱 = 70ms
    timerRef.current = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          goToNext();
          return 0;
        }
        return old + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlay, isHolding, isAtPaywall, isWatchingAd, goToNext]);

  // 터치 제스처 (스와이프 위/아래)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsHolding(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHolding(false);
    if (touchStartY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const diff = endY - touchStartY.current;

    if (diff < -45) {
      // 위로 스와이프 -> 다음 스토리
      goToNext();
    } else if (diff > 45) {
      // 아래로 스와이프 -> 이전 스토리
      goToPrev();
    }
    touchStartY.current = null;
  };

  // 마우스 휠 스크롤 감지 (스로틀링 400ms)
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 400) return;
    lastWheelTime.current = now;

    if (e.deltaY > 20) {
      goToNext();
    } else if (e.deltaY < -20) {
      goToPrev();
    }
  };

  // 5초 리워드 광고 시청 핸들러
  const handleStartWatchAd = () => {
    setIsWatchingAd(true);
    setAdCountdown(5);

    const adTimer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(adTimer);
          setIsWatchingAd(false);
          onUnlockMore(3); // 3개 추가 잠금 해제
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const currentFailure = feedList[currentIndex];

  return (
    <div
      className="relative w-full h-[78vh] max-h-[720px] flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.08] shadow-[0_15px_50px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#070b19] via-[#050713] to-black select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => setIsHolding(true)}
      onMouseUp={() => setIsHolding(false)}
      onWheel={handleWheel}
    >
      {/* 21st.dev 앰비언트 글로우 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. 상단 프로그레스 바 (인스타 스토리 / 숏츠 스타일) */}
      <div className="relative z-20 px-4 pt-3.5 space-y-2">
        <div className="flex items-center gap-1">
          {feedList.slice(0, Math.min(unlockedCount, feedList.length)).map((_, idx) => (
            <div
              key={idx}
              className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-pink-400 transition-all duration-75"
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
          ))}
        </div>

        {/* 상단 헤더 정보: 실시간 레이더 매칭 배너 */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700/50 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.25)]">
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>오늘 나와 비슷한 실패 {similarCount}명</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {isAtPaywall ? '광고/이용권' : `${currentIndex + 1} / ${totalItems}`}
            </span>
          </div>

          {/* 자동 넘김 토글 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoPlay(!isAutoPlay);
            }}
            className="flex items-center gap-1 text-[10px] bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] px-2 py-0.5 rounded-full transition-colors"
          >
            {isAutoPlay ? (
              <>
                <Pause className="w-2.5 h-2.5 text-indigo-400" />
                <span>자동 {Math.ceil((7 * (100 - progress)) / 100)}s</span>
              </>
            ) : (
              <>
                <Play className="w-2.5 h-2.5 text-slate-400" />
                <span>일시정지</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. 중앙 메인 숏폼 카드 또는 광고 페이월 카드 */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-6 py-4">
        {isAtPaywall ? (
          /* [광고 삽입 및 이용권 잠금 카드] */
          <div className="w-full glass-card rounded-3xl p-6 sm:p-7 border border-indigo-500/30 text-center space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.2)] animate-in zoom-in-95 duration-200">
            {isWatchingAd ? (
              /* 광고 시청 중인 상태 */
              <div className="space-y-4 py-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto animate-pulse">
                  <Video className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-100">
                    스폰서 리워드 광고 시청 중...
                  </h3>
                  <p className="text-xs text-slate-400">
                    잠시 후 다음 3개의 실패 스토리가 잠금 해제됩니다.
                  </p>
                </div>
                <div className="text-3xl font-black text-pink-400 font-mono">
                  {adCountdown}초
                </div>
                <div className="w-48 mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-500 transition-all duration-1000"
                    style={{ width: `${((5 - adCountdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              /* 광고 시청 또는 이용권 선택 대기 상태 */
              <>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                  <Video className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                    기본 3개 무료 시청 완료
                  </span>
                  <h3 className="text-lg font-black text-slate-100">
                    다음 실패 이야기를<br />계속 넘겨보시겠어요?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    짧은 리워드 광고(5초)를 시청하거나 이용권을 사용하시면<br />
                    계속해서 숏츠처럼 스와이프하여 열람하실 수 있습니다.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleStartWatchAd}
                    className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 active:scale-[0.98] shadow-[0_0_25px_rgba(99,102,241,0.3)] animate-shimmer flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>🎬 5초 광고 보고 다음 3개 계속 보기</span>
                  </button>

                  <button
                    onClick={onUnlockAll}
                    className="w-full py-3 rounded-2xl font-bold text-xs text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] active:scale-[0.98] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-amber-400" />
                    <span>🎟️ 이용권으로 오늘 전체 무제한 열람</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : currentFailure ? (
          /* [실제 실패 숏폼 카드] */
          <div className="w-full flex flex-col justify-between h-full py-2">
            {/* 상단 태그 및 작성자 */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                  #{currentFailure.category}
                </span>
                {currentFailure.similarityScore !== undefined && (
                  <span className="text-[10px] font-bold text-pink-300 bg-pink-500/15 border border-pink-500/30 px-2 py-0.5 rounded-full">
                    나와의 공감도 {currentFailure.similarityScore}%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>{currentFailure.authorNickname || '익명의 친구'}</span>
                <button
                  onClick={() => onReport(currentFailure.id)}
                  className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                  title="신고"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 중앙 본문: 큰 폰트, 감성적 스토리 */}
            <div className="my-auto py-4 space-y-4">
              <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed break-words whitespace-pre-wrap">
                &ldquo;{currentFailure.content}&rdquo;
              </p>

              {/* AI 토닥임 코멘트 박스 */}
              {currentFailure.aiComfortQuote && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-start gap-2.5 text-xs text-indigo-200 italic shadow-inner">
                  <Quote className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5 rotate-180" />
                  <span>{currentFailure.aiComfortQuote}</span>
                </div>
              )}
            </div>

            {/* 하단 제스처 안내 문구 */}
            <div className="text-center">
              <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1 animate-pulse">
                <span>위로 드래그하여 다음 이야기 보기</span>
                <ChevronDown className="w-3 h-3" />
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-500">
            더 이상 표시할 실패 스토리가 없습니다.
          </div>
        )}

        {/* 3. 우측 세로 숏츠형 인터랙션 플로팅 바 (숏츠 리액션 버튼들) */}
        {!isAtPaywall && currentFailure && (
          <div className="absolute right-3.5 bottom-6 flex flex-col items-center gap-2.5 z-20">
            {REACTION_CONFIG.map(({ type, emoji, label, activeClass }) => {
              const count = currentFailure.reactions[type] || 0;
              const isSelected = currentFailure.userReactions?.includes(type);

              return (
                <button
                  key={type}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReaction(currentFailure.id, type);
                  }}
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-90 border backdrop-blur-md ${
                    isSelected
                      ? activeClass
                      : 'bg-black/50 text-slate-300 border-white/[0.1] hover:bg-white/[0.1]'
                  }`}
                  title={label}
                >
                  <span className="text-base leading-none">{emoji}</span>
                  <span className="text-[9px] font-bold font-mono mt-0.5">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. 하단 네비게이션 컨트롤 (다음/이전 버튼) */}
      <div className="relative z-20 px-4 pb-3 flex items-center justify-between text-xs text-slate-500 border-t border-white/[0.05] pt-2">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 text-[11px] hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none py-1 px-2 rounded-lg"
        >
          <ChevronUp className="w-4 h-4" />
          <span>이전 이야기</span>
        </button>

        <span className="text-[10px] text-slate-500 font-mono">
          스와이프 혹은 휠로 이동
        </span>

        <button
          onClick={goToNext}
          disabled={currentIndex >= totalItems}
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:pointer-events-none py-1 px-2 rounded-lg font-bold"
        >
          <span>다음 이야기</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
