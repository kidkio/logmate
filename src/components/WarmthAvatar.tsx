'use client';

import React from 'react';
import { WarmthTier } from '@/lib/warmthSystem';

interface WarmthAvatarProps {
  tier: WarmthTier;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
  className?: string;
}

export function WarmthAvatar({
  tier,
  size = 'md',
  showBadge = true,
  isLocked = false,
  onClick,
  className = '',
}: WarmthAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 text-lg',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-3xl',
  };

  const badgeSizeClasses = {
    sm: 'text-[8px] px-1 -bottom-1 -right-1',
    md: 'text-[9px] px-1.5 py-0.2 -bottom-1.5 -right-1',
    lg: 'text-[10px] px-2 py-0.5 -bottom-2 -right-1',
    xl: 'text-xs px-2.5 py-0.5 -bottom-2 -right-1',
  };

  if (isLocked) {
    return (
      <div
        onClick={onClick}
        className={`relative inline-flex items-center justify-center rounded-2xl bg-slate-950/80 border-2 border-dashed border-slate-800/80 select-none transition-all flex-shrink-0 opacity-60 ${sizeClasses[size]} ${className}`}
        title={`Lv.${tier.level} (미달성 잠금)`}
      >
        <span className="text-slate-600 filter grayscale select-none text-xs sm:text-sm">
          🔒
        </span>

        {showBadge && (
          <span
            className={`absolute rounded-full font-black border border-slate-800 bg-slate-900 text-slate-500 shadow font-mono flex items-center justify-center whitespace-nowrap z-10 ${badgeSizeClasses[size]}`}
          >
            Lv.{tier.level}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr ${tier.bgGradient} border-2 ${tier.borderClass} ${tier.auraGlowClass} select-none transition-all flex-shrink-0 ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${sizeClasses[size]} ${className}`}
      title={`Lv.${tier.level} ${tier.title} (${tier.avatarName})`}
    >
      {/* 아바타 이모지 & 오라 */}
      <span className="transform transition-transform hover:rotate-6 filter drop-shadow-md">
        {tier.avatarEmoji}
      </span>

      {/* 레벨 배지 */}
      {showBadge && (
        <span
          className={`absolute rounded-full font-black border shadow-md font-mono flex items-center justify-center whitespace-nowrap z-10 ${badgeSizeClasses[size]} ${tier.badgeColor}`}
        >
          Lv.{tier.level}
        </span>
      )}
    </div>
  );
}
