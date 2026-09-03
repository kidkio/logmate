'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Heart } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none">
      <div className="bg-slate-900/90 text-slate-100 border border-amber-500/30 backdrop-blur-md px-4 py-2 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.8)] flex items-center gap-2 text-xs font-bold text-center">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin duration-3000 flex-shrink-0" />
        <span className="text-amber-200">{message}</span>
      </div>
    </div>
  );
}
