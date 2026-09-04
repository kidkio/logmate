'use client';

import React from 'react';
import { Sparkles, Ticket, LockOpen, Flame, Headphones, Mail, ScrollText, X } from 'lucide-react';

interface WarmthShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userWarmth: number;
  onRedeemPass: () => void;
  onRedeemSimilar: () => void;
  onRedeemGoldenCandle: () => void;
  onRedeemTarot: () => void;
  onRedeemNotePack: () => void;
  onRedeemHiddenSound: () => void;
}

export function WarmthShopModal({
  isOpen,
  onClose,
  userWarmth,
  onRedeemPass,
  onRedeemSimilar,
  onRedeemGoldenCandle,
  onRedeemTarot,
  onRedeemNotePack,
  onRedeemHiddenSound,
}: WarmthShopModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card max-w-sm w-full p-5 rounded-3xl border border-amber-500/30 text-left space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* 상단 헤더 & 보유 온기 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">온기 보상 상점</h3>
              <p className="text-[10px] text-slate-400">모은 온기로 특별한 안식처 혜택을 누리세요</p>
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
          {/* 1. 광고 없는 1일 이용권 (25 온기) */}
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
                <p className="text-[10px] text-slate-400 truncate">24시간 모든 광고 완전 제거</p>
              </div>
            </div>

            <button
              onClick={onRedeemPass}
              disabled={userWarmth < 25}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                userWarmth >= 25
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
              }`}
            >
              25 온기
            </button>
          </div>

          {/* 2. AI 실패 극복 힐링 타로 부적 (5 온기) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/40 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <ScrollText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                  <span>힐링 타로 부적 뽑기</span>
                  <span className="text-[9px] text-amber-300 bg-amber-950 px-1.5 py-0.2 rounded border border-amber-500/30">추천</span>
                </h4>
                <p className="text-[10px] text-slate-400 truncate">오늘 나에게 꼭 필요한 다정한 극복 지혜</p>
              </div>
            </div>

            <button
              onClick={onRedeemTarot}
              disabled={userWarmth < 5}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                userWarmth >= 5
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
              }`}
            >
              5 온기
            </button>
          </div>

          {/* 3. 숨겨진 유사 사연 3편 열기 (6 온기) */}
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
              disabled={userWarmth < 6}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                userWarmth >= 6
                  ? 'bg-pink-500 hover:bg-pink-400 text-white shadow-md shadow-pink-500/20 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
              }`}
            >
              6 온기
            </button>
          </div>

          {/* 4. 익명 온기 쪽지 발송권 3장 (10 온기) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-sky-500/40 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-100">온기 쪽지 발송권 (3장)</h4>
                <p className="text-[10px] text-slate-400 truncate">힘들어하는 이웃에게 손글씨 쪽지 전송</p>
              </div>
            </div>

            <button
              onClick={onRedeemNotePack}
              disabled={userWarmth < 10}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                userWarmth >= 10
                  ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
              }`}
            >
              10 온기
            </button>
          </div>

          {/* 5. 내 사연 황금 촛불 부착 (12 온기) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/40 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <Flame className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-100">내 사연에 황금 촛불 달기</h4>
                <p className="text-[10px] text-slate-400 truncate">오늘 내 사연에 이웃들의 위로 2배 집중</p>
              </div>
            </div>

            <button
              onClick={onRedeemGoldenCandle}
              disabled={userWarmth < 12}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                userWarmth >= 12
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/20 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
              }`}
            >
              12 온기
            </button>
          </div>

          {/* 6. VIP 히든 ASMR '설원 자작나무 숲' 24시간 청취권 (20 온기) */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-teal-500/40 transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1">
                  <span>VIP 히든 ASMR 설원 숲</span>
                  <span className="text-[9px] text-teal-300 bg-teal-950 px-1.5 py-0.2 rounded border border-teal-500/30">스페셜</span>
                </h4>
                <p className="text-[10px] text-slate-400 truncate">눈 내리는 자작나무 숲의 고요 24시간 해금</p>
              </div>
            </div>

            <button
              onClick={onRedeemHiddenSound}
              disabled={userWarmth < 20}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                userWarmth >= 20
                  ? 'bg-teal-500 hover:bg-teal-400 text-neutral-950 shadow-md shadow-teal-500/20 active:scale-95'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.05] cursor-not-allowed'
              }`}
            >
              20 온기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
