'use client';

import React, { useState, useEffect } from 'react';
import { Failure, ReactionType, ComfortNote } from '@/types';
import { 
  Heart, 
  Flame, 
  Smartphone, 
  Inbox, 
  History, 
  Sparkles, 
  LogOut, 
  Mail, 
  CheckCircle2,
  Quote,
  AlertTriangle
} from 'lucide-react';
import { FailureCard } from './FailureCard';
import { MoonlightCalendar } from './MoonlightCalendar';
import { useAuth } from '@/context/AuthContext';
import { getDeviceId } from '@/lib/device';

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
  const { user, logout, withdrawAccount } = useAuth();
  const [comfortNotes, setComfortNotes] = useState<ComfortNote[]>([]);
  const [failuresState, setFailuresState] = useState<Failure[]>(myFailures);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    setFailuresState(myFailures);
  }, [myFailures]);

  // 받은 온기 쪽지 불러오기
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/comfort-notes?userId=${encodeURIComponent(user.id)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.notes)) {
            setComfortNotes(data.notes);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const totalComfortsReceived = failuresState.reduce((acc, curr) => {
    return (
      acc +
      curr.reactions.comfort +
      curr.reactions.relate +
      curr.reactions.kick +
      curr.reactions.cheer
    );
  }, 0);

  const streakDays = failuresState.length > 0 ? Math.min(failuresState.length, 7) : 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-4">
      {/* 1. 프로필 & 계정 정보 카드 */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/[0.08] shadow-xl space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {user?.provider === 'kakao' ? '🟡 카카오' : user?.provider === 'google' ? '⚪ Google' : user?.provider === 'email' ? '✉️ 이메일' : '🕶️ 게스트'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5 flex items-center gap-1.5">
                <span>{user?.nickname || '익명의 친구'}</span>
              </h3>
              {user?.email && (
                <p className="text-[10px] text-slate-500">{user.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={logout}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-800/80 transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="text-[10px] text-slate-500 hover:text-rose-400 px-1.5 py-1 rounded-lg hover:bg-rose-950/30 transition-colors"
              title="회원 탈퇴"
            >
              탈퇴
            </button>
          </div>
        </div>

        {/* 스트릭 & 통계 바 */}
        <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                {streakDays}일 연속 실패 털어놓기
              </span>
              <span className="text-[9px] text-slate-500">
                매일 밤 마음 비우기 습관 형성 중
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-amber-400 font-mono">Day {Math.max(1, streakDays)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/[0.06] text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">털어놓은 밤</span>
            <span className="text-base font-black text-slate-100">{failuresState.length}편</span>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/[0.06] text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">받은 토닥임</span>
            <div className="flex items-center justify-center gap-1 text-pink-400 font-black text-base">
              <Heart className="w-3.5 h-3.5 fill-pink-400" />
              <span>{totalComfortsReceived}</span>
            </div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/[0.06] text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">온기 쪽지함</span>
            <div className="flex items-center justify-center gap-1 text-amber-300 font-black text-base">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{comfortNotes.length}</span>
            </div>
          </div>
        </div>

        {/* 앱 설치 유도 배너 */}
        <div
          onClick={onOpenInstallGuide}
          className="bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-800/40 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-medium text-slate-300">
              홈 화면에 앱으로 추가하고 매일 밤 털어놓기
            </span>
          </div>
          <span className="text-[10px] text-indigo-400 font-bold">추가 &gt;</span>
        </div>
      </div>

      {/* 2. [달빛 캘린더] 실패 기록 & 극복 궤적 */}
      <MoonlightCalendar
        failures={failuresState}
        onSelectFailure={(f) => {
          const el = document.getElementById(`my-failure-${f.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3. [이웃들이 보낸 익명 온기 편지함] */}
      {comfortNotes.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-pink-500/20 space-y-3 shadow-[0_5px_20px_rgba(236,72,153,0.15)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                <span>이웃들이 보낸 온기 편지</span>
                <span className="text-[10px] text-pink-400 font-bold bg-pink-950/60 px-1.5 py-0.5 rounded-full border border-pink-500/30">
                  {comfortNotes.length}통
                </span>
              </h4>
            </div>
            <span className="text-[9px] text-slate-500">따뜻한 마음들</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {comfortNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-xl bg-[#060918] border border-pink-500/20 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-pink-300">
                    from. {note.fromNickname}
                  </span>
                  <span className="text-slate-600 font-mono">
                    {new Date(note.createdAt).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  &ldquo;{note.message}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 내가 쓴 글 목록 & 극복 스탬프 기능 */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 px-1">
          <History className="w-3.5 h-3.5 text-indigo-400" />
          <span>내가 털어놓았던 지난 기록들 ({failuresState.length})</span>
        </h4>

        {failuresState.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-white/[0.06] p-6 space-y-2">
            <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
            <h5 className="text-xs font-semibold text-slate-300">
              아직 털어놓은 실패가 없습니다
            </h5>
            <p className="text-[11px] text-slate-500">
              오늘 겪었던 실수를 첫 번째로 털어놓아 보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {failuresState.map((failure) => (
              <div
                key={failure.id}
                id={`my-failure-${failure.id}`}
                className="space-y-1.5 relative transition-all"
              >
                {/* 상단 날짜 및 카테고리 태그 */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(failure.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    #{failure.category}
                  </span>
                </div>

                <div>
                  <FailureCard
                    failure={failure}
                    onReaction={onReaction}
                    onReport={onReport}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 회원 탈퇴 확인 모달 */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="glass-card max-w-sm w-full p-6 rounded-3xl border border-rose-500/30 text-center space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.25)]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-100">
                정말 안식처를 떠나시겠습니까?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                탈퇴 시 작성하신 모든 실패 이야기, 받은 토닥임 및 온기 쪽지가 영구히 파기되며 다시는 복구할 수 없습니다.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                disabled={isWithdrawing}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-all"
              >
                머무르기
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsWithdrawing(true);
                  const devId = getDeviceId();
                  await withdrawAccount(devId);
                  setIsWithdrawing(false);
                  setIsWithdrawModalOpen(false);
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                disabled={isWithdrawing}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-lg shadow-rose-600/30"
              >
                {isWithdrawing ? '처리 중...' : '탈퇴 진행하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
