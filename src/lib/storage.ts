import { Failure, CategoryType, ReactionType, ReactionCounts, ComfortNote } from '@/types';
import { reviewModerationAI } from './gemini';
import { calculateKoreanSimilarity, SIMILARITY_MATCH_THRESHOLD } from './koreanSimilarity';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const FAILURES_DATA_PATH = path.join(process.cwd(), 'data', 'failures.json');
const NOTES_DATA_PATH = path.join(process.cwd(), 'data', 'notes.json');

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

// 사연 소유권 판별 (게스트와 정식 회원 계정 간의 사연 유출 철저 차단 및 작성자 본인 식별)
export function isFailureOwnedBy(f: Failure, deviceId?: string, userId?: string): boolean {
  if (userId) {
    // 회원 사용자의 경우: 오직 본인의 userId와 일치하는 글만 본인 소유로 판별
    return Boolean(f.userId && f.userId === userId);
  }
  if (deviceId) {
    // 비로그인 게스트의 경우: 회원에게 귀속되지 않은 순수 게스트 글(!f.userId) 중 기기 식별자가 일치하는 글만 판별
    return Boolean(!f.userId && f.deviceId && f.deviceId === deviceId);
  }
  return false;
}

// In-Memory 캐시 및 영구 JSON 파일 저장소
class FailureStore {
  private failures: Map<string, Failure> = new Map();
  private userReactions: Map<string, Set<ReactionType>> = new Map(); // key: `${failureId}:${deviceId}`
  private userReports: Set<string> = new Set(); // key: `${failureId}:${deviceId}`
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // 영구 JSON 파일에서 실제 사용자 사연 불러오기 (더미 시드 데이터 완전 제거)
    try {
      const raw = await fs.readFile(FAILURES_DATA_PATH, 'utf-8');
      const list: Failure[] = JSON.parse(raw);
      for (const item of list) {
        if (!item.isSeed && !item.id.startsWith('seed-')) {
          this.failures.set(item.id, item);
        }
      }
    } catch {
      // 파일이 없으면 깨끗한 빈 저장소로 시작
    }

    try {
      const notesRaw = await fs.readFile(NOTES_DATA_PATH, 'utf-8');
      this.comfortNotes = JSON.parse(notesRaw);
    } catch {}

    // Supabase 연동 시 원격 데이터 동기화
    if (supabase) {
      try {
        const { data, error } = await supabase.from('failures').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          for (const row of data) {
            const f = this.mapDbRow(row as Record<string, unknown>);
            if (!f.isSeed && !f.id.startsWith('seed-')) {
              this.failures.set(f.id, f);
            }
          }
        }
      } catch (err) {
        console.warn('Supabase initial failures fetch failed:', err);
      }

      try {
        const { data: notesData, error: notesError } = await supabase.from('comfort_notes').select('*').order('created_at', { ascending: false });
        if (!notesError && notesData && notesData.length > 0) {
          this.comfortNotes = notesData.map((row: Record<string, unknown>) => ({
            id: String(row.id),
            failureId: String(row.failure_id),
            targetUserId: row.target_user_id ? String(row.target_user_id) : undefined,
            fromNickname: String(row.from_nickname),
            message: String(row.message),
            createdAt: String(row.created_at),
          }));
        }
      } catch (err) {
        console.warn('Supabase initial notes fetch failed:', err);
      }
    }
  }

  private async persistFailures(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(FAILURES_DATA_PATH), { recursive: true });
      const list = Array.from(this.failures.values()).filter((f) => !f.isSeed && !f.id.startsWith('seed-'));
      const tmpPath = `${FAILURES_DATA_PATH}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
      await fs.writeFile(tmpPath, JSON.stringify(list, null, 2), 'utf-8');
      await fs.rename(tmpPath, FAILURES_DATA_PATH);
    } catch (e) {
      console.error('Failed to persist failures:', e);
    }
  }

  private async persistNotes(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(NOTES_DATA_PATH), { recursive: true });
      const tmpPath = `${NOTES_DATA_PATH}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
      await fs.writeFile(tmpPath, JSON.stringify(this.comfortNotes, null, 2), 'utf-8');
      await fs.rename(tmpPath, NOTES_DATA_PATH);
    } catch (e) {
      console.error('Failed to persist notes:', e);
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
          return data.map((d: Record<string, unknown>) => this.mapDbRow(d, deviceId));
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

  async getTodaysFailure(deviceId: string, userId?: string): Promise<Failure | null> {
    await this.init();
    const cutoff = getToday3AMKSTCutoff();
    const my = Array.from(this.failures.values()).filter((f) => {
      if (f.isBlinded) return false;
      if (new Date(f.createdAt) < cutoff) return false;
      return isFailureOwnedBy(f, deviceId, userId);
    });
    if (my.length === 0) return null;
    my.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return this.enrichWithUserReactions(my[0], deviceId);
  }

  async create(failureData: Omit<Failure, 'id' | 'reactions' | 'reportCount' | 'isBlinded' | 'createdAt'>): Promise<Failure> {
    await this.init();

    // 1일 1회 작성 제한 (새벽 3시 KST 기준 - deviceId 및 userId 복합 확인)
    const existing = await this.getTodaysFailure(failureData.deviceId, failureData.userId);
    if (existing) {
      const err = Object.assign(
        new Error('오늘은 이미 실패를 공유하셨습니다. 매일 새벽 3시에 새로운 실패를 털어놓으실 수 있어요!'),
        { existingFailure: existing, code: 'LIMIT_EXCEEDED' }
      );
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
          user_id: newFailure.userId || null,
          device_id: newFailure.deviceId,
          author_nickname: newFailure.authorNickname || null,
          content: newFailure.content,
          category: newFailure.category,
          tags: newFailure.tags,
          ai_comfort_quote: newFailure.aiComfortQuote || null,
          ai_peer_story: newFailure.aiPeerStory || null,
          embedding: newFailure.embedding || null,
          reactions: newFailure.reactions,
          report_count: 0,
          is_overcome: false,
          is_blinded: false,
          is_seed: false,
        });
      } catch (err) {
        console.warn('Supabase insert failed, fallback to memory:', err);
      }
    }

    this.failures.set(id, newFailure);
    await this.persistFailures();
    return newFailure;
  }

  // 실시간 유사 실패 매칭 (한국어 특화 하이브리드 엔진)
  async findSimilar(targetFailure: Failure): Promise<{
    similarCount: number;
    similarFailures: Failure[];
    categoryCount: number;
    aiPeerStory?: Failure;
  }> {
    await this.init();
    const cutoff = getToday3AMKSTCutoff();
    const all = Array.from(this.failures.values()).filter(
      (f) =>
        !f.isBlinded &&
        f.id !== targetFailure.id &&
        !isFailureOwnedBy(f, targetFailure.deviceId, targetFailure.userId)
    );

    // 새벽 3시 이후 글 우선 필터링
    let todaysFailures = all.filter((f) => new Date(f.createdAt) >= cutoff);
    if (todaysFailures.length < 3) {
      // 오늘 등록된 글이 적을 때(콜드 스타트)는 전체 DB 사연 포함
      todaysFailures = all;
    }

    // 동일 카테고리 오늘 등록 인원 수
    const categoryCount = todaysFailures.filter((f) => f.category === targetFailure.category).length;

    // 한국어 형태소/키워드 Jaccard + 카테고리 가중치 유사도 점수 계산
    const scored = todaysFailures.map((f) => {
      const score = calculateKoreanSimilarity(
        targetFailure.category,
        targetFailure.content,
        targetFailure.tags || [],
        f.category,
        f.content,
        f.tags || []
      );
      return { failure: f, score };
    });

    // 유사도 내림차순 정렬
    scored.sort((a, b) => b.score - a.score);

    // 의미적으로 진짜 유사하다고 볼 기준 점수 (>= 0.42)
    const matched = scored.filter((item) => item.score >= SIMILARITY_MATCH_THRESHOLD);

    let topSimilar: Failure[] = [];
    let aiPeerStory: Failure | undefined = undefined;
    let similarCount = 0;

    if (matched.length > 0) {
      // 실제 유사 사연이 존재하는 경우: 상위 최대 4개 추출
      similarCount = matched.length;
      topSimilar = matched.slice(0, 4).map((item) => ({
        ...this.enrichWithUserReactions(item.failure, targetFailure.deviceId),
        similarityScore: Math.round(item.score * 100),
      }));
    } else {
      // 실제 유사 사연이 없는 경우 (콜드 스타트):
      // 엉뚱한 글을 노출하지 않고, AI 맞춤 공감 에피소드를 제공
      if (targetFailure.aiPeerStory) {
        aiPeerStory = {
          id: `ai-peer-${targetFailure.id}`,
          deviceId: 'ai-neighbor',
          authorNickname: '비슷한 일을 겪은 익명의 이웃 🌿',
          content: targetFailure.aiPeerStory,
          category: targetFailure.category,
          tags: targetFailure.tags || ['공감', '토닥토닥'],
          aiComfortQuote: '이웃의 따뜻한 공감 이야기',
          reactions: { comfort: 3, relate: 2, kick: 0, cheer: 1 },
          reportCount: 0,
          isBlinded: false,
          isAiGenerated: true,
          createdAt: new Date().toISOString(),
          similarityScore: 98,
        };
        similarCount = 1;
      }
    }

    return {
      similarCount,
      similarFailures: topSimilar,
      categoryCount,
      aiPeerStory,
    };
  }

  async getFailure(failureId: string): Promise<Failure | undefined> {
    await this.init();
    return this.failures.get(failureId);
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

    await this.persistFailures();
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

    await this.persistFailures();
    return { isBlinded: failure.isBlinded, reportCount: failure.reportCount };
  }

  async getMyFailures(deviceId: string, userId?: string): Promise<Failure[]> {
    await this.init();
    const my = Array.from(this.failures.values()).filter((f) => {
      return isFailureOwnedBy(f, deviceId, userId);
    });
    my.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return my.map((f) => this.enrichWithUserReactions(f, deviceId));
  }

  // 익명 온기 쪽지 저장소
  private comfortNotes: ComfortNote[] = [];

  async addComfortNote(data: {
    failureId: string;
    targetUserId?: string;
    fromNickname: string;
    message: string;
  }): Promise<ComfortNote> {
    await this.init();
    const note: ComfortNote = {
      id: 'note-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      failureId: data.failureId,
      targetUserId: data.targetUserId,
      fromNickname: data.fromNickname,
      message: data.message.trim(),
      createdAt: new Date().toISOString(),
    };
    this.comfortNotes.unshift(note);
    if (supabase) {
      try {
        await supabase.from('comfort_notes').insert({
          id: note.id,
          failure_id: note.failureId,
          target_user_id: note.targetUserId || null,
          from_nickname: note.fromNickname,
          message: note.message,
          created_at: note.createdAt,
        });
      } catch (err) {
        console.warn('Supabase note insert failed:', err);
      }
    }
    await this.persistNotes();
    return note;
  }

  async getComfortNotesForUser(userId: string): Promise<ComfortNote[]> {
    await this.init();
    const userFailureIds = new Set(
      Array.from(this.failures.values())
        .filter((f) => f.userId === userId || f.deviceId === userId)
        .map((f) => f.id)
    );
    return this.comfortNotes.filter(
      (n) => (n.targetUserId && n.targetUserId === userId) || userFailureIds.has(n.failureId)
    );
  }

  async toggleOvercome(failureId: string): Promise<Failure> {
    await this.init();
    const failure = this.failures.get(failureId);
    if (!failure) throw new Error('Failure not found');
    failure.isOvercome = !failure.isOvercome;
    if (supabase) {
      try {
        await supabase.from('failures').update({ is_overcome: failure.isOvercome }).eq('id', failureId);
      } catch (err) {
        console.warn('Supabase toggleOvercome update failed:', err);
      }
    }
    await this.persistFailures();
    return failure;
  }

  // 회원 탈퇴 및 게스트 데이터 정리 시 작성 사연 및 온기 쪽지 안전 파기
  async deleteUserData(userId?: string, deviceId?: string): Promise<void> {
    await this.init();
    const toDeleteIds: string[] = [];

    for (const [id, f] of this.failures.entries()) {
      if (userId) {
        // 회원 탈퇴: 해당 회원의 사연만 삭제
        if (f.userId === userId) {
          toDeleteIds.push(id);
        }
      } else if (deviceId) {
        // 게스트 정리: 회원 소유가 아닌 해당 기기의 게스트 사연만 삭제
        if (!f.userId && f.deviceId === deviceId) {
          toDeleteIds.push(id);
        }
      }
    }

    toDeleteIds.forEach((id) => this.failures.delete(id));
    await this.persistFailures();

    // 관련 온기 쪽지 영구 파기 (해당 회원 대상 쪽지 및 삭제된 사연에 달린 쪽지 제거)
    const deletedIdSet = new Set(toDeleteIds);
    this.comfortNotes = this.comfortNotes.filter((n) => {
      if (userId && n.targetUserId === userId) return false;
      if (deletedIdSet.has(n.failureId)) return false;
      return true;
    });
    await this.persistNotes();

    // Supabase 연동 환경인 경우 DB 레코드도 함께 삭제
    if (supabase) {
      try {
        if (userId) {
          await supabase.from('failures').delete().eq('user_id', userId);
          await supabase.from('comfort_notes').delete().eq('target_user_id', userId);
        } else if (deviceId) {
          await supabase.from('failures').delete().eq('device_id', deviceId).is('user_id', null);
        }
      } catch (e) {
        console.warn('Supabase delete failed:', e);
      }
    }
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

  private mapDbRow(row: Record<string, unknown>, deviceId?: string): Failure {
    const failure: Failure = {
      id: String(row.id || ''),
      deviceId: String(row.device_id || ''),
      userId: row.user_id ? String(row.user_id) : undefined,
      authorNickname: row.author_nickname ? String(row.author_nickname) : undefined,
      content: String(row.content || ''),
      category: (row.category as CategoryType) || '기타',
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
      aiComfortQuote: String(row.ai_comfort_quote || '괜찮아요, 내일은 더 잘 될 거예요.'),
      aiPeerStory: row.ai_peer_story ? String(row.ai_peer_story) : undefined,
      reactions: (row.reactions as ReactionCounts) || { comfort: 0, relate: 0, kick: 0, cheer: 0 },
      reportCount: typeof row.report_count === 'number' ? row.report_count : 0,
      isBlinded: Boolean(row.is_blinded),
      isSeed: Boolean(row.is_seed),
      isOvercome: Boolean(row.is_overcome),
      createdAt: String(row.created_at || new Date().toISOString()),
    };
    return this.enrichWithUserReactions(failure, deviceId);
  }
}

export const failureStore = new FailureStore();

