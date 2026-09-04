'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Send, RefreshCw, AlertCircle, Flame, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CreateFailureResponse } from '@/types';
import { getDeviceId } from '@/lib/device';

interface DailyRitualGateProps {
  onSuccess: (result: CreateFailureResponse) => void;
}

const INSPIRATION_CHIPS = [
  '업무 실수 ✉️',
  '다이어트 야식 🍜',
  '단톡방 말실수 💬',
  '시험 착각 📝',
  '충동구매 💸',
  '이불킥 🛌',
];

export function DailyRitualGate({ onSuccess }: DailyRitualGateProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();

    if (trimmed.length < 5) {
      setErrorMessage('조금만 더 자세히 적어주세요. (최소 5자 이상)');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

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

      // 만약 이미 오늘 작성한 글이거나 새로 작성된 글 객체가 있다면 바로 피드로 이동!
      if (data.failure) {
        setContent('');
        onSuccess(data);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || '실패 등록 중 오류가 발생했습니다.');
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
    <div className="w-full h-full flex flex-col justify-between py-1 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
      {/* 상단 인트로 안내 */}
      <div className="space-y-2 text-center pt-1 flex-shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mx-auto shadow-[0_0_25px_rgba(99,102,241,0.3)]">
          <Moon className="w-5 h-5 fill-white/20" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30">
            <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>오늘의 실패 털어놓기 리추얼</span>
          </div>

          <h1 className="text-base sm:text-lg font-black text-slate-100 tracking-tight leading-snug">
            오늘 당신은 어떤<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              실패를 경험하셨나요?
            </span>
          </h1>

          <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
            솔직하게 털어놓으면 <strong className="text-indigo-300">나와 닮은 고민을 겪은 이웃들의 사연 피드</strong>가 바로 열립니다.
          </p>
        </div>
      </div>

      {/* 중앙 폼 입력 영역 */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 my-2 border border-white/[0.08] shadow-[0_10px_35px_rgba(0,0,0,0.5)] space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>오늘 있었던 실수 고백하기</span>
          </span>
          <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-950/80 border border-indigo-700/50 px-2 py-0.5 rounded-full">
            {user?.nickname || '100% 익명'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="오늘 회사, 학교, 일상, 인간관계에서 자책했던 일이나 이불킥했던 순간을 솔직하게 털어놓으세요..."
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
              className="w-full bg-[#050713]/90 text-slate-100 placeholder:text-slate-600 rounded-xl p-3 text-xs sm:text-sm leading-relaxed border border-white/[0.08] focus:border-indigo-500/80 focus:shadow-[0_0_20px_rgba(99,102,241,0.25)] outline-none resize-none transition-all"
            />
            <div className="absolute bottom-2 right-2.5 text-[9px] text-slate-500 font-mono">
              <span className={content.length >= 5 ? 'text-indigo-400 font-bold' : 'text-slate-600'}>
                {content.length}
              </span>
              /500자
            </div>
          </div>

          {/* 영감 칩 */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-slate-500 mr-1 font-medium">영감:</span>
            {INSPIRATION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (!content.includes(chip.split(' ')[0])) {
                    setContent((prev) => (prev ? `${prev} ${chip.split(' ')[0]}` : `${chip.split(' ')[0]} 실수: `));
                  }
                }}
                className="text-[10px] bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 px-2 py-0.5 rounded-full border border-white/[0.06] transition-all active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || content.trim().length < 5}
            className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-shimmer flex items-center justify-center gap-1.5 transition-all"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI가 비슷한 친구들을 찾는 중...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>오늘의 실패 털어놓고 사연 피드 열기</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 하단 안심 가이드 */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pb-1 flex-shrink-0">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span>100% 완전 익명으로 등록되며 다른 사람의 실패가 열립니다</span>
      </div>
    </div>
  );
}
