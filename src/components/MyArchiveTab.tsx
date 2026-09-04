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
  AlertTriangle,
  Ticket,
  RotateCcw,
  Bell
} from 'lucide-react';
import { FailureCard } from './FailureCard';
import { MoonlightCalendar } from './MoonlightCalendar';
import { useAuth } from '@/context/AuthContext';
import { getDeviceId } from '@/lib/device';
import { calculateWarmthProgress, getStoredWarmth, getStoredPassStatus, clearStoredPass, WarmthProgress } from '@/lib/warmthSystem';
import { notifyIfNewComfortNotes, requestNotificationPermission } from '@/lib/notifications';
import { WarmthAvatar } from './WarmthAvatar';
import { WarmthLevelModal } from './WarmthLevelModal';
import { RefundModal } from './RefundModal';

interface MyArchiveTabProps {
  myFailures: Failure[];
  onReaction: (failureId: string, type: ReactionType) => void;
  onReport: (failureId: string) => void;
  onOpenInstallGuide: () => void;
  hasPass?: boolean;
  onOpenPassModal?: () => void;
  onPassCancelled?: () => void;
}

export function MyArchiveTab({
  myFailures,
  onReaction,
  onReport,
  onOpenInstallGuide,
  hasPass = false,
  onOpenPassModal,
  onPassCancelled,
}: MyArchiveTabProps) {
  const { user, logout, withdrawAccount } = useAuth();
  const [comfortNotes, setComfortNotes] = useState<ComfortNote[]>([]);
  const [failuresState, setFailuresState] = useState<Failure[]>(myFailures);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [warmthProgress, setWarmthProgress] = useState<WarmthProgress>(() => {
    const stored = getStoredWarmth(user?.id);
    return calculateWarmthProgress(stored.lifetime, stored.spendable);
  });
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [passInfo, setPassInfo] = useState<{
    plan?: string;
    orderId?: string;
    paymentKey?: string;
    expiresAt?: string;
    purchasedAt?: string;
  } | null>(() => getStoredPassStatus(user?.id).passInfo);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { passInfo: pInfo } = getStoredPassStatus(user?.id);
      setPassInfo(pInfo as typeof passInfo);
    }, 0);
    return () => clearTimeout(timer);
  }, [hasPass, user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = getStoredWarmth(user?.id);
      setWarmthProgress(calculateWarmthProgress(stored.lifetime, stored.spendable));
    }, 0);
    return () => clearTimeout(timer);
  }, [user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFailuresState(myFailures);
    }, 0);
    return () => clearTimeout(timer);
  }, [myFailures]);

  // 받은 온기 쪽지 불러오기
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/comfort-notes?userId=${encodeURIComponent(user.id)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.notes)) {
            setComfortNotes(data.notes);
            notifyIfNewComfortNotes(data.notes.length);
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
          <div className="flex items-center gap-3 min-w-0">
            {/* 레벨 진화 아바타 */}
            <WarmthAvatar
              tier={warmthProgress.tier}
              size="lg"
              onClick={() => setIsLevelModalOpen(true)}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {user?.provider === 'kakao' ? '🟡 카카오' : user?.provider === 'google' ? '⚪ Google' : user?.provider === 'email' ? '✉️ 이메일' : '🕶️ 게스트'}
                </span>
                {/* 클릭 시 레벨 도감 오픈 */}
                <button
                  onClick={() => setIsLevelModalOpen(true)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1 transition-all hover:scale-105 active:scale-95 ${warmthProgress.tier.badgeColor}`}
                  title="온기 레벨 & 도감 보기"
                >
                  <span>{warmthProgress.tier.avatarEmoji}</span>
                  <span>Lv.{warmthProgress.tier.level} {warmthProgress.tier.title}</span>
                </button>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>{user?.nickname || '익명의 친구'}</span>
              </h3>
              {user?.email && (
                <p className="text-[10px] text-slate-500">{user.email}</p>
              )}

              {/* 다음 레벨 미니 진행 바 */}
              {!warmthProgress.isMaxLevel && warmthProgress.nextTier && (
                <div
                  onClick={() => setIsLevelModalOpen(true)}
                  className="pt-1 space-y-0.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[9px] text-slate-400 group-hover:text-amber-300 transition-colors">
                    <span>다음: {warmthProgress.nextTier.title}</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {warmthProgress.warmthToNext}개 남음 ({warmthProgress.progressPct}%)
                    </span>
                  </div>
                  <div className="w-36 sm:w-48 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/[0.05]">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${warmthProgress.progressPct}%` }}
                    />
                  </div>
                </div>
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
          <div
            onClick={() => setIsLevelModalOpen(true)}
            className="bg-slate-950/60 rounded-xl p-2.5 border border-amber-500/30 text-center bg-amber-950/20 cursor-pointer hover:bg-amber-900/30 transition-all active:scale-95"
            title="온기 레벨 도감 보기"
          >
            <span className="text-[10px] text-amber-300 font-semibold block mb-0.5">내 보유 온기</span>
            <div className="flex items-center justify-center gap-1 text-amber-300 font-black text-base">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
              <span>{warmthProgress.spendableWarmth}개</span>
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

      {/* 2. 프리미엄 멤버십 & 패스 관리 카드 */}
      <div
        className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border shadow-lg space-y-3 transition-all ${
          hasPass
            ? 'bg-gradient-to-br from-indigo-950/70 via-purple-950/40 to-slate-900 border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
            : 'bg-slate-900/60 border-white/[0.08]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                hasPass
                  ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-500 shadow-md shadow-pink-500/20'
                  : 'bg-slate-800 border border-white/10'
              }`}
            >
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                멤버십 상태
              </span>
              <h4 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5 flex-wrap mt-0.5">
                {hasPass ? (
                  <>
                    <span className="text-amber-300">
                      💎 {passInfo?.plan === 'day' ? '1일 자유 이용권' : passInfo?.plan === 'lifetime' ? '평생 VIP 프리미엄' : '30일 심야 무제한 패스'}
                    </span>
                    <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      이용 중
                    </span>
                  </>
                ) : (
                  <>
                    <span>일반 회원</span>
                    <span className="text-[9px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-white/5">
                      광고 포함
                    </span>
                  </>
                )}
              </h4>
            </div>
          </div>

          <div>
            {hasPass ? (
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(true)}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-300 underline underline-offset-4 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>환불 / 결제 취소</span>
              </button>
            ) : (
              onOpenPassModal && (
                <button
                  type="button"
                  onClick={onOpenPassModal}
                  className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-amber-500/20"
                >
                  패스 구독하기 ➔
                </button>
              )
            )}
          </div>
        </div>

        {hasPass ? (
          <div className="flex items-center justify-between text-[11px] bg-black/40 px-3.5 py-2.5 rounded-xl border border-white/5 font-mono text-slate-300">
            <span className="text-slate-400">
              {passInfo?.expiresAt
                ? `만료: ${new Date(passInfo.expiresAt).toLocaleDateString()}`
                : '만료 기한: 영구 무제한'}
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>모든 광고 100% 차단 중</span>
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
            프리미엄 패스를 구독하시면 모든 광고가 완전 차단되며 숨겨진 공감 사연을 자유롭게 열람하실 수 있습니다.
          </p>
        )}
      </div>

      {/* 3. [달빛 캘린더] 실패 기록 & 극복 궤적 */}
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
            <button
              type="button"
              onClick={async () => {
                const granted = await requestNotificationPermission();
                if (granted) {
                  alert('🔔 온기 쪽지 브라우저 알림이 켜졌습니다! 새로운 쪽지가 도착하면 알려드릴게요.');
                }
              }}
              className="text-[10px] font-semibold text-pink-300 hover:text-white bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/30 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95 shadow-sm"
              title="새로운 온기 쪽지가 도착하면 브라우저 푸시 알림으로 알려드립니다"
            >
              <Bell className="w-3 h-3 text-pink-400" />
              <span>쪽지 알림 켜기</span>
            </button>
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
                    isMine={true}
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

      {/* 4. 온기 레벨 & 프로필 도감 모달 */}
      <WarmthLevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        progress={warmthProgress}
      />

      {/* 5. 이용권 환불 / 결제 취소 모달 */}
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        passInfo={passInfo}
        onRefundSuccess={() => {
          clearStoredPass(user?.id);
          setPassInfo(null);
          if (onPassCancelled) onPassCancelled();
        }}
      />
    </div>
  );
}
