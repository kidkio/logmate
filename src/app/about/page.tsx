import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Moon, Heart, Shield, Sparkles, Compass, Users, CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서비스 소개 | LogMate (로그메이트)',
  description: '실패를 털어놓을 가장 다정한 친구, LogMate의 철학과 가치를 소개합니다.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>LogMate 홈으로 돌아가기</span>
          </Link>
          <span className="text-xs text-indigo-400 font-medium">About LogMate</span>
        </div>

        {/* 히어로 섹션 */}
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/25">
            <Moon className="w-7 h-7 fill-white/20" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>실패를 보듬는 따뜻한 익명 안식처</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight leading-tight">
            “당신의 오늘 실패는 끝이 아니라,<br className="hidden sm:inline" /> 다음 도약의 디딤돌입니다.”
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            성공만을 찬양하는 세상 속에서, 우리는 오늘 하루 겪었던 좌절과 실수를 부끄러워하지 않고 편안히 내려놓을 수 있는 고요한 심야의 쉼터를 만들었습니다.
          </p>
        </div>

        {/* 핵심 가치 카드 4종 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">100% 완전 익명성 보장</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              실명과 프로필 사진을 요구하지 않습니다. 가입 시 &lsquo;토닥이는 쿼카&rsquo; 같은 무작위 포근한 닉네임이 배정되며, 모든 사연은 철저히 비밀로 안전하게 보호됩니다.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">따뜻한 경청과 상호 연대</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              비난과 혐오가 없는 무균실 같은 공간입니다. 비슷한 실패를 먼저 겪었던 동료들과 정성 어린 AI의 1:1 맞춤 한 줄 위로가 당신의 짐을 덜어줍니다.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">회복탄력성 (Resilience) 지향</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              단순한 하소연에 그치지 않고, 겪었던 실패를 기록하고 훗날 극복했을 때 &lsquo;극복기&rsquo;로 승화시킬 수 있도록 돕는 성장형 멘탈 웰니스 플랫폼입니다.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">건강한 디지털 디톡스 & ASMR</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              자극적인 숏폼 알고리즘 대신, 장작불·비·파도 소리가 잔잔하게 흐르는 미드나잇 라운지에서 마음을 가다듬고 온전한 숙면을 취할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 서비스 철학 상세 에세이 */}
        <div className="bg-white/[0.02] border border-white/[0.08] p-6 sm:p-8 rounded-3xl space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-100">왜 실패를 기록해야 할까요?</h2>
          <p>
            심리학 연구에 따르면, 실패나 좌절을 혼자 마음속에 가두어둘 때 뇌의 편도체는 이를 생존의 위협으로 인식하여 자책과 우울의 악순환을 만듭니다. 반면, 자신의 실패를 글로 명료하게 적어내고(Naming), 타인과의 공감을 통해 &lsquo;나만 그런 것이 아니다&rsquo;라는 보편성을 확인하는 순간 편도체의 과열은 진정되고 전두엽이 활성화되어 새로운 해결책을 찾기 시작합니다.
          </p>
          <p>
            LogMate는 바로 이 심리적 치유 메커니즘을 디지털 공간에 구현한 서비스입니다. 오늘 밤, 당신의 마음을 짓누르는 무거운 실패가 있다면 조용히 문을 열고 털어놓아 보세요.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/guide"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20"
            >
              <span>심야 힐링 가이드 읽어보기 &rarr;</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 font-bold text-xs transition-all border border-white/10"
            >
              <span>LogMate 시작하기</span>
            </Link>
          </div>
        </div>

        {/* 하단 푸터 */}
        <div className="pt-4 text-center text-xs text-slate-500">
          © 2026 LogMate. 실패를 솔직히 마주하는 모든 용기 있는 사람들을 응원합니다.
        </div>

      </div>
    </div>
  );
}
