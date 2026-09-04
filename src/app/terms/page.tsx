import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, Heart, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서비스 이용약관 | LogMate (로그메이트)',
  description: 'LogMate(로그메이트) 서비스 이용약관 및 커뮤니티 기본 규정입니다.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>LogMate 홈으로 돌아가기</span>
          </Link>
          <span className="text-xs text-slate-500 font-mono">시행일자: 2026년 9월 1일</span>
        </div>

        {/* 헤더 */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            LogMate 서비스 이용약관
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            환영합니다! LogMate는 일상의 실패와 고민을 안전하게 털어놓고 서로에게 위로와 온기를 전하는 익명 안식처입니다. 본 약관은 회원과 서비스 간의 권리, 의무 및 책임사항을 규정합니다.
          </p>
        </div>

        {/* 본문 섹션 */}
        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300 bg-white/[0.02] border border-white/[0.08] p-6 sm:p-8 rounded-3xl">
          
          {/* 제 1조: 목적 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-indigo-400">제 1조</span> (목적)
            </h2>
            <p>
              본 약관은 LogMate(이하 &lsquo;회사&rsquo; 또는 &lsquo;서비스&rsquo;)가 제공하는 실패 기록, 공감 리액션, 온기 상점, 심야 라운지 및 관련 제반 서비스의 이용 조건과 절차에 관한 기본 사항을 정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제 2조: 커뮤니티 기본 원칙 & 무관용 정책 */}
          <section className="space-y-2 pt-4 border-t border-white/[0.06]">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-indigo-400">제 2조</span> (다정한 커뮤니티 보호 및 금지 행위)
            </h2>
            <p>
              LogMate는 심리적 상처를 치유하는 안전지대입니다. 이용자는 다음 각 호에 해당하는 행위를 하여서는 안 되며, 위반 시 즉시 계정 정지 및 사연 블라인드 처리가 진행됩니다:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-400">
              <li>타인의 실패나 아픔을 조롱, 비난, 모욕, 혐오하는 행위</li>
              <li>욕설, 음란물, 불법 정보, 또는 특정인을 식별할 수 있는 개인정보를 유포하는 행위</li>
              <li>상업적 스팸, 광고성 글, 불법 홍보 행위</li>
              <li>타인의 사연을 외부로 무단 유출하거나 악의적으로 캡처하여 유포하는 행위</li>
            </ul>
          </section>

          {/* 제 3조: 유료 서비스 및 환불 규정 */}
          <section className="space-y-2 pt-4 border-t border-white/[0.06]">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-indigo-400">제 3조</span> (프리미엄 패스 및 결제/환불 정책)
            </h2>
            <p>
              1. 회사는 이용자에게 광고 제거 및 무제한 기능이 포함된 프리미엄 이용권(1일권, 30일권, 평생권)을 유료로 제공합니다.
            </p>
            <p>
              2. 전자상거래 등에서의 소비자보호에 관한 법률에 따라, 구매 후 기능을 전혀 사용하지 않은 경우 7일 이내에 [내 서재] 또는 고객지원을 통해 전액 청약 철회(환불)가 가능합니다.
            </p>
            <p>
              3. 이미 사용이 개시되었거나 유효기간이 만료된 기간제 이용권은 원칙적으로 환불이 제한될 수 있습니다.
            </p>
          </section>

          {/* 제 4조: 면책 조항 */}
          <section className="space-y-2 pt-4 border-t border-white/[0.06]">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-indigo-400">제 4조</span> (면책 조항)
            </h2>
            <p>
              1. 회사는 이용자가 서비스에 게재한 익명 정보 및 사연의 진실성, 신뢰성에 대해 법적 보증을 하지 않습니다.
            </p>
            <p>
              2. 본 서비스에서 제공되는 AI 및 유저의 위로의 말은 심리적 안정감을 위한 응원 메시지이며, 전문적인 정신건강의학적 진료나 치료를 대체하지 않습니다. 위급한 심리적 위기 상황 시에는 전문 상담 기관(보건복지부 정신건강상담전화 1577-0199)의 도움을 받으시기 바랍니다.
            </p>
          </section>

        </div>

        {/* 하단 푸터 */}
        <div className="pt-4 text-center text-xs text-slate-500">
          © 2026 LogMate. 따뜻함과 존중이 살아있는 안식처를 함께 만들어갑니다.
        </div>

      </div>
    </div>
  );
}
