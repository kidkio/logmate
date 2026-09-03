'use client';

import React from 'react';
import { Sparkles, Ticket, LockOpen, Flame, Crown, CheckCircle2, X } from 'lucide-react';

interface WarmthShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWarmth: number;
  onRedeemPass: () => void;
  onRedeemSimilar: () => void;
  onRedeemGoldenCandle: () => void;
  onRedeemBadge: () => void;
}

export function WarmthShopModal({
  isOpen,
  onClose,
  userWarmth,
  onRedeemPass,
  onRedeemSimilar,
  onRedeemGoldenCandle,
  onRedeemBadge,
}: WarmthShopModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card max-w-sm w-full p-5 rounded-3xl border border-amber-500/30 text-left space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* 상단 헤더 & 보유 온기 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">온기 보상 상점</h3>
              <p className="text-[10px] text-slate-400">모은 온기로 특별한 혜택을 누리세요</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 내 보유 온기 잔액 카드 */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-black border border-amber-500/30 flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium">내 보유 온기</span>
          <div className="flex items-center gap-1.5 font-bold">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="text-base text-amber-300 font-mono">{userWarmth}</span>
            <span className="text-xs text-amber-400">온기</span>
          </div>
        </div>

        {/* 교환 가능한 보상 리스트 */}
        <div className="space-y-2.5 pt-1">
          {/* 1. 광고 제거 1일 패스권 (30 온기) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/40 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                  <span>광고 없는 1일 이용권</span>
                  <span className="text-[9px] text-indigo-300 bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-500/30">인기</span>
                </h4>
                <p className="text-[10px] text-slate-400 truncate">광고 없이 피드를 무제한으로 열람</p>
              </div>
            </div>

            <button
              onClick={onRedeemPass}
              disabled={userWarmth < 30}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                userWarmth >= 30
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
              }`}
            >
              30 온기
            </button>
          </div>

          {/* 2. 숨겨진 유사 사연 3편 열기 (5 온기) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-pink-500/40 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0">
                <LockOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-100">숨겨진 공감 사연 3편</h4>
                <p className="text-[10px] text-slate-400 truncate">나와 가장 닮은 비밀 사연 즉시 해금</p>
              </div>
            </div>

            <button
              onClick={onRedeemSimilar}
              disabled={userWarmth < 5}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                userWarmth >= 5
                  ? 'bg-pink-500 hover:bg-pink-400 text-white shadow-md shadow-pink-500/20 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
              }`}
            >
              5 온기
            </button>
          </div>

          {/* 3. 내 사연 황금 촛불 부착 (10 온기) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/40 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-100">내 사연에 황금 촛불 달기</h4>
                <p className="text-[10px] text-slate-400 truncate">이웃들의 위로 쪽지를 2배로 수신</p>
              </div>
            </div>

            <button
              onClick={onRedeemGoldenCandle}
              disabled={userWarmth < 10}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                userWarmth >= 10
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
              }`}
            >
              10 온기
            </button>
          </div>

          {/* 4. 프로필 명예 칭호 (50 온기) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-500/40 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-100">명예 칭호 &ldquo;따뜻한 등대지기&rdquo;</h4>
                <p className="text-[10px] text-slate-400 truncate">내 서재 프로필에 황금 테두리 부여</p>
              </div>
            </div>

            <button
              onClick={onRedeemBadge}
              disabled={userWarmth < 50}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                userWarmth >= 50
                  ? 'bg-purple-500 hover:bg-purple-400 text-white shadow-md shadow-purple-500/20 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
              }`}
            >
              50 온기
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          💡 온기는 심야 라운지에서 촛불을 켜거나, 15초 힐링 영상을 시청하여 5배 부스터로 모으실 수 있습니다.
        </p>
      </div>
    </div>
  );
}
