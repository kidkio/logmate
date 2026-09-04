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

    const excludeParam = searchParams.get('excludeIds') || '';
    const excludedIdSet = new Set(excludeParam ? excludeParam.split(',').filter(Boolean) : []);

    const todayFailure = (deviceId || userId) 
      ? await failureStore.getTodaysFailure(deviceId, userId) 
      : null;

    const allFailures = await failureStore.getAll(deviceId, '전체', 'popular');
    // 본인이 작성한 글 및 이미 해금한 글은 후보에서 완전히 배제
    const available = allFailures.filter(
      (f) =>
        !isFailureOwnedBy(f, deviceId, userId) &&
        (!todayFailure || f.id !== todayFailure.id) &&
        !excludedIdSet.has(f.id)
    );

    let unlocked: Failure[] = [];

    if (todayFailure) {
      // 무료 기본 3편의 ID 추출 (이미 무료로 피드에 노출된 상위 3편)
      const allEligible = allFailures.filter(
        (f) => !isFailureOwnedBy(f, deviceId, userId) && f.id !== todayFailure.id
      );
      const allScored = allEligible.map((f) => ({
        failure: f,
        score: calculateKoreanSimilarity(
          todayFailure.category,
          todayFailure.content,
          todayFailure.tags || [],
          f.category,
          f.content,
          f.tags || []
        ),
      }));
      allScored.sort((a, b) => b.score - a.score);
      const freeTop3Ids = new Set(allScored.slice(0, 3).map((item) => item.failure.id));

      // 남은 후보 사연 중에서 유사도 높은 순으로 신규 3편 추출
      const candidates = available
        .filter((f) => !freeTop3Ids.has(f.id))
        .map((f) => ({
          failure: f,
          score: calculateKoreanSimilarity(
            todayFailure.category,
            todayFailure.content,
            todayFailure.tags || [],
            f.category,
            f.content,
            f.tags || []
          ),
        }));
      candidates.sort((a, b) => b.score - a.score);

      unlocked = candidates.slice(0, 3).map((item) => ({
        ...item.failure,
        similarityScore: Math.round(item.score * 100),
      }));

      // 3개 미만이면 카테고리 필러로 충원
      if (unlocked.length < 3) {
        const currentPickedIds = new Set([
          todayFailure.id,
          ...excludedIdSet,
          ...freeTop3Ids,
          ...unlocked.map((u) => u.id),
        ]);
        const categoryFillers = available.filter(
          (f) => f.category === todayFailure.category && !currentPickedIds.has(f.id)
        );
        for (const f of categoryFillers) {
          if (unlocked.length >= 3) break;
          unlocked.push({ ...f, similarityScore: 88 });
          currentPickedIds.add(f.id);
        }
      }
    }

    // 여전히 3개 미만인 경우 (전체 풀에서 충원)
    if (unlocked.length < 3) {
      const currentPickedIds = new Set([
        ...(todayFailure ? [todayFailure.id] : []),
        ...excludedIdSet,
        ...unlocked.map((u) => u.id),
      ]);
      const generalFillers = available.filter((f) => !currentPickedIds.has(f.id));
      for (const f of generalFillers) {
        if (unlocked.length >= 3) break;
        unlocked.push({ ...f, similarityScore: 85 });
        currentPickedIds.add(f.id);
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
