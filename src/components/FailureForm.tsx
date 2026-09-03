'use client';

import React, { useState } from 'react';
import { Send, ShieldCheck, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { CreateFailureResponse } from '@/types';
import { getDeviceId } from '@/lib/device';
import { useAuth } from '@/context/AuthContext';

interface FailureFormProps {
  onSuccess: (result: CreateFailureResponse) => void;
}

const INSPIRATION_CHIPS = [
  '업무/메일 실수 ✉️',
  '다이어트 야식 🍜',
  '단톡방 말실수 💬',
  '시험/과제 착각 📝',
  '충동구매 💸',
  '이불킥 해프닝 🛌',
];

export function FailureForm({ onSuccess }: FailureFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCrisis, setIsCrisis] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();

    if (trimmed.length < 5) {
      setErrorMessage('조금만 더 자세히 적어주세요. (최소 5자 이상)');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setIsCrisis(false);

    try {
      const deviceId = getDeviceId();
      const res = await fetch('/api/failures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          deviceId,
          userId: user?.id,
          authorNickname: user?.nickname,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || '실패 등록 중 오류가 발생했습니다.');
        if (data.isCrisis) setIsCrisis(true);
        return;
      }

      setContent('');
      onSuccess(data);
    } catch (err: any) {
      setErrorMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full glass-card rounded-3xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] relative overflow-hidden space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>오늘의 실패를 털어놓으세요</span>
        </h2>
        <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-950/80 border border-indigo-700/50 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)]">
          {user?.nickname || '100% 익명'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="오늘 회사에서, 일상에서, 인간관계에서 자책하거나 이불킥했던 순간이 있었나요? 솔직하게 털어놓으면 AI가 비슷한 실패를 겪은 사람들을 찾아 연결해 드립니다..."
            rows={4}
            maxLength={500}
            disabled={isSubmitting}
            className="w-full bg-[#050713]/80 text-slate-100 placeholder:text-slate-600 rounded-2xl p-4 text-sm leading-relaxed border border-white/[0.08] focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.25)] outline-none resize-none transition-all"
          />
          <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono">
            <span className={content.length >= 5 ? 'text-indigo-400 font-bold' : 'text-slate-600'}>
              {content.length}
            </span>
            /500자
          </div>
        </div>

        {/* 21st.dev 마이크로 칩 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-slate-500 mr-1 font-medium">예시 키워드:</span>
          {INSPIRATION_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!content.includes(chip.split(' ')[0])) {
                  setContent((prev) => (prev ? `${prev} ${chip.split(' ')[0]}` : `${chip.split(' ')[0]} 실수: `));
                }
              }}
              className="text-[10px] bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 px-2.5 py-1 rounded-full border border-white/[0.06] transition-all active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 사전 보안 안내 */}
        <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/[0.05] flex items-start gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            {user?.nickname} 님으로 안전하게 익명 기록됩니다. 타인 비방이나 실명 노출은 삼가주세요.
          </span>
        </div>

        {/* 에러 및 위기 안내 */}
        {errorMessage && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
            isCrisis 
              ? 'bg-amber-950/50 border-amber-800/60 text-amber-200' 
              : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* 21st.dev 쉬머 CTA 버튼 */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting || content.trim().length < 5}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(99,102,241,0.3)] animate-shimmer flex items-center justify-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI가 비슷한 실패를 찾는 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>오늘의 실패 털어놓기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
