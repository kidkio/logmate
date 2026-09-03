'use client';

import React, { useState } from 'react';
import { Moon, Sparkles, ShieldCheck, Users, Mail, ArrowRight, X } from 'lucide-react';
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
      <div className="w-full max-w-md min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-7 relative shadow-2xl border-x border-slate-900/80 antialiased overflow-hidden">
        {/* 상단 장식용 배경 은하수 빛 */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* 상단 브랜드 헤더 */}
        <div className="space-y-6 pt-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Moon className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-indigo-400 uppercase block">
                LogMate
              </span>
              <span className="text-[11px] text-slate-400 font-medium">로그메이트</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              익명 실패 공유 & 힐링 커뮤니티
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight leading-snug">
              오늘 당신의 실패를<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                공유하세요
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              실패를 털어놓을 가장 다정한 친구, LogMate.<br />
              누구도 당신을 평가하지 않는 밤의 안식처입니다.
            </p>
          </div>
        </div>

        {/* 서비스 핵심 가치 카드 3종 */}
        <div className="space-y-2.5 my-6 relative z-10">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">100% 철저한 익명 활동</h4>
              <p className="text-[11px] text-slate-400">
                실명이나 이메일은 절대 노출되지 않으며, 귀여운 랜덤 닉네임으로 보호됩니다.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">AI 실시간 유사 실패 연결</h4>
              <p className="text-[11px] text-slate-400">
                오늘 나와 똑같은 실수를 겪은 친구들의 수와 사연이 즉시 연결됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 가입 및 로그인 버튼 영역 */}
        <div className="space-y-2.5 pt-2 relative z-10">
          {/* 카카오 로그인 */}
          <button
            onClick={() => loginWithSocial('kakao')}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.76 1.84 5.18 4.62 6.55-.2.74-.74 2.68-.85 3.12-.13.53.19.52.4.38.28-.19 3.84-2.61 4.51-3.07.43.06.87.09 1.32.09 5.52 0 10-3.48 10-7.77S17.52 3 12 3z" />
            </svg>
            <span>카카오로 3초 만에 시작하기</span>
          </button>

          {/* Google 로그인 */}
          <button
            onClick={() => loginWithSocial('google')}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700/80 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50"
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

          {/* 이메일 및 게스트 둘러보기 버튼 */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="flex-1 py-3 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>이메일 로그인</span>
            </button>

            <button
              onClick={loginGuest}
              className="flex-1 py-3 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900/40 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>게스트로 둘러보기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center pt-2 leading-relaxed">
            로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.<br />
            이메일은 본인 확인에만 사용되며 커뮤니티에는 일절 공개되지 않습니다.
          </p>
        </div>

        {/* 이메일 입력 모달 */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative space-y-4">
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>이메일로 시작하기</span>
                </h3>
                <p className="text-xs text-slate-400">
                  사용하시는 이메일 주소를 입력하시면 간편하게 계정이 생성됩니다.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-950 text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-sm border border-slate-800 focus:border-indigo-500 outline-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
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
