/** 音频管理器 —— 单例控制所有游戏音效 */

type SoundName = 'button' | 'start' | 'bgMusic' | 'shot' | 'killed' | 'gameOver';

class AudioManager {
  private els: Map<SoundName, HTMLAudioElement> = new Map();
  private muted = false;
  private masterVolume = 1;
  private bgMusicFaded = false;

  /** 从 Vite 导入的 URL 直接创建 Audio 元素（无需 DOM） */
  init(sources: Record<SoundName, string>): void {
    for (const [name, src] of Object.entries(sources)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      if (name === 'bgMusic') {
        audio.loop = true;
        audio.volume = 0.6;
      }
      if (name === 'shot') {
        audio.volume = 0.4;
      }
      this.els.set(name as SoundName, audio);
    }

  }

  play(name: SoundName): void {
    if (this.muted) return;
    const el = this.els.get(name);
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => {});
    }
  }

  pause(name: SoundName): void {
    const el = this.els.get(name);
    if (el) el.pause();
  }

  /** 背景音乐渐入（移动端友好） */
  fadeInBgMusic(duration = 2000): void {
    if (this.bgMusicFaded || this.muted) return;
    this.bgMusicFaded = true;
    const el = this.els.get('bgMusic');
    if (!el) return;
    if (this.fadeOutRAF) {
      cancelAnimationFrame(this.fadeOutRAF);
      this.fadeOutRAF = 0;
    }
    el.currentTime = 0;
    el.volume = 0;
    el.play().catch(() => {});
    const target = 0.6 * this.masterVolume;
    const start = performance.now();
    const fade = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      el.volume = target * progress;
      if (progress < 1) requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  }

  private fadeOutRAF = 0;

  /** 背景音乐渐出 */
  fadeOutBgMusic(duration = 800): void {
    this.bgMusicFaded = false;
    const el = this.els.get('bgMusic');
    if (!el) return;
    if (this.fadeOutRAF) cancelAnimationFrame(this.fadeOutRAF);
    const startVolume = el.volume;
    const start = performance.now();
    const fade = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      el.volume = startVolume * (1 - progress);
      if (progress < 1) {
        this.fadeOutRAF = requestAnimationFrame(fade);
      } else {
        el.pause();
        this.fadeOutRAF = 0;
      }
    };
    requestAnimationFrame(fade);
  }

  setVolume(name: SoundName, vol: number): void {
    const el = this.els.get(name);
    if (el) el.volume = vol;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      for (const el of this.els.values()) el.pause();
    }
    return this.muted;
  }

  setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }
}

export const audioManager = new AudioManager();
