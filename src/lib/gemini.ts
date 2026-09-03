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

// AI 실패 분석 및 위로 생성 (1순위: 로컬 서버 자체 SLM -> 2순위: Gemini -> 3순위: 룰베이스)
export async function analyzeFailure(content: string): Promise<{
  category: CategoryType;
  tags: string[];
  aiComfortQuote: string;
  isHarmful: boolean;
}> {
  // 1. 서버 자체 구축 로컬 경량 SLM (Ollama qwen2.5:1.5b: 비용 0원)
  try {
    const prompt = `
당신은 '오늘 당신의 실패를 공유하세요' 서비스의 따뜻하고 다정한 AI 심리 상담사입니다.
사용자가 작성한 아래의 실패 경험을 분석해주세요.

[사용자 글]
"${content}"

JSON 형식으로만 응답하세요:
{
  "category": "일상/실수" | "업무/취업" | "공부/시험" | "연애/인간관계" | "건강/다이어트" | "소비/재테크" | "기타",
  "tags": ["태그1", "태그2", "태그3"],
  "aiComfortQuote": "다정하고 공감 넘치며 때로는 살짝 위트 있는 1~2문장의 따뜻한 위로",
  "isHarmful": false
}
* 주의: 극단적 선택/자해, 심각한 범죄 모의 또는 실명 비방이 포함된 경우 isHarmful을 true로 설정하세요.
`;

    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LOCAL_LLM_MODEL,
        prompt,
        format: 'json',
        stream: false,
        options: { temperature: 0.7, num_predict: 250 },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      const parsed = JSON.parse(data.response || '{}');
      if (parsed.category && parsed.aiComfortQuote) {
        return {
          category: parsed.category as CategoryType,
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : ['실패', '극복'],
          aiComfortQuote: parsed.aiComfortQuote,
          isHarmful: Boolean(parsed.isHarmful),
        };
      }
    }
  } catch (err) {
    // 로컬 SLM 응답 지연/부재 시 클라우드 또는 폴백 전환
  }

  // 2. Gemini 클라우드 API (키가 설정된 경우)
  if (ai) {
    try {
      const prompt = `
당신은 '오늘 당신의 실패를 공유하세요' 서비스의 따뜻하고 다정한 AI 심리 상담사입니다.
사용자가 작성한 아래의 실패 경험을 분석해주세요.

[사용자 글]
"${content}"

다음 JSON 형식으로만 응답하세요:
{
  "category": "일상/실수" | "업무/취업" | "공부/시험" | "연애/인간관계" | "건강/다이어트" | "소비/재테크" | "기타",
  "tags": ["태그1", "태그2", "태그3"],
  "aiComfortQuote": "다정하고 공감 넘치며 때로는 살짝 위트 있는 1~2문장의 따뜻한 위로",
  "isHarmful": false
}
`;
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(result.text || '{}');
      if (parsed.category && parsed.aiComfortQuote) {
        return {
          category: parsed.category as CategoryType,
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : ['실패', '극복'],
          aiComfortQuote: parsed.aiComfortQuote,
          isHarmful: Boolean(parsed.isHarmful),
        };
      }
    } catch (err) {
      console.warn('Gemini analysis failed, using rule-based fallback:', err);
    }
  }

  // 3. 로컬 룰베이스 폴백 엔진
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

function analyzeLocally(content: string): {
  category: CategoryType;
  tags: string[];
  aiComfortQuote: string;
  isHarmful: boolean;
} {
  const c = content.toLowerCase();

  if (c.includes('자살') || c.includes('죽고 싶') || c.includes('자해')) {
    return {
      category: '기타',
      tags: ['상담안내'],
      aiComfortQuote: '힘든 시간을 보내고 계신가요? 마음을 털어놓을 수 있는 24시간 위기상담전화(109)가 함께합니다.',
      isHarmful: true,
    };
  }

  if (c.includes('회사') || c.includes('부장') || c.includes('팀장') || c.includes('면접') || c.includes('취준') || c.includes('업무') || c.includes('메일') || c.includes('출근') || c.includes('퇴사')) {
    return {
      category: '업무/취업',
      tags: ['직장생활', '실수', '이불킥', '성장'],
      aiComfortQuote: '일하다 보면 일어나는 작은 해프닝일 뿐이에요. 실수는 성장의 가장 확실한 비료가 되어줄 거예요!',
      isHarmful: false,
    };
  }

  if (c.includes('다이어트') || c.includes('운동') || c.includes('헬스') || c.includes('야식') || c.includes('치킨') || c.includes('불닭') || c.includes('살')) {
    return {
      category: '건강/다이어트',
      tags: ['다이어트', '작심삼일', '야식', '내일부터'],
      aiComfortQuote: '맛있는 음식으로 오늘 하루의 스트레스를 잘 보듬어준 거예요. 내일 아침 산뜻하게 다시 시작하면 돼요!',
      isHarmful: false,
    };
  }

  if (c.includes('시험') || c.includes('공부') || c.includes('자격증') || c.includes('학점') || c.includes('과제') || c.includes('도서관')) {
    return {
      category: '공부/시험',
      tags: ['시험', '공부', '노력', '다음기회'],
      aiComfortQuote: '결과보다 그동안 쏟았던 당신의 땀방울이 훨씬 값집니다. 충분히 멋지게 해내셨어요!',
      isHarmful: false,
    };
  }

  if (c.includes('연애') || c.includes('고백') || c.includes('친구') || c.includes('싸움') || c.includes('카톡') || c.includes('짝사랑')) {
    return {
      category: '연애/인간관계',
      tags: ['인간관계', '마음', '용기', '토닥토닥'],
      aiComfortQuote: '사람 마음이란 내 뜻대로 되지 않을 때가 더 많아요. 진심을 다했던 당신의 용기는 여전히 눈부십니다.',
      isHarmful: false,
    };
  }

  if (c.includes('돈') || c.includes('택시') || c.includes('쇼핑') || c.includes('주식') || c.includes('지출') || c.includes('지름')) {
    return {
      category: '소비/재테크',
      tags: ['소비', '통장', '경험', '금융치료'],
      aiComfortQuote: '값진 인생의 배움 레슨을 한 번 구매했다고 생각해요! 내일부터 다시 똑똑하게 모아가면 됩니다.',
      isHarmful: false,
    };
  }

  return {
    category: '일상/실수',
    tags: ['일상', '해프닝', '이불킥', '쉼표'],
    aiComfortQuote: '오늘 밤 푹 자고 훌훌 털어내면 내일은 새하얀 백지입니다. 당신은 여전히 빛나는 사람이에요.',
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
