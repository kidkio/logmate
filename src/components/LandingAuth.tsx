'use client';

import React, { useState } from 'react';
import { Moon, Sparkles, ShieldCheck, Users, Mail, ArrowRight, X, Clock, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function LandingAuth() {
  const { loginWithSocial, loginWithEmail, loginGuest, isLoading } = useAuth();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    await loginWithEmail(emailInput);
    setIsSubmitting(false);
    setIsEmailModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-black flex justify-center selection:bg-indigo-500 selection:text-white">
      {/* 21st.dev 모바일 앱 프레임 컨테이너 */}
      <div className="w-full max-w-md min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between p-6 sm:p-7 relative shadow-[0_0_80px_rgba(0,0,0,0.9)] border-x border-white/[0.06] antialiased overflow-hidden">
        
        {/* 21st.dev 시그니처 앰비언트 글로우 & 배경 도트 그리드 */}
        <div className="absolute inset-0 bg-dot-pattern opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)] pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 상단 브랜드 헤더 & 앰비언트 배너 */}
        <div className="space-y-6 pt-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                  <Moon className="w-5 h-5 fill-white/20" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wider text-indigo-400 uppercase">
                    LogMate
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">v2.0</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">실패를 털어놓는 밤</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>실시간 익명 연결 중</span>
            </div>
          </div>

          <div className="space-y-3">
            {/* 21st.dev 글로잉 필 뱃지 */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>실패는 부끄러운 것이 아닙니다</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight leading-snug">
              오늘 당신의 실패를<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                안전하게 공유하세요
              </span>
            </h1>

            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              누구도 당신을 평가하지 않는 밤의 안식처, LogMate.<br />
              털어놓는 순간, 혼자가 아님을 알게 됩니다.
            </p>
          </div>
        </div>

        {/* 21st.dev 스타일 Bento Grid (벤토 그리드 핵심 가치) */}
        <div className="grid grid-cols-1 gap-2.5 my-5 relative z-10">
          {/* Bento Card 1: 100% 익명성 */}
          <div className="glass-card rounded-2xl p-4 transition-all duration-300 hover:border-indigo-500/30 flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>100% 완전 익명 활동</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.2 rounded font-mono">
                    Encrypted
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  실명/이메일 일절 비공개 · 귀여운 랜덤 닉네임 자동 부여
                </p>
              </div>
            </div>
          </div>

          {/* Bento Card 2: AI 실시간 유사 실패 매칭 */}
          <div className="glass-card rounded-2xl p-4 transition-all duration-300 hover:border-pink-500/30 flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">AI 실시간 유사 실패 매칭</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  &ldquo;오늘 나와 같은 실수를 한 사람: 14명 발견&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Bento Card 3: 새벽 3시 리셋 */}
          <div className="glass-card rounded-2xl p-4 transition-all duration-300 hover:border-amber-500/30 flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">새벽 3시 일일 리셋 & 꿀잠</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  이불킥 대신 토닥임을 나누고 내일은 새하얀 백지로 시작
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 21st.dev 프리미엄 CTA 버튼 그룹 */}
        <div className="space-y-2.5 pt-1 relative z-10">
          {/* 카카오 로그인 */}
          <button
            onClick={() => loginWithSocial('kakao')}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(254,229,0,0.15)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.76 1.84 5.18 4.62 6.55-.2.74-.74 2.68-.85 3.12-.13.53.19.52.4.38.28-.19 3.84-2.61 4.51-3.07.43.06.87.09 1.32.09 5.52 0 10-3.48 10-7.77S17.52 3 12 3z" />
            </svg>
            <span>카카오로 3초 만에 시작하기</span>
          </button>

          {/* Google 계정 로그인 */}
          <button
            onClick={() => loginWithSocial('google')}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-white/[0.05] hover:bg-white/[0.08] text-slate-100 border border-white/[0.1] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
              />
            </svg>
            <span>Google 계정으로 계속하기</span>
          </button>

          {/* 이메일 & 게스트 둘러보기 */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="flex-1 py-3 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>이메일 로그인</span>
            </button>

            <button
              onClick={loginGuest}
              className="flex-1 py-3 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>게스트로 둘러보기</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 pt-2 text-center">
            <Lock className="w-3 h-3 text-slate-600 flex-shrink-0" />
            <span>이메일은 오직 본인 확인에만 쓰이며 다른 유저에게 절대 공개되지 않습니다</span>
          </div>
        </div>

        {/* 이메일 로그인 모달 */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-sm glass-card bg-slate-900/95 border border-white/[0.12] rounded-3xl p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-100">이메일로 시작하기</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  사용하시는 이메일 주소를 입력하시면 간편하게 계정이 생성됩니다.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3 pt-1">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-950/90 text-slate-100 placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm border border-white/[0.08] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {isSubmitting ? '진행 중...' : '계속하기'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
