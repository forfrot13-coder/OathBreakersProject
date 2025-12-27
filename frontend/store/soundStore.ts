'use client';

import { create } from 'zustand';
import { audioManager, type SoundKey } from '@/lib/audioManager';

interface SoundState {
  muted: boolean;
  effectsVolume: number;
  musicVolume: number;
  musicSrc: string | null;

  hydrate: () => void;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setEffectsVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;

  preload: (keys?: SoundKey[]) => void;
  playEffect: (key: SoundKey) => void;
  playMusic: (src: string) => void;
  stopMusic: () => void;
}

const STORAGE_KEY = 'sound:v1';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export const useSoundStore = create<SoundState>((set, get) => ({
  muted: false,
  effectsVolume: 0.6,
  musicVolume: 0.4,
  musicSrc: null,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<Pick<SoundState, 'muted' | 'effectsVolume' | 'musicVolume' | 'musicSrc'>>;
      set({
        muted: !!parsed.muted,
        effectsVolume: clamp01(parsed.effectsVolume ?? 0.6),
        musicVolume: clamp01(parsed.musicVolume ?? 0.4),
        musicSrc: parsed.musicSrc ?? null,
      });

      audioManager.setOptions({
        muted: !!parsed.muted,
        effectsVolume: clamp01(parsed.effectsVolume ?? 0.6),
        musicVolume: clamp01(parsed.musicVolume ?? 0.4),
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },

  setMuted: (muted) => {
    set({ muted });
    audioManager.setOptions({ muted });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          muted,
          effectsVolume: get().effectsVolume,
          musicVolume: get().musicVolume,
          musicSrc: get().musicSrc,
        })
      );
    }
  },

  toggleMuted: () => get().setMuted(!get().muted),

  setEffectsVolume: (volume) => {
    const v = clamp01(volume);
    set({ effectsVolume: v });
    audioManager.setOptions({ effectsVolume: v });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          muted: get().muted,
          effectsVolume: v,
          musicVolume: get().musicVolume,
          musicSrc: get().musicSrc,
        })
      );
    }
  },

  setMusicVolume: (volume) => {
    const v = clamp01(volume);
    set({ musicVolume: v });
    audioManager.setOptions({ musicVolume: v });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          muted: get().muted,
          effectsVolume: get().effectsVolume,
          musicVolume: v,
          musicSrc: get().musicSrc,
        })
      );
    }
  },

  preload: (keys) => {
    audioManager.setOptions({
      muted: get().muted,
      effectsVolume: get().effectsVolume,
      musicVolume: get().musicVolume,
    });
    audioManager.preload(keys);
  },

  playEffect: (key) => {
    audioManager.setOptions({
      muted: get().muted,
      effectsVolume: get().effectsVolume,
      musicVolume: get().musicVolume,
    });
    audioManager.playEffect(key);
  },

  playMusic: (src) => {
    set({ musicSrc: src });
    audioManager.setOptions({
      muted: get().muted,
      effectsVolume: get().effectsVolume,
      musicVolume: get().musicVolume,
    });
    audioManager.playMusic(src);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          muted: get().muted,
          effectsVolume: get().effectsVolume,
          musicVolume: get().musicVolume,
          musicSrc: src,
        })
      );
    }
  },

  stopMusic: () => {
    audioManager.stopMusic();
    set({ musicSrc: null });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          muted: get().muted,
          effectsVolume: get().effectsVolume,
          musicVolume: get().musicVolume,
          musicSrc: null,
        })
      );
    }
  },
}));
