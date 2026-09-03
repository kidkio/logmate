'use client';

import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PassInfo {
  plan?: string;
  orderId?: string;
  paymentKey?: string;
  expiresAt?: string;
  purchasedAt?: string;
}

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  passInfo: PassInfo | null;
  onRefundSuccess: () => void;
}

export function RefundModal({
  isOpen,
  onClose,
  passInfo,
  onRefundSuccess,
}: RefundModalProps) {
  const [reason, setReason] = useState('단순 변심 및 서비스 이용 완료');
  const [customReason, setCustomReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const planTitles: Record<string, string> = {
    day: '1일 자유 이용권 (990원)',
    month: '30일 심야 무제한 패스 (4,900원)',
    lifetime: '평생 VIP 프리미엄 (19,900원)',
  };

  const planName = passInfo?.plan && planTitles[passInfo.plan] ? planTitles[passInfo.plan] : '프리미엄 패스';

  const handleRefundSubmit = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    const fullReason = reason === '기타 사유' ? customReason || '기타' : reason;

    try {
      if (passInfo?.paymentKey) {
        // 실제 토스페이먼츠 환불 API 호출
        const res = await fetch('/api/payments/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey: passInfo.paymentKey,
            cancelReason: fullReason,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || '환불 처리에 실패했습니다.');
        }
      }

      // 로컬 스토리지 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('logmate_has_pass');
        localStorage.removeItem('logmate_pass_info');
      }

      onRefundSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Refund failed:', err);
      setErrorMsg(err instanceof Error ? err.message : '환불 처리 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in text-left">
      <div className="w-full max-w-sm glass-card bg-slate-900/95 border border-rose-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(244,63,94,0.25)] relative space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-white/[0.05]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 상단 헤더 */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 shadow-md shadow-rose-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-100">
            이용권 결제 취소 및 환불
          </h3>
          <p className="text-xs text-slate-400">
            구매하신 이용권의 결제 취소 사유를 선택해 주세요.
          </p>
        </div>

        {/* 결제 상품 정보 요약 */}
        <div className="bg-slate-950/70 rounded-2xl p-3.5 border border-white/[0.06] space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">환불 대상 상품</span>
          <span className="text-xs sm:text-sm font-bold text-amber-300 block font-mono">
            {planName}
          </span>
          {passInfo?.orderId && (
            <span className="text-[9px] text-slate-500 block font-mono">
              주문번호: {passInfo.orderId}
            </span>
          )}
        </div>

        {/* 취소 사유 라디오 목록 */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-300 block">취소 사유 선택</span>
          {[
            '단순 변심 및 서비스 이용 완료',
            '실수로 잘못 결제함',
            '다른 플랜으로 변경하고 싶음',
            '기능 오류 또는 서비스 불만족',
            '기타 사유',
          ].map((item) => (
            <label
              key={item}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                reason === item
                  ? 'bg-rose-950/40 border-rose-500/50 text-slate-100'
                  : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/[0.12]'
              }`}
            >
              <input
                type="radio"
                name="refund_reason"
                value={item}
                checked={reason === item}
                onChange={() => setReason(item)}
                className="w-3.5 h-3.5 text-rose-500 bg-slate-900 border-white/20 focus:ring-0"
              />
              <span className="text-[11px]">{item}</span>
            </label>
          ))}

          {reason === '기타 사유' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="구체적인 사유를 남겨주시면 서비스 개선에 큰 도움이 됩니다."
              className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/60 resize-none h-16"
            />
          )}
        </div>

        {/* 에러 메시지 */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-[11px] text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* 안내 문구 & 취소 실행 버튼 */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <div className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              전자상거래법에 따라 즉시 전액 승인 취소되며, 신용/체크카드는 카드사 영업일 기준 2~3일 내에 한도가 복원됩니다.
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
            >
              유지하기
            </button>
            <button
              type="button"
              onClick={handleRefundSubmit}
              disabled={isProcessing}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 disabled:opacity-50"
            >
              {isProcessing ? '환불 처리 중...' : '즉시 전액 환불'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
