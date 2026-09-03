import { Failure, CategoryType, ReactionType, ReactionCounts } from '@/types';
import { INITIAL_SEED_FAILURES } from './seed-data';
import { getEmbedding, cosineSimilarity, reviewModerationAI } from './gemini';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// KST 새벽 3시 기준 시작 시점 계산
export function getToday3AMKSTCutoff(): Date {
  const now = new Date();
  // KST offset is +9 hours (540 minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kstNow = new Date(utc + 9 * 3600000);

  const kstCutoff = new Date(kstNow);
  // 만약 현재 KST 시간이 새벽 3시 이전이라면, 어제 새벽 3시가 기준
  if (kstNow.getHours() < 3) {
    kstCutoff.setDate(kstCutoff.getDate() - 1);
  }
  kstCutoff.setHours(3, 0, 0, 0);

  // UTC 타임스탬프로 환산하여 Date 객체 반환
  const kstCutoffUtcTime = kstCutoff.getTime() - 9 * 3600000;
  return new Date(kstCutoffUtcTime);
}

// In-Memory 캐시 / Mock 저장소 (Supabase 미연결 시 로컬 개발 및 즉시 테스트 지원)
class FailureStore {
  private failures: Map<string, Failure> = new Map();
  private userReactions: Map<string, Set<ReactionType>> = new Map(); // key: `${failureId}:${deviceId}`
  private userReports: Set<string> = new Set(); // key: `${failureId}:${deviceId}`
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // 시드 데이터 초기 임베딩 생성 및 등록
    for (const seed of INITIAL_SEED_FAILURES) {
      const embedding = await getEmbedding(seed.content);
      this.failures.set(seed.id, {
        ...seed,
        embedding,
        isBlinded: false,
        reportCount: 0,
      });
    }
  }

  async getAll(deviceId?: string, category?: CategoryType, sort: 'latest' | 'popular' = 'latest'): Promise<Failure[]> {
    await this.init();

    if (supabase) {
      try {
        let query = supabase.from('failures').select('*').eq('is_blinded', false);
        if (category && category !== '전체') {
          query = query.eq('category', category);
        }
        if (sort === 'popular') {
          query = query.order('reactions->comfort', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }
        const { data, error } = await query;
        if (!error && data) {
          return data.map((d: any) => this.mapDbRow(d, deviceId));
        }
      } catch (e) {
        console.warn('Supabase fetch failed, fallback to local store:', e);
      }
    }

    let list = Array.from(this.failures.values()).filter((f) => !f.isBlinded);

    if (category && category !== '전체') {
      list = list.filter((f) => f.category === category);
    }

    if (sort === 'popular') {
      list.sort((a, b) => {
        const totalA = a.reactions.comfort + a.reactions.relate + a.reactions.kick + a.reactions.cheer;
        const totalB = b.reactions.comfort + b.reactions.relate + b.reactions.kick + b.reactions.cheer;
        return totalB - totalA;
      });
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list.map((f) => this.enrichWithUserReactions(f, deviceId));
  }

  async getById(id: string, deviceId?: string): Promise<Failure | null> {
    await this.init();
    const item = this.failures.get(id);
    if (!item || item.isBlinded) return null;
    return this.enrichWithUserReactions(item, deviceId);
  }

  async getTodaysFailure(deviceId: string): Promise<Failure | null> {
    await this.init();
    const cutoff = getToday3AMKSTCutoff();
    const my = Array.from(this.failures.values()).filter(
      (f) => f.deviceId === deviceId && !f.isBlinded && new Date(f.createdAt) >= cutoff
    );
    if (my.length === 0) return null;
    my.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return this.enrichWithUserReactions(my[0], deviceId);
  }

  async create(failureData: Omit<Failure, 'id' | 'reactions' | 'reportCount' | 'isBlinded' | 'createdAt'>): Promise<Failure> {
    await this.init();

    // 1일 1회 작성 제한 (새벽 3시 KST 기준)
    const existing = await this.getTodaysFailure(failureData.deviceId);
    if (existing) {
      const err = new Error('오늘은 이미 실패를 공유하셨습니다. 매일 새벽 3시에 새로운 실패를 털어놓으실 수 있어요!');
      (err as any).existingFailure = existing;
      (err as any).code = 'LIMIT_EXCEEDED';
      throw err;
    }

    const id = 'fail-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newFailure: Failure = {
      ...failureData,
      id,
      reactions: { comfort: 0, relate: 0, kick: 0, cheer: 0 },
      reportCount: 0,
      isBlinded: false,
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      try {
        await supabase.from('failures').insert({
          id: newFailure.id,
          device_id: newFailure.deviceId,
          content: newFailure.content,
          category: newFailure.category,
          tags: newFailure.tags,
          ai_comfort_quote: newFailure.aiComfortQuote,
          embedding: newFailure.embedding,
          reactions: newFailure.reactions,
          is_seed: false,
        });
      } catch (err) {
        console.warn('Supabase insert failed, fallback to memory:', err);
      }
    }

    this.failures.set(id, newFailure);
    return newFailure;
  }

  // 실시간 유사 실패 매칭
  async findSimilar(targetFailure: Failure): Promise<{
    similarCount: number;
    similarFailures: Failure[];
    categoryCount: number;
  }> {
    await this.init();
    const cutoff = getToday3AMKSTCutoff();
    const all = Array.from(this.failures.values()).filter(
      (f) => !f.isBlinded && f.id !== targetFailure.id
    );

    // 새벽 3시 이후 글 우선 필터링
    let todaysFailures = all.filter((f) => new Date(f.createdAt) >= cutoff);
    if (todaysFailures.length < 3) {
      // 오늘 등록된 글이 적을 때(콜드 스타트)는 최근 48시간 또는 시드 데이터 포함
      todaysFailures = all;
    }

    // 동일 카테고리 오늘 등록 인원 수
    const categoryCount = todaysFailures.filter((f) => f.category === targetFailure.category).length;

    // 코사인 유사도 점수 계산
    const scored = todaysFailures.map((f) => {
      let score = 0;
      if (targetFailure.embedding && f.embedding) {
        score = cosineSimilarity(targetFailure.embedding, f.embedding);
      } else if (f.category === targetFailure.category) {
        score = 0.65;
      }
      return { failure: f, score };
    });

    // 유사도 내림차순 정렬
    scored.sort((a, b) => b.score - a.score);

    // 의미적으로 유사하다고 볼 기준 점수 (>= 0.60)
    const SIMILAR_THRESHOLD = 0.60;
    const matched = scored.filter((item) => item.score >= SIMILAR_THRESHOLD);

    // 비슷한 실패를 겪은 사람 수 (최소 1명 이상은 공감 카테고리로 보장)
    const similarCount = Math.max(matched.length, Math.min(categoryCount, 1));

    // 상위 3~5개 추출
    const topSimilar = (matched.length > 0 ? matched : scored)
      .slice(0, 4)
      .map((item) => ({
        ...this.enrichWithUserReactions(item.failure, targetFailure.deviceId),
        similarityScore: Math.round(item.score * 100),
      }));

    return {
      similarCount,
      similarFailures: topSimilar,
      categoryCount,
    };
  }

  async addReaction(failureId: string, deviceId: string, reactionType: ReactionType): Promise<ReactionCounts> {
    await this.init();
    const failure = this.failures.get(failureId);
    if (!failure) throw new Error('Failure not found');

    const userKey = `${failureId}:${deviceId}`;
    let userSet = this.userReactions.get(userKey);
    if (!userSet) {
      userSet = new Set();
      this.userReactions.set(userKey, userSet);
    }

    if (userSet.has(reactionType)) {
      // 이미 누른 경우 취소 (토글)
      userSet.delete(reactionType);
      failure.reactions[reactionType] = Math.max(0, failure.reactions[reactionType] - 1);
    } else {
      userSet.add(reactionType);
      failure.reactions[reactionType] = (failure.reactions[reactionType] || 0) + 1;
    }

    return failure.reactions;
  }

  async addReport(failureId: string, deviceId: string, reason: string): Promise<{ isBlinded: boolean; reportCount: number }> {
    await this.init();
    const failure = this.failures.get(failureId);
    if (!failure) throw new Error('Failure not found');

    const reportKey = `${failureId}:${deviceId}`;
    if (this.userReports.has(reportKey)) {
      return { isBlinded: failure.isBlinded, reportCount: failure.reportCount };
    }

    this.userReports.add(reportKey);
    failure.reportCount += 1;

    // 신고 3회 누적 시 AI 자동 검수
    if (failure.reportCount >= 3 && !failure.isBlinded) {
      const review = await reviewModerationAI(failure.content, reason);
      if (review.isViolating) {
        failure.isBlinded = true;
      }
    }

    return { isBlinded: failure.isBlinded, reportCount: failure.reportCount };
  }

  async getMyFailures(deviceId: string): Promise<Failure[]> {
    await this.init();
    const my = Array.from(this.failures.values()).filter((f) => f.deviceId === deviceId);
    my.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return my.map((f) => this.enrichWithUserReactions(f, deviceId));
  }

  private enrichWithUserReactions(failure: Failure, deviceId?: string): Failure {
    if (!deviceId) return { ...failure, userReactions: [] };
    const userKey = `${failure.id}:${deviceId}`;
    const userSet = this.userReactions.get(userKey);
    return {
      ...failure,
      userReactions: userSet ? Array.from(userSet) : [],
    };
  }

  private mapDbRow(row: any, deviceId?: string): Failure {
    const failure: Failure = {
      id: row.id,
      deviceId: row.device_id,
      content: row.content,
      category: row.category,
      tags: row.tags || [],
      aiComfortQuote: row.ai_comfort_quote,
      reactions: row.reactions || { comfort: 0, relate: 0, kick: 0, cheer: 0 },
      reportCount: row.report_count || 0,
      isBlinded: row.is_blinded || false,
      isSeed: row.is_seed || false,
      createdAt: row.created_at,
    };
    return this.enrichWithUserReactions(failure, deviceId);
  }
}

export const failureStore = new FailureStore();
