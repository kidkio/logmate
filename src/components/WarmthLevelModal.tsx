'use client';

import React from 'react';
import { X, Flame, Sparkles, CheckCircle2, Lock, ArrowRight, HelpCircle } from 'lucide-react';
import { WARMTH_TIERS, WarmthProgress } from '@/lib/warmthSystem';
import { WarmthAvatar } from './WarmthAvatar';

interface WarmthLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: WarmthProgress;
  onOpenBooster?: () => void;
}

export function WarmthLevelModal({
  isOpen,
  onClose,
  progress,
  onOpenBooster,
}: WarmthLevelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card max-w-md w-full p-5 rounded-3xl border border-indigo-500/30 text-left space-y-4 shadow-[0_0_50px_rgba(99,102,241,0.25)] relative max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">온기 레벨 & 아바타 성장 도감 (15단계)</h3>
              <p className="text-[10px] text-slate-400">온기를 모아 미지의 실루엣을 해금해 보세요</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 내 현재 등급 & 진척도 카드 */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-black border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-3">
            <WarmthAvatar tier={progress.tier} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  현재 등급
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  누적 {progress.lifetimeWarmth} 온기
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-100 mt-0.5 truncate">
                Lv.{progress.tier.level} {progress.tier.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {progress.tier.description}
              </p>
            </div>
          </div>

          {/* 다음 레벨까지 게이지 */}
          {!progress.isMaxLevel && progress.nextTier && (
            <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <span>다음 목표:</span>
                  <strong className="text-slate-200">Lv.{progress.nextTier.level} {progress.nextTier.title}</strong>
                </span>
                <span className="font-mono text-amber-300 font-bold">
                  {progress.warmthToNext}개 남음 ({progress.progressPct}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress.progressPct}%` }}
                />
              </div>
            </div>
          )}

          {progress.isMaxLevel && (
            <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
              <span className="text-xs font-bold text-yellow-300">
                👑 최종 15단계에 도달하셨습니다! 당신은 밤하늘 영원한 온기의 신화입니다.
              </span>
            </div>
          )}
        </div>

        {/* 15단계 레벨 도감 리스트 (미달성 등급 디자인 비공개) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 block">
              전체 15단계 성장 도감
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>미달성 등급은 실루엣 비공개</span>
            </span>
          </div>

          {WARMTH_TIERS.map((tier) => {
            const isCurrent = tier.level === progress.tier.level;
            const isUnlocked = progress.lifetimeWarmth >= tier.minWarmth;
            const isNextTarget = progress.nextTier?.level === tier.level;

            return (
              <div
                key={tier.level}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : isUnlocked
                    ? 'bg-white/[0.03] border-white/[0.08]'
                    : isNextTarget
                    ? 'bg-slate-900/50 border-amber-500/30'
                    : 'bg-white/[0.01] border-white/[0.04] opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* 아바타: 해금 시 정식 디자인, 미해금 시 미스터리 실루엣 🔒 */}
                  <WarmthAvatar
                    tier={tier}
                    size="md"
                    showBadge={false}
                    isLocked={!isUnlocked}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold ${isUnlocked ? 'text-slate-100' : isNextTarget ? 'text-slate-300' : 'text-slate-500'}`}>
                        {isUnlocked ? (
                          `Lv.${tier.level} ${tier.title}`
                        ) : isNextTarget ? (
                          `Lv.${tier.level} ${tier.title} (다음 목표)`
                        ) : (
                          `Lv.${tier.level} ??? (비밀의 등급)`
                        )}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        ({tier.minWarmth}{tier.maxWarmth !== Infinity ? `~${tier.maxWarmth}` : '+'} 온기)
                      </span>

                      {isCurrent && (
                        <span className="text-[9px] font-bold text-indigo-300 bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-500/40">
                          내 등급
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {isUnlocked ? (
                        tier.perk
                      ) : isNextTarget ? (
                        `🔒 ${tier.minWarmth - progress.lifetimeWarmth} 온기 추가 시 정식 아바타와 전용 오라 공개!`
                      ) : (
                        `🔒 ${tier.minWarmth} 온기 달성 시 실루엣 및 디자인 해금`
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 pl-1">
                  {isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                      <Lock className="w-3 h-3" />
                      <span>{tier.minWarmth}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 온기 획득 유도 바텀 버튼 */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>촛불 켜기(+1) & 15초 부스터(+5)</span>
          </div>

          {onOpenBooster && (
            <button
              onClick={() => {
                onClose();
                onOpenBooster();
              }}
              className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 active:scale-95 transition-all shadow-md shadow-pink-500/20 flex items-center gap-1"
            >
              <span>5배 부스터로 레벨업</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
