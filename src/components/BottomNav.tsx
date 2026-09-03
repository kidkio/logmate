'use client';

import React from 'react';
import { Moon, Compass, BookHeart, Sparkles } from 'lucide-react';

export type TabType = 'today' | 'explore' | 'archive';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  myFailuresCount: number;
}

export function BottomNav({ activeTab, onChangeTab, myFailuresCount }: BottomNavProps) {
  const navItems = [
    {
      id: 'today' as TabType,
      label: '오늘의 실패',
      icon: Moon,
    },
    {
      id: 'explore' as TabType,
      label: '실패 둘러보기',
      icon: Compass,
    },
    {
      id: 'archive' as TabType,
      label: '내 서재',
      icon: BookHeart,
      badge: myFailuresCount > 0 ? myFailuresCount : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-indigo-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-pink-500 text-[10px] text-white flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-indigo-400 absolute bottom-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
