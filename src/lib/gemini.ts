import { GoogleGenAI } from '@google/genai';
import { CategoryType } from '@/types';

// Gemini Client 인스턴스 (환경변수 존재 시 초기화)
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

// 텍스트 임베딩 생성 (Gemini API or 경량 시맨틱 벡터 폴백)
export async function getEmbedding(text: string): Promise<number[]> {
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
      console.warn('Gemini embedding failed, falling back to local vectorizer:', err);
    }
  }

  // 폴백: 한국어 형태소/N-gram 기반 128차원 시맨틱 해시 벡터
  return generateLocalVector(text, 128);
}

// AI 분류, 태그 추출 및 따뜻한 위로 생성
export async function analyzeFailure(content: string): Promise<{
  category: CategoryType;
  tags: string[];
  aiComfortQuote: string;
  isHarmful: boolean;
}> {
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

* 주의: 극단적 선택/자해, 심각한 범죄 모의 또는 실명 비방이 포함된 경우 isHarmful을 true로 설정하세요.
`;
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
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

  // 폴백: 키워드 기반 카테고리 분석 및 위로 멘트 템플릿
  return analyzeLocally(content);
}

// 다량 신고 누적 시 AI 모더레이션 검수
export async function reviewModerationAI(content: string, reason: string): Promise<{
  isViolating: boolean;
  violationReason?: string;
}> {
  if (ai) {
    try {
      const prompt = `
다음 커뮤니티 게시글에 대한 신고가 접수되었습니다.
게시글: "${content}"
신고 사유: "${reason}"

이 글이 심각한 타인 비방, 개인정보 유출, 불법 유해, 성적 수치심, 극단적 자해 조장 등에 해당하는지 엄밀히 검토하세요.
단순한 일상적 실수나 자조적인 한탄은 위반이 아닙니다.

응답 JSON:
{
  "isViolating": boolean,
  "violationReason": "사유 요약"
}
`;
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(result.text || '{}');
      return {
        isViolating: Boolean(parsed.isViolating),
        violationReason: parsed.violationReason,
      };
    } catch (e) {
      console.warn('AI moderation failed, defaulting to report count threshold:', e);
    }
  }

  // 기본 폴백
  return { isViolating: true, violationReason: '다수 신고 접수 기준 충족' };
}

// --- 로컬 시맨틱 분석 및 벡터 폴백 함수들 ---

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

  if (c.includes('시험') || c.includes('공부') || c.includes('과제') || c.includes('성적') || c.includes('학점') || c.includes('수능')) {
    return {
      category: '공부/시험',
      tags: ['공부', '시험', '벼락치기', '수고했어'],
      aiComfortQuote: '노력했던 과정 그 자체가 이미 소중한 자산입니다. 한 번의 시험이 당신의 가능성을 전부 증명하지는 않아요.',
      isHarmful: false,
    };
  }

  if (c.includes('카톡') || c.includes('짝사랑') || c.includes('친구') || c.includes('고백') || c.includes('소개팅') || c.includes('연애') || c.includes('이별')) {
    return {
      category: '연애/인간관계',
      tags: ['인간관계', '마음', '연애', '용기'],
      aiComfortQuote: '마음을 표현하고 다가서려 했던 용기만큼은 누구보다 멋졌습니다. 때로는 서투름이 가장 진솔한 매력이에요.',
      isHarmful: false,
    };
  }

  if (c.includes('돈') || c.includes('주식') || c.includes('결제') || c.includes('쇼핑') || c.includes('택시') || c.includes('충동구매')) {
    return {
      category: '소비/재테크',
      tags: ['소비', '통장', '경험치', '금융치료'],
      aiComfortQuote: '돈을 잃은 게 아니라 인생의 귀중한 수업료를 낸 것입니다. 오늘의 지출은 더 큰 낭비를 막아줄 거예요!',
      isHarmful: false,
    };
  }

  return {
    category: '일상/실수',
    tags: ['일상', '해프닝', '위로', '토닥토닥'],
    aiComfortQuote: '모든 날이 완벽할 수는 없지요. 털어놓고 훌훌 털어버리면, 내일은 조금 더 편안한 하루가 될 거예요.',
    isHarmful: false,
  };
}

// 텍스트 기반 시맨틱 해시 벡터 (128차원)
function generateLocalVector(text: string, dim = 128): number[] {
  const vec = new Array(dim).fill(0);
  const words = text.replace(/[^a-zA-Z0-9가-힣\s]/g, '').split(/\s+/);
  
  for (const word of words) {
    if (!word) continue;
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1;
    // N-gram 보완
    if (word.length >= 2) {
      for (let j = 0; j < word.length - 1; j++) {
        const biHash = (word.charCodeAt(j) * 31 + word.charCodeAt(j + 1)) % dim;
        vec[biHash] += 0.5;
      }
    }
  }

  // 벡터 정규화(L2 Norm)
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vec[i] /= norm;
  }
  return vec;
}
