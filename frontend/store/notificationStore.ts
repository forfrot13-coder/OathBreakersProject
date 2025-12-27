'use client';

import { create } from 'zustand';
import type { GameError } from '@/lib/types';
import { getErrorMessage } from '@/lib/errorHandler';
import { useSoundStore } from './soundStore';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface GameNotification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  createdAt: string;
  persistent?: boolean;
  read?: boolean;
}

interface NotificationState {
  toastsEnabled: boolean;
  desktopEnabled: boolean;
  notifications: GameNotification[];

  hydrate: () => void;
  setDesktopEnabled: (enabled: boolean) => void;
  setToastsEnabled: (enabled: boolean) => void;

  notify: (n: Omit<GameNotification, 'id' | 'createdAt'>) => void;
  notifyError: (error: unknown, title?: string) => void;
  markRead: (id: string) => void;
  clear: () => void;
}

const STORAGE_KEY = 'notifications:v1';

function uuid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  toastsEnabled: true,
  desktopEnabled: false,
  notifications: [],

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<Pick<NotificationState, 'toastsEnabled' | 'desktopEnabled' | 'notifications'>>;
      set({
        toastsEnabled: parsed.toastsEnabled ?? true,
        desktopEnabled: parsed.desktopEnabled ?? false,
        notifications: parsed.notifications ?? [],
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },

  setDesktopEnabled: (enabled) => {
    set({ desktopEnabled: enabled });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          toastsEnabled: get().toastsEnabled,
          desktopEnabled: enabled,
          notifications: get().notifications,
        })
      );
    }
  },

  setToastsEnabled: (enabled) => {
    set({ toastsEnabled: enabled });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          toastsEnabled: enabled,
          desktopEnabled: get().desktopEnabled,
          notifications: get().notifications,
        })
      );
    }
  },

  notify: (n) => {
    const notification: GameNotification = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      read: false,
      ...n,
    };

    set((state) => ({ notifications: [notification, ...state.notifications].slice(0, 100) }));

    const sound = useSoundStore.getState();
    if (notification.type === 'success') sound.playEffect('success');
    if (notification.type === 'error') sound.playEffect('error');

    if (get().toastsEnabled) {
      void import('react-hot-toast').then(({ default: toast }) => {
        const msg = notification.title ? `${notification.title}: ${notification.message}` : notification.message;
        if (notification.type === 'success') toast.success(msg);
        else if (notification.type === 'error') toast.error(msg);
        else toast(msg);
      });
    }

    if (get().desktopEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        // eslint-disable-next-line no-new
        new Notification(notification.title ?? 'OathBreakers', { body: notification.message });
      }
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          toastsEnabled: get().toastsEnabled,
          desktopEnabled: get().desktopEnabled,
          notifications: get().notifications,
        })
      );
    }
  },

  notifyError: (error, title) => {
    const message = getErrorMessage(error);
    const details = error as Partial<GameError> | undefined;

    get().notify({
      type: 'error',
      title: title ?? 'خطا',
      message: details?.message && details.message !== message ? `${message} (${details.message})` : message,
    });
  },

  markRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  clear: () => set({ notifications: [] }),
}));
