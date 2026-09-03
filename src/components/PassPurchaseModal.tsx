'use client';

import React, { useState } from 'react';
import { Ticket, Sparkles, Check, X, ShieldCheck, Zap, Flame, CreditCard, Lock } from 'lucide-react';
import { PASS_PLANS, requestTossPayment } from '@/lib/tossPayments';
import { useAuth } from '@/context/AuthContext';

interface PassPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
  onOpenWarmthShop?: () => void;
  userWarmth?: number;
}

export function PassPurchaseModal({
  isOpen,
  onClose,
  onOpenWarmthShop,
  userWarmth = 0,
}: PassPurchaseModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'day' | 'month' | 'lifetime'>('month');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      await requestTossPayment({
        planId: selectedPlan,
        customerName: user?.nickname || '익명의 친구',
        customerEmail: user?.email || undefined,
      });
      // Toss Payments SDK redirects automatically to successUrl or failUrl
    } catch (err: unknown) {
      console.error('Payment request error:', err);
      const message = err instanceof Error ? err.message : '결제 창을 여는 도중 문제가 발생했습니다.';
      setErrorMsg(message);
      setIsProcessing(false);
    }
  };

  const plan = PASS_PLANS[selectedPlan];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md glass-card bg-slate-900/95 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(99,102,241,0.25)] relative space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-white/[0.05]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 상단 뱃지 & 헤더 */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-500 flex items-center justify-center mx-auto text-white shadow-[0_0_25px_rgba(245,158,11,0.35)]">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>LogMate 공식 프리미엄 멤버십</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-100 leading-snug">
            광고 없이 편안한 밤을 위한<br />
            <span className="bg-gradient-to-r from-amber-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              무제한 안식처 이용권
            </span>
          </h3>
        </div>

        {/* 3가지 플랜 선택 그리드 */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* 1일 이용권 */}
          <button
            type="button"
            onClick={() => setSelectedPlan('day')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedPlan === 'day'
                ? 'bg-indigo-950/70 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-medium">오늘 하루</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100 block mt-0.5">1일권</span>
            <span className="text-xs text-indigo-300 font-extrabold mt-1 block">990원</span>
            <span className="text-[9px] text-slate-500 line-through">1,500원</span>
          </button>

          {/* 30일 무제한 패스 */}
          <button
            type="button"
            onClick={() => setSelectedPlan('month')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
              selectedPlan === 'month'
                ? 'bg-pink-950/50 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.35)]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <span className="absolute top-0 right-0 bg-gradient-to-l from-pink-500 to-indigo-500 text-[8px] font-black text-white px-1.5 py-0.2 rounded-bl-lg">
              BEST
            </span>
            <span className="text-[10px] text-pink-300 block font-medium">30일 정기</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100 block mt-0.5">월간 패스</span>
            <span className="text-xs text-pink-300 font-black mt-1 block">4,900원</span>
            <span className="text-[9px] text-slate-500 line-through">9,900원</span>
          </button>

          {/* 평생 VIP */}
          <button
            type="button"
            onClick={() => setSelectedPlan('lifetime')}
            className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
              selectedPlan === 'lifetime'
                ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <span className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-[8px] font-black text-slate-950 px-1.5 py-0.2 rounded-bl-lg">
              VIP 👑
            </span>
            <span className="text-[10px] text-amber-300 block font-medium">평생 소장</span>
            <span className="text-xs sm:text-sm font-bold text-slate-100 block mt-0.5">평생 VIP</span>
            <span className="text-xs text-amber-300 font-black mt-1 block">19,900원</span>
            <span className="text-[9px] text-slate-500 line-through">59,000원</span>
          </button>
        </div>

        {/* 선택된 플랜의 혜택 상세 */}
        <div className="bg-white/[0.03] rounded-2xl p-3.5 border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              {plan.name} 포함 혜택
            </span>
            <span className="text-[10px] font-mono text-pink-400 font-bold">
              {plan.discount}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            {plan.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] leading-tight">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* 결제 수단 안내 & 실결제 버튼 */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 hover:opacity-95 active:scale-[0.98] shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>토스페이먼츠 보안 결제창 여는 중...</span>
              </span>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>
                  {plan.price.toLocaleString()}원 결제하기 (카드 · 간편결제)
                </span>
              </>
            )}
          </button>

          {/* 결제 지원 수단 뱃지 */}
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <span className="bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">토스페이</span>
            <span className="bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">카카오페이</span>
            <span className="bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">네이버페이</span>
            <span className="bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">모든 카드</span>
          </div>

          {/* 온기 무료 교환 링크 안내 */}
          {userWarmth >= 30 && onOpenWarmthShop && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWarmthShop();
                }}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline underline-offset-2 flex items-center justify-center gap-1 mx-auto"
              >
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>내 보유 온기 30개로 1일권 무료 교환하기 ➔</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>토스페이먼츠 256bit 금융 보안 결제 · 언제든 해지 가능</span>
          </div>
        </div>
      </div>
    </div>
  );
}
