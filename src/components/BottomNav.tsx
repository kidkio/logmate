'use client';

import React from 'react';
import { Moon, Compass, BookHeart } from 'lucide-react';

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
      label: '둘러보기',
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
    <nav className="w-full px-3 pb-2.5 pt-1 z-30 flex-shrink-0">
      {/* 21st.dev 플로팅 아일랜드 독 */}
      <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-1 shadow-[0_10px_35px_rgba(0,0,0,0.7)] flex items-center justify-around">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex-1 py-2 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative ${
                isActive
                  ? 'text-white font-bold bg-white/[0.08] shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-indigo-400' : ''
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 w-3.5 h-3.5 rounded-full bg-pink-500 text-[9px] text-white flex items-center justify-center font-bold shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? 'text-indigo-200 font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
