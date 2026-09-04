import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Cookie, FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 | LogMate (로그메이트)',
  description: 'LogMate(로그메이트)의 개인정보처리방침 및 Google AdSense 광고 쿠키 정책 안내입니다.',
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Cookie Policy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            LogMate 개인정보처리방침
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            LogMate(이하 &lsquo;서비스&rsquo;)는 이용자의 자유로운 생각과 감정을 지키기 위해 **100% 완전 익명성 보장**과 엄격한 개인정보 보호를 최우선 가치로 여깁니다. 본 방침은 이용자의 개인정보 및 광고 쿠키가 어떻게 안전하게 취급되는지 상세히 설명합니다.
          </p>
        </div>

        {/* 본문 섹션 */}
        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300 bg-white/[0.02] border border-white/[0.08] p-6 sm:p-8 rounded-3xl">
          
          {/* 제 1조: 수집하는 개인정보 항목 및 목적 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-indigo-400">1.</span> 수집하는 정보의 최소화 및 100% 익명 원칙
            </h2>
            <p>
              서비스는 개인을 특정할 수 있는 실명, 주민등록번호, 전화번호, 상세 주소 등의 정보를 **절대로 수집하지 않습니다.**
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>**이메일 회원가입 시**: 이메일 주소, 단방향 암호화(Scrypt)된 비밀번호, 무작위 자동 생성된 익명 닉네임</li>
              <li>**소셜 로그인(카카오/구글) 시**: 소셜 제공자 고유 식별값(ID), 시스템 자동 배정 익명 닉네임 (프로필 사진 및 실명은 서비스에 노출되지 않음)</li>
              <li>**게스트 체험 시**: 브라우저 로컬 식별자(UUID 기반 기기 토큰)</li>
              <li>**자동 수집 항목**: 접속 IP, 서비스 이용 로그, 접속 시간 (부정 이용 방지 및 보안 목적)</li>
            </ul>
          </section>

          {/* 제 2조: Google AdSense 및 타사 광고 쿠키 정책 (구글 애드센스 필수 조항) */}
          <section className="space-y-2 pt-4 border-t border-white/[0.06]">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-indigo-400">2.</span> Google AdSense 및 타사 광고 서비스 쿠키(Cookie) 안내
            </h2>
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                <Cookie className="w-4 h-4 text-amber-400" />
                <span>Google 광고 파트너 규정 준수 명시</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                본 서비스는 무료 힐링 서비스 유지 및 서버 운영을 위해 **Google AdSense**를 통한 광고를 게재할 수 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-400">
                <li>
                  **Google을 포함한 타사 공급업체**는 사용자가 본 웹사이트 또는 다른 웹사이트를 과거에 방문했던 기록을 바탕으로 쿠키(Cookie)를 사용하여 맞춤형 광고를 게재합니다.
                </li>
                <li>
                  Google의 광고 쿠키 사용으로 인해 Google 및 Google 파트너는 사용자의 본 사이트 및 인터넷 상의 다른 사이트 방문 기록을 기반으로 적절한 광고를 제공할 수 있습니다.
                </li>
                <li>
                  이용자는 **Google 광고 설정(<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">adssettings.google.com</a>)**을 방문하여 개인 맞춤 광고 게재를 언제든지 사용 중지할 수 있습니다.
                </li>
                <li>
                  또한, **<a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">www.aboutads.info</a>**를 방문하여 타사 공급업체의 개인 맞춤 광고용 쿠키 사용을 선택 해제할 수 있습니다.
                </li>
              </ul>
            </div>
          </section>

          {/* 제 3조: 개인정보의 보유 및 파기 */}
          <section className="space-y-2 pt-4 border-t border-white/[0.06]">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-indigo-400">3.</span> 개인정보의 보유 기간 및 파기 절차
            </h2>
            <p>
              이용자의 개인정보는 회원 탈퇴 시 즉시 영구 파기됩니다. 탈퇴 시 작성된 사연 및 위로 쪽지는 완전 비식별화되어 복구가 불가능하도록 처리됩니다. 단, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령에 의해 보존할 필요가 있는 결제 기록은 법정 보존 기간(5년) 동안 안전하게 분리 보관됩니다.
            </p>
          </section>

          {/* 제 4조: 이용자의 권리와 행사 방법 */}
          <section className="space-y-2 pt-4 border-t border-white/[0.06]">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-indigo-400">4.</span> 이용자의 권리 및 회원 탈퇴
            </h2>
            <p>
              이용자는 언제든지 서비스 내 [내 서재] 메뉴를 통해 자신의 개인정보를 조회, 수정하거나 즉시 회원 탈퇴 및 데이터 삭제를 요청할 수 있습니다.
            </p>
          </section>

          {/* 제 5조: 개인정보 보호책임자 및 문의처 */}
          <section className="space-y-2 pt-4 border-t border-white/[0.06]">
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-indigo-400">5.</span> 개인정보 보호책임자 및 고객 문의
            </h2>
            <p className="text-slate-400">
              서비스 이용 중 발생하는 모든 개인정보 관련 문의 및 불만 처리는 아래 책임자에게 문의하실 수 있습니다:
            </p>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-slate-300 space-y-1">
              <div>• 담당 부서: LogMate 보안 및 프라이버시 팀</div>
              <div>• 문의 이메일: support@logmate.duckdns.org</div>
            </div>
          </section>

        </div>

        {/* 하단 푸터 */}
        <div className="pt-4 text-center text-xs text-slate-500">
          © 2026 LogMate. All rights reserved. 익명성과 프라이버시를 가장 소중히 여깁니다.
        </div>

      </div>
    </div>
  );
}
