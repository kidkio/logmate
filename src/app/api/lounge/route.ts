import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getUserCount } from '@/lib/user-store';

interface WhisperItem {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  likes: number;
}

export interface WarmthEvent {
  id: string;
  nickname: string;
  amount: number;
  type: 'candle' | 'fever' | 'bonus' | 'milestone' | 'whisper';
  createdAt: string;
}

interface LoungeData {
  candleCount: number;
  whispers: WhisperItem[];
  recentEvents?: WarmthEvent[];
}

const DATA_PATH = path.join(process.cwd(), 'data', 'lounge.json');

const INITIAL_EVENTS: WarmthEvent[] = [
  { id: 'ev_1', nickname: '다정한 쿼카', amount: 1, type: 'candle', createdAt: new Date(Date.now() - 1000 * 30).toISOString() },
  { id: 'ev_2', nickname: '포근한 판다', amount: 3, type: 'fever', createdAt: new Date(Date.now() - 1000 * 85).toISOString() },
  { id: 'ev_3', nickname: '따뜻한 펭귄', amount: 1, type: 'candle', createdAt: new Date(Date.now() - 1000 * 140).toISOString() },
  { id: 'ev_4', nickname: '잠 못 드는 곰돌이', amount: 5, type: 'bonus', createdAt: new Date(Date.now() - 1000 * 220).toISOString() },
];

const INITIAL_WHISPERS: WhisperItem[] = [
  { id: 'w1', text: '오늘 하루도 다들 버티느라 고생 많았어요 🌙', author: '따뜻한 펭귄', createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), likes: 24 },
  { id: 'w2', text: '내일은 오늘보다 조금만 더 가볍길', author: '서투른 쿼카', createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), likes: 19 },
  { id: 'w3', text: '자책하지 마세요. 우리 모두 처음 살아보는 오늘이잖아요', author: '밤샘하는 다람쥐', createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(), likes: 38 },
  { id: 'w4', text: '빗소리 들으면서 눈 감아봅니다. 좋은 꿈 꿔요', author: '잠 못 드는 곰돌이', createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(), likes: 15 },
];

async function getLoungeData(): Promise<LoungeData> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.recentEvents || parsed.recentEvents.length === 0) {
      parsed.recentEvents = INITIAL_EVENTS;
    }
    return parsed;
  } catch {
    const initial: LoungeData = {
      candleCount: 1240,
      whispers: INITIAL_WHISPERS,
      recentEvents: INITIAL_EVENTS,
    };
    try {
      await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
      await fs.writeFile(DATA_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    } catch {}
    return initial;
  }
}

async function saveLoungeData(data: LoungeData): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save lounge data:', e);
  }
}

// 실시간 접속자 세션 메모리 풀 (최근 45초 이내 핑/하트비트 유지)
const activePresenceMap = new Map<string, number>();

function recordPresence(req: NextRequest, clientKey?: string): number {
  const now = Date.now();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const id = clientKey || ip;
  activePresenceMap.set(id, now);

  // 45초 이상 경과한 세션 자동 만료
  for (const [key, ts] of activePresenceMap.entries()) {
    if (now - ts > 45 * 1000) {
      activePresenceMap.delete(key);
    }
  }

  return Math.max(1, activePresenceMap.size);
}

// 회원수와 동시 접속자 수에 비례하여 적절히 상향 조절되는 은하수 마일스톤 목표 산출
export function calculateMilestoneGoal(memberCount: number, activeCount: number): number {
  const effectiveMembers = Math.max(memberCount, 12);
  const base = 2500;
  const memberAddition = effectiveMembers * 60;
  const activeAddition = activeCount * 80;
  const raw = base + memberAddition + activeAddition;
  return Math.max(2500, Math.ceil(raw / 100) * 100);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get('deviceId') || undefined;
  const activeCount = recordPresence(req, deviceId);
  const memberCount = await getUserCount();
  const milestoneGoal = calculateMilestoneGoal(memberCount, activeCount);

  const data = await getLoungeData();
  return NextResponse.json({
    success: true,
    candleCount: data.candleCount,
    activeCount,
    memberCount,
    milestoneGoal,
    whispers: data.whispers,
    recentEvents: data.recentEvents || [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const activeCount = recordPresence(req, body.deviceId);
    const memberCount = await getUserCount();
    const milestoneGoal = calculateMilestoneGoal(memberCount, activeCount);
    const data = await getLoungeData();

    if (body.action === 'heartbeat') {
      return NextResponse.json({ 
        success: true, 
        activeCount, 
        memberCount,
        milestoneGoal,
        candleCount: data.candleCount,
        recentEvents: data.recentEvents || [],
      });
    }

    if (body.action === 'candle') {
      const amount = typeof body.amount === 'number' && body.amount > 0 ? body.amount : 1;
      data.candleCount += amount;

      const nickname = (body.nickname || '어느 이웃').trim();
      const eventType = body.isFever ? 'fever' : (body.isBonus ? 'bonus' : 'candle');
      const newEvent: WarmthEvent = {
        id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        nickname,
        amount,
        type: eventType,
        createdAt: new Date().toISOString(),
      };
      if (!data.recentEvents) data.recentEvents = [];
      data.recentEvents.unshift(newEvent);
      if (data.recentEvents.length > 20) {
        data.recentEvents = data.recentEvents.slice(0, 20);
      }

      await saveLoungeData(data);
      return NextResponse.json({ 
        success: true, 
        candleCount: data.candleCount, 
        activeCount,
        recentEvents: data.recentEvents,
      });
    }

    if (body.action === 'whisper') {
      const text = (body.text || '').trim();
      if (!text || text.length < 2) {
        return NextResponse.json({ success: false, error: '한 줄 소망은 최소 2자 이상 적어주세요.' }, { status: 400 });
      }
      if (text.length > 50) {
        return NextResponse.json({ success: false, error: '소망은 50자 이하로 적어주세요.' }, { status: 400 });
      }

      const authorName = body.nickname || '어느 밤의 이웃';
      const newWhisper: WhisperItem = {
        id: `wh_${Date.now().toString(36)}`,
        text,
        author: authorName,
        createdAt: new Date().toISOString(),
        likes: 1,
      };

      data.whispers.unshift(newWhisper);
      if (data.whispers.length > 50) {
        data.whispers = data.whispers.slice(0, 50);
      }

      if (!data.recentEvents) data.recentEvents = [];
      data.recentEvents.unshift({
        id: `ev_wh_${Date.now()}`,
        nickname: authorName,
        amount: 1,
        type: 'whisper',
        createdAt: new Date().toISOString(),
      });
      if (data.recentEvents.length > 20) {
        data.recentEvents = data.recentEvents.slice(0, 20);
      }

      await saveLoungeData(data);
      return NextResponse.json({ 
        success: true, 
        whisper: newWhisper, 
        whispers: data.whispers,
        recentEvents: data.recentEvents,
      });
    }

    if (body.action === 'like') {
      const item = data.whispers.find((w) => w.id === body.whisperId);
      if (item) {
        item.likes += 1;
        await saveLoungeData(data);
      }
      return NextResponse.json({ success: true, whispers: data.whispers });
    }

    return NextResponse.json({ success: false, error: '잘못된 액션입니다.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
