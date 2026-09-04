// 한국어 특화 사연 유사도 계산 엔진
// 영어 전용 임베딩 모델의 한계를 극복하고 한국어 형태소/바이그램 및 카테고리 가중치를 결합한 하이브리드 유사도 분석기

const KOREAN_STOPWORDS = new Set([
  '오늘', '진짜', '너무', '정말', '그냥', '하고', '했다', '있다', '없다',
  '에서', '에게', '으로', '로써', '까지', '부터', '때문', '생각', '사람',
  '그때', '그런', '이런', '저런', '하나', '모두', '다시', '계속', '어제',
  '내일', '지금', '어떻게', '왜', '이거', '저거', '그거'
]);

export interface TextFeatures {
  words: Set<string>;
  biGrams: Set<string>;
}

export function extractKoreanFeatures(text: string): TextFeatures {
  if (!text) return { words: new Set(), biGrams: new Set() };

  // 한글, 영문, 숫자 외 기호 공백 치환
  const clean = text.replace(/[^가-힣a-zA-Z0-9\s]/g, ' ').toLowerCase();

  // 단어 토큰화 (2글자 이상, 불용어 제거)
  const rawWords = clean.split(/\s+/).filter((w) => w.length >= 2);
  const words = new Set(rawWords.filter((w) => !KOREAN_STOPWORDS.has(w)));

  // 2-글자 음절 바이그램 추출 (공백 제거 후 슬라이딩 윈도우)
  const noSpace = clean.replace(/\s+/g, '');
  const biGrams = new Set<string>();
  for (let i = 0; i < noSpace.length - 1; i++) {
    const bg = noSpace.slice(i, i + 2);
    // 불용어 음절 조합만으로 이루어진 경우 제외
    if (!KOREAN_STOPWORDS.has(bg)) {
      biGrams.add(bg);
    }
  }

  return { words, biGrams };
}

/**
 * 두 사연 간의 정밀 유사도 계산 (0.0 ~ 1.0)
 * - 동일 카테고리 가중치: 35%
 * - 한국어 바이그램/단어 Jaccard 유사도: 최대 55%
 * - 태그 일치도: 최대 10%
 * - 다른 카테고리인 경우 0.30 이하로 엄격히 제한
 */
export function calculateKoreanSimilarity(
  targetCategory: string,
  targetContent: string,
  targetTags: string[] = [],
  candidateCategory: string,
  candidateContent: string,
  candidateTags: string[] = []
): number {
  if (!targetContent || !candidateContent) return 0;

  const fA = extractKoreanFeatures(targetContent);
  const fB = extractKoreanFeatures(candidateContent);

  // 1. 음절 바이그램 Jaccard 유사도
  let bgOverlap = 0;
  for (const bg of fA.biGrams) {
    if (fB.biGrams.has(bg)) bgOverlap++;
  }
  const bgUnion = fA.biGrams.size + fB.biGrams.size - bgOverlap;
  const bgJaccard = bgUnion > 0 ? bgOverlap / bgUnion : 0;

  // 2. 단어 키워드 Jaccard 유사도
  let wOverlap = 0;
  for (const w of fA.words) {
    if (fB.words.has(w)) wOverlap++;
  }
  const wUnion = fA.words.size + fB.words.size - wOverlap;
  const wJaccard = wUnion > 0 ? wOverlap / wUnion : 0;

  // 어휘 유사도 종합 (바이그램 60% + 단어 40%)
  const lexicalScore = bgJaccard * 0.6 + wJaccard * 0.4;

  // 3. 태그 일치도 계산
  let tagOverlap = 0;
  if (targetTags.length > 0 && candidateTags.length > 0) {
    const candTagSet = new Set(candidateTags);
    const sharedTags = targetTags.filter((t) => candTagSet.has(t)).length;
    tagOverlap = sharedTags / Math.max(targetTags.length, candidateTags.length);
  }

  // 4. 카테고리 일치 여부에 따른 점수 산출
  const isSameCategory = targetCategory === candidateCategory;

  if (isSameCategory) {
    // 같은 카테고리: 기본 보너스 0.35 + 어휘 일치도 (최대 0.55) + 태그 일치도 (최대 0.10)
    const totalScore = 0.35 + lexicalScore * 2.0 + tagOverlap * 0.1;
    return Math.min(1.0, Math.max(0.0, totalScore));
  } else {
    // 다른 카테고리: 어휘가 우연히 겹쳐도 0.30을 넘지 못하도록 엄격히 제한
    return Math.min(0.30, lexicalScore * 0.6);
  }
}

// 의미적으로 진짜 유사하다고 판별할 기준 임계치 (42% 이상)
export const SIMILARITY_MATCH_THRESHOLD = 0.42;
