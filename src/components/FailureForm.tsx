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
    <div className="w-full bg-slate-900/90 rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl shadow-black/40">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>오늘 있었던 당신의 실패를 털어놓으세요</span>
        </h2>
        <span className="text-[11px] text-indigo-400 font-medium bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-full">
          {user?.nickname || '100% 익명'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
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
            className="w-full bg-slate-950/80 text-slate-100 placeholder:text-slate-600 rounded-xl p-3.5 sm:p-4 text-sm sm:text-base border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all"
          />
          <div className="absolute bottom-2.5 right-3 text-[11px] text-slate-500">
            <span className={content.length >= 5 ? 'text-indigo-400 font-medium' : 'text-slate-600'}>
              {content.length}
            </span>
            /500자
          </div>
        </div>

        {/* 빠른 영감 키워드 칩 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 mr-1">예시:</span>
          {INSPIRATION_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!content.includes(chip.split(' ')[0])) {
                  setContent((prev) => (prev ? `${prev} ${chip.split(' ')[0]}` : `${chip.split(' ')[0]} 실수: `));
                }
              }}
              className="text-[11px] bg-slate-800 hover:bg-slate-700/80 text-slate-300 px-2 py-1 rounded-full border border-slate-700/50 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 사전 안내 및 보안 가이드라인 */}
        <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            {user?.nickname} 님으로 안전하게 익명 기록됩니다. 타인 비방이나 실명 노출은 삼가주세요. 유사한 실패를 겪은 인원 수와 따뜻한 피드백이 실시간으로 제공됩니다.
          </span>
        </div>

        {/* 에러 및 위기 안내 배너 */}
        {errorMessage && (
          <div className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
            isCrisis 
              ? 'bg-amber-950/50 border-amber-800/60 text-amber-200' 
              : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting || content.trim().length < 5}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
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
