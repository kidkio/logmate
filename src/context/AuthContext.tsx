'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { initNewUserWarmth, cleanupLegacyStorageKeys } from '@/lib/warmthSystem';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, password: string, nickname?: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  loginWithSocial: (provider: 'kakao' | 'google') => Promise<{ success: boolean; error?: string }>;
  loginGuest: () => Promise<void>;
  logout: () => Promise<void>;
  withdrawAccount: (deviceId?: string) => Promise<{ success: boolean; error?: string }>;
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
        cleanupLegacyStorageKeys();
        // 소셜 로그인 리다이렉트 후 전달된 토큰 파라미터 확인
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const authToken = urlParams.get('auth_token');
          if (authToken) {
            localStorage.setItem('logmate_token', authToken);
            // URL 파라미터 정리
            urlParams.delete('auth_token');
            urlParams.delete('auth_provider');
            const cleanUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('logmate_token') : null;
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/auth/me', { headers });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('logmate_user', JSON.stringify(data.user));
        } else {
          // 서버 인증 실패 시, 게스트 세션인 경우만 유지하고 그 외는 정리
          const local = localStorage.getItem('logmate_user');
          if (local) {
            try {
              const parsed = JSON.parse(local);
              if (parsed.provider === 'guest') {
                setUser(parsed);
              } else {
                localStorage.removeItem('logmate_user');
                localStorage.removeItem('logmate_token');
                setUser(null);
              }
            } catch {
              localStorage.removeItem('logmate_user');
              localStorage.removeItem('logmate_token');
              setUser(null);
            }
          } else {
            setUser(null);
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

      if (data.token) {
        localStorage.setItem('logmate_token', data.token);
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

      if (data.token) {
        localStorage.setItem('logmate_token', data.token);
      }
      localStorage.setItem('logmate_just_signed_up', 'true');
      initNewUserWarmth(data.user.id);
      setUser(data.user);
      localStorage.setItem('logmate_user', JSON.stringify(data.user));
      setIsLoading(false);
      return { success: true, user: data.user };
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
    localStorage.removeItem('logmate_token');
    const guestUser: User = {
      id: `usr_guest_` + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      nickname: '게스트 쿼카 #' + Math.floor(Math.random() * 900 + 100),
      provider: 'guest',
      createdAt: new Date().toISOString(),
    };
    initNewUserWarmth(guestUser.id);
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
    cleanupLegacyStorageKeys();
    localStorage.removeItem('logmate_user');
    localStorage.removeItem('logmate_token');
    setUser(null);
  };

  // 7. 회원 탈퇴 (모든 데이터 영구 파기)
  const withdrawAccount = async (deviceId?: string) => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('logmate_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/auth/withdraw', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          deviceId,
          isGuest: user?.provider === 'guest',
          userId: user?.id,
        }),
      });
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('logmate_user');
    localStorage.removeItem('logmate_token');
    localStorage.removeItem('logmate_has_pass');
    localStorage.removeItem('logmate_onboarded');
    localStorage.removeItem('logmate_just_signed_up');
    setUser(null);
    setIsLoading(false);
    return { success: true };
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
        withdrawAccount,
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
