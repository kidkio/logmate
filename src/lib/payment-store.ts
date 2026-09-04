import fs from 'fs/promises';
import path from 'path';

export interface PaymentOrder {
  orderId: string;
  paymentKey: string;
  amount: number;
  plan: 'day' | 'month' | 'lifetime';
  userId?: string;
  deviceId?: string;
  status: 'DONE' | 'CANCELED';
  expiresAt: string;
  purchasedAt: string;
  canceledAt?: string;
  cancelReason?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

class PaymentStore {
  private orders: Map<string, PaymentOrder> = new Map();
  private initialized = false;

  private async init() {
    if (this.initialized) return;
    this.initialized = true;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const raw = await fs.readFile(PAYMENTS_FILE, 'utf-8');
      const list: PaymentOrder[] = JSON.parse(raw);
      for (const order of list) {
        this.orders.set(order.orderId, order);
      }
    } catch {
      // 파일이 없으면 초기화 완료 후 빈 상태로 시작
    }
  }

  private async persist(): Promise<void> {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const list = Array.from(this.orders.values());
      const tmpPath = `${PAYMENTS_FILE}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
      await fs.writeFile(tmpPath, JSON.stringify(list, null, 2), 'utf-8');
      await fs.rename(tmpPath, PAYMENTS_FILE);
    } catch (e) {
      console.error('Failed to persist payments:', e);
    }
  }

  async saveOrder(order: PaymentOrder): Promise<void> {
    await this.init();
    this.orders.set(order.orderId, order);
    await this.persist();
  }

  async getOrderByPaymentKey(paymentKey: string): Promise<PaymentOrder | null> {
    await this.init();
    for (const order of this.orders.values()) {
      if (order.paymentKey === paymentKey) {
        return order;
      }
    }
    return null;
  }

  async getOrderByOrderId(orderId: string): Promise<PaymentOrder | null> {
    await this.init();
    return this.orders.get(orderId) || null;
  }

  async cancelOrder(paymentKey: string, reason: string): Promise<PaymentOrder | null> {
    await this.init();
    const order = await this.getOrderByPaymentKey(paymentKey);
    if (!order) return null;
    order.status = 'CANCELED';
    order.canceledAt = new Date().toISOString();
    order.cancelReason = reason;
    this.orders.set(order.orderId, order);
    await this.persist();
    return order;
  }
}

export const paymentStore = new PaymentStore();
