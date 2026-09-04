import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Sparkles, Moon, Heart, Compass, Shield, Feather, Clock } from 'lucide-react';
import type { Metadata } from 'next';
import { AdSenseScript } from '@/components/AdSenseScript';

export const metadata: Metadata = {
  title: '심야 쉼터 가이드 | 실패 극복 & 마인드케어 아티클 - LogMate',
  description: '자책과 이불킥을 멈추고 회복탄력성을 기르는 심리학 전문 아티클과 심야 힐링 가이드 컬렉션입니다.',
};

const ARTICLES = [
  {
    id: 'perfectionism-and-shame',
    category: '심리학 에세이',
    title: '완벽주의와 이불킥: 뇌과학으로 풀어보는 자책을 멈추는 법',
    subtitle: '밤마다 실수했던 장면이 떠올라 괴롭다면, 당신의 뇌는 지금 과열 상태입니다.',
    readTime: '4분 읽기',
    date: '2026.09.01',
    content: `
누구나 한 번쯤 낮에 있었던 어설픈 실수나 말실수 때문에 밤에 이불을 차며 자책해 본 경험이 있을 것입니다. 심리학에서는 이를 '반추(Rumination)' 현상이라고 부릅니다.

우리의 뇌는 진화론적으로 위험을 회피하도록 설계되어 있습니다. 과거의 작은 실수를 위험 신호로 받아들인 편도체(Amygdala)는 스트레스 호르몬을 분비하며 그 상황을 끝없이 재생합니다. 하지만 중요한 사실은, 당신이 생각하는 것만큼 타인은 당신의 실수에 큰 관심이 없다는 것입니다(조명 효과, Spotlight Effect).

자책의 악순환을 끊어내는 가장 효과적인 방법은 '자기 자비(Self-Compassion)'입니다. 만약 당신의 소중한 친구가 똑같은 실수를 저질렀다면, 당신은 비난 대신 어떤 위로를 건넸을까요? 그 따뜻하고 다정한 목소리를 오늘 밤은 자기 자신에게 들려주어야 합니다.
    `,
    takeaway: '실수는 당신의 가치를 깎아내리는 흠집이 아니라, 아직 완성되지 않은 인간으로서 자연스러운 과정입니다.',
  },
  {
    id: 'job-interview-rejection',
    category: '회복탄력성',
    title: '면접·시험 탈락 후 무기력증을 다정하게 안아주는 3단계 심리 루틴',
    subtitle: '불합격 통보를 받은 날, 무너진 자존감을 다시 세우는 현실적인 회복의 기술',
    readTime: '5분 읽기',
    date: '2026.08.28',
    content: `
수개월 동안 쏟아부었던 노력의 결과가 '불합격'이라는 세 글자로 돌아왔을 때, 우리는 종종 자기 존재 자체가 부정당한 것 같은 깊은 상실감을 느낍니다. 

하지만 시험이나 채용 면접에서의 탈락은 '나라는 사람의 무능'을 증명한 것이 아닙니다. 그것은 단지 그 회사의 특정 시점의 타이밍과 조건, 그리고 평가자의 주관적 기준과의 '적합도(Fit)'가 맞지 않았을 뿐입니다.

탈락 후 심리 회복을 위한 3단계 루틴을 권합니다:
1. **슬픔의 애도 허용하기**: 억지로 긍정적인 척하지 말고, 하루나 이틀 동안은 온전히 아쉬워하고 속상해하는 감정을 솔직하게 인정하세요.
2. **사실과 해석 분리하기**: '면접에 떨어졌다'는 객관적 사실이고, '나는 평생 취업 못 할 쓸모없는 사람이다'는 뇌가 만들어낸 왜곡된 해석입니다.
3. **작은 통제감 회복하기**: 방 청소, 가벼운 산책, 따뜻한 차 한 잔 마시기처럼 내가 100% 통제할 수 있는 아주 작은 일상의 행동부터 실천해 보세요.
    `,
    takeaway: '당신의 가치는 타인이 보낸 합격 통지서 한 장으로 결정되지 않습니다.',
  },
  {
    id: 'resilience-growth',
    category: '성장 마인드셋',
    title: '실패를 인생의 변곡점으로 바꾸는 회복탄력성(Resilience) 가이드',
    subtitle: '실패하지 않는 사람은 새로운 도전을 전혀 하지 않은 사람뿐입니다.',
    readTime: '4분 읽기',
    date: '2026.08.22',
    content: `
세계적인 심리학자 캐롤 드웩(Carol Dweck)은 마인드셋 연구를 통해 인간을 두 가지 유형으로 분류했습니다. 재능과 능력은 타고난 것이라 믿는 '고정 마인드셋(Fixed Mindset)'과, 노력과 경험을 통해 얼마든지 확장될 수 있다고 믿는 '성장 마인드셋(Growth Mindset)'입니다.

고정 마인드셋을 가진 사람은 실패를 자신의 한계로 받아들이고 도전을 멈춥니다. 반면 성장 마인드셋을 가진 사람은 실패를 '학습의 데이터'로 바라봅니다. 

"이번 시도에서 무엇이 잘 작동하지 않았는가? 다음번에는 어떤 방식을 바꿔볼 수 있을까?"라는 질문을 던질 때, 실패는 단순한 패배가 아니라 성공으로 가는 가장 정밀한 나침반이 됩니다. 실패의 크기만큼 당신의 그릇은 더 깊고 넓어지고 있습니다.
    `,
    takeaway: '실패란 넘어진 상태를 의미하지 않습니다. 다시 일어서기를 포기했을 때 비로소 실패가 됩니다.',
  },
  {
    id: 'mindful-sleep-routine',
    category: '심야 웰니스',
    title: '심야의 불면과 생각 비우기: 밤의 온기와 마인드풀니스',
    subtitle: '스마트폰을 내려놓고 고요한 소리와 함께 하루의 무게를 내려놓는 법',
    readTime: '3분 읽기',
    date: '2026.08.15',
    content: `
밤이 깊어질수록 머릿속 생각은 더 복잡해지고, 지나간 일에 대한 후회와 미래에 대한 불안이 꼬리를 뭅니다. 밤의 침묵 속에서 우리의 뇌는 외부 자극이 줄어들자 내면의 불안 요소들을 크게 확대하기 때문입니다.

이럴 때 억지로 잠을 청하려 애쓰면 불면증은 오히려 악화됩니다. 수면은 노력해서 얻는 것이 아니라, 긴장이 풀렸을 때 자연스럽게 찾아오는 선물입니다.

LogMate의 심야 라운지에서 잔잔한 장작불 소리나 빗소리를 들으며 복식 호흡을 해보세요. 4초간 숨을 들이마시고, 7초간 멈추고, 8초간 길게 내쉬는 4-7-8 호흡법은 부교감 신경을 활성화하여 과열된 몸과 마음을 숙면 모드로 전환해 줍니다. 오늘 하루도 버텨낸 당신의 육체와 영혼에 깊은 안식을 선물하세요.
    `,
    takeaway: '모든 것을 오늘 밤 안에 해결할 필요는 없습니다. 내일의 태양이 뜨면 생각보다 많은 것이 가벼워질 것입니다.',
  },
  {
    id: 'power-of-vulnerability',
    category: '치유와 연대',
    title: '익명과 취약성의 힘: 내밀한 실패를 털어놓을 때 일어나는 기적',
    subtitle: '브레네 브라운의 수치심 연구와 LogMate가 지향하는 치유의 메커니즘',
    readTime: '5분 읽기',
    date: '2026.08.08',
    content: `
휴스턴 대학교 연구교수 브레네 브라운(Brené Brown)은 10년이 넘는 연구 끝에 인간 관계와 치유의 핵심 열쇠로 '취약성(Vulnerability)'을 꼽았습니다.

수치심은 어둠 속에서 자라납니다. "이런 실수를 한 사람은 나밖에 없을 거야", "내가 부족해서 그래"라는 생각은 혼자 숨길수록 점점 더 거대해집니다. 하지만 자신의 상처와 실패를 안전한 공간에서 솔직히 털어놓았을 때, 수치심은 빛 속에서 소멸합니다.

"나도 그랬어요", "충분히 그럴 수 있어요", "당신 잘못이 아니에요"라는 누군가의 진심 어린 공감 한마디는 고립되었던 우리를 다시 세상과 연결해 줍니다. LogMate가 100% 완전 익명을 고집하는 이유도 바로 이 때문입니다. 가면을 벗고 가장 솔직한 나로 존재할 수 있는 안식처에서 진정한 치유가 시작됩니다.
    `,
    takeaway: '당신의 약점과 실수를 솔직히 인정하는 것은 나약함이 아니라, 세상에서 가장 숭고한 용기입니다.',
  },
  {
    id: 'escape-comparison',
    category: '자존감 회복',
    title: '타인과의 끝없는 비교에서 벗어나 내 속도의 계절을 인정하기',
    subtitle: 'SNS 속 하이라이트 필름과 나의 비하인드 씬을 비교하지 마세요.',
    readTime: '4분 읽기',
    date: '2026.08.01',
    content: `
SNS 피드를 열면 동년배들의 화려한 성공, 이직, 결혼, 자산 증식의 소식들이 넘쳐납니다. 그에 반해 침대에 누워 실패와 고민에 짓눌려 있는 자신의 모습은 초라하게만 느껴집니다.

하지만 우리가 기억해야 할 것은, 타인의 SNS는 편집된 '하이라이트 필름'이고, 나의 일상은 편집 없는 'NG 컷과 비하인드 씬'이라는 점입니다. 남의 완벽한 결과물과 나의 치열한 과정을 비교하는 것은 공정하지 않습니다.

봄에 피는 벚꽃이 아름답다고 해서 가을에 피는 국화가 가치 없는 것은 아닙니다. 모든 생명에게는 저마다 꽃을 피우는 자신만의 계절이 있습니다. 당신의 계절은 아직 당도하지 않았을 뿐입니다. 남의 속도에 조급해하지 말고, 오늘 당신의 보폭대로 한 걸음만 나아가면 충분합니다.
    `,
    takeaway: '꽃마다 피는 계절이 다르듯, 당신의 인생에도 가장 찬란하게 피어날 당신만의 계절이 옵니다.',
  },
];

export default function GuideArticlesPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <AdSenseScript />
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>LogMate 홈으로 돌아가기</span>
          </Link>
          <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>LogMate 힐링 아티클 라이브러리</span>
          </span>
        </div>

        {/* 헤더 */}
        <div className="text-center space-y-3 py-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Feather className="w-3.5 h-3.5" />
            <span>심야 쉼터 공식 가이드 컬렉션</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            마음의 상처를 보듬는 심리학 에세이 & 힐링 가이드
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            실패를 겪고 자책으로 잠 못 이루는 밤, 따뜻한 심리학적 통찰과 다정한 위로가 담긴 LogMate 공식 아티클을 읽어보세요.
          </p>
        </div>

        {/* 아티클 리스트 */}
        <div className="space-y-6">
          {ARTICLES.map((article, idx) => (
            <article
              key={article.id}
              className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/40 transition-all space-y-4"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  {article.category}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{article.readTime}</span>
                  </span>
                  <span>{article.date}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-black text-slate-100 leading-snug">
                  {article.title}
                </h2>
                <p className="text-xs sm:text-sm text-indigo-300/80 font-medium">
                  {article.subtitle}
                </p>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-white/[0.06] pt-3">
                {article.content.trim()}
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>&ldquo;{article.takeaway}&rdquo;</span>
              </div>
            </article>
          ))}
        </div>

        {/* 하단 CTA */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/50 to-slate-900 border border-indigo-500/30 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Moon className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-black text-slate-100">
              오늘 밤, 당신의 이야기를 안전하게 털어놓아 보세요
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              LogMate는 100% 완전 익명으로 운영되는 실패 극복 안식처입니다. 당신만 그런 것이 아닙니다.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <span>LogMate 입장하기 (완전 익명)</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        {/* 하단 푸터 */}
        <div className="pt-4 text-center text-xs text-slate-500 space-y-2 border-t border-white/[0.08]">
          <div className="flex items-center justify-center gap-4 text-slate-400">
            <Link href="/about" className="hover:text-slate-200 underline underline-offset-4">서비스 소개</Link>
            <Link href="/privacy" className="hover:text-slate-200 underline underline-offset-4">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-slate-200 underline underline-offset-4">이용약관</Link>
          </div>
          <p>© 2026 LogMate. All rights reserved. 실패를 위로하는 가장 다정한 친구.</p>
        </div>

      </div>
    </div>
  );
}
