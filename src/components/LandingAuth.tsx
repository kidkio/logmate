'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Moon, Sparkles, ShieldCheck, Lock, Mail, ArrowRight, Dices, AlertCircle, Eye, EyeOff, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const RANDOM_ADJECTIVES = ['이불킥하는', '토닥이는', '서투른', '야근하는', '밤샘하는', '용감한', '작심삼일', '따뜻한', '덤벙대는'];
const RANDOM_NOUNS = ['펭귄', '쿼카', '다람쥐', '고양이', '햄스터', '수달', '곰돌이', '판다', '참새', '토끼'];

function getRandomNickname(): string {
  const adj = RANDOM_ADJECTIVES[Math.floor(Math.random() * RANDOM_ADJECTIVES.length)];
  const noun = RANDOM_NOUNS[Math.floor(Math.random() * RANDOM_NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj} ${noun} #${num}`;
}

export function LandingAuth() {
  const { loginWithSocial, loginWithEmail, signupWithEmail, loginGuest, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(getRandomNickname());
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authErr = params.get('auth_error');
      if (authErr) {
        if (authErr === 'kakao_canceled' || authErr === 'google_canceled') {
          setErrorMsg('소셜 로그인이 취소되었습니다.');
        } else if (authErr.includes('token_failed')) {
          setErrorMsg('소셜 인증 토큰 발급에 실패했습니다.');
        } else {
          setErrorMsg('소셜 로그인 처리 중 오류가 발생했습니다.');
        }
      }
    }
  }, []);

  const handleRollNickname = () => {
    setNickname(getRandomNickname());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await loginWithEmail(email, password);
      if (!res.success) {
        setErrorMsg(res.error || '로그인에 실패했습니다.');
      }
    } else {
      const res = await signupWithEmail(email, password);
      if (!res.success) {
        setErrorMsg(res.error || '회원가입에 실패했습니다.');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black flex justify-center selection:bg-indigo-500 selection:text-white">
      {/* 21st.dev 모바일 앱 컨테이너 */}
      <div className="w-full max-w-md min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between p-6 sm:p-7 relative shadow-[0_0_80px_rgba(0,0,0,0.9)] border-x border-white/[0.06] antialiased overflow-y-auto">
        
        {/* 배경 앰비언트 글로우 & 도트 그리드 */}
        <div className="absolute inset-0 bg-dot-pattern opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)] pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 상단 브랜드 헤더 */}
        <div className="space-y-4 pt-2 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <Moon className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <span className="text-xs font-black tracking-wider text-indigo-400 uppercase block">
                  LogMate
                </span>
                <span className="text-[11px] text-slate-400 font-medium">로그메이트</span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>보안 인증 활성화</span>
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {mode === 'login' ? '다시 오신 것을 환영해요' : '나만의 안식처 만들기'}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {mode === 'login'
                ? '가입하신 이메일과 비밀번호로 로그인하여 오늘을 털어놓으세요.'
                : '이메일은 계정 보관에만 쓰이며, 다른 유저에게는 100% 익명으로 보호됩니다.'}
            </p>
          </div>
        </div>

        {/* 간편 소셜 로그인 버튼들 */}
        <div className="space-y-2 pt-4 relative z-10">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/api/auth/oauth/kakao';
            }}
            disabled={isLoading || isSubmitting}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-[#FEE500] hover:bg-[#FADA0A] text-[#191919] flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(254,229,0,0.15)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.76 1.84 5.18 4.62 6.55-.2.74-.74 2.68-.85 3.12-.13.53.19.52.4.38.28-.19 3.84-2.61 4.51-3.07.43.06.87.09 1.32.09 5.52 0 10-3.48 10-7.77S17.52 3 12 3z" />
            </svg>
            <span>카카오로 3초 만에 시작하기</span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/api/auth/oauth/google';
            }}
            disabled={isLoading || isSubmitting}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-white/[0.05] hover:bg-white/[0.08] text-slate-100 border border-white/[0.1] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
        </div>

        {/* 구분선 */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-[#030712] px-2 text-slate-500 font-medium">
              또는 이메일로 직접 {mode === 'login' ? '로그인' : '가입'}
            </span>
          </div>
        </div>

        {/* 탭 토글: 로그인 vs 회원가입 */}
        <div className="glass-card rounded-2xl p-1 flex items-center mb-4 relative z-10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 실제 로그인/회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
          {/* 에러 메시지 배너 */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 이메일 입력 */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">이메일 주소</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-[#050713] text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-xs border border-white/[0.08] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none"
              />
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* 비밀번호 입력 */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">비밀번호 (6자 이상)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#050713] text-slate-100 placeholder:text-slate-600 rounded-xl px-3.5 py-2.5 text-xs border border-white/[0.08] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300 absolute right-3.5 top-2.5 p-0.5"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 회원가입 시: 완전 익명 닉네임 자동 배정 안내 */}
          {mode === 'signup' && (
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-1 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>100% 완전 익명 닉네임 자동 배정</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                실명 노출을 원천 방지하기 위해 계정 생성 시 <span className="text-pink-300 font-semibold">&lsquo;따뜻한 쿼카 #123&rsquo;</span>과 같은 포근한 익명 닉네임이 무작위로 자동 지정됩니다.
              </p>
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-2"
          >
            {isSubmitting
              ? '처리 중...'
              : mode === 'login'
              ? 'LogMate 로그인'
              : '회원가입 완료하고 시작하기'}
          </button>
        </form>

        {/* 하단 둘러보기 & 심야 쉼터 가이드 & 정책 안내 */}
        <div className="pt-4 space-y-3 relative z-10 text-center">
          <div className="flex flex-col gap-2">
            <button
              onClick={loginGuest}
              disabled={isLoading || isSubmitting}
              className="w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all inline-flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              <span>가입 없이 둘러보기 (게스트 체험)</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>

            <Link
              href="/guide"
              className="w-full py-2 px-3 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/20 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-all inline-flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>🌙 심야 쉼터 가이드 읽기 (마인드케어 아티클)</span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-1">
            <Link href="/about" className="hover:text-slate-200 transition-colors">
              서비스 소개
            </Link>
            <span className="text-slate-600">·</span>
            <Link href="/privacy" className="hover:text-slate-200 transition-colors underline underline-offset-2">
              개인정보처리방침
            </Link>
            <span className="text-slate-600">·</span>
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              이용약관
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% 완전 익명 안식처 · 비밀번호 암호화(Scrypt) 보호</span>
          </div>
        </div>
      </div>
    </div>
  );
}
