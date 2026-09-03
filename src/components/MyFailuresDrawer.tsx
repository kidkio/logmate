'use client';

import React from 'react';
import { Failure, ReactionType } from '@/types';
import { X, Heart, History, Inbox, Sparkles } from 'lucide-react';
import { FailureCard } from './FailureCard';

interface MyFailuresDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  myFailures: Failure[];
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
}

export function MyFailuresDrawer({
  isOpen,
  onClose,
  myFailures,
  onReaction,
  onReport,
}: MyFailuresDrawerProps) {
  if (!isOpen) return null;

  const totalComfortsReceived = myFailures.reduce((acc, curr) => {
    return (
      acc +
      curr.reactions.comfort +
      curr.reactions.relate +
      curr.reactions.kick +
      curr.reactions.cheer
    );
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* 헤더 */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">내 실패 서재</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="p-4 border-b border-slate-800/80 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span>내가 털어놓은 실패</span>
            <strong className="text-indigo-300 font-bold text-sm">
              {myFailures.length}개
            </strong>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>내가 이웃들로부터 받은 응원</span>
            <div className="flex items-center gap-1 text-pink-400 font-bold text-sm">
              <Heart className="w-3.5 h-3.5 fill-pink-400" />
              <span>{totalComfortsReceived}회</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            * 이 기기의 브라우저에 익명으로 안전하게 보관되고 있습니다.
          </p>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {myFailures.length === 0 ? (
            <div className="text-center py-16 space-y-2 text-slate-500">
              <Inbox className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">아직 이 기기에서 털어놓은 실패가 없습니다.</p>
            </div>
          ) : (
            myFailures.map((failure) => (
              <FailureCard
                key={failure.id}
                failure={failure}
                onReaction={onReaction}
                onReport={onReport}
                isCompact
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
