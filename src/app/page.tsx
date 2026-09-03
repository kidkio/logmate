'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Failure, CategoryType, ReactionType, CreateFailureResponse } from '@/types';
import { getDeviceId } from '@/lib/device';
import { Header } from '@/components/Header';
import { FailureForm } from '@/components/FailureForm';
import { FailureFeed } from '@/components/FailureFeed';
import { SimilarResultsModal } from '@/components/SimilarResultsModal';
import { MyFailuresDrawer } from '@/components/MyFailuresDrawer';
import { ReportModal } from '@/components/ReportModal';
import { TodayStatusCard } from '@/components/TodayStatusCard';
import { AdRewardModal } from '@/components/AdRewardModal';

export default function HomePage() {
  const [deviceId, setDeviceId] = useState<string>('');
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

  // 모달 및 서랍 상태
  const [similarModalResult, setSimilarModalResult] = useState<CreateFailureResponse | null>(null);
  const [isMyDrawerOpen, setIsMyDrawerOpen] = useState(false);
  const [reportingFailureId, setReportingFailureId] = useState<string | null>(null);

  // 실시간 통계
  const [stats, setStats] = useState({
    todaysCount: 0,
    totalCount: 0,
    totalComforts: 0,
  });

  // 초기화 (기기 식별자 세팅)
  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
  }, []);

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

  // 오늘 작성 여부 확인
  const fetchMyTodayStatus = useCallback(async () => {
    if (!deviceId) return;
    try {
      const res = await fetch(`/api/failures/my-today?deviceId=${deviceId}`);
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
  }, [deviceId]);

  // 전체 피드 불러오기
  const fetchFailures = useCallback(async () => {
    if (!deviceId) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        category: activeCategory,
        sort: activeSort,
        deviceId,
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
  }, [deviceId, activeCategory, activeSort]);

  // 내 실패 목록 불러오기
  const fetchMyFailures = useCallback(async () => {
    if (!deviceId) return;
    try {
      const res = await fetch(`/api/failures/my?deviceId=${deviceId}`);
      const data = await res.json();
      if (data.success) {
        setMyFailures(data.failures);
      }
    } catch (err) {
      console.error(err);
    }
  }, [deviceId]);

  useEffect(() => {
    if (deviceId) {
      fetchFailures();
      fetchMyFailures();
      fetchStats();
      fetchMyTodayStatus();
    }
  }, [deviceId, fetchFailures, fetchMyFailures, fetchStats, fetchMyTodayStatus]);

  // 글 작성 성공 핸들러
  const handleSuccessCreate = (result: CreateFailureResponse) => {
    setSimilarModalResult(result);
    setMyTodayFailure(result.failure);
    setTodaySimilarCount(result.similarCount);
    setFailures((prev) => [result.failure, ...prev]);
    setMyFailures((prev) => [result.failure, ...prev]);
    fetchStats();
  };

  // 잠금 해제 (광고 시청 또는 이용권) 핸들러
  const handleUnlockReward = (mode: 'plus3' | 'all') => {
    if (mode === 'plus3') {
      setUnlockedCount((prev) => prev + 3);
    } else {
      setUnlockedCount(9999);
    }
  };

  // 리액션 핸들러 (낙관적 UI 업데이트)
  const handleReaction = async (failureId: string, type: ReactionType) => {
    if (!deviceId) return;

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
        body: JSON.stringify({ failureId, deviceId, reactionType: type }),
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
    if (!deviceId) return;
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ failureId, deviceId, reason }),
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* 헤더 */}
      <Header
        todaysCount={stats.todaysCount}
        totalComforts={stats.totalComforts}
        onOpenMyFailures={() => setIsMyDrawerOpen(true)}
        myFailuresCount={myFailures.length}
      />

      {/* 중앙 메인 콘텐츠 영역 */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8 space-y-7">
        {/* 1일 1회 작성 정책: 이미 작성했으면 오늘 상태 카드, 미작성이면 입력 폼 노출 */}
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

        {/* 실패 피드 및 탐색 영역 */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-200">
                오늘 사람들의 실패 이야기
              </h3>
              <p className="text-[11px] text-slate-400">
                기본 3명 무료 열람 · 추가 열람은 광고 및 패스로 잠금 해제
              </p>
            </div>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-full">
              열람 가능 {Math.min(failures.length, unlockedCount)}/{failures.length}개
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

      {/* 푸터 */}
      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© LogMate (로그메이트) · 실패를 털어놓을 가장 다정한 친구. 당신만 그런 것이 아닙니다.</p>
      </footer>

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

      {/* 내 실패 서재 서랍 */}
      <MyFailuresDrawer
        isOpen={isMyDrawerOpen}
        onClose={() => setIsMyDrawerOpen(false)}
        myFailures={myFailures}
        onReaction={handleReaction}
        onReport={(id) => setReportingFailureId(id)}
      />

      {/* 신고 모달 */}
      <ReportModal
        failureId={reportingFailureId}
        onClose={() => setReportingFailureId(null)}
        onSubmitReport={handleReportSubmit}
      />
    </main>
  );
}
