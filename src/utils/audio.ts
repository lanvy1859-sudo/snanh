// Web Audio API sound synthesizer for cheerful birthday melody & water ambient effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMelodyPlaying: boolean = false;
  private melodyTimeout: any = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMelody();
    } else {
      this.startBirthdayMelody();
    }
    return this.isMuted;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopMelody();
    } else {
      this.startBirthdayMelody();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play a pleasant water drop / ripple bubble pop
  public playWaterDrop(freq = 600) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;

      // Pitch swoop up like a water droplet 'plop'
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio not permitted or interrupted
    }
  }

  // Play celebratory chime / sparkle
  public playChime(freq = 880) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const now = this.ctx.currentTime;

      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch {
      // audio error handling
    }
  }

  // Play a soft paper page flip sound
  public playPageFlip() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // White noise burst filtered like a soft paper flip
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // ignore
    }
  }

  // Play a delicate typewriter keystroke click
  public playTypewriterSound() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const freq = 1200 + Math.random() * 400;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // ignore
    }
  }

  // Play a water splash when koi leaps
  public playSplash() {
    if (this.isMuted) return;
    this.playWaterDrop(450);
    setTimeout(() => this.playWaterDrop(720), 40);
  }

  // Play classic gentle Happy Birthday melody (Music-Box Chime, Warm Acoustic Marimba & Soft Bass)
  public startBirthdayMelody() {
    if (this.isMuted || this.isMelodyPlaying) return;
    this.initCtx();
    this.isMelodyPlaying = true;
    this.stopMelodyTimers();

    // 108 BPM - Gentle, cheerful 3/4 Birthday Waltz tempo
    const tempo = 108;
    const beatSec = 60 / tempo;

    // Frequencies (C Major scale)
    const C3 = 130.81, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, B3 = 246.94;
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;

    interface TrackNote {
      type: 'lead' | 'marimba' | 'bass' | 'sparkle';
      freq: number;
      beat: number;
      duration: number;
      gain?: number;
    }

    const score: TrackNote[] = [];

    // --- 1. HARMONIC ACCOMPANIMENT (Soft Marimba arpeggios + warm acoustic bass on beat 1) ---
    // 3/4 Waltz measures (3 beats per measure)
    const chords: { bass: number; arp: number[] }[] = [
      { bass: C3, arp: [C4, E4, G4] },     // Bar 1: C
      { bass: C3, arp: [E4, G4, C5] },     // Bar 2: C
      { bass: G3, arp: [B3 || 246.94, D4, G4] }, // Bar 3: G
      { bass: G3, arp: [D4, F4, G4] },     // Bar 4: G7
      { bass: C3, arp: [C4, E4, G4] },     // Bar 5: C
      { bass: C3, arp: [E4, G4, C5] },     // Bar 6: C7
      { bass: F3, arp: [C4, F4, A4] },     // Bar 7: F
      { bass: C3, arp: [C4, E4, G4] },     // Bar 8: C
      { bass: G3, arp: [B3 || 246.94, D4, G4] }, // Bar 9: G
      { bass: C3, arp: [C4, E4, G4, C5] }, // Bar 10: C (resolution)
    ];

    chords.forEach((chord, barIndex) => {
      const barStart = barIndex * 3;
      // Gentle bass pluck on beat 1
      score.push({ type: 'bass', freq: chord.bass, beat: barStart, duration: 2.0, gain: 0.08 });
      // Soft rhythmic marimba pulses on beats 1.5, 2, 2.5
      chord.arp.forEach((freq, idx) => {
        score.push({
          type: 'marimba',
          freq,
          beat: barStart + 0.8 + idx * 0.7,
          duration: 0.6,
          gain: 0.032,
        });
      });
    });

    // --- 2. THE CLASSIC "HAPPY BIRTHDAY TO YOU" MELODY ---
    // Phrase 1: "Happy Birthday to you" (Bars 1 - 2)
    score.push({ type: 'lead', freq: G4, beat: 0.0, duration: 0.75 });
    score.push({ type: 'lead', freq: G4, beat: 0.75, duration: 0.25 });
    score.push({ type: 'lead', freq: A4, beat: 1.0, duration: 1.0 });
    score.push({ type: 'lead', freq: G4, beat: 2.0, duration: 1.0 });
    score.push({ type: 'lead', freq: C5, beat: 3.0, duration: 1.0 });
    score.push({ type: 'lead', freq: B4, beat: 4.0, duration: 2.0 });

    // Phrase 2: "Happy Birthday to you" (Bars 3 - 4)
    score.push({ type: 'lead', freq: G4, beat: 6.0, duration: 0.75 });
    score.push({ type: 'lead', freq: G4, beat: 6.75, duration: 0.25 });
    score.push({ type: 'lead', freq: A4, beat: 7.0, duration: 1.0 });
    score.push({ type: 'lead', freq: G4, beat: 8.0, duration: 1.0 });
    score.push({ type: 'lead', freq: D5, beat: 9.0, duration: 1.0 });
    score.push({ type: 'lead', freq: C5, beat: 10.0, duration: 2.0 });

    // Phrase 3: "Happy Birthday to Kim Ánh (sweet octave jump to G5)" (Bars 5 - 6)
    score.push({ type: 'lead', freq: G4, beat: 12.0, duration: 0.75 });
    score.push({ type: 'lead', freq: G4, beat: 12.75, duration: 0.25 });
    score.push({ type: 'lead', freq: G5, beat: 13.0, duration: 1.0 });
    score.push({ type: 'lead', freq: E5, beat: 14.0, duration: 1.0 });
    score.push({ type: 'lead', freq: C5, beat: 15.0, duration: 1.0 });
    score.push({ type: 'lead', freq: B4, beat: 16.0, duration: 1.0 });
    score.push({ type: 'lead', freq: A4, beat: 17.0, duration: 1.8 });

    // Phrase 4: "Happy Birthday to you!" (Bars 7 - 8)
    score.push({ type: 'lead', freq: F5, beat: 18.5, duration: 0.75 });
    score.push({ type: 'lead', freq: F5, beat: 19.25, duration: 0.25 });
    score.push({ type: 'lead', freq: E5, beat: 19.75, duration: 1.0 });
    score.push({ type: 'lead', freq: C5, beat: 20.75, duration: 1.0 });
    score.push({ type: 'lead', freq: D5, beat: 21.75, duration: 1.0 });
    score.push({ type: 'lead', freq: C5, beat: 22.75, duration: 2.5 });

    // Sweet celebratory sparkle flourish (Bars 9 - 10)
    score.push({ type: 'sparkle', freq: E5, beat: 25.5, duration: 0.5, gain: 0.07 });
    score.push({ type: 'sparkle', freq: G5, beat: 26.0, duration: 0.5, gain: 0.08 });
    score.push({ type: 'sparkle', freq: C5 * 2, beat: 26.5, duration: 0.6, gain: 0.09 });
    score.push({ type: 'sparkle', freq: E5 * 2, beat: 27.0, duration: 0.8, gain: 0.1 });
    score.push({ type: 'sparkle', freq: G5 * 2, beat: 27.5, duration: 1.5, gain: 0.1 });

    const totalDurationSec = 30 * beatSec;

    // Schedule all notes
    score.forEach((note) => {
      const startTime = note.beat * beatSec;
      const tid = setTimeout(() => {
        if (!this.isMelodyPlaying || this.isMuted) return;
        if (note.type === 'lead') {
          this.playMusicBoxNote(note.freq, note.duration * beatSec, note.gain ?? 0.11);
        } else if (note.type === 'marimba') {
          this.playMarimbaNote(note.freq, note.duration * beatSec, note.gain ?? 0.035);
        } else if (note.type === 'bass') {
          this.playBassNote(note.freq, note.duration * beatSec, note.gain ?? 0.08);
        } else if (note.type === 'sparkle') {
          this.playSparkleChime(note.freq, note.duration * beatSec, note.gain ?? 0.08);
        }
      }, startTime * 1000);
      this.melodyTimeouts.push(tid);
    });

    // Graceful loop after finished + 1.2s soft pause
    const loopTid = setTimeout(() => {
      this.isMelodyPlaying = false;
      if (!this.isMuted) {
        this.startBirthdayMelody();
      }
    }, (totalDurationSec + 1.2) * 1000);
    this.melodyTimeouts.push(loopTid);
  }

  private melodyTimeouts: any[] = [];

  private stopMelodyTimers() {
    this.melodyTimeouts.forEach((tid) => clearTimeout(tid));
    this.melodyTimeouts = [];
  }

  public stopMelody() {
    this.isMelodyPlaying = false;
    this.stopMelodyTimers();
  }

  // 1. Crystal Music Box / Celesta Timbre (Clear, warm, joyful bell-like tones)
  private playMusicBoxNote(freq: number, duration: number, gainVolume = 0.11) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, now); // Sweet upper harmonic bell shimmer

      // Soft 15ms attack to avoid clicking, then natural exponential decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainVolume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(duration * 1.15, 0.45));

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.5);
      osc2.stop(now + duration + 0.5);
    } catch {
      // Audio safety
    }
  }

  // 2. Warm Wooden Marimba Note (Soft acoustic wooden body)
  private playMarimbaNote(freq: number, duration: number, gainVolume = 0.035) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainVolume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(duration, 0.25));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.3);
    } catch {
      // ignore
    }
  }

  // 3. Warm Acoustic Bass Note (Deep, soft, grounded)
  private playBassNote(freq: number, duration: number, gainVolume = 0.08) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainVolume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(duration, 0.6));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.7);
    } catch {
      // ignore
    }
  }

  // 4. Sparkling High Chime (Crystal celebrations)
  private playSparkleChime(freq: number, duration: number, gainVolume = 0.08) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainVolume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(duration, 0.4));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.4);
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundManager();
