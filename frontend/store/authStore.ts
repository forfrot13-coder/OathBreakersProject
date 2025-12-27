'use client';

import { create } from 'zustand';
import { apiFetchJson, setTokenProvider, setUnauthorizedHandler } from '@/lib/api';
import { endpoints } from '@/lib/endpoints';
import type { AuthResponse, User } from '@/lib/types';
import { isValidPassword, isValidUsername } from '@/lib/utils';

interface AuthError {
  code: 'INVALID_CREDENTIALS' | 'USER_EXISTS' | 'SERVER_ERROR' | 'NETWORK_ERROR';
  message: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: AuthError | null;

  deviceToken: string | null;
  lastLoginTime: string | null;

  failedLoginAttempts: number;
  lockoutUntil: string | null;

  initializeAuth: () => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, confirmPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => void;

  setUser: (user: User) => void;
  setDeviceToken: (token: string | null) => void;
  clearError: () => void;
}

const STORAGE_KEY = 'auth:v2';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function nowIso() {
  return new Date().toISOString();
}

function isLocked(lockoutUntil: string | null) {
  if (!lockoutUntil) return false;
  return new Date(lockoutUntil).getTime() > Date.now();
}

function persist(state: Pick<
  AuthStore,
  | 'user'
  | 'token'
  | 'deviceToken'
  | 'lastLoginTime'
  | 'failedLoginAttempts'
  | 'lockoutUntil'
>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  if (state.token) window.localStorage.setItem('token', state.token);
  else window.localStorage.removeItem('token');

  if (state.user) window.localStorage.setItem('user', JSON.stringify(state.user));
  else window.localStorage.removeItem('user');
}

function readPersisted(): Partial<AuthStore> {
  if (typeof window === 'undefined') return {};

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Partial<AuthStore>;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Backward compatible legacy keys
  const token = window.localStorage.getItem('token');
  const userStr = window.localStorage.getItem('user');
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr) as User;
      return { token, user };
    } catch {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    }
  }

  return {};
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  deviceToken: null,
  lastLoginTime: null,
  failedLoginAttempts: 0,
  lockoutUntil: null,

  initializeAuth: () => {
    const persisted = readPersisted();

    set({
      user: (persisted.user as User) ?? null,
      token: (persisted.token as string) ?? null,
      deviceToken: (persisted.deviceToken as string) ?? null,
      lastLoginTime: (persisted.lastLoginTime as string) ?? null,
      failedLoginAttempts: (persisted.failedLoginAttempts as number) ?? 0,
      lockoutUntil: (persisted.lockoutUntil as string) ?? null,
    });

    setTokenProvider(() => useAuthStore.getState().token);
    setUnauthorizedHandler(() => useAuthStore.getState().logout());
  },

  clearError: () => set({ error: null }),

  setDeviceToken: (token) => {
    set({ deviceToken: token });
    persist({
      user: get().user,
      token: get().token,
      deviceToken: token,
      lastLoginTime: get().lastLoginTime,
      failedLoginAttempts: get().failedLoginAttempts,
      lockoutUntil: get().lockoutUntil,
    });
  },

  setUser: (user) => {
    set({ user });
    persist({
      user,
      token: get().token,
      deviceToken: get().deviceToken,
      lastLoginTime: get().lastLoginTime,
      failedLoginAttempts: get().failedLoginAttempts,
      lockoutUntil: get().lockoutUntil,
    });
  },

  login: async (username, password) => {
    if (!isValidUsername(username)) {
      throw new Error('نام‌کاربری نامعتبر است');
    }
    if (!isValidPassword(password)) {
      throw new Error('رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد');
    }

    if (isLocked(get().lockoutUntil)) {
      throw new Error('حساب شما موقتاً قفل شده است. کمی بعد دوباره تلاش کنید');
    }

    set({ isLoading: true, error: null });

    try {
      const data = await apiFetchJson<AuthResponse>(endpoints.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const lastLoginTime = nowIso();

      set({
        token: data.token,
        user: data.user,
        isLoading: false,
        lastLoginTime,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      });

      persist({
        token: data.token,
        user: data.user,
        deviceToken: get().deviceToken,
        lastLoginTime,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      });
    } catch (err) {
      const attempts = get().failedLoginAttempts + 1;
      const lockoutUntil = attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString() : null;

      set({
       isLoading: false,
       error: {
         code: 'INVALID_CREDENTIALS',
         message: err instanceof Error ? err.message : 'خطا در ورود'
       },
       failedLoginAttempts: attempts,
       lockoutUntil,
      });

      persist({
        token: get().token,
        user: get().user,
        deviceToken: get().deviceToken,
        lastLoginTime: get().lastLoginTime,
        failedLoginAttempts: attempts,
        lockoutUntil,
      });

      throw err;
    }
  },

  register: async (username, password, confirmPassword) => {
    if (!isValidUsername(username)) {
      throw new Error('نام‌کاربری نامعتبر است');
    }
    if (!isValidPassword(password)) {
      throw new Error('رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد');
    }
    if (password !== confirmPassword) {
      throw new Error('رمز عبور و تکرار آن یکسان نیست');
    }

    set({ isLoading: true, error: null });

    try {
      const data = await apiFetchJson<AuthResponse>(endpoints.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const lastLoginTime = nowIso();

      set({
        token: data.token,
        user: data.user,
        isLoading: false,
        lastLoginTime,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      });

      persist({
        token: data.token,
        user: data.user,
        deviceToken: get().deviceToken,
        lastLoginTime,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      });
    } catch (err) {
      set({
       isLoading: false,
       error: {
         code: 'SERVER_ERROR',
         message: err instanceof Error ? err.message : 'خطا در ثبت‌نام'
       }
      });
      throw err;
    }
  },

  refreshToken: async () => {
    const token = get().token;
    if (!token) return;

    try {
      const data = await apiFetchJson<Partial<AuthResponse>>(endpoints.auth.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (data.token) {
        set({ token: data.token });
        persist({
          token: data.token,
          user: get().user,
          deviceToken: get().deviceToken,
          lastLoginTime: get().lastLoginTime,
          failedLoginAttempts: get().failedLoginAttempts,
          lockoutUntil: get().lockoutUntil,
        });
      }
    } catch {
      // Backend might not support refresh; ignore.
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    }

    set({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });
  },
}));

setTokenProvider(() => useAuthStore.getState().token);
setUnauthorizedHandler(() => useAuthStore.getState().logout());
