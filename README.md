# 🌙 LogMate (로그메이트)
> **"오늘 당신의 실패를 공유하세요. 실패를 털어놓을 가장 다정한 친구, LogMate"**

익명의 사용자들이 오늘의 실패를 털어놓으면, AI가 실패의 의미를 분석하고 그룹지어 **비슷한 실패를 경험한 사람들의 수와 위로를 연결해 주는 감성 웰니스 커뮤니티 서비스**입니다.

---

## ✨ 핵심 기능

1. **100% 무가입 익명 작성 (Frictionless)**
   - 회원가입 없이 브라우저 로컬 식별자(`deviceId`)를 통해 즉시 실패를 털어놓을 수 있습니다.
   - 우측 상단 **[내 기록]**을 통해 내가 작성한 실패와 이웃들에게 받은 총 응원 횟수를 확인할 수 있습니다.

2. **실시간 AI 의미적 유사도 매칭 (Semantic Similarity Matching)**
   - 글 작성 즉시 벡터 임베딩을 생성하여 오늘 등록된 실패 중 가장 유사한 사연들을 찾습니다.
   - **"오늘 당신과 비슷한 실패를 겪은 사람은 N명입니다"** 통계 모달과 함께 AI의 따뜻한 공감 한마디를 건넵니다.

3. **새벽 03:00 (KST) 일일 리셋 주기**
   - 늦은 밤 감정을 털어놓는 사용자의 생활 패턴을 반영하여, 자정이 아닌 **매일 새벽 3시**를 기준으로 '오늘의 실패' 통계를 롤링 집계합니다.

4. **2차 가해 없는 '이모지 전용 리액션'**
   - 훈수, 악플을 원천 차단하기 위해 댓글 기능을 제한하고 4가지 따뜻한 이모지 버튼만 지원합니다:
     - `🫂 토닥토닥`
     - `🥲 나도 그래`
     - `🛌 이불킥 방지`
     - `🍀 내일은 성공`

5. **안전 가이드 & AI 자동 모더레이션 (신고 시스템)**
   - 사전 가이드라인 안내 및 유저 신고 3건 누적 시 Gemini AI가 유해성을 판정하여 자동 비공개(블라인드) 처리합니다.

---

## 🛠️ 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React
- **Backend & API**: Next.js Route Handlers (`/api/failures`, `/api/reactions`, `/api/reports`, `/api/stats`)
- **Database**: Supabase (PostgreSQL + `pgvector` 확장) / 로컬 인메모리 스토어 폴백
- **AI Engine**: Google Gemini API (`text-embedding-004`, `gemini-2.5-flash`) / 로컬 시맨틱 벡터 엔진 내장

---

## 🚀 빠른 시작 가이드

### 1. 의존성 설치 및 실행
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드 및 실행
npm run build
npm start
```
브라우저에서 `http://localhost:3000`으로 접속하여 즉시 테스트할 수 있습니다.

### 2. 환경변수 설정 (`.env.local`)
API 키 없이도 내장된 시맨틱 해시 벡터와 시드 데이터를 통해 100% 정상 작동합니다.  
실제 배포 환경 연결 시 `.env.example`을 복사하여 `.env.local`을 생성하고 키를 입력하세요:

```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Supabase DB 설정
`schema.sql`의 SQL 쿼리를 Supabase 대시보드의 **SQL Editor**에 붙여넣어 실행하면 테이블과 벡터 인덱스가 한 번에 생성됩니다.
