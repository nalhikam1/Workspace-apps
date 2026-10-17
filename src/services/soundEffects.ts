// Web Audio API Synthesized Sound Effects and Ambient Sound Player

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbientMode: string | null = null;
  private ambientVolume: number = 0.5;

  constructor() {
    // Read user preference
    try {
      const stored = localStorage.getItem('workstudio_sound_enabled');
      if (stored !== null) {
        this.soundEnabled = stored === 'true';
      }
    } catch {
      this.soundEnabled = true;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('workstudio_sound_enabled', String(enabled));
    } catch {}
  }

  // Tactile Mechanical Click Sound
  public playClickSound(): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Crisp pitch decay
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch (e) {
      // AudioContext might be blocked until user gesture, safe fallback
    }
  }

  // Success / Completion Chime
  public playCompletionChime(): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch {}
  }

  // AMBIENT SOUND GENERATOR (Rain, Cafe, White Noise, Lo-fi)
  public startAmbient(mode: 'rain' | 'cafe' | 'whitenoise' | 'lofi'): void {
    this.stopAmbient();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.currentAmbientMode = mode;
    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.ambientVolume * 0.35, ctx.currentTime);
    this.ambientGain.connect(ctx.destination);

    // Buffer noise generator
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (mode === 'rain') {
        // Pink noise filter approximation
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      } else if (mode === 'cafe') {
        // Brown noise + rumble
        lastOut = (lastOut + 0.015 * white) / 1.015;
        data[i] = lastOut * 3.0;
      } else if (mode === 'whitenoise') {
        data[i] = white * 0.25;
      } else {
        // Lo-fi mellow wave
        data[i] = (Math.sin(i / 80) * 0.2) + (white * 0.04);
      }
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter shaping
    const filter = ctx.createBiquadFilter();
    if (mode === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
    } else if (mode === 'cafe') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
    } else if (mode === 'whitenoise') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
    }

    noise.connect(filter);
    filter.connect(this.ambientGain);
    noise.start();
    this.ambientSource = noise;
  }

  public stopAmbient(): void {
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioBufferSourceNode).stop();
        this.ambientSource.disconnect();
      } catch {}
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch {}
      this.ambientGain = null;
    }
    this.currentAmbientMode = null;
  }

  public getCurrentAmbientMode(): string | null {
    return this.currentAmbientMode;
  }

  public setAmbientVolume(vol: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.audioCtx) {
      this.ambientGain.gain.setValueAtTime(this.ambientVolume * 0.35, this.audioCtx.currentTime);
    }
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  // Setup global click sound on all interactive buttons
  public initGlobalClickSound(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('button, a, input[type="checkbox"], input[type="radio"], [role="button"], select, .btn-interactive');
      if (clickable) {
        this.playClickSound();
      }
    }, true);
  }
}

export const SoundEffects = new SoundEffectsService();
