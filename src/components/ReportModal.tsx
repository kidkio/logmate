'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, Send } from 'lucide-react';

interface ReportModalProps {
  failureId: string | null;
  onClose: () => void;
  onSubmitReport: (failureId: string, reason: string) => Promise<void>;
}

const REPORT_REASONS = [
  '타인에 대한 실명 비방 및 명예훼손',
  '개인정보(전화번호, 주소, 회사명 등) 노출',
  '음란물, 불법 정보 또는 도배성 광고',
  '심각한 자해/위기 상황 또는 혐오 발언',
  '기타 부적절한 내용',
];

export function ReportModal({
  failureId,
  onClose,
  onSubmitReport,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!failureId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitReport(failureId, selectedReason);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-rose-400 mb-2">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-100">게시글 신고하기</h3>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          커뮤니티 가이드라인을 위반한 글을 신고해주세요. 누적 신고 수가 일정 기준을 넘으면 **AI가 내용을 즉시 검토하여 자동 비공개(블라인드)** 처리합니다.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs text-center">
            신고가 정상 접수되었습니다. 깨끗한 실패 공유 커뮤니티를 만들어주셔서 감사합니다.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? 'bg-rose-950/30 border-rose-800 text-rose-200 font-medium'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-rose-500 focus:ring-rose-500 bg-slate-900 border-slate-700"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
              >
                {isSubmitting ? '접수 중...' : '신고 접수'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
