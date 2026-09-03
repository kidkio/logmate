import { NextRequest, NextResponse } from 'next/server';
import { failureStore } from '@/lib/storage';
import { getEmbedding, analyzeFailure } from '@/lib/gemini';
import { CategoryType } from '@/types';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = (searchParams.get('category') as CategoryType) || '전체';
    const sort = (searchParams.get('sort') as 'latest' | 'popular') || 'latest';
    const deviceId = searchParams.get('deviceId') || undefined;

    const failures = await failureStore.getAll(deviceId, category, sort);
    return NextResponse.json({ success: true, failures });
  } catch (error: any) {
    console.error('Failed to get failures:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`failure_post_${ip}`, 15, 10 * 60 * 1000); // 10분에 15회 제한
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: '과도한 등록 요청이 감지되었습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { content, deviceId } = body;

    if (!content || typeof content !== 'string' || content.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: '실패 내용은 최소 5자 이상 적어주세요.' },
        { status: 400 }
      );
    }
    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: '실패 내용은 최대 500자까지 작성 가능합니다.' },
        { status: 400 }
      );
    }
    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: '기기 식별자(deviceId)가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1일 1회 작성 제한 (새벽 3시 KST 기준)
    const existing = await failureStore.getTodaysFailure(deviceId);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: '오늘은 이미 실패를 공유하셨습니다. 매일 새벽 3시에 새로운 실패를 털어놓으실 수 있어요!',
          code: 'LIMIT_EXCEEDED',
          existingFailure: existing,
        },
        { status: 429 }
      );
    }

    // 1. AI 분석 (카테고리, 태그, 위로 한마디, 유해성 검사)
    const analysis = await analyzeFailure(content);

    if (analysis.isHarmful) {
      return NextResponse.json({
        success: false,
        error: '마음이 많이 지쳐 보이시네요. 극단적인 표현이 감지되어 바로 등록되지 않았습니다. 24시간 정신건강 위기상담전화(1577-0199 / 109)에서 따뜻한 도움을 받으실 수 있습니다.',
        isCrisis: true
      }, { status: 422 });
    }

    // 2. 임베딩 벡터 생성
    const embedding = await getEmbedding(content);

    // 3. 저장소에 등록
    const newFailure = await failureStore.create({
      deviceId,
      content: content.trim(),
      category: analysis.category,
      tags: analysis.tags,
      aiComfortQuote: analysis.aiComfortQuote,
      embedding,
    });

    // 4. 실시간 유사 실패 검색 및 통계 산출
    const similarData = await failureStore.findSimilar(newFailure);

    return NextResponse.json({
      success: true,
      failure: newFailure,
      similarCount: similarData.similarCount,
      similarFailures: similarData.similarFailures,
      categoryCount: similarData.categoryCount,
      aiMessage: analysis.aiComfortQuote,
    });
  } catch (error: any) {
    console.error('Failed to create failure:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
