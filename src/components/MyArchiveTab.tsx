'use client';

import React from 'react';
import { Failure, ReactionType } from '@/types';
import { Heart, Flame, Smartphone, Inbox, History, Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { FailureCard } from './FailureCard';
import { useAuth } from '@/context/AuthContext';

interface MyArchiveTabProps {
  myFailures: Failure[];
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
  onOpenInstallGuide: () => void;
}

export function MyArchiveTab({
  myFailures,
  onReaction,
  onReport,
  onOpenInstallGuide,
}: MyArchiveTabProps) {
  const { user, logout } = useAuth();

  const totalComfortsReceived = myFailures.reduce((acc, curr) => {
    return (
      acc +
      curr.reactions.comfort +
      curr.reactions.relate +
      curr.reactions.kick +
      curr.reactions.cheer
    );
  }, 0);

  // 스트릭 계산: 작성한 글이 있으면 최소 1일차
  const streakDays = myFailures.length > 0 ? Math.min(myFailures.length, 7) : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 프로필 & 계정 정보 카드 */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {user?.provider === 'kakao' ? '🟡 카카오 로그인' : user?.provider === 'google' ? '⚪ Google 계정' : user?.provider === 'email' ? '✉️ 이메일 계정' : '🕶️ 게스트 모드'}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5 flex items-center gap-1.5">
                <span>{user?.nickname || '익명의 친구'}</span>
              </h3>
              {user?.email && (
                <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
            title="로그아웃"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>

        {/* 스트릭 & 통계 그리드 */}
        <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                {streakDays}일 연속 실패 털어놓기
              </span>
              <span className="text-[10px] text-slate-500">
                매일 밤 마음 비우기 습관 형성 중
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-amber-400">Day {Math.max(1, streakDays)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">털어놓은 실패</span>
            <span className="text-lg font-black text-slate-100">{myFailures.length}개</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">받은 토닥임</span>
            <div className="flex items-center gap-1.5 text-pink-400 font-black text-lg">
              <Heart className="w-4 h-4 fill-pink-400" />
              <span>{totalComfortsReceived}회</span>
            </div>
          </div>
        </div>

        {/* 앱 설치 유도 배너 */}
        <div
          onClick={onOpenInstallGuide}
          className="bg-indigo-950/40 hover:bg-indigo-950/60 border border-indigo-800/50 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-xs font-bold text-slate-200">
                홈 화면에 앱으로 추가하기
              </p>
              <p className="text-[10px] text-slate-400">
                매일 밤 침대에서 앱처럼 1초 만에 털어놓으세요
              </p>
            </div>
          </div>
          <span className="text-xs text-indigo-400 font-bold">추가 &gt;</span>
        </div>
      </div>

      {/* 내가 쓴 글 목록 */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 px-1">
          <History className="w-3.5 h-3.5 text-indigo-400" />
          <span>내가 털어놓았던 지난 기록들</span>
        </h4>

        {myFailures.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-6 space-y-2">
            <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
            <h5 className="text-sm font-semibold text-slate-300">
              아직 털어놓은 실패가 없습니다
            </h5>
            <p className="text-xs text-slate-500">
              오늘 겪었던 실수를 첫 번째로 털어놓아 보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myFailures.map((failure) => (
              <FailureCard
                key={failure.id}
                failure={failure}
                onReaction={onReaction}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
