/** 音频管理器 —— 单例控制所有游戏音效 */

type SoundName = 'button' | 'start' | 'bgMusic' | 'shot' | 'killed' | 'gameOver';

class AudioManager {
  private els: Map<SoundName, HTMLAudioElement> = new Map();

  init(sources: Record<SoundName, string>): void {
    const ids: Record<SoundName, string> = {
      button: 'audio-button',
      start: 'audio-start',
      bgMusic: 'audio-bgMusic',
      shot: 'audio-shot',
      killed: 'audio-killed',
      gameOver: 'audio-gameOver',
    };

    for (const [name, src] of Object.entries(sources)) {
      const el = document.getElementById(ids[name as SoundName]) as HTMLAudioElement | null;
      if (el) {
        const source = el.querySelector('source');
        if (source) source.src = src;
        el.load();
        this.els.set(name as SoundName, el);
      }
    }
  }

  play(name: SoundName): void {
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

  setVolume(name: SoundName, vol: number): void {
    const el = this.els.get(name);
    if (el) el.volume = vol;
  }
}

export const audioManager = new AudioManager();
