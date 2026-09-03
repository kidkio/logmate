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

export interface Failure {
  id: string;
  deviceId: string;
  content: string;
  category: CategoryType;
  tags: string[];
  aiComfortQuote: string;
  embedding?: number[];
  reactions: ReactionCounts;
  userReactions?: ReactionType[];
  reportCount: number;
  isBlinded: boolean;
  isSeed?: boolean;
  createdAt: string; // ISO 8601
  similarityScore?: number; // 0.0 ~ 1.0 (유사도 검색 시)
}

export interface CreateFailureRequest {
  content: string;
  deviceId: string;
}

export interface CreateFailureResponse {
  failure: Failure;
  similarCount: number;
  similarFailures: Failure[];
  categoryCount: number;
  aiMessage: string;
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
