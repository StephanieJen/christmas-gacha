// SoundManager.ts
// Works with <audio id="bgm"> in index.html
// Put mp3 at: public/assets/christmas-morning-glow-455054.mp3
// <source src="/assets/christmas-morning-glow-455054.mp3" type="audio/mpeg" />

type SfxType = "click" | "spin" | "reveal";

class SoundManager {
  private ctx: AudioContext | null = null;

  private musicEnabled = true; // default ON (but still needs first gesture)
  private sfxEnabled = true;

  private musicAudio: HTMLAudioElement | null = null;
  private audioUnlocked = false;

  // Desired steady volume for BGM (adjust if you want)
  private targetMusicVolume = 0.5;

  constructor() {
    // Grab audio lazily; do not auto-play here (browser blocks)
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  /** Resume AudioContext (best effort). In Safari/iOS this must be triggered by a user gesture. */
  private async resumeCtx(): Promise<void> {
    const ctx = this.ensureCtx();
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // ignore; may still work via HTMLAudio element
      }
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
    el.playsInline = true; // helpful on iOS

    // Helpful debug (optional)
    el.addEventListener("error", () => {
      const err = (el.error && el.error.code) || "unknown";
      console.warn("[BGM] audio element error code:", err, "src:", el.currentSrc || el.src);
    });

    this.musicAudio = el;
    return el;
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

  /** Try to play audio safely; returns true if playback started. */
  private async safePlay(audio: HTMLAudioElement): Promise<boolean> {
    try {
      // resume ctx first (especially for SFX). Even if it fails, HTMLAudio may still play.
      await this.resumeCtx();

      const p = audio.play();
      await Promise.resolve(p);
      return true;
    } catch (e) {
      console.warn(
        "[BGM] play() blocked. Make sure this runs directly inside a user click handler.",
        e
      );
      return false;
    }
  }

  /**
   * Call this ONCE from the very first user gesture:
   * e.g. "Open Card" button click
   *
   * This will:
   *  - resume audio context (best effort)
   *  - start BGM playback immediately (silently) then fade in
   *  - mark audioUnlocked=true if started
   */
  public unlockAudio(): void {
    if (this.audioUnlocked) return;

    const audio = this.getAudioElement();
    if (!audio) {
      console.warn("[BGM] #bgm element not found. Did you add it to index.html?");
      return;
    }

    // Known state
    audio.muted = false;

    // IMPORTANT:
    // Setting volume to 0 can sometimes be "too silent" if fade never runs due to navigation.
    // Use a tiny audible-safe floor, then fade up.
    audio.volume = 0.01;

    // Start from beginning for first-time greeting feel (optional)
    audio.currentTime = 0;

    // Must happen inside the user gesture call stack
    (async () => {
      const ok = await this.safePlay(audio);
      if (!ok) return;

      this.audioUnlocked = true;

      // Only enable music if user hasn't turned it off
      if (this.musicEnabled) {
        this.fadeTo(this.targetMusicVolume, 1.2);
      } else {
        audio.pause();
      }
    })();
  }

  /**
   * Best “one-liner” for your CTA button.
   * Call this inside the Open Card button click:
   *   soundManager.onFirstUserGesture();
   *
   * It guarantees:
   *  - musicEnabled=true
   *  - if not unlocked: unlock + start playing immediately
   *  - if already unlocked but paused: start playing + fade in
   */
  public onFirstUserGesture(): void {
    this.musicEnabled = true;

    const audio = this.getAudioElement();
    if (!audio) {
      console.warn("[BGM] #bgm element not found. Did you add it to index.html?");
      return;
    }

    if (!this.audioUnlocked) {
      this.unlockAudio();
      return;
    }

    // Already unlocked: make sure it's playing now
    this.startMusic();
  }

  /** Toggle background music on/off. */
  public toggleMusic(): boolean {
    const audio = this.getAudioElement();
    if (!audio) return this.musicEnabled;

    this.musicEnabled = !this.musicEnabled;

    if (!this.musicEnabled) {
      // Fade out and pause
      this.fadeTo(0, 0.6);
      window.setTimeout(() => audio.pause(), 650);
      return this.musicEnabled;
    }

    // Turning on:
    // If not unlocked yet, we must rely on a user gesture.
    // So: try to unlock/play anyway (will succeed if called from a click).
    if (!this.audioUnlocked) {
      this.unlockAudio();
      return this.musicEnabled;
    }

    // Already unlocked: start playing + fade in
    this.startMusic();
    return this.musicEnabled;
  }

  /** Start music (best called after unlockAudio() or within a user gesture). */
  public startMusic(): void {
    this.musicEnabled = true;

    const audio = this.getAudioElement();
    if (!audio) return;

    audio.muted = false;

    (async () => {
      const ok = await this.safePlay(audio);
      if (!ok) return;

      // Mark unlocked if we successfully played
      this.audioUnlocked = true;

      // ensure volume ramps to target
      if (audio.volume < 0.01) audio.volume = 0.01;
      this.fadeTo(this.targetMusicVolume, 0.9);
    })();
  }

  public stopMusic(): void {
    this.musicEnabled = false;

    const audio = this.getAudioElement();
    if (!audio) return;

    this.fadeTo(0, 0.6);
    window.setTimeout(() => audio.pause(), 650);
  }

  /** Enable/disable SFX (oscillator based). */
  public setSfxEnabled(val: boolean): void {
    this.sfxEnabled = val;
    if (val) {
      // best effort: create/resume ctx
      this.ensureCtx();
      this.resumeCtx().catch(() => {});
    }
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

    const ctx = this.ensureCtx();
    if (!ctx) return;

    // Try resume (won't hurt; may fail if not in gesture)
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

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
}

export const soundManager = new SoundManager();
