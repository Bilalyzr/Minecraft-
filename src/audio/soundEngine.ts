// Procedural Web Audio API soundscape synthesizer (zero external audio files required)
class SpringSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private birdTimer: number | null = null;
  private lastStepTime = 0;

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    if (enable) {
      this.initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setTargetAtTime(0.06, this.ctx.currentTime, 0.25);
      }
    } else if (this.ctx) {
      if (this.ambientGain) {
        this.ambientGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.15);
      }
      if (this.engineGain) {
        this.engineGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.1);
      }
    }
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();

    // Gentle filtered spring breeze / stream noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.03 * white) / 1.03;
      lastOut = data[i];
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 520;
    filter.Q.value = 0.7;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.05;

    noise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    noise.start();

    // Vehicle Engine Synth
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 55;

    const engineFilter = this.ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.value = 210;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.0;

    this.engineOsc.connect(engineFilter);
    engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);
    this.engineOsc.start();

    // Occasional pleasant spring birdsong chirps
    this.birdTimer = window.setInterval(() => {
      if (this.enabled && Math.random() < 0.55) {
        this.playBirdChirp();
      }
    }, 3400);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const notes = [2100 + Math.random() * 500, 2650 + Math.random() * 450, 2350 + Math.random() * 400];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t0 = now + idx * 0.095;
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.18, t0 + 0.07);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.018, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.085);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.09);
    });
  }

  public playFootstep(isStone = false) {
    if (!this.ctx || !this.enabled) return;
    const now = performance.now();
    if (now - this.lastStepTime < 220) return;
    this.lastStepTime = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isStone ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isStone ? 175 : 115, t);
    osc.frequency.exponentialRampToValueAtTime(52, t + 0.055);
    gain.gain.setValueAtTime(0.032, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.065);
  }

  public updateVehicleEngine(isDriving: boolean, speedKmh: number, boosting: boolean) {
    if (!this.ctx || !this.engineOsc || !this.engineGain) return;
    const t = this.ctx.currentTime;
    if (!this.enabled || !isDriving) {
      this.engineGain.gain.setTargetAtTime(0.0, t, 0.12);
      return;
    }
    const targetFreq = 48 + Math.min(130, speedKmh * 1.75) + (boosting ? 32 : 0);
    const targetVol = 0.028 + Math.min(0.035, (speedKmh / 110) * 0.035);
    this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.08);
    this.engineGain.gain.setTargetAtTime(targetVol, t, 0.1);
  }

  public playChime(variant: 'pad' | 'mount' | 'horn' | 'teleport' = 'pad') {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    if (variant === 'horn') {
      [392, 493.88].forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1100;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
      return;
    }

    const chord =
      variant === 'pad'
        ? [523.25, 659.25, 783.99, 1046.5]
        : variant === 'teleport'
          ? [440, 554.37, 659.25, 880]
          : [392, 523.25];

    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t0 = t + i * 0.055;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.035, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.34);
    });
  }
}

export const soundEngine = new SpringSoundEngine();
