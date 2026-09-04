import { GoogleGenAI } from '@google/genai';
import { CategoryType } from '@/types';

// 로컬 자체 구축 AI (Ollama) 및 Gemini 클라우드 설정
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const LOCAL_EMBED_MODEL = process.env.LOCAL_EMBED_MODEL || 'all-minilm';
const LOCAL_LLM_MODEL = process.env.LOCAL_LLM_MODEL || 'qwen2.5:1.5b';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// 벡터 코사인 유사도 계산
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 텍스트 임베딩 생성 (1순위: 로컬 서버 자체 모델 -> 2순위: Gemini 클라우드 -> 3순위: 경량 해시 벡터)
export async function getEmbedding(text: string): Promise<number[]> {
  // 1. 서버 자체 구축 로컬 임베딩 (Ollama all-minilm: 비용 0원, 0.02초)
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: LOCAL_EMBED_MODEL, prompt: text }),
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.embedding && Array.isArray(data.embedding)) {
        return data.embedding;
      }
    }
  } catch (err) {
    // 로컬 임베딩 실패 시 다음 우선순위로 전환
  }

  // 2. Gemini 클라우드 API (키가 설정된 경우)
  if (ai) {
    try {
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
      const resAny = response as any;
      const values = resAny.embedding?.values || resAny.embeddings?.[0]?.values;
      if (values && Array.isArray(values)) {
        return values;
      }
    } catch (err) {
      console.warn('Gemini embedding failed, using local hash vectorizer:', err);
    }
  }

  // 3. 로컬 128차원 시맨틱 해시 벡터 (완전 무설치 폴백)
  return generateLocalVector(text, 128);
}

export interface FailureAnalysis {
  category: CategoryType;
  tags: string[];
  aiComfortQuote: string;
  aiPeerStory?: string;
  isHarmful: boolean;
}

// AI 실패 분석 및 사연별 1:1 맞춤 위로/공감 에피소드 생성
// (1순위: 초고속 Gemini 클라우드 -> 2순위: 로컬 서버 자체 SLM -> 3순위: 동적 키워드 기반 로컬 엔진)
export async function analyzeFailure(content: string): Promise<FailureAnalysis> {
  const systemPrompt = `
당신은 실패와 실수를 따뜻하게 보듬어주는 'LogMate'의 다정한 AI 심리 상담사이자 공감 이웃입니다.
사용자가 작성한 아래의 실패 경험을 깊이 공감하며 분석해주세요.

[사용자 사연]
"${content}"

다음 JSON 형식으로만 응답하세요:
{
  "category": "일상/실수" | "업무/취업" | "공부/시험" | "연애/인간관계" | "건강/다이어트" | "소비/재테크" | "기타",
  "tags": ["태그1", "태그2", "태그3"],
  "aiComfortQuote": "작성자의 구체적인 실수나 상황(예: 지각, 보고서, 야식, 불합격 등)을 직접 언급하며 위트와 온기로 토닥여주는 따뜻한 1~2문장의 맞춤형 위로",
  "aiPeerStory": "비슷한 실수를 겪었던 다정한 이웃의 입장에서 '저도 예전에...'로 시작하는 2~3문장의 짧고 따뜻한 공감 에피소드",
  "isHarmful": false
}
* 주의: 극단적 선택/자해, 심각한 범죄 모의 또는 실명 비방이 포함된 경우 isHarmful을 true로 설정하세요.
`;

  // 1. Gemini 클라우드 API (키가 설정된 경우 0.4초 만에 고품질 응답)
  if (ai) {
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(result.text || '{}');
      if (parsed.category && parsed.aiComfortQuote) {
        return {
          category: parsed.category as CategoryType,
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : ['실패', '극복'],
          aiComfortQuote: parsed.aiComfortQuote,
          aiPeerStory: parsed.aiPeerStory || undefined,
          isHarmful: Boolean(parsed.isHarmful),
        };
      }
    } catch (err) {
      console.warn('Gemini analysis failed, trying local Ollama:', err);
    }
  }

  // 2. 서버 자체 구축 로컬 경량 SLM (Ollama qwen2.5:1.5b: 비용 0원)
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LOCAL_LLM_MODEL,
        prompt: systemPrompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.75, num_predict: 160 },
      }),
      signal: AbortSignal.timeout(15000), // CPU 환경 고려 15초 확보
    });

    if (res.ok) {
      const data = await res.json();
      const parsed = JSON.parse(data.response || '{}');
      if (parsed.category && parsed.aiComfortQuote) {
        return {
          category: parsed.category as CategoryType,
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : ['실패', '극복'],
          aiComfortQuote: parsed.aiComfortQuote,
          aiPeerStory: parsed.aiPeerStory || undefined,
          isHarmful: Boolean(parsed.isHarmful),
        };
      }
    }
  } catch (err) {
    // 로컬 SLM 응답 지연/부재 시 동적 룰베이스 전환
  }

  // 3. 로컬 동적 맞춤형 폴백 엔진 (키워드 추출 + 다양한 공감 템플릿)
  return analyzeLocally(content);
}

// 다량 신고 누적 시 AI 모더레이션 검수
export async function reviewModerationAI(content: string, reason: string): Promise<{
  isViolating: boolean;
  violationReason?: string;
}> {
  // 로컬 SLM 검수
  try {
    const prompt = `
다음 커뮤니티 게시글에 대한 신고가 접수되었습니다.
게시글: "${content}"
신고 사유: "${reason}"

이 글이 심각한 타인 비방, 개인정보 유출, 불법 유해, 성적 수치심, 극단적 자해 조장 등에 해당하는지 검토하세요.
응답 JSON:
{
  "isViolating": boolean,
  "violationReason": "사유 요약"
}
`;
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LOCAL_LLM_MODEL,
        prompt,
        format: 'json',
        stream: false,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const parsed = JSON.parse(data.response || '{}');
      return {
        isViolating: Boolean(parsed.isViolating),
        violationReason: parsed.violationReason,
      };
    }
  } catch (e) {
    //
  }

  return { isViolating: true, violationReason: '다수 신고 접수 기준 충족' };
}

// --- 로컬 시맨틱 분석 및 해시 벡터 폴백 함수들 ---

function analyzeLocally(content: string): FailureAnalysis {
  const c = content.toLowerCase();

  // 자해/위기 감지
  if (c.includes('자살') || c.includes('죽고 싶') || c.includes('자해')) {
    return {
      category: '기타',
      tags: ['상담안내'],
      aiComfortQuote: '힘든 시간을 보내고 계신가요? 마음을 털어놓을 수 있는 24시간 위기상담전화(109)가 언제나 함께합니다.',
      aiPeerStory: '혼자 끙끙 앓지 마세요. 따뜻한 전문가의 손길이 당신의 곁에 있습니다.',
      isHarmful: true,
    };
  }

  // 핵심 키워드 감지
  const keywords = content.match(/[가-힣]{2,6}/g) || ['오늘의 일'];
  const meaningfulKeyword = keywords.find((k) => !['오늘', '진짜', '너무', '정말', '그냥', '했다', '있다', '없다'].includes(k)) || '오늘의 실수';

  // 1. 업무/취업
  if (c.includes('회사') || c.includes('부장') || c.includes('팀장') || c.includes('면접') || c.includes('취준') || c.includes('업무') || c.includes('메일') || c.includes('출근') || c.includes('지각') || c.includes('퇴사')) {
    const quotes = [
      `"${meaningfulKeyword}" 때문에 오늘 하루 식은땀도 나고 마음이 많이 무거우셨겠어요. 하지만 누구나 겪는 성장통일 뿐이니 너무 자책하지 마세요!`,
      `처음부터 완벽한 사람은 없어요. 오늘의 "${meaningfulKeyword}" 에피소드는 훗날 동료들과 웃으며 이야기할 값진 내공이 되어줄 거예요.`,
      `오늘 겪은 "${meaningfulKeyword}" 일로 이불킥하고 계신가요? 밤새 끙끙 앓지 마시고 따뜻한 차 한 잔으로 훌훌 털어내세요.`,
      `정말 고생 많으셨어요. "${meaningfulKeyword}" 일로 놀란 마음, 오늘 밤은 푹 주무시고 내일 산뜻하게 다시 시작해요.`
    ];
    const peerStories = [
      `저도 예전에 첫 출근길에 반대 방향 전철을 타서 30분 넘게 지각하고 세상이 무너지는 줄 알았어요. 그런데 솔직하게 사과드리니 사수분께서 '누구나 한 번은 하는 실수'라며 따뜻하게 웃어주시더라고요.`,
      `저도 회사에서 전체 메일로 초안 보고서를 잘못 발송해 온몸이 얼어붙었던 적이 있어요. 그때는 끝인 줄 알았는데, 빠른 정중한 사과 한 통으로 오히려 신뢰를 얻었답니다.`
    ];
    const quoteIndex = Math.abs(content.length + content.charCodeAt(0)) % quotes.length;
    const peerIndex = Math.abs(content.length) % peerStories.length;
    return {
      category: '업무/취업',
      tags: ['직장생활', meaningfulKeyword, '성장', '토닥토닥'],
      aiComfortQuote: quotes[quoteIndex],
      aiPeerStory: peerStories[peerIndex],
      isHarmful: false,
    };
  }

  // 2. 건강/다이어트
  if (c.includes('다이어트') || c.includes('운동') || c.includes('헬스') || c.includes('야식') || c.includes('치킨') || c.includes('불닭') || c.includes('살') || c.includes('폭식')) {
    const quotes = [
      `"${meaningfulKeyword}"(으)로 오늘 하루 지친 마음을 맛있는 에너지로 충전했다고 생각해요! 내일부터 다시 물 한 잔으로 산뜻하게 시작하면 돼요.`,
      `맛있는 음식 한 끼에 무너질 당신의 노력이 아닙니다. 죄책감은 내려놓고, 오늘 밤은 배부르고 편안하게 꿀잠 주무세요!`,
      `"${meaningfulKeyword}" 때문에 자책하고 계신가요? 몸보다 중요한 건 내 마음의 행복입니다. 내일 가볍게 10분만 산책해 봐요.`
    ];
    const peerStories = [
      `저도 3달 내내 닭가슴살만 먹다가 야밤에 치킨 두 마리를 혼자 다 먹고 죄책감에 울 뻔한 적이 있어요. 그런데 다음날 산책하고 물 많이 마시니 금방 원래대로 돌아오더라고요!`
    ];
    const quoteIndex = Math.abs(content.length + content.charCodeAt(0)) % quotes.length;
    return {
      category: '건강/다이어트',
      tags: ['다이어트', meaningfulKeyword, '내일부터', '토닥토닥'],
      aiComfortQuote: quotes[quoteIndex],
      aiPeerStory: peerStories[0],
      isHarmful: false,
    };
  }

  // 3. 공부/시험
  if (c.includes('시험') || c.includes('공부') || c.includes('자격증') || c.includes('학점') || c.includes('과제') || c.includes('도서관') || c.includes('합격') || c.includes('불합격')) {
    const quotes = [
      `"${meaningfulKeyword}" 결과보다 그동안 도서관에서 쏟았던 당신의 땀방울이 훨씬 눈부십니다. 충분히 멋지게 최선을 다하셨어요!`,
      `시험 하나로 당신이라는 사람의 빛나는 잠재력을 절대 평가할 수 없어요. 잠시 숨을 고르고 다음 기회를 향해 도약해 봐요.`,
      `오늘 겪은 "${meaningfulKeyword}"의 아쉬움은 더 큰 결실을 맺기 위한 단단한 디딤돌이 되어줄 거예요.`
    ];
    const peerStories = [
      `저도 1점 차이로 자격증 시험에 떨어지고 독서실에서 멍하니 앉아있던 날이 있었어요. 하지만 그때 틀렸던 문제들을 복습한 덕분에 다음 시험에서 만점을 받았답니다!`
    ];
    const quoteIndex = Math.abs(content.length + content.charCodeAt(0)) % quotes.length;
    return {
      category: '공부/시험',
      tags: ['공부', meaningfulKeyword, '노력', '다음기회'],
      aiComfortQuote: quotes[quoteIndex],
      aiPeerStory: peerStories[0],
      isHarmful: false,
    };
  }

  // 4. 연애/인간관계
  if (c.includes('연애') || c.includes('고백') || c.includes('친구') || c.includes('싸움') || c.includes('카톡') || c.includes('짝사랑') || c.includes('이별')) {
    const quotes = [
      `사람 마음이란 내 뜻대로 되지 않을 때가 더 많아요. "${meaningfulKeyword}"에 진심을 다했던 당신의 용기는 여전히 눈부십니다.`,
      `상처받은 마음에 따뜻한 연고를 발라드리고 싶네요. 오늘 밤은 휴대폰을 잠시 내려놓고 나 자신을 가장 아껴주세요.`,
      `누군가를 진심으로 대하다가 겪은 아픔은 당신이 다정한 사람이라는 증거예요. 당신을 온전히 알아봐 줄 사람이 곧 나타날 거예요.`
    ];
    const peerStories = [
      `저도 친구에게 홧김에 서운한 말을 쏟아붓고 며칠 동안 밤잠을 설친 적이 있어요. 용기 내어 '그때 내가 말이 심했어 미안해'라고 먼저 톡을 보냈더니 친구도 기다렸다는 듯 화답해 주더라고요.`
    ];
    const quoteIndex = Math.abs(content.length + content.charCodeAt(0)) % quotes.length;
    return {
      category: '연애/인간관계',
      tags: ['인간관계', meaningfulKeyword, '용기', '토닥토닥'],
      aiComfortQuote: quotes[quoteIndex],
      aiPeerStory: peerStories[0],
      isHarmful: false,
    };
  }

  // 5. 소비/재테크
  if (c.includes('돈') || c.includes('택시') || c.includes('쇼핑') || c.includes('주식') || c.includes('지출') || c.includes('지름') || c.includes('지갑')) {
    const quotes = [
      `값진 인생의 배움 레슨을 한 번 구매했다고 생각해요! "${meaningfulKeyword}" 일은 훌훌 털어내고 내일부터 다시 똑똑하게 모아가면 됩니다.`,
      `잃어버린 돈이나 지출보다 소중한 건 오늘 당신의 평온한 마음입니다. 금융 치료는 내일부터 다시 시작해요!`
    ];
    const peerStories = [
      `저도 충동구매로 통장 잔고를 보고 좌절했던 적이 수두룩해요. 지나간 돈은 아쉽지만 그 덕분에 소비 습관을 돌아보는 인생의 중요한 터닝포인트가 되었답니다.`
    ];
    const quoteIndex = Math.abs(content.length + content.charCodeAt(0)) % quotes.length;
    return {
      category: '소비/재테크',
      tags: ['소비', meaningfulKeyword, '경험', '재정비'],
      aiComfortQuote: quotes[quoteIndex],
      aiPeerStory: peerStories[0],
      isHarmful: false,
    };
  }

  // 기본 일상/실수
  const genericQuotes = [
    `"${meaningfulKeyword}" 일로 오늘 하루 많이 놀라고 당황하셨죠? 오늘 밤 푹 자고 훌훌 털어내면 내일은 새하얀 백지입니다.`,
    `살다 보면 누구나 상상치 못한 귀여운 실수를 하곤 해요. 오늘 하루도 치열하게 살아낸 당신은 여전히 충분히 멋진 사람입니다.`,
    `이불킥이 절로 나오는 밤이지만, 훗날 돌아보면 미소 지을 인생의 귀여운 에피소드 하나가 늘어난 거예요!`
  ];
  const genericPeerStory = `저도 예전에 비슷한 실수를 하고 혼자 속상해서 어쩔 줄 몰랐던 기억이 나요. 하지만 시간이 지나고 보니 다 지나가는 작은 해프닝이었더라고요. 너무 마음 쓰지 마세요!`;

  const quoteIndex = Math.abs(content.length + content.charCodeAt(0)) % genericQuotes.length;
  return {
    category: '일상/실수',
    tags: ['일상', meaningfulKeyword, '해프닝', '쉼표'],
    aiComfortQuote: genericQuotes[quoteIndex],
    aiPeerStory: genericPeerStory,
    isHarmful: false,
  };
}

function generateLocalVector(text: string, dimensions = 128): number[] {
  const vector = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/\s+/g, '');

  for (let i = 0; i < normalized.length - 1; i++) {
    const bigram = normalized.slice(i, i + 2);
    let hash = 0;
    for (let j = 0; j < bigram.length; j++) {
      hash = (hash << 5) - hash + bigram.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1;
  }

  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}
