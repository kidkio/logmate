'use client';

import React, { useState } from 'react';
import { Moon, Users, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: Moon,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/20 border-indigo-500/30',
    badge: '환영합니다',
    title: '오늘 하루, 자책으로\n잠 못 이루고 계신가요?',
    desc: '성공과 완벽함만 강요받는 세상에서, 누구의 눈치도 보지 않고 나의 서투름을 털어놓을 수 있는 안전한 비밀 공간입니다.',
  },
  {
    icon: Sparkles,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/20 border-amber-500/30',
    badge: '사연 피드 미리보기',
    title: '실패를 털어놓으면\n따뜻한 위로가 도착합니다',
    desc: '매일 밤, 나와 닮은 고민을 겪은 이웃들의 솔직한 고백과 다정한 위로가 가득 채워집니다.',
    previewCard: {
      author: '포근한 다람쥐 #412',
      content: '오늘 중요한 발표에서 긴장해서 준비한 말을 하나도 못 했어요. 집에 오는 내내 제가 너무 한심해서 눈물이 났습니다...',
      quote: '“괜찮아요. 그날의 긴장감은 당신이 그만큼 간절히 최선을 다했다는 빛나는 증거입니다.”',
      warmth: 28,
    },
  },
  {
    icon: Users,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/20 border-pink-500/30',
    badge: '1일 1회 작성 원칙',
    title: '내 사연을 먼저 적어야\n친구들의 사연이 열립니다',
    desc: '다른 사람의 글을 눈팅만 하는 공간이 아닌, 서로의 상처를 정직하게 나누는 무균실 안식처입니다. 오늘 나의 실패를 먼저 솔직히 털어놓아 보세요.',
  },
  {
    icon: Clock,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20 border-emerald-500/30',
    badge: '매일 새벽 3시의 리셋',
    title: '털어놓고 훌훌 털어내면,\n내일은 새하얀 백지입니다',
    desc: '하루에 딱 한 번 진솔하게 털어놓으세요. 악플 없는 다정한 토닥임만 받고, 편안한 마음으로 오늘 밤 숙면을 취하세요.',
  },
];

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const IconComponent = slide.icon;
  const isLast = currentSlide === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between min-h-[460px] relative overflow-hidden">
        {/* 장식용 배경 광선 */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 상단 인디케이터 & 스킵 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'w-6 bg-indigo-500'
                    : 'w-1.5 bg-slate-800'
                }`}
              />
            ))}
          </div>
          {!isLast && (
            <button
              onClick={onComplete}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              건너뛰기
            </button>
          )}
        </div>

        {/* 슬라이드 메인 콘텐츠 */}
        <div className="py-4 space-y-3 my-auto text-center">
          <div
            className={`w-12 h-12 rounded-2xl ${slide.iconBg} border flex items-center justify-center mx-auto shadow-inner`}
          >
            <IconComponent className={`w-6 h-6 ${slide.iconColor}`} />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              {slide.badge}
            </span>
            <h2 className="text-lg font-bold text-slate-100 whitespace-pre-line leading-snug">
              {slide.title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              {slide.desc}
            </p>
          </div>

          {'previewCard' in slide && slide.previewCard && (
            <div className="mt-1 p-3.5 rounded-2xl bg-black/50 border border-indigo-500/30 text-left space-y-2 shadow-inner text-xs animate-in fade-in">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-semibold text-indigo-300">👤 {slide.previewCard.author}</span>
                <span className="text-amber-400 font-bold">🕯️ {slide.previewCard.warmth} 온기</span>
              </div>
              <p className="text-slate-200 line-clamp-2 text-[11px] leading-relaxed">
                &ldquo;{slide.previewCard.content}&rdquo;
              </p>
              <div className="p-2 rounded-xl bg-indigo-950/50 border border-indigo-500/20 text-[10px] text-indigo-300 italic">
                {slide.previewCard.quote}
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 및 안심 문구 */}
        <div className="space-y-3">
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 active:scale-[0.98] shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>{isLast ? 'LogMate 시작하기' : '다음으로'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>회원가입 없이 100% 완전 익명으로 보호됩니다</span>
          </div>
        </div>
      </div>
    </div>
  );
}
