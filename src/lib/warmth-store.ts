import fs from 'fs/promises';
import path from 'path';

export interface WarmthRecord {
  id: string; // userId || deviceId || 'guest'
  lifetime: number;
  spendable: number;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const WARMTH_FILE = path.join(DATA_DIR, 'warmth.json');

class WarmthStore {
  private cache: Map<string, WarmthRecord> = new Map();
  private initialized = false;

  private async ensureInit(): Promise<void> {
    if (this.initialized) return;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const data = await fs.readFile(WARMTH_FILE, 'utf-8');
      const list: WarmthRecord[] = JSON.parse(data);
      if (Array.isArray(list)) {
        list.forEach((r) => this.cache.set(r.id, r));
      }
    } catch {
      // 파일 부재 시 빈 맵으로 시작
    }
    this.initialized = true;
  }

  private async persist(): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const list = Array.from(this.cache.values());
    const tmpPath = `${WARMTH_FILE}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
    await fs.writeFile(tmpPath, JSON.stringify(list, null, 2), 'utf-8');
    await fs.rename(tmpPath, WARMTH_FILE);
  }

  private getKey(userId?: string | null, deviceId?: string | null): string {
    return userId || deviceId || 'guest';
  }

  async getWarmth(userId?: string | null, deviceId?: string | null): Promise<{ lifetime: number; spendable: number }> {
    await this.ensureInit();
    const key = this.getKey(userId, deviceId);
    const rec = this.cache.get(key);
    if (!rec) {
      return { lifetime: 0, spendable: 0 };
    }
    return { lifetime: rec.lifetime, spendable: rec.spendable };
  }

  async addWarmth(
    userId?: string | null,
    deviceId?: string | null,
    amount: number = 1
  ): Promise<{ lifetime: number; spendable: number }> {
    await this.ensureInit();
    // 1회 최대 획득량 비정상 조작 방지 (최대 100)
    const safeAmount = Math.min(Math.max(1, Math.floor(amount)), 100);
    const key = this.getKey(userId, deviceId);

    const current = this.cache.get(key) || {
      id: key,
      lifetime: 0,
      spendable: 0,
      updatedAt: new Date().toISOString(),
    };

    current.lifetime += safeAmount;
    current.spendable += safeAmount;
    current.updatedAt = new Date().toISOString();

    this.cache.set(key, current);
    await this.persist();

    return { lifetime: current.lifetime, spendable: current.spendable };
  }

  async spendWarmth(
    userId?: string | null,
    deviceId?: string | null,
    amount: number = 1
  ): Promise<{ success: boolean; remaining: number }> {
    await this.ensureInit();
    const key = this.getKey(userId, deviceId);
    const current = this.cache.get(key);

    if (!current || current.spendable < amount) {
      return { success: false, remaining: current ? current.spendable : 0 };
    }

    current.spendable -= amount;
    current.updatedAt = new Date().toISOString();

    this.cache.set(key, current);
    await this.persist();

    return { success: true, remaining: current.spendable };
  }

  async syncFromClient(
    userId?: string | null,
    deviceId?: string | null,
    clientLifetime: number = 0,
    clientSpendable: number = 0
  ): Promise<{ lifetime: number; spendable: number }> {
    await this.ensureInit();
    const key = this.getKey(userId, deviceId);
    const server = this.cache.get(key);

    if (!server) {
      // 서버에 아직 기록이 없으면 클라이언트 정당 획득분 초기 등록 (최대 5000 상한 제한)
      const safeLifetime = Math.min(Math.max(0, Math.floor(clientLifetime)), 5000);
      const safeSpendable = Math.min(Math.max(0, Math.floor(clientSpendable)), safeLifetime);
      const newRec: WarmthRecord = {
        id: key,
        lifetime: safeLifetime,
        spendable: safeSpendable,
        updatedAt: new Date().toISOString(),
      };
      this.cache.set(key, newRec);
      await this.persist();
      return { lifetime: safeLifetime, spendable: safeSpendable };
    }

    // 서버에 이미 기록이 있다면 더 큰 lifetime을 존중하되, 비정상적 점프 방지
    const resolvedLifetime = Math.max(server.lifetime, Math.min(clientLifetime, server.lifetime + 100));
    const resolvedSpendable = Math.max(server.spendable, Math.min(clientSpendable, resolvedLifetime));

    server.lifetime = resolvedLifetime;
    server.spendable = resolvedSpendable;
    server.updatedAt = new Date().toISOString();

    this.cache.set(key, server);
    await this.persist();

    return { lifetime: server.lifetime, spendable: server.spendable };
  }
}

export const warmthStore = new WarmthStore();
