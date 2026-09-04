export type CategoryType =
  | '전체'
  | '일상/실수'
  | '업무/취업'
  | '공부/시험'
  | '연애/인간관계'
  | '건강/다이어트'
  | '소비/재테크'
  | '기타';

export type ReactionType = 'comfort' | 'relate' | 'kick' | 'cheer';

export interface ReactionCounts {
  comfort: number; // 토닥토닥 🫂
  relate: number;  // 나도 그래 🥲
  kick: number;    // 이불킥 방지 🛌
  cheer: number;   // 내일은 성공 🍀
}

export interface User {
  id: string;
  email?: string;
  nickname: string;
  provider: 'kakao' | 'google' | 'email' | 'guest';
  createdAt: string;
}

export interface ComfortNote {
  id: string;
  failureId: string;
  targetUserId?: string;
  fromNickname: string;
  message: string;
  createdAt: string;
}

export interface Failure {
  id: string;
  deviceId: string;
  userId?: string;
  authorNickname?: string;
  content: string;
  category: CategoryType;
  tags: string[];
  aiComfortQuote: string;
  aiPeerStory?: string; // AI 생성 공감 에피소드
  embedding?: number[];
  reactions: ReactionCounts;
  userReactions?: ReactionType[];
  reportCount: number;
  isBlinded: boolean;
  isSeed?: boolean;
  isOvercome?: boolean; // 극복 완료 여부 🌟
  isAiGenerated?: boolean; // AI 가상 이웃 사연 여부
  createdAt: string; // ISO 8601
  similarityScore?: number; // 0.0 ~ 1.0 (유사도 검색 시)
}

export interface CreateFailureRequest {
  content: string;
  deviceId: string;
  userId?: string;
  authorNickname?: string;
}

export interface CreateFailureResponse {
  failure: Failure;
  similarCount: number;
  similarFailures: Failure[];
  categoryCount: number;
  aiMessage: string;
  aiPeerStory?: Failure;
}

export interface ReactionRequest {
  failureId: string;
  deviceId: string;
  reactionType: ReactionType;
}

export interface ReportRequest {
  failureId: string;
  deviceId: string;
  reason: string;
}
