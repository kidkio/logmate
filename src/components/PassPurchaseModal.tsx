'use client';

import React, { useState } from 'react';
import { Ticket, Sparkles, Check, X, ShieldCheck, Zap, Moon } from 'lucide-react';

interface PassPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

export function PassPurchaseModal({
  isOpen,
  onClose,
  onPurchaseSuccess,
}: PassPurchaseModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'day' | 'month'>('month');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleBuy = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPurchaseSuccess();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm glass-card bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 상단 뱃지 & 헤더 */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-500 flex items-center justify-center mx-auto text-white shadow-[0_0_25px_rgba(245,158,11,0.35)]">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>LogMate 프리미엄</span>
          </div>
          <h3 className="text-lg font-black text-slate-100">
            광고 없이 편안한 밤을 위한<br />
            <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              무제한 이용권
            </span>
          </h3>
        </div>

        {/* 혜택 목록 */}
        <div className="bg-white/[0.03] rounded-2xl p-3 border border-white/[0.06] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>모든 중간 광고(5초) 100% 완전 제거</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>이웃들의 실패 사연 피드 무제한 자유 감상</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>내 실패 서재 영구 보관 & 월간 감정 리포트</span>
          </div>
        </div>

        {/* 플랜 선택 */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedPlan('day')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedPlan === 'day'
                ? 'bg-indigo-950/60 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-medium">오늘 하루</span>
            <span className="text-sm font-bold text-slate-100 block mt-0.5">1일 이용권</span>
            <span className="text-xs text-indigo-300 font-extrabold mt-1 block">500원</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan('month')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
              selectedPlan === 'month'
                ? 'bg-indigo-950/60 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <span className="absolute top-0 right-0 bg-gradient-to-l from-pink-500 to-indigo-500 text-[9px] font-bold text-white px-2 py-0.5 rounded-bl-xl">
              BEST
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">월간 정기</span>
            <span className="text-sm font-bold text-slate-100 block mt-0.5">월간 무제한</span>
            <span className="text-xs text-pink-300 font-extrabold mt-1 block">월 2,900원</span>
          </button>
        </div>

        {/* 구매 버튼 */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleBuy}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 hover:opacity-90 active:scale-[0.98] shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-shimmer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>
              {isProcessing
                ? '결제 처리 중...'
                : selectedPlan === 'day'
                ? '1일 이용권 시작하기 (체험 0원)'
                : '월간 패스 시작하기 (첫 달 무료)'}
            </span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>언제든 위약금 없이 즉시 해지 가능합니다</span>
          </div>
        </div>
      </div>
    </div>
  );
}
