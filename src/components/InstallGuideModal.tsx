'use client';

import React from 'react';
import { Smartphone, Share, MoreVertical, X, Check, Moon } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallGuideModal({ isOpen, onClose }: InstallGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-500/20">
            <Moon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100">
            LogMate를 홈 화면에 추가하기
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            별도의 앱스토어 다운로드 없이, 1초 만에 스마트폰 홈 화면에 앱 아이콘을 추가할 수 있습니다.
          </p>
        </div>

        <div className="space-y-2.5 pt-1 text-xs">
          {/* iOS 가이드 */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Share className="w-3.5 h-3.5 text-indigo-400" />
              <span>iPhone (Safari) 이용 시</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              하단의 <strong className="text-slate-200">공유 버튼</strong>을 누른 후 <strong className="text-indigo-300">&apos;홈 화면에 추가&apos;</strong>를 선택하세요.
            </p>
          </div>

          {/* Android 가이드 */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <MoreVertical className="w-3.5 h-3.5 text-pink-400" />
              <span>Android (Chrome) 이용 시</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              우측 상단 <strong className="text-slate-200">더보기(⋮)</strong>를 누른 후 <strong className="text-pink-300">&apos;홈 화면에 추가&apos;</strong> 또는 <strong className="text-pink-300">&apos;앱 설치&apos;</strong>를 누르세요.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
}
