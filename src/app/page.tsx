'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Failure, CategoryType, ReactionType, CreateFailureResponse } from '@/types';
import { getDeviceId } from '@/lib/device';
import { Header } from '@/components/Header';
import { FailureFeed } from '@/components/FailureFeed';
import { ReportModal } from '@/components/ReportModal';
import { BottomNav, TabType } from '@/components/BottomNav';
import { OnboardingModal } from '@/components/OnboardingModal';
import { MyArchiveTab } from '@/components/MyArchiveTab';
import { InstallGuideModal } from '@/components/InstallGuideModal';
import { LandingAuth } from '@/components/LandingAuth';
import { DailyRitualGate } from '@/components/DailyRitualGate';
import { FailureShortsFeed } from '@/components/FailureShortsFeed';
import { PassPurchaseModal } from '@/components/PassPurchaseModal';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Moon } from 'lucide-react';

function MainApp() {
  const { user, isLoading: authLoading } = useAuth();
  const [deviceId, setDeviceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [failures, setFailures] = useState<Failure[]>([]);
  const [myFailures, setMyFailures] = useState<Failure[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('전체');
  const [activeSort, setActiveSort] = useState<'latest' | 'popular'>('latest');
  const [isLoading, setIsLoading] = useState(true);

  // 1일 1회 작성 상태 & 메인 유사 인원 수 & 유사 사연 3종
  const [myTodayFailure, setMyTodayFailure] = useState<Failure | null>(null);
  const [todaySimilarCount, setTodaySimilarCount] = useState<number>(0);
  const [todaySimilarFailures, setTodaySimilarFailures] = useState<Failure[]>([]);

  // 무제한 이용권 보유 여부
  const [hasPass, setHasPass] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // 모달 상태
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [reportingFailureId, setReportingFailureId] = useState<string | null>(null);

  // 실시간 통계
  const [stats, setStats] = useState({
    todaysCount: 0,
    totalCount: 0,
    totalComforts: 0,
  });

  // 초기화 (기기 식별자, 온보딩, 패스 체크)
  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);

    const hasSeenOnboarding = localStorage.getItem('logmate_onboarded');
    if (!hasSeenOnboarding && user) {
      setIsOnboardingOpen(true);
    }

    const savedPass = localStorage.getItem('logmate_has_pass');
    if (savedPass === 'true') {
      setHasPass(true);
    }
  }, [user]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('logmate_onboarded', 'true');
    setIsOnboardingOpen(false);
  };

  const handlePassPurchaseSuccess = () => {
    setHasPass(true);
    localStorage.setItem('logmate_has_pass', 'true');
  };

  // 통계 불러오기
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats({
          todaysCount: data.todaysCount,
          totalCount: data.totalCount,
          totalComforts: data.totalComforts,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 오늘 작성 여부 및 유사 사연 3종 불러오기
  const fetchMyTodayStatus = useCallback(async () => {
    if (!deviceId) return;
    try {
      const targetId = user?.id || deviceId;
      const res = await fetch(`/api/failures/my-today?deviceId=${encodeURIComponent(targetId)}`);
      const data = await res.json();
      if (data.success && data.hasPostedToday) {
        setMyTodayFailure(data.failure);
        setTodaySimilarCount(data.similarCount);
        if (data.similarFailures && Array.isArray(data.similarFailures)) {
          setTodaySimilarFailures(data.similarFailures.slice(0, 3));
        }
      } else {
        setMyTodayFailure(null);
      }
    } catch (err) {
      console.error(err);
    }
  }, [deviceId, user]);

  // 전체 피드 불러오기
  const fetchFailures = useCallback(async () => {
    if (!deviceId) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        category: activeCategory,
        sort: activeSort,
        deviceId: user?.id || deviceId,
      });
      const res = await fetch(`/api/failures?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setFailures(data.failures);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, user, activeCategory, activeSort]);

  // 내 실패 목록 불러오기
  const fetchMyFailures = useCallback(async () => {
    if (!deviceId) return;
    try {
      const targetId = user?.id || deviceId;
      const res = await fetch(`/api/failures/my?deviceId=${encodeURIComponent(targetId)}`);
      const data = await res.json();
      if (data.success) {
        setMyFailures(data.failures);
      }
    } catch (err) {
      console.error(err);
    }
  }, [deviceId, user]);

  useEffect(() => {
    if (deviceId && user) {
      fetchFailures();
      fetchMyFailures();
      fetchStats();
      fetchMyTodayStatus();
    }
  }, [deviceId, user, fetchFailures, fetchMyFailures, fetchStats, fetchMyTodayStatus]);

  // 글 작성 성공 핸들러 -> 유사 3종 사연을 즉시 담아 숏츠 뷰로 자동 전환
  const handleSuccessCreate = (result: CreateFailureResponse) => {
    setMyTodayFailure(result.failure);
    setTodaySimilarCount(result.similarCount);
    // 유사한 3종 사연 명시적 추출
    const top3 = result.similarFailures.slice(0, 3);
    setTodaySimilarFailures(top3);

    const otherFailures = failures.filter(
      (f) => f.id !== result.failure.id && !top3.some((sf) => sf.id === f.id)
    );
    setFailures([...top3, ...otherFailures]);
    setMyFailures((prev) => [result.failure, ...prev]);
    fetchStats();
    setActiveTab('today');
  };

  // 리액션 핸들러
  const handleReaction = async (failureId: string, type: ReactionType) => {
    const actorId = user?.id || deviceId;
    if (!actorId) return;

    const updateList = (list: Failure[]) =>
      list.map((f) => {
        if (f.id !== failureId) return f;
        const currentReactions = { ...f.reactions };
        const userReactions = new Set(f.userReactions || []);

        if (userReactions.has(type)) {
          userReactions.delete(type);
          currentReactions[type] = Math.max(0, currentReactions[type] - 1);
        } else {
          userReactions.add(type);
          currentReactions[type] = (currentReactions[type] || 0) + 1;
        }

        return {
          ...f,
          reactions: currentReactions,
          userReactions: Array.from(userReactions),
        };
      });

    setFailures((prev) => updateList(prev));
    setMyFailures((prev) => updateList(prev));
    setTodaySimilarFailures((prev) => updateList(prev));
    if (myTodayFailure && myTodayFailure.id === failureId) {
      setMyTodayFailure((prev) => (prev ? updateList([prev])[0] : null));
    }

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ failureId, deviceId: actorId, reactionType: type }),
      });
      const data = await res.json();
      if (data.success) {
        const syncReactions = (list: Failure[]) =>
          list.map((f) => (f.id === failureId ? { ...f, reactions: data.reactions } : f));
        setFailures((prev) => syncReactions(prev));
        setMyFailures((prev) => syncReactions(prev));
        setTodaySimilarFailures((prev) => syncReactions(prev));
        if (myTodayFailure && myTodayFailure.id === failureId) {
          setMyTodayFailure((prev) => (prev ? { ...prev, reactions: data.reactions } : null));
        }
        fetchStats();
      }
    } catch (e) {
      console.error('Failed to react:', e);
    }
  };

  // 신고 제출 핸들러
  const handleReportSubmit = async (failureId: string, reason: string) => {
    const actorId = user?.id || deviceId;
    if (!actorId) return;
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ failureId, deviceId: actorId, reason }),
      });
      const data = await res.json();
      if (data.success && data.isBlinded) {
        setFailures((prev) => prev.filter((f) => f.id !== failureId));
        setMyFailures((prev) => prev.filter((f) => f.id !== failureId));
        setTodaySimilarFailures((prev) => prev.filter((f) => f.id !== failureId));
        if (myTodayFailure && myTodayFailure.id === failureId) {
          setMyTodayFailure(null);
        }
      }
    } catch (err) {
      console.error('Failed to report:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="h-[100dvh] w-full bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white animate-pulse shadow-lg shadow-indigo-500/25">
          <Moon className="w-6 h-6" />
        </div>
        <p className="text-xs font-medium">LogMate 로딩 중...</p>
      </div>
    );
  }

  // 1. 비로그인 사용자
  if (!user) {
    return <LandingAuth />;
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-black flex justify-center selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* 모바일 100dvh 뷰포트 맞춤 컨테이너 */}
      <main className="w-full max-w-md h-[100dvh] max-h-[100dvh] bg-[#030712] text-slate-100 flex flex-col justify-between relative shadow-[0_0_80px_rgba(0,0,0,0.9)] border-x border-white/[0.06] antialiased overflow-hidden">
        {/* 1. 상단 헤더 */}
        <Header
          todaysCount={stats.todaysCount}
          totalComforts={stats.totalComforts}
          onOpenMyFailures={() => setActiveTab('archive')}
          myFailuresCount={myFailures.length}
          userNickname={user.nickname}
        />

        {/* 2. 중앙 메인 뷰포트 */}
        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col px-3 sm:px-4 py-2">
          {activeTab === 'today' && (
            <div className="w-full h-full flex-1 min-h-0 flex flex-col">
              {!myTodayFailure ? (
                /* 아직 작성하지 않았으면: 털어놓기 게이트 먼저 표시 */
                <DailyRitualGate
                  onSuccess={handleSuccessCreate}
                  onExploreAnyway={() => setActiveTab('explore')}
                />
              ) : (
                /* 작성 완료 시: 유사한 3종 사연이 1~3위로 최우선 노출되는 숏츠 뷰 */
                <FailureShortsFeed
                  similarFailures={todaySimilarFailures}
                  otherFailures={failures}
                  myTodayFailure={myTodayFailure}
                  similarCount={todaySimilarCount}
                  onReaction={handleReaction}
                  onReport={(id) => setReportingFailureId(id)}
                  hasPass={hasPass}
                  onOpenPassModal={() => setIsPassModalOpen(true)}
                />
              )}
            </div>
          )}

          {activeTab === 'explore' && (
            <div className="w-full h-full flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="px-1 space-y-0.5">
                <h2 className="text-sm font-bold text-slate-100">모든 실패 둘러보기</h2>
                <p className="text-[11px] text-slate-400">
                  카테고리별로 공감 가는 사연을 탐색하고 따뜻한 위로를 전해보세요.
                </p>
              </div>

              <FailureFeed
                failures={failures}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                activeSort={activeSort}
                onSelectSort={setActiveSort}
                onReaction={handleReaction}
                onReport={(id) => setReportingFailureId(id)}
                isLoading={isLoading}
                unlockedCount={9999}
                onOpenAdModal={() => setIsPassModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'archive' && (
            <div className="w-full h-full flex-1 overflow-y-auto space-y-4 pr-1">
              <MyArchiveTab
                myFailures={myFailures}
                onReaction={handleReaction}
                onReport={(id) => setReportingFailureId(id)}
                onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
              />
            </div>
          )}
        </div>

        {/* 3. 하단 플로팅 독 네비게이션 */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          myFailuresCount={myFailures.length}
        />

        {/* 이용권 구매 팝업 모달 */}
        <PassPurchaseModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          onPurchaseSuccess={handlePassPurchaseSuccess}
        />

        {/* 온보딩 모달 */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={handleCompleteOnboarding}
        />

        {/* PWA 앱 설치 가이드 모달 */}
        <InstallGuideModal
          isOpen={isInstallGuideOpen}
          onClose={() => setIsInstallGuideOpen(false)}
        />

        {/* 신고 모달 */}
        <ReportModal
          failureId={reportingFailureId}
          onClose={() => setReportingFailureId(null)}
          onSubmitReport={handleReportSubmit}
        />
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
