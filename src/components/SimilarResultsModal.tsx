'use client';

import React from 'react';
import { CreateFailureResponse, ReactionType } from '@/types';
import { Sparkles, Users, Heart, ArrowRight, X, Quote } from 'lucide-react';
import { FailureCard } from './FailureCard';

interface SimilarResultsModalProps {
  result: CreateFailureResponse | null;
  onClose: () => void;
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
}

export function SimilarResultsModal({
  result,
  onClose,
  onReaction,
  onReport,
}: SimilarResultsModalProps) {
  if (!result) return null;

  const { failure, similarCount, similarFailures, aiMessage } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* 모달 상단 헤더 */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  실시간 AI 매칭 완료
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                오늘 당신과 비슷한 실패를 겪은 사람은{' '}
                <span className="text-pink-400 underline decoration-pink-500/40 underline-offset-4 font-extrabold">
                  {similarCount}명
                </span>
                입니다
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 스크롤 가능한 본문 */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* AI 공감 카드 */}
          <div className="bg-gradient-to-br from-indigo-900/30 via-slate-800/40 to-purple-900/30 border border-indigo-700/30 rounded-xl p-3.5 sm:p-4 text-slate-200 relative">
            <div className="flex items-start gap-2.5">
              <Quote className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5 rotate-180" />
              <div>
                <span className="text-[11px] font-medium text-indigo-300 block mb-1">
                  AI의 따뜻한 토닥임
                </span>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200 italic">
                  &ldquo;{aiMessage || failure.aiComfortQuote}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* 나와 비슷한 사람들의 실패 목록 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>비슷한 고민을 나눈 사람들의 이야기</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                {similarFailures.length}개의 비슷한 사연
              </span>
            </div>

            <div className="space-y-3">
              {similarFailures.length === 0 ? (
                <div className="space-y-3">
                  <div className="text-center py-4 px-3 text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                    <p className="font-bold text-slate-200">오늘 이 실패를 처음 털어놓으신 개척자입니다! 🎉</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      아직 같은 실패를 나눈 이웃 사연이 없지만, AI 이웃이 먼저 깊은 공감 에피소드를 보내왔습니다.
                    </p>
                  </div>

                  {result.aiPeerStory && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-purple-950/50 to-slate-900 border border-indigo-500/40 shadow-lg shadow-indigo-950/40 space-y-2.5 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                          <span>AI 이웃의 공감 에피소드</span>
                        </div>
                        <span className="text-[10px] text-indigo-200/80 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                          가상 이웃의 경험담
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
                        &ldquo;{result.aiPeerStory.content}&rdquo;
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[11px] text-slate-400">
                        <span>{result.aiPeerStory.authorNickname || '비슷한 일을 겪었던 이웃'}</span>
                        <span className="text-pink-300 font-mono text-[10px]">공감도 98%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                similarFailures.map((item) => (
                  <FailureCard
                    key={item.id}
                    failure={item}
                    onReaction={onReaction}
                    onReport={onReport}
                    isCompact
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* 하단 액션 버튼 바 */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-100 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <span>전체 피드 둘러보기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
