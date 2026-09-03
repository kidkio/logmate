'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Volume2, VolumeX, CheckCircle2, Play, Flame, LockOpen } from 'lucide-react';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardType: 'candle' | 'similar_failures';
  onRewardClaimed: (rewardType: 'candle' | 'similar_failures') => void;
}

export function RewardedAdModal({
  isOpen,
  onClose,
  rewardType,
  onRewardClaimed,
}: RewardedAdModalProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(15);
      setIsCompleted(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round(((15 - timeLeft) / 15) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card max-w-sm w-full p-5 rounded-3xl border border-amber-500/30 text-center space-y-4 shadow-[0_0_60px_rgba(245,158,11,0.35)] relative overflow-hidden">
        {/* 상단 타이머 및 닫기 버튼 */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-white/10 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>{isCompleted ? '보상 획득 가능' : `${timeLeft}초 후 보상 지급`}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-slate-300 hover:text-white"
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {isCompleted && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 광고 진행 바 */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 비디오/스폰서 비주얼 영역 */}
        <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border border-white/[0.08] overflow-hidden flex flex-col items-center justify-center p-4 group">
          <div className="absolute inset-0 bg-dot-pattern opacity-40" />
          
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              {rewardType === 'candle' ? (
                <Flame className="w-6 h-6 text-white fill-white/20 animate-pulse" />
              ) : (
                <LockOpen className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-amber-300 tracking-wider">
                Google AdMob · Premium Reward
              </span>
              <h4 className="text-sm font-bold text-slate-100">
                마인드풀 슬립테크 & 심야 힐링 사운드
              </h4>
              <p className="text-[11px] text-slate-400">
                &ldquo;오늘 밤, 당신의 무거운 짐을 함께 내려놓습니다&rdquo;
              </p>
            </div>
          </div>

          <div className="absolute bottom-2 right-2 text-[9px] text-slate-500 bg-black/70 px-1.5 py-0.5 rounded border border-white/5">
            Ad · 15s
          </div>
        </div>

        {/* 하단 보상 액션 버튼 */}
        <div className="pt-1">
          {isCompleted ? (
            <button
              onClick={() => {
                onRewardClaimed(rewardType);
                onClose();
              }}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 hover:from-amber-600 hover:to-indigo-600 active:scale-95 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-1.5 animate-bounce"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>
                {rewardType === 'candle'
                  ? '온기 5배 부스터 받기 (+5 🕯️)'
                  : '숨겨진 유사 사연 3개 열기 🔓'}
              </span>
            </button>
          ) : (
            <div className="w-full py-3 rounded-xl font-semibold text-xs text-slate-400 bg-white/[0.04] border border-white/[0.08] flex items-center justify-center gap-1.5 cursor-not-allowed">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>광고 시청 완료까지 {timeLeft}초 남았어요</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
