// SoundManager.ts
// Works with <audio id="bgm"> in index.html
// Put mp3 at: public/assets/christmas-morning-glow-455054.mp3
// <source src="/assets/christmas-morning-glow-455054.mp3" type="audio/mpeg" />

type SfxType = "click" | "spin" | "reveal";

class SoundManager {
  private ctx: AudioContext | null = null;

  private musicEnabled = true;   // default ON (but still needs first gesture)
  private sfxEnabled = true;

  private musicAudio: HTMLAudioElement | null = null;
  private audioUnlocked = false;

  // Desired steady volume for BGM (adjust if you want)
  private targetMusicVolume = 0.5;

  constructor() {
    // Grab audio lazily; do not auto-play here (browser blocks)
  }

  private ensureCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      // Resume needs a user gesture in many browsers; safe to call anyway
      this.ctx.resume().catch(() => {});
    }
  }

  private getAudioElement(): HTMLAudioElement | null {
    if (this.musicAudio) return this.musicAudio;

    const el = document.getElementById("bgm") as HTMLAudioElement | null;
    if (!el) return null;

    // Basic sane defaults
    el.loop = true;
    el.preload = "auto";
    el.muted = false;

    // Helpful debug (optional)
    el.addEventListener("error", () => {
      const err = (el.error && el.error.code) || "unknown";
      console.warn("[BGM] audio element error code:", err, "src:", el.currentSrc || el.src);
    });

    this.musicAudio = el;
    return el;
  }

  /**
   * Call this ONCE from the very first user gesture:
   * e.g. "Open Card" / "Let's Draw" button click
   */
  public unlockAudio(): void {
    if (this.audioUnlocked) return;

    this.ensureCtx();
    const audio = this.getAudioElement();
    if (!audio) {
      console.warn("[BGM] #bgm element not found. Did you add it to index.html?");
      return;
    }

    // Make sure we start from a known state
    audio.currentTime = 0;
    audio.muted = false;

    // Start silent, then fade in
    audio.volume = 0;

    // IMPORTANT: play() must happen inside the user gesture call stack
    const p = audio.play();

    // If play() succeeds, we consider audio unlocked for this session
    Promise.resolve(p)
      .then(() => {
        this.audioUnlocked = true;

        // Only enable music if user hasn't turned it off
        if (this.musicEnabled) {
          this.fadeTo(this.targetMusicVolume, 1.8);
        } else {
          // user wants music off, pause immediately
          audio.pause();
        }
      })
      .catch((e) => {
        // Browser blocked because gesture wasn't recognized or user settings
        console.warn("[BGM] play() blocked. Ensure unlockAudio() is called directly in a click handler.", e);
      });
  }

  /** Smoothly fade BGM volume to a target (uses GSAP if available, else fallback). */
  private fadeTo(volume: number, durationSec: number) {
    const audio = this.getAudioElement();
    if (!audio) return;

    const gsap = (window as any).gsap;
    const v = Math.max(0, Math.min(1, volume));

    if (gsap?.to) {
      gsap.to(audio, { volume: v, duration: durationSec, overwrite: true });
      return;
    }

    // Fallback: small JS tween
    const start = audio.volume;
    const delta = v - start;
    const startTs = performance.now();
    const durMs = Math.max(10, durationSec * 1000);

    const tick = (t: number) => {
      const k = Math.min(1, (t - startTs) / durMs);
      audio.volume = start + delta * k;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /** Toggle background music on/off. */
  public toggleMusic(): boolean {
    const audio = this.getAudioElement();
    if (!audio) return this.musicEnabled;

    this.musicEnabled = !this.musicEnabled;

    if (!this.musicEnabled) {
      // Fade out and pause
      this.fadeTo(0, 0.7);
      setTimeout(() => audio.pause(), 750);
      return this.musicEnabled;
    }

    // Turning on:
    // If not unlocked yet, caller should call unlockAudio() from a gesture.
    // We still try play() here; if blocked, user must click again.
    this.ensureCtx();
    audio.muted = false;

    const p = audio.play();
    Promise.resolve(p)
      .then(() => {
        this.fadeTo(this.targetMusicVolume, 1.2);
      })
      .catch((e) => {
        console.warn("[BGM] play() blocked. Click 'Open Card'/'Let's Draw' once to enable audio.", e);
      });

    return this.musicEnabled;
  }

  /** Start music (best called after unlockAudio() or within a user gesture). */
  public startMusic(): void {
    this.musicEnabled = true;

    const audio = this.getAudioElement();
    if (!audio) return;

    this.ensureCtx();
    audio.muted = false;

    const p = audio.play();
    Promise.resolve(p)
      .then(() => {
        // Mark unlocked if we successfully played
        this.audioUnlocked = true;
        this.fadeTo(this.targetMusicVolume, 1.2);
      })
      .catch((e) => {
        console.warn("[BGM] startMusic blocked. Call unlockAudio() from a click handler first.", e);
      });
  }

  public stopMusic(): void {
    this.musicEnabled = false;

    const audio = this.getAudioElement();
    if (!audio) return;

    this.fadeTo(0, 0.7);
    setTimeout(() => audio.pause(), 750);
  }

  /** Enable/disable SFX (oscillator based). */
  public setSfxEnabled(val: boolean): void {
    this.sfxEnabled = val;
    if (val) this.ensureCtx();
  }

  /** Optional: allow UI to set BGM target volume. */
  public setMusicVolume(val: number): void {
    this.targetMusicVolume = Math.max(0, Math.min(1, val));
    const audio = this.getAudioElement();
    if (!audio) return;
    if (this.musicEnabled && !audio.paused) {
      this.fadeTo(this.targetMusicVolume, 0.6);
    }
  }

  /** Simple WebAudio oscillator SFX. */
  public playSfx(type: SfxType): void {
    if (!this.sfxEnabled) return;

    this.ensureCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Default
    osc.type = "sine";

    if (type === "click") {
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.09);
      return;
    }

    if (type === "spin") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(840, now + 0.9);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.start(now);
      osc.stop(now + 0.92);
      return;
    }

    // reveal
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.45);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.start(now);
    osc.stop(now + 0.48);
  }

  /**
   * Convenience method: call from the FIRST CTA click.
   * This both unlocks audio and ensures BGM is on.
   */
  public onFirstUserGesture(): void {
    this.musicEnabled = true;
    this.unlockAudio();
  }
}

export const soundManager = new SoundManager();
