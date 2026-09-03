# 🌙 LogMate (로그메이트)
> **"오늘 당신의 실패를 공유하세요. 실패를 털어놓을 가장 다정한 친구, LogMate"**

익명의 사용자들이 오늘의 실패를 털어놓으면, 자체 구축 AI가 실패의 의미를 분석하여 **나와 가장 비슷한 실패를 경험한 친구들의 사연을 숏츠(스토리) 형태로 연결해 주는 감성 웰니스 커뮤니티 서비스**입니다.

---

## ✨ 핵심 기능

1. **1일 1회 데일리 실패 리추얼 (`DailyRitualGate`)**
   - 오늘 하루 겪었던 실패를 솔직하게 고백해야 다른 사람들의 사연이 열립니다.
   - 매일 새벽 3시(KST)에 리셋되어 하루의 스트레스와 자책을 편안하게 털어내는 수면 루틴을 형성합니다.

2. **나와 가장 닮은 사연 3종 우선 노출 & 숏츠 피드 (`FailureShortsFeed`)**
   - 실패를 등록하는 즉시 AI가 코사인 유사도를 계산하여 **가장 닮은 사연 1위, 2위, 3위(공감도 % 표시)**를 최우선으로 연속 재생합니다.
   - 인스타그램 스토리처럼 좌/우 탭으로 이동하고, 화면을 꾹 누르면 일시정지됩니다.
   - `[ 📋 3종 모아보기 ]` 드로어를 통해 한눈에 비교 열람할 수 있습니다.

3. **서버 자체 구축 AI 엔진 (Zero API Cost)**
   - 외부 유료 API 없이 서버 내부 Ollama (`all-minilm` 임베딩 + `qwen2.5:1.5b` 한국어 SLM)로 **실패 분류, 태그 추출, 위로 멘트, 벡터 유사도 계산을 100% 자체 구동**합니다. (외부 API 비용 0원)
   - 클라우드 Gemini 2.5 Flash 및 룰베이스 알고리즘의 이중 하이브리드 백업 지원.

4. **사용자 체류 시간 극대화 장치 (Dwell-time Enhancers)**
   - **🎧 내장 앰비언트 사운드 (ASMR)**: 브라우저 Web Audio API로 실시간 합성되는 편안한 빗소리(🌧️)와 타닥타닥 모닥불(🔥) 소리.
   - **💌 1초 익명 온기 쪽지**: 이모지를 넘어 사연자에게 따뜻한 한 줄 위로 편지를 전달하고, '내 서재'에 차곡차곡 보관.
   - **📅 달빛 캘린더 & 극복 스탬프**: 매일 밤 실패를 기록한 날(🌙)과 시간이 지나 웃어넘기게 된 날(🌟 극복 완료)을 한눈에 시각화.

5. **자연스러운 수익화 모델 (Freemium & In-Feed Ads)**
   - 유사 사연 3종 열람 후 5초 스폰서 광고 자동 재생.
   - 광고 없는 무제한 열람을 위한 1일권(500원) 및 월간 패스(2,900원) 결제 모달.

6. **2차 가해 없는 청정 커뮤니티**
   - 악플과 훈수를 방지하기 위해 텍스트 댓글을 제한하고, 4가지 따뜻한 이모지 리액션(`토닥토닥 🫂`, `나도 그래 🥲`, `이불킥 방지 🛌`, `내일은 성공 🍀`) 지원.
   - 신고 3회 누적 시 AI 자동 모더레이션 블라인드.

---

## 🛠️ 기술 스택

- **Frontend**: Next.js 16 (App Router, Standalone), React 19, Tailwind CSS v4, Lucide React
- **Design System**: 21st.dev 영감의 앰비언트 글로우, 도트 매트릭스, 글래스모피즘, 100dvh 반응형 모바일 셸
- **Local AI Runtime**: Ollama (`qwen2.5:1.5b`, `all-minilm`)
- **Audio DSP**: Web Audio API Procedural Synthesizer (Pink Noise + Resonant Biquad Filter)
- **Deployment**: Docker, Docker Compose, Standalone Next.js runner (~120MB)

---

## 🚀 빠른 배포 및 실행 가이드

### 1. Docker Compose 원클릭 실행 (가장 추천)
```bash
# 레포지토리 클론
git clone https://github.com/kidkio/logmate.git
cd logmate

# 프로덕션 환경 변수 복사
cp .env.production.example .env.production

# 컨테이너 빌드 & 백그라운드 실행
docker compose up -d --build
```
실행 후 `http://localhost:3000`으로 접속하시면 즉시 모든 기능을 사용하실 수 있습니다!

### 2. 로컬 개발 환경 실행
```bash
npm install
npm run build
npm start
```

---

## 📄 라이선스
MIT License
