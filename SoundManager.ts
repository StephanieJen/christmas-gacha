class SoundManager {
  private ctx: AudioContext | null = null;
  private musicEnabled = false;
  private sfxEnabled = false;
  private musicAudio: HTMLAudioElement | null = null;
  private audioUnlocked = false;

  constructor() {
    // Audio element will be grabbed from DOM when needed
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private getAudioElement(): HTMLAudioElement | null {
    if (this.musicAudio) return this.musicAudio;
    const el = document.getElementById('bgm') as HTMLAudioElement;
    if (el) this.musicAudio = el;
    return this.musicAudio;
  }

  /**
   * Specifically for unlocking audio on the very first user interaction
   */
  public unlockAudio() {
    if (this.audioUnlocked) return;
    
    this.initCtx();
    const audio = this.getAudioElement();
    
    if (audio) {
      audio.muted = false;
      audio.volume = 0; // Start silent for fade-in
      const p = audio.play();
      
      if (p instanceof Promise) {
        p.then(() => {
          this.audioUnlocked = true;
          this.musicEnabled = true;
          (window as any).gsap.to(audio, { volume: 0.5, duration: 3 });
        }).catch(e => {
          console.warn("Audio play blocked by browser. User must click again.");
        });
      }
    }
  }

  playSfx(type: 'click' | 'spin' | 'reveal') {
    if (!this.sfxEnabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);

    if (type === 'click') {
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start();
      osc.stop(now + 0.1);
    } else if (type === 'spin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(800, now + 1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
      osc.start();
      osc.stop(now + 1);
    } else if (type === 'reveal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start();
      osc.stop(now + 0.5);
    }
  }

  setSfxEnabled(val: boolean) { 
    this.sfxEnabled = val; 
  }

  toggleMusic() {
    const audio = this.getAudioElement();
    if (!audio) return;

    if (this.musicEnabled) {
      this.musicEnabled = false;
      (window as any).gsap.to(audio, { 
        volume: 0, 
        duration: 1, 
        onComplete: () => audio.pause() 
      });
    } else {
      this.musicEnabled = true;
      this.initCtx();
      audio.play().catch(e => console.warn("Music play blocked"));
      (window as any).gsap.to(audio, { volume: 0.5, duration: 2 });
    }
    return this.musicEnabled;
  }

  startMusic() {
    this.initCtx();
    const audio = this.getAudioElement();
    if (audio) {
      this.musicEnabled = true;
      audio.play().then(() => {
        (window as any).gsap.to(audio, { volume: 0.5, duration: 3 });
      }).catch(e => console.warn("Music play blocked"));
    }
  }

  stopMusic() {
    this.musicEnabled = false;
    const audio = this.getAudioElement();
    if (audio) {
      (window as any).gsap.to(audio, { 
        volume: 0, 
        duration: 1, 
        onComplete: () => audio.pause() 
      });
    }
  }
}

export const soundManager = new SoundManager();