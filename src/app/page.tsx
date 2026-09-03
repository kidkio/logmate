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

export default function HomePage() {
  const [deviceId, setDeviceId] = useState<string>('');
  const [failures, setFailures] = useState<Failure[]>([]);
  const [myFailures, setMyFailures] = useState<Failure[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('전체');
  const [activeSort, setActiveSort] = useState<'latest' | 'popular'>('latest');
  const [isLoading, setIsLoading] = useState(true);

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
    }
  }, [deviceId, fetchFailures, fetchMyFailures, fetchStats]);

  // 글 작성 성공 핸들러
  const handleSuccessCreate = (result: CreateFailureResponse) => {
    setSimilarModalResult(result);
    setFailures((prev) => [result.failure, ...prev]);
    setMyFailures((prev) => [result.failure, ...prev]);
    fetchStats();
  };

  // 리액션 핸들러 (낙관적 UI 업데이트)
  const handleReaction = async (failureId: string, type: ReactionType) => {
    if (!deviceId) return;

    // 1. 피드 목록 낙관적 업데이트
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
        // 서버의 최신 값으로 동기화
        const syncReactions = (list: Failure[]) =>
          list.map((f) => (f.id === failureId ? { ...f, reactions: data.reactions } : f));
        setFailures((prev) => syncReactions(prev));
        setMyFailures((prev) => syncReactions(prev));
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
        // 만약 AI 판정으로 블라인드 처리되었다면 피드에서 즉시 제거
        setFailures((prev) => prev.filter((f) => f.id !== failureId));
        setMyFailures((prev) => prev.filter((f) => f.id !== failureId));
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
        {/* 실패 작성 히어로 폼 */}
        <FailureForm onSuccess={handleSuccessCreate} />

        {/* 실패 피드 및 탐색 영역 */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-200">
              오늘 사람들의 실패 이야기
            </h3>
            <span className="text-xs text-slate-500">
              {failures.length}개의 실패 공유됨
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
