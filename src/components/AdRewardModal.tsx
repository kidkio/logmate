'use client';

import React, { useState, useEffect } from 'react';
import { Play, Ticket, Sparkles, X, CheckCircle2, Lock, Volume2 } from 'lucide-react';

interface AdRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: (mode: 'plus3' | 'all') => void;
  remainingLockedCount: number;
}

export function AdRewardModal({
  isOpen,
  onClose,
  onUnlockSuccess,
  remainingLockedCount,
}: AdRewardModalProps) {
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [adFinished, setAdFinished] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlayingAd && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isPlayingAd && countdown === 0) {
      setAdFinished(true);
    }
    return () => clearInterval(timer);
  }, [isPlayingAd, countdown]);

  if (!isOpen) return null;

  const handleStartAd = () => {
    setIsPlayingAd(true);
    setCountdown(5);
    setAdFinished(false);
  };

  const handleClaimAdReward = () => {
    setIsPlayingAd(false);
    setAdFinished(false);
    onUnlockSuccess('plus3');
    onClose();
  };

  const handleUseTicket = () => {
    onUnlockSuccess('all');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* 상단 닫기 버튼 */}
        {!isPlayingAd && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 광고 재생 중 화면 */}
        {isPlayingAd ? (
          <div className="space-y-4 text-center py-2">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                보상형 리워드 광고
              </span>
              <span className="font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800">
                {countdown > 0 ? `${countdown}초 후 보상 지급` : '시청 완료!'}
              </span>
            </div>

            {/* 가상 광고 비디오 플레이어 Mock */}
            <div className="w-full h-44 rounded-xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-purple-900 flex flex-col items-center justify-center p-4 border border-indigo-500/20 relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center mb-2 animate-bounce">
                <Sparkles className="w-6 h-6 text-indigo-300" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                LogMate 마음 케어
              </h4>
              <p className="text-xs text-slate-300 max-w-xs">
                실패를 털어놓을 가장 다정한 친구, LogMate와 매일 밤 함께하세요.
              </p>
              <div className="absolute bottom-2 left-3 right-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>

            {adFinished ? (
              <button
                onClick={handleClaimAdReward}
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 animate-in zoom-in-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>3개 추가 열람 잠금 해제하기</span>
              </button>
            ) : (
              <p className="text-xs text-slate-500">
                광고를 끝까지 시청하시면 실패 카드가 즉시 열립니다.
              </p>
            )}
          </div>
        ) : (
          /* 선택 화면 */
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                추가 실패 이야기 열람하기
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                기본 3개의 사연 외에 <strong className="text-indigo-300">{remainingLockedCount}개</strong>의 비슷한 실패가 더 있습니다. 아래 방법 중 하나를 선택해 잠금을 해제하세요!
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* 옵션 1: 광고 보고 3개 열람 */}
              <button
                onClick={handleStartAd}
                className="w-full p-3.5 rounded-xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 hover:from-indigo-900 hover:to-purple-900 border border-indigo-700/50 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                    <Play className="w-5 h-5 fill-indigo-300" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      <span>5초 짧은 광고 보고 열람</span>
                      <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded">
                        +3개 잠금 해제
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      별도 결제 없이 5초 후 바로 열람 가능합니다
                    </p>
                  </div>
                </div>
              </button>

              {/* 옵션 2: 1일 프리미엄 이용권으로 전체 열람 */}
              <button
                onClick={handleUseTicket}
                className="w-full p-3.5 rounded-xl bg-gradient-to-r from-pink-950/50 to-purple-950/50 hover:from-pink-950 hover:to-purple-950 border border-pink-700/40 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-300 group-hover:scale-105 transition-transform">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      <span>무료 이용권으로 전체 잠금 해제</span>
                      <span className="text-[10px] bg-pink-500/30 text-pink-300 px-1.5 py-0.5 rounded">
                        Free Pass
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      오늘 등록된 모든 실패를 제한 없이 바로 열람합니다
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                다음에 볼게요
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
