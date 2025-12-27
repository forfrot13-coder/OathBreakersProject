type SoundKey =
  | 'click'
  | 'cardHover'
  | 'cardFlip'
  | 'packOpen'
  | 'purchase'
  | 'success'
  | 'error'
  | 'claim';

export interface AudioManagerOptions {
  effectsVolume: number; // 0..1
  musicVolume: number; // 0..1
  muted: boolean;
}

const defaultSources: Record<SoundKey, string> = {
  click: '/audio/click.mp3',
  cardHover: '/audio/card-hover.mp3',
  cardFlip: '/audio/card-flip.mp3',
  packOpen: '/audio/pack-open.mp3',
  purchase: '/audio/purchase.mp3',
  success: '/audio/success.mp3',
  error: '/audio/error.mp3',
  claim: '/audio/claim.mp3',
};

class AudioManager {
  private effects = new Map<SoundKey, HTMLAudioElement>();
  private music: HTMLAudioElement | null = null;
  private options: AudioManagerOptions = { effectsVolume: 0.6, musicVolume: 0.4, muted: false };

  setOptions(partial: Partial<AudioManagerOptions>) {
    this.options = { ...this.options, ...partial };
    if (this.music) this.music.volume = this.options.muted ? 0 : this.options.musicVolume;
  }

  preload(keys: SoundKey[] = Object.keys(defaultSources) as SoundKey[]) {
    if (typeof window === 'undefined') return;

    keys.forEach((key) => {
      if (this.effects.has(key)) return;

      const audio = new Audio(defaultSources[key]);
      audio.preload = 'auto';
      audio.volume = this.options.muted ? 0 : this.options.effectsVolume;
      this.effects.set(key, audio);
    });
  }

  playEffect(key: SoundKey) {
    if (typeof window === 'undefined') return;
    if (this.options.muted) return;

    try {
      const audio = this.effects.get(key) ?? new Audio(defaultSources[key]);
      audio.volume = this.options.effectsVolume;
      audio.currentTime = 0;
      void audio.play();
      this.effects.set(key, audio);
    } catch {
      // ignore playback failures (autoplay policies, missing files, etc.)
    }
  }

  playMusic(src: string, loop = true) {
    if (typeof window === 'undefined') return;

    try {
      if (this.music) {
        this.music.pause();
        this.music = null;
      }

      const audio = new Audio(src);
      audio.loop = loop;
      audio.preload = 'auto';
      audio.volume = this.options.muted ? 0 : this.options.musicVolume;
      this.music = audio;
      void audio.play();
    } catch {
      // ignore
    }
  }

  stopMusic() {
    if (!this.music) return;
    this.music.pause();
    this.music = null;
  }
}

export const audioManager = new AudioManager();
export type { SoundKey };
