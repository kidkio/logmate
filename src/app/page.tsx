'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Failure, CategoryType, ReactionType, CreateFailureResponse } from '@/types';
import { getDeviceId } from '@/lib/device';
import { Header } from '@/components/Header';
import { FailureForm } from '@/components/FailureForm';
import { FailureFeed } from '@/components/FailureFeed';
import { SimilarResultsModal } from '@/components/SimilarResultsModal';
import { ReportModal } from '@/components/ReportModal';
import { TodayStatusCard } from '@/components/TodayStatusCard';
import { AdRewardModal } from '@/components/AdRewardModal';
import { BottomNav, TabType } from '@/components/BottomNav';
import { OnboardingModal } from '@/components/OnboardingModal';
import { MyArchiveTab } from '@/components/MyArchiveTab';
import { InstallGuideModal } from '@/components/InstallGuideModal';
import { LandingAuth } from '@/components/LandingAuth';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Moon, RefreshCw } from 'lucide-react';

function MainApp() {
  const { user, isLoading: authLoading } = useAuth();
  const [deviceId, setDeviceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [failures, setFailures] = useState<Failure[]>([]);
  const [myFailures, setMyFailures] = useState<Failure[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('전체');
  const [activeSort, setActiveSort] = useState<'latest' | 'popular'>('latest');
  const [isLoading, setIsLoading] = useState(true);

  // 1일 1회 작성 상태 & 메인 유사 인원 수
  const [myTodayFailure, setMyTodayFailure] = useState<Failure | null>(null);
  const [todaySimilarCount, setTodaySimilarCount] = useState<number>(0);

  // 3개 무료 열람 + 광고/이용권 잠금 해제 상태
  const [unlockedCount, setUnlockedCount] = useState<number>(3);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  // 모달 상태
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [similarModalResult, setSimilarModalResult] = useState<CreateFailureResponse | null>(null);
  const [reportingFailureId, setReportingFailureId] = useState<string | null>(null);

  // 실시간 통계
  const [stats, setStats] = useState({
    todaysCount: 0,
    totalCount: 0,
    totalComforts: 0,
  });

  // 초기화 (기기 식별자 및 온보딩 체크)
  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);

    const hasSeenOnboarding = localStorage.getItem('logmate_onboarded');
    if (!hasSeenOnboarding && user) {
      setIsOnboardingOpen(true);
    }
  }, [user]);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('logmate_onboarded', 'true');
    setIsOnboardingOpen(false);
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

  // 오늘 작성 여부 확인 (userId 및 deviceId)
  const fetchMyTodayStatus = useCallback(async () => {
    if (!deviceId) return;
    try {
      const targetId = user?.id || deviceId;
      const res = await fetch(`/api/failures/my-today?deviceId=${encodeURIComponent(targetId)}`);
      const data = await res.json();
      if (data.success && data.hasPostedToday) {
        setMyTodayFailure(data.failure);
        setTodaySimilarCount(data.similarCount);
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

  // 글 작성 성공 핸들러
  const handleSuccessCreate = (result: CreateFailureResponse) => {
    setSimilarModalResult(result);
    setMyTodayFailure(result.failure);
    setTodaySimilarCount(result.similarCount);
    setFailures((prev) => [result.failure, ...prev]);
    setMyFailures((prev) => [result.failure, ...prev]);
    fetchStats();
  };

  // 잠금 해제 (광고 시청 또는 이용권)
  const handleUnlockReward = (mode: 'plus3' | 'all') => {
    if (mode === 'plus3') {
      setUnlockedCount((prev) => prev + 3);
    } else {
      setUnlockedCount(9999);
    }
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
    if (myTodayFailure && myTodayFailure.id === failureId) {
      setMyTodayFailure((prev) => (prev ? updateList([prev])[0] : null));
    }
    if (similarModalResult) {
      setSimilarModalResult((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          similarFailures: updateList(prev.similarFailures),
        };
      });
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
        if (myTodayFailure && myTodayFailure.id === failureId) {
          setMyTodayFailure(null);
        }
      }
    } catch (err) {
      console.error('Failed to report:', err);
    }
  };

  // 로그인 상태 로딩 중 화면
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white animate-pulse shadow-lg shadow-indigo-500/25">
          <Moon className="w-6 h-6" />
        </div>
        <p className="text-xs font-medium">LogMate 로딩 중...</p>
      </div>
    );
  }

  // 비로그인 사용자 -> 랜딩 & 소셜/이메일 로그인 게이트웨이 노출
  if (!user) {
    return <LandingAuth />;
  }

  return (
    <div className="min-h-screen bg-black flex justify-center selection:bg-indigo-500 selection:text-white">
      {/* 모바일 웹앱 컨테이너 (App Shell) */}
      <main className="w-full max-w-md min-h-screen bg-slate-950 text-slate-100 flex flex-col relative pb-20 shadow-2xl border-x border-slate-900/80 antialiased">
        {/* 상단 앱 헤더 */}
        <Header
          todaysCount={stats.todaysCount}
          totalComforts={stats.totalComforts}
          onOpenMyFailures={() => setActiveTab('archive')}
          myFailuresCount={myFailures.length}
          userNickname={user.nickname}
        />

        {/* 탭별 뷰 렌더링 */}
        <div className="flex-1 px-4 py-5 space-y-6">
          {activeTab === 'today' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* 1일 1회 작성 상태 카드 or 작성 폼 */}
              {myTodayFailure ? (
                <TodayStatusCard
                  failure={myTodayFailure}
                  similarCount={todaySimilarCount}
                  onReaction={handleReaction}
                  onReport={(id) => setReportingFailureId(id)}
                />
              ) : (
                <FailureForm onSuccess={handleSuccessCreate} />
              )}

              {/* 오늘의 추천 유사 피드 (기본 3개 무료 + 잠금 해제) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">
                      오늘 사람들의 실패 이야기
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      기본 3명 무료 열람 · 추가는 광고/패스로 잠금 해제
                    </p>
                  </div>
                  <span className="text-xs text-indigo-400 font-semibold bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-full">
                    {Math.min(failures.length, unlockedCount)}/{failures.length}개
                  </span>
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
                  unlockedCount={unlockedCount}
                  onOpenAdModal={() => setIsAdModalOpen(true)}
                />
              </div>
            </div>
          )}

          {activeTab === 'explore' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="px-1 space-y-1">
                <h2 className="text-base font-bold text-slate-100">
                  모든 실패 둘러보기
                </h2>
                <p className="text-xs text-slate-400">
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
                onOpenAdModal={() => setIsAdModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'archive' && (
            <MyArchiveTab
              myFailures={myFailures}
              onReaction={handleReaction}
              onReport={(id) => setReportingFailureId(id)}
              onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
            />
          )}
        </div>

        {/* 하단 모바일 웹앱 네비게이션 바 */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          myFailuresCount={myFailures.length}
        />

        {/* 첫 방문 몰입형 온보딩 모달 */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={handleCompleteOnboarding}
        />

        {/* 홈 화면 추가(PWA 설치) 안내 모달 */}
        <InstallGuideModal
          isOpen={isInstallGuideOpen}
          onClose={() => setIsInstallGuideOpen(false)}
        />

        {/* 작성 직후 유사 실패 AI 매칭 모달 */}
        <SimilarResultsModal
          result={similarModalResult}
          onClose={() => setSimilarModalResult(null)}
          onReaction={handleReaction}
          onReport={(id) => setReportingFailureId(id)}
        />

        {/* 광고 시청 / 이용권 모달 */}
        <AdRewardModal
          isOpen={isAdModalOpen}
          onClose={() => setIsAdModalOpen(false)}
          onUnlockSuccess={handleUnlockReward}
          remainingLockedCount={Math.max(0, failures.length - unlockedCount)}
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
