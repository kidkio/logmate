'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, password: string, nickname?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSocial: (provider: 'kakao' | 'google') => Promise<{ success: boolean; error?: string }>;
  loginGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateNickname: (newNickname: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 앱 기동 시 실제 서버 세션 쿠키 검증 (/api/auth/me)
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('logmate_user', JSON.stringify(data.user));
        } else {
          // 쿠키가 없으면 로컬 스토리지 확인
          const local = localStorage.getItem('logmate_user');
          if (local) {
            try {
              setUser(JSON.parse(local));
            } catch {
              localStorage.removeItem('logmate_user');
            }
          }
        }
      } catch (err) {
        console.error('Failed to check auth:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  // 2. 실제 이메일 로그인
  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || '로그인에 실패했습니다.' };
      }

      setUser(data.user);
      localStorage.setItem('logmate_user', JSON.stringify(data.user));
      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: '서버 통신 오류가 발생했습니다.' };
    }
  };

  // 3. 실제 이메일 회원가입
  const signupWithEmail = async (email: string, password: string, nickname?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || '회원가입에 실패했습니다.' };
      }

      setUser(data.user);
      localStorage.setItem('logmate_user', JSON.stringify(data.user));
      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: '서버 통신 오류가 발생했습니다.' };
    }
  };

  // 4. 소셜 로그인 (카카오 / 구글)
  const loginWithSocial = async (provider: 'kakao' | 'google') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || '소셜 인증에 실패했습니다.' };
      }

      setUser(data.user);
      localStorage.setItem('logmate_user', JSON.stringify(data.user));
      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: '서버 통신 오류가 발생했습니다.' };
    }
  };

  // 5. 게스트 모드
  const loginGuest = async () => {
    setIsLoading(true);
    const guestUser: User = {
      id: `usr_guest_` + Date.now().toString(36),
      nickname: '게스트 쿼카 #' + Math.floor(Math.random() * 900 + 100),
      provider: 'guest',
      createdAt: new Date().toISOString(),
    };
    setUser(guestUser);
    localStorage.setItem('logmate_user', JSON.stringify(guestUser));
    setIsLoading(false);
  };

  // 6. 로그아웃
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
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
        loginWithEmail,
        signupWithEmail,
        loginWithSocial,
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
