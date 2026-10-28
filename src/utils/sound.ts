class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Lazy initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Authentic tactile mechanical micro-switch click
   */
  public playClick() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;

      // 1. Sharp high-frequency actuation transient (simulates switch snap)
      const oscHigh = this.ctx.createOscillator();
      const gainHigh = this.ctx.createGain();
      oscHigh.type = 'triangle';
      oscHigh.frequency.setValueAtTime(1200, t);
      oscHigh.frequency.exponentialRampToValueAtTime(180, t + 0.025);

      gainHigh.gain.setValueAtTime(0.045, t);
      gainHigh.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      oscHigh.connect(gainHigh);
      gainHigh.connect(this.ctx.destination);

      oscHigh.start(t);
      oscHigh.stop(t + 0.025);

      // 2. Subtle low-end mechanical body thump (simulates keycap bottoming out)
      const oscLow = this.ctx.createOscillator();
      const gainLow = this.ctx.createGain();
      oscLow.type = 'sine';
      oscLow.frequency.setValueAtTime(140, t);
      oscLow.frequency.exponentialRampToValueAtTime(45, t + 0.035);

      gainLow.gain.setValueAtTime(0.035, t);
      gainLow.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      oscLow.connect(gainLow);
      gainLow.connect(this.ctx.destination);

      oscLow.start(t);
      oscLow.stop(t + 0.035);
    } catch {
      // Audio policy safe
    }
  }

  /**
   * Refined harmonic confirmation chime
   */
  public playSuccess() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.08); // E5

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch {}
  }
}

export const soundManager = new SoundSynthesizer();
