'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { WARMTH_SHOP_PRICES } from '@/lib/warmthSystem';

interface TarotCard {
  name: string;
  subName: string;
  emoji: string;
  quote: string;
  insight: string;
  bgGradient: string;
  borderColor: string;
}

const TAROT_DECK: TarotCard[] = [
  {
    name: '희망의 별',
    subName: 'The Star',
    emoji: '🌟',
    quote: '가장 어두운 밤에만 비로소 북극성이 보입니다.',
    insight: '오늘 겪은 실패는 당신의 끝이 아니라, 더 깊고 따뜻한 사람이 되기 위한 빛나는 별빛의 조각입니다.',
    bgGradient: 'from-blue-950 via-indigo-950 to-slate-900',
    borderColor: 'border-blue-400/60',
  },
  {
    name: '안식의 달',
    subName: 'The Moon',
    emoji: '🌙',
    quote: '어두운 밤이 깊을수록 새벽은 더 눈부시게 밝아옵니다.',
    insight: '모든 것을 잘 해내지 못했어도 괜찮습니다. 오늘 밤은 자책을 내려놓고 온전히 편안히 잠드세요.',
    bgGradient: 'from-purple-950 via-slate-900 to-amber-950/40',
    borderColor: 'border-purple-400/60',
  },
  {
    name: '회복의 태양',
    subName: 'The Sun',
    emoji: '☀️',
    quote: '당신은 아무것도 잃지 않았습니다. 길을 하나 더 배웠을 뿐입니다.',
    insight: '실패했던 경험이 훗날 누군가에게 가장 다정한 위로를 건넬 수 있는 당신만의 힘이 됩니다.',
    bgGradient: 'from-amber-950 via-orange-950 to-slate-900',
    borderColor: 'border-amber-400/60',
  },
  {
    name: '지혜의 숲',
    subName: 'The Hermit',
    emoji: '🌲',
    quote: '잠시 멈춰선 시간은 후퇴가 아닌 깊은 뿌리내림입니다.',
    insight: '빠르게 달리는 것보다 소중한 것은 내 호흡을 잃지 않는 것입니다. 천천히 다시 시작해도 늦지 않습니다.',
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-900',
    borderColor: 'border-emerald-400/60',
  },
  {
    name: '새로운 비상',
    subName: 'The Rebirth',
    emoji: '🕊️',
    quote: '새는 알을 깨고 나와야 비로소 하늘을 날 수 있습니다.',
    insight: '오늘의 이불킥과 부끄러움은 내 안의 한계를 깨고 더 넓은 세상으로 도약하는 증거입니다.',
    bgGradient: 'from-pink-950 via-rose-950 to-slate-900',
    borderColor: 'border-pink-400/60',
  },
  {
    name: '순리의 강물',
    subName: 'The River',
    emoji: '🌊',
    quote: '돌부리에 걸린 물은 불평하지 않고 돌아서 바다로 갑니다.',
    insight: '원하는 대로 되지 않았다고 자책하지 마세요. 인생의 강물은 당신을 더 좋은 곳으로 데려가고 있습니다.',
    bgGradient: 'from-cyan-950 via-blue-950 to-slate-900',
    borderColor: 'border-cyan-400/60',
  },
];

interface TarotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWarmth: number;
  onDrawAgain?: () => void;
}

export function TarotModal({
  isOpen,
  onClose,
  userWarmth,
  onDrawAgain,
}: TarotModalProps) {
  const [currentCard, setCurrentCard] = useState<TarotCard>(TAROT_DECK[0]);
  const [isFlipping, setIsFlipping] = useState(false);

  const drawRandomCard = useCallback(() => {
    setIsFlipping(true);
    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * TAROT_DECK.length);
      setCurrentCard(TAROT_DECK[randomIdx]);
      setIsFlipping(false);
    }, 400);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      drawRandomCard();
    }, 10);
    return () => clearTimeout(timeout);
  }, [isOpen, drawRandomCard]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card max-w-sm w-full p-5 rounded-3xl border border-amber-500/30 text-center space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative max-h-[92vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-white/[0.05]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 헤더 */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            ✨ 심야 힐링 타로 부적
          </span>
          <h3 className="text-base font-black text-slate-100">
            오늘 밤 당신에게 도착한 지혜
          </h3>
        </div>

        {/* 타로 카드 비주얼 */}
        <div
          className={`aspect-[3/4] max-w-[260px] mx-auto rounded-3xl bg-gradient-to-b ${currentCard.bgGradient} border-2 ${currentCard.borderColor} p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 ${
            isFlipping ? 'scale-95 opacity-50 rotate-3' : 'scale-100 opacity-100'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-amber-300/80 font-mono">
            <span>LogMate Arcana</span>
            <span>{currentCard.subName}</span>
          </div>

          <div className="space-y-2 my-auto py-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto text-3xl shadow-inner animate-pulse">
              {currentCard.emoji}
            </div>

            <div>
              <h4 className="text-base font-black text-slate-100">
                {currentCard.name}
              </h4>
              <p className="text-[11px] text-amber-300/90 font-medium italic mt-1 leading-snug">
                &ldquo;{currentCard.quote}&rdquo;
              </p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-left">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {currentCard.insight}
            </p>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="pt-1 flex gap-2">
          {onDrawAgain && (
            <button
              onClick={() => {
                if (userWarmth < WARMTH_SHOP_PRICES.TAROT_DRAW) return;
                onDrawAgain();
                drawRandomCard();
              }}
              disabled={userWarmth < WARMTH_SHOP_PRICES.TAROT_DRAW}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                userWarmth >= WARMTH_SHOP_PRICES.TAROT_DRAW
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 active:scale-95'
                  : 'bg-white/[0.04] text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>다시 뽑기 ({WARMTH_SHOP_PRICES.TAROT_DRAW} 온기)</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-pink-500/20"
          >
            마음에 간직하기
          </button>
        </div>
      </div>
    </div>
  );
}
