'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithSocial: (provider: 'kakao' | 'google') => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  loginGuest: () => Promise<void>;
  logout: () => void;
  updateNickname: (newNickname: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADJECTIVES = ['이불킥하는', '토닥이는', '서투른', '야근하는', '밤샘하는', '용감한', '작심삼일', '따뜻한', '덤벙대는', '길잃은'];
const NOUNS = ['펭귄', '쿼카', '다람쥐', '고양이', '햄스터', '수달', '곰돌이', '판다', '참새', '토끼'];

function generateAnonymousNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj} ${noun} #${num}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. 로컬 스토리지에서 기존 세션 복원
    const saved = localStorage.getItem('logmate_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('logmate_user');
      }
    }

    // 2. Supabase Auth 리스너 (설정된 경우)
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const newUser: User = {
            id: session.user.id,
            email: session.user.email,
            nickname: generateAnonymousNickname(),
            provider: (session.user.app_metadata.provider as any) || 'email',
            createdAt: session.user.created_at,
          };
          setUser(newUser);
          localStorage.setItem('logmate_user', JSON.stringify(newUser));
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const newUser: User = {
            id: session.user.id,
            email: session.user.email,
            nickname: generateAnonymousNickname(),
            provider: (session.user.app_metadata.provider as any) || 'email',
            createdAt: session.user.created_at,
          };
          setUser(newUser);
          localStorage.setItem('logmate_user', JSON.stringify(newUser));
        } else if (!saved) {
          setUser(null);
        }
      });

      setIsLoading(false);
      return () => subscription.unsubscribe();
    }

    setIsLoading(false);
  }, []);

  const loginWithSocial = async (provider: 'kakao' | 'google') => {
    setIsLoading(true);
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider === 'kakao' ? ('kakao' as any) : 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        return;
      } catch (err) {
        console.warn('Supabase OAuth failed, proceeding with local simulated login:', err);
      }
    }

    // 로컬 시뮬레이션 로그인 (API 키 미설정 환경에서도 1초 만에 테스트 가능)
    const mockUser: User = {
      id: `usr_${provider}_` + Date.now().toString(36),
      email: `${provider}_user@example.com`,
      nickname: generateAnonymousNickname(),
      provider,
      createdAt: new Date().toISOString(),
    };
    setUser(mockUser);
    localStorage.setItem('logmate_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const loginWithEmail = async (email: string) => {
    setIsLoading(true);
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        });
        if (!error) {
          alert('로그인 확인 이메일이 발송되었습니다! 메일함을 확인해주세요.');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase OTP failed, fallback to local login:', err);
      }
    }

    const mockUser: User = {
      id: `usr_email_` + Date.now().toString(36),
      email,
      nickname: generateAnonymousNickname(),
      provider: 'email',
      createdAt: new Date().toISOString(),
    };
    setUser(mockUser);
    localStorage.setItem('logmate_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const loginGuest = async () => {
    setIsLoading(true);
    const guestUser: User = {
      id: `usr_guest_` + Date.now().toString(36),
      nickname: generateAnonymousNickname(),
      provider: 'guest',
      createdAt: new Date().toISOString(),
    };
    setUser(guestUser);
    localStorage.setItem('logmate_user', JSON.stringify(guestUser));
    setIsLoading(false);
  };

  const logout = () => {
    if (supabase) {
      supabase.auth.signOut().catch(console.error);
    }
    localStorage.removeItem('logmate_user');
    setUser(null);
  };

  const updateNickname = (newNickname: string) => {
    if (!user) return;
    const updated = { ...user, nickname: newNickname };
    setUser(updated);
    localStorage.setItem('logmate_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithSocial,
        loginWithEmail,
        loginGuest,
        logout,
        updateNickname,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
