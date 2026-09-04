import { NextRequest, NextResponse } from 'next/server';
import { failureStore, isFailureOwnedBy } from '@/lib/storage';
import { getUserBySession } from '@/lib/user-store';
import { calculateKoreanSimilarity } from '@/lib/koreanSimilarity';
import { Failure } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId') || '';
    let userId = searchParams.get('userId') || undefined;

    const token = req.cookies.get('logmate_token')?.value;
    if (token && !userId) {
      const user = await getUserBySession(token);
      if (user) userId = user.id;
    }

    const todayFailure = (deviceId || userId) 
      ? await failureStore.getTodaysFailure(deviceId, userId) 
      : null;

    const allFailures = await failureStore.getAll(deviceId, '전체', 'popular');
    // 본인이 작성한 글은 해금 비밀 사연 후보에서 완전히 배제
    const available = allFailures.filter(
      (f) => !isFailureOwnedBy(f, deviceId, userId) && (!todayFailure || f.id !== todayFailure.id)
    );

    let unlocked: Failure[] = [];

    if (todayFailure) {
      // 오늘 작성한 실패와 유사도 계산
      const scored = available.map((f) => {
        const score = calculateKoreanSimilarity(
          todayFailure.category,
          todayFailure.content,
          todayFailure.tags || [],
          f.category,
          f.content,
          f.tags || []
        );
        return { failure: f, score };
      });

      scored.sort((a, b) => b.score - a.score);

      // 상위 3개(기본 무료 노출된 것) 다음의 4~6번째 유사 사연 선택
      const nextSimilar = scored.slice(3, 6).map((item) => ({
        ...item.failure,
        similarityScore: Math.round(item.score * 100),
      }));

      unlocked = nextSimilar;

      // 만약 4~6번째가 3개 미만이면, 동일 카테고리 또는 인기 공감 사연으로 채움
      if (unlocked.length < 3) {
        const existingIds = new Set([todayFailure.id, ...unlocked.map((u) => u.id), ...scored.slice(0, 3).map((s) => s.failure.id)]);
        const categoryFillers = available.filter((f) => f.category === todayFailure.category && !existingIds.has(f.id));
        for (const f of categoryFillers) {
          if (unlocked.length >= 3) break;
          unlocked.push({ ...f, similarityScore: 88 });
          existingIds.add(f.id);
        }
      }
    }

    // 여전히 3개 미만인 경우 (오늘 글을 아직 안 썼거나 글 수가 적을 때)
    if (unlocked.length < 3) {
      const existingIds = new Set(unlocked.map((u) => u.id));
      if (todayFailure) existingIds.add(todayFailure.id);
      
      const generalFillers = available.filter((f) => !existingIds.has(f.id));
      for (const f of generalFillers) {
        if (unlocked.length >= 3) break;
        unlocked.push({ ...f, similarityScore: 85 });
        existingIds.add(f.id);
      }
    }

    return NextResponse.json({
      success: true,
      unlockedFailures: unlocked.slice(0, 3),
      basedOnTodayFailure: !!todayFailure,
    });
  } catch (error: any) {
    console.error('Failed to get unlocked similar failures:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
