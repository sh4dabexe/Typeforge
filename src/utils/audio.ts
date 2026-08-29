import { SoundProfile } from '../types';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playKeySound(profile: SoundProfile, volume: number = 0.5, isError: boolean = false) {
    if (profile === 'off' || volume <= 0) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume * (isError ? 0.35 : 0.25), now);
      gain.connect(this.ctx.destination);

      if (isError) {
        // Subtle low thud error sound
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

        gain.gain.setValueAtTime(volume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.08);
        return;
      }

      if (profile === 'thock') {
        // Deep mechanical switch sound (lubed linear / holy panda style)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        
        // Random micro-variation for realistic switch feel
        const pitchVar = (Math.random() - 0.5) * 20;
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(220 + pitchVar, now);
        osc1.frequency.exponentialRampToValueAtTime(65, now + 0.05);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(440 + pitchVar, now);
        osc2.frequency.exponentialRampToValueAtTime(110, now + 0.03);

        gain.gain.setValueAtTime(volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.06);
        osc2.stop(now + 0.06);

      } else if (profile === 'clicky') {
        // High crisp tactile blue click
        const osc = this.ctx.createOscillator();
        const pitchVar = (Math.random() - 0.5) * 60;
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400 + pitchVar, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.03);

      } else if (profile === 'typewriter') {
        // Vintage heavy clack
        const osc = this.ctx.createOscillator();
        const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1800;

        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.04);

        gain.gain.setValueAtTime(volume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        whiteNoise.connect(filter);
        filter.connect(gain);

        osc.start(now);
        whiteNoise.start(now);
        osc.stop(now + 0.045);
        whiteNoise.stop(now + 0.045);

      } else if (profile === 'bubble') {
        // Gentle bubble / marimba pop
        const osc = this.ctx.createOscillator();
        const baseFreq = 500 + Math.random() * 200;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.015);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.04);

        gain.gain.setValueAtTime(volume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.045);

      } else if (profile === 'digital') {
        // Cyber sci-fi chirp
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1760, now + 0.01);

        gain.gain.setValueAtTime(volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.025);
      }
    } catch {
      // Audio autoplay or web audio context error graceful ignore
    }
  }

  public playCompleteSound(volume: number = 0.5) {
    if (volume <= 0) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(volume * 0.2, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.45);
      });
    } catch {
      // Graceful ignore
    }
  }
}

export const soundManager = new SoundSynthesizer();
