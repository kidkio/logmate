import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  nickname: string;
  provider: 'email' | 'kakao' | 'google';
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

const ADJECTIVES = [
  '이불킥하는', '토닥이는', '서투른', '야근하는', '밤샘하는', '용감한',
  '작심삼일', '따뜻한', '덤벙대는', '길잃은', '꿈꾸는', '쉬어가는',
  '달빛품은', '지친하루의', '새벽감성', '고민많은', '별빛따라', '토닥토닥',
  '마음여린', '꿋꿋한', '느긋한', '잠못드는'
];
const NOUNS = [
  '펭귄', '쿼카', '다람쥐', '고양이', '햄스터', '수달',
  '곰돌이', '판다', '참새', '토끼', '고슴도치', '강아지',
  '부엉이', '알파카', '물범', '아기사슴', '코알라', '미어캣'
];

export function generateAnonymousNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj} ${noun} #${num}`;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch {
    return false;
  }
}

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify([]), 'utf-8');
  }
  try {
    await fs.access(SESSIONS_FILE);
  } catch {
    await fs.writeFile(SESSIONS_FILE, JSON.stringify([]), 'utf-8');
  }
}

async function readUsers(): Promise<UserRecord[]> {
  await ensureFiles();
  const raw = await fs.readFile(USERS_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeUsers(users: UserRecord[]): Promise<void> {
  await ensureFiles();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

async function readSessions(): Promise<SessionRecord[]> {
  await ensureFiles();
  const raw = await fs.readFile(SESSIONS_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeSessions(sessions: SessionRecord[]): Promise<void> {
  await ensureFiles();
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const users = await readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) || null;
}

export async function createUser(
  email: string,
  password: string,
  nickname?: string,
  provider: 'email' | 'kakao' | 'google' = 'email'
): Promise<UserRecord> {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error('이미 등록된 이메일 주소입니다.');
  }

  const { hash, salt } = hashPassword(password);
  const newUser: UserRecord = {
    id: 'usr_' + Date.now().toString(36) + '_' + crypto.randomBytes(4).toString('hex'),
    email: email.toLowerCase().trim(),
    passwordHash: hash,
    salt,
    nickname: generateAnonymousNickname(),
    provider,
    createdAt: new Date().toISOString(),
  };

  const users = await readUsers();
  users.push(newUser);
  await writeUsers(users);

  return newUser;
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(); // 30일 유효

  const sessions = await readSessions();
  // 1인 다중 기기 세션 지원 (오래된 만료 세션은 정리)
  const now = new Date();
  const valid = sessions.filter((s) => new Date(s.expiresAt) > now);
  valid.push({ token, userId, expiresAt });
  await writeSessions(valid);

  return token;
}

export async function getUserBySession(token: string): Promise<UserRecord | null> {
  if (!token) return null;
  const sessions = await readSessions();
  const now = new Date();
  const found = sessions.find((s) => s.token === token && new Date(s.expiresAt) > now);
  if (!found) return null;

  return getUserById(found.userId);
}

export async function deleteSession(token: string): Promise<void> {
  const sessions = await readSessions();
  const filtered = sessions.filter((s) => s.token !== token);
  await writeSessions(filtered);
}
