/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Procedural Audio & Music Engine using Web Audio API.
 * 100% original, zero external assets, mobile-friendly, zero copyright concerns.
 * Includes Master Limiter, separate Music/SFX gains, and audible cyberpunk ambient/rush soundtracks.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private bgmGainNode: GainNode | null = null;
  private bgmFilterNode: BiquadFilterNode | null = null;

  private isSoundMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.55;

  // Background Music loop handles
  private bgmMode: 'AMBIENT' | 'RUSH' | 'STOPPED' = 'STOPPED';
  private bgmIntervalId: ReturnType<typeof setInterval> | null = null;
  private bgmStep: number = 0;
  private isAudioUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.resumeAudio();
        if (this.ctx && this.ctx.state === 'running') {
          this.isAudioUnlocked = true;
          window.removeEventListener('pointerdown', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
          window.removeEventListener('keydown', unlockAudio);
        }
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
    }
  }

  public initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // 1. Master Dynamics Compressor / Limiter to prevent clipping
        this.masterLimiter = this.ctx.createDynamicsCompressor();
        this.masterLimiter.threshold.setValueAtTime(-6, this.ctx.currentTime);
        this.masterLimiter.knee.setValueAtTime(6, this.ctx.currentTime);
        this.masterLimiter.ratio.setValueAtTime(8, this.ctx.currentTime);
        this.masterLimiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.masterLimiter.release.setValueAtTime(0.15, this.ctx.currentTime);
        this.masterLimiter.connect(this.ctx.destination);

        // 2. SFX Gain Bus
        this.sfxGainNode = this.ctx.createGain();
        this.sfxGainNode.gain.setValueAtTime(
          this.isSoundMuted ? 0 : this.sfxVolume,
          this.ctx.currentTime
        );
        this.sfxGainNode.connect(this.masterLimiter);

        // 3. Music Gain Bus & Ambient Master Filter
        this.bgmGainNode = this.ctx.createGain();
        this.bgmGainNode.gain.setValueAtTime(
          this.isMusicMuted ? 0 : this.bgmVolume * 0.7,
          this.ctx.currentTime
        );

        this.bgmFilterNode = this.ctx.createBiquadFilter();
        this.bgmFilterNode.type = 'lowpass';
        this.bgmFilterNode.frequency.setValueAtTime(1800, this.ctx.currentTime);
        this.bgmFilterNode.Q.setValueAtTime(1.2, this.ctx.currentTime);

        this.bgmFilterNode.connect(this.bgmGainNode);
        this.bgmGainNode.connect(this.masterLimiter);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Resumes audio context on any user touch/click.
   * Ensures seamless playback across iOS Safari and Android Chrome autoplay restrictions.
   */
  public resumeAudio() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        if (this.bgmMode !== 'STOPPED' && !this.isMusicMuted && this.bgmIntervalId === null) {
          this.startMusic(this.bgmMode);
        }
      }).catch(() => {});
    }
  }

  // -------------------------------------------------------------
  // VOLUME & MUTE CONTROLS
  // -------------------------------------------------------------
  public setMuted(muted: boolean) {
    this.isSoundMuted = muted;
    if (this.ctx && this.sfxGainNode) {
      this.sfxGainNode.gain.setTargetAtTime(
        muted ? 0 : this.sfxVolume,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public getMuted(): boolean {
    return this.isSoundMuted;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (this.ctx && this.bgmGainNode) {
      this.bgmGainNode.gain.setTargetAtTime(
        muted ? 0 : this.bgmVolume * 0.7,
        this.ctx.currentTime,
        0.08
      );
    }
    if (muted) {
      this.stopMusic();
    } else {
      if (this.bgmMode === 'STOPPED') {
        this.startMusic('AMBIENT');
      }
    }
  }

  public getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  public setSoundVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.sfxGainNode && !this.isSoundMuted) {
      this.sfxGainNode.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.bgmGainNode && !this.isMusicMuted) {
      this.bgmGainNode.gain.setTargetAtTime(this.bgmVolume * 0.7, this.ctx.currentTime, 0.08);
    }
  }

  // -------------------------------------------------------------
  // HAPTIC FEEDBACK (Lightweight vibration API)
  // -------------------------------------------------------------
  public triggerHaptic(type: 'light' | 'medium' | 'error' | 'success' = 'light') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        switch (type) {
          case 'light':
            navigator.vibrate(10);
            break;
          case 'medium':
            navigator.vibrate(22);
            break;
          case 'error':
            navigator.vibrate([25, 40, 25]);
            break;
          case 'success':
            navigator.vibrate([15, 30, 25]);
            break;
        }
      } catch {
        // Fallback for restricted iframes
      }
    }
  }

  // -------------------------------------------------------------
  // BACKGROUND MUSIC SYNTHESIS (Audible, Original Electronic Ambient & Rush)
  // -------------------------------------------------------------
  public startMusic(mode: 'AMBIENT' | 'RUSH' = 'AMBIENT') {
    if (this.isMusicMuted) {
      this.bgmMode = mode;
      return;
    }

    this.initContext();
    if (!this.ctx || !this.bgmFilterNode || !this.bgmGainNode) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.bgmMode === mode && this.bgmIntervalId !== null) {
      return; // Already actively looping in this mode
    }

    this.stopMusic();
    this.bgmMode = mode;

    const now = this.ctx.currentTime;
    if (mode === 'RUSH') {
      this.bgmFilterNode.frequency.setTargetAtTime(2600, now, 0.3);
      this.bgmGainNode.gain.setTargetAtTime(this.bgmVolume * 0.75, now, 0.2);
    } else {
      this.bgmFilterNode.frequency.setTargetAtTime(1700, now, 0.4);
      this.bgmGainNode.gain.setTargetAtTime(this.bgmVolume * 0.65, now, 0.3);
    }

    // Step scheduler
    const intervalMs = mode === 'RUSH' ? 240 : 480; // 125 BPM vs ambient 62.5 BPM
    this.bgmStep = 0;

    // Harmonic Cyberpunk Chords: Am9 -> Fmaj7 -> Cmaj9 -> Em7
    const ambientChords = [
      [110, 220, 261.63, 329.63, 493.88], // A2, A3, C4, E4, B4
      [87.31, 174.61, 261.63, 329.63, 440.0], // F2, F3, C4, E4, A4
      [130.81, 196.0, 261.63, 329.63, 493.88], // C3, G3, C4, E4, B4
      [82.41, 164.81, 246.94, 329.63, 392.0], // E2, E3, B3, E4, G4
    ];

    const rushBassNotes = [110, 87.31, 130.81, 82.41]; // A2, F2, C3, E2
    const rushArpNotes = [
      [220, 261.63, 329.63, 440, 493.88, 523.25, 659.25, 440],
      [174.61, 220, 261.63, 329.63, 349.23, 440, 523.25, 349.23],
      [196.0, 261.63, 329.63, 392, 493.88, 523.25, 587.33, 392],
      [164.81, 246.94, 329.63, 392, 440, 493.88, 587.33, 493.88],
    ];

    this.bgmIntervalId = setInterval(() => {
      if (!this.ctx || this.isMusicMuted || !this.bgmFilterNode) return;
      if (this.ctx.state !== 'running') return;

      const chordIdx = Math.floor(this.bgmStep / 8) % 4;
      const stepInChord = this.bgmStep % 8;
      const t = this.ctx.currentTime;

      if (this.bgmMode === 'AMBIENT') {
        // Sustained warm pad on chord start
        if (stepInChord === 0) {
          const chord = ambientChords[chordIdx];
          chord.forEach((freq, idx) => {
            if (!this.ctx || !this.bgmFilterNode) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = idx === 0 ? 'sine' : idx === 1 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, t);

            // Audible gentle swelling envelope
            const padDur = 3.7;
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.09 / (idx * 0.4 + 1), t + 0.6);
            gain.gain.exponentialRampToValueAtTime(0.001, t + padDur);

            osc.connect(gain);
            gain.connect(this.bgmFilterNode);
            osc.start(t);
            osc.stop(t + padDur);
          });

          // Soft sub bass pulse on root
          const subOsc = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(chord[0] * 0.5, t);
          subGain.gain.setValueAtTime(0.14, t);
          subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
          subOsc.connect(subGain);
          subGain.connect(this.bgmFilterNode);
          subOsc.start(t);
          subOsc.stop(t + 1.3);
        }

        // Soft ambient pulse kick on beats 0 and 4
        if (stepInChord === 0 || stepInChord === 4) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(85, t);
          kickOsc.frequency.exponentialRampToValueAtTime(38, t + 0.14);
          kickGain.gain.setValueAtTime(0.12, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
          kickOsc.connect(kickGain);
          kickGain.connect(this.bgmFilterNode);
          kickOsc.start(t);
          kickOsc.stop(t + 0.18);
        }

        // Celestial twinkle arpeggio on steps 2 & 5
        if (stepInChord === 2 || stepInChord === 5) {
          const twinkleFreq = ambientChords[chordIdx][3 + (stepInChord === 2 ? 0 : 1)];
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(twinkleFreq, t);

          gain.gain.setValueAtTime(0.065, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

          osc.connect(gain);
          gain.connect(this.bgmFilterNode);
          osc.start(t);
          osc.stop(t + 0.6);
        }
      } else if (this.bgmMode === 'RUSH') {
        // Energetic electronic bassline
        const arpList = rushArpNotes[chordIdx];
        const noteFreq = arpList[stepInChord % arpList.length];

        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = stepInChord % 2 === 0 ? 'sawtooth' : 'triangle';
        bassOsc.frequency.setValueAtTime(stepInChord % 4 === 0 ? rushBassNotes[chordIdx] : noteFreq, t);

        const dur = 0.22;
        bassGain.gain.setValueAtTime(0.12, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmFilterNode);
        bassOsc.start(t);
        bassOsc.stop(t + dur);

        // Electro kick on steps 0 and 4
        if (stepInChord === 0 || stepInChord === 4) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(130, t);
          kickOsc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
          kickGain.gain.setValueAtTime(0.2, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
          kickOsc.connect(kickGain);
          kickGain.connect(this.bgmFilterNode);
          kickOsc.start(t);
          kickOsc.stop(t + 0.15);
        }

        // Hi-hat cyber pulse on off-beats (synthesized with high triangle pulse into bandpass)
        if (stepInChord % 2 === 1) {
          const hatOsc = this.ctx.createOscillator();
          const hatGain = this.ctx.createGain();
          const hatFilter = this.ctx.createBiquadFilter();

          hatFilter.type = 'bandpass';
          hatFilter.frequency.setValueAtTime(4500, t);
          hatFilter.Q.setValueAtTime(4, t);

          hatOsc.type = 'square';
          hatOsc.frequency.setValueAtTime(2200, t);

          hatGain.gain.setValueAtTime(0.045, t);
          hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

          hatOsc.connect(hatFilter);
          hatFilter.connect(hatGain);
          hatGain.connect(this.bgmFilterNode);
          hatOsc.start(t);
          hatOsc.stop(t + 0.05);
        }
      }

      this.bgmStep++;
    }, intervalMs);
  }

  public stopMusic() {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.bgmMode = 'STOPPED';
  }

  // -------------------------------------------------------------
  // SOUND EFFECTS ENGINE
  // -------------------------------------------------------------

  /** Subtle tactile laser blip on arrow tap */
  public playTap() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(1080, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio error catch
    }
  }

  /** Successful arrow exit: aerodynamic whoosh + resonant laser tone with combo scaling */
  public playLaunch(combo: number = 0) {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('light');

    try {
      const now = this.ctx.currentTime;
      const baseFreq = Math.min(340 + combo * 48, 1020);

      // 1. Main resonant pitch-shifting tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, now + 0.16);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.23);

      // 2. High-speed air slipstream whoosh
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(baseFreq * 0.45, now);
      subOsc.frequency.exponentialRampToValueAtTime(baseFreq * 2.8, now + 0.18);

      subGain.gain.setValueAtTime(0.1, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      subOsc.connect(subGain);
      subGain.connect(this.sfxGainNode);
      subOsc.start(now);
      subOsc.stop(now + 0.19);
    } catch {
      // Audio fallback
    }
  }

  /** Blocked arrow: deep tactile impact thud + filtered electric refusal buzz */
  public playBlocked() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('error');

    try {
      const now = this.ctx.currentTime;

      // 1. Sub punch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.14);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.17);

      // 2. Filtered refusal buzz
      const buzz = this.ctx.createOscillator();
      const buzzGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      buzz.type = 'sawtooth';
      buzz.frequency.setValueAtTime(160, now);
      buzz.frequency.setValueAtTime(130, now + 0.05);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, now);

      buzzGain.gain.setValueAtTime(0.12, now);
      buzzGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      buzz.connect(filter);
      filter.connect(buzzGain);
      buzzGain.connect(this.sfxGainNode);

      buzz.start(now);
      buzz.stop(now + 0.13);
    } catch {
      // Audio fallback
    }
  }

  /** Undo: gentle rewinding tone */
  public playUndo() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('light');

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.14);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Audio fallback
    }
  }

  /** Hint activation: holographic scanner sweep */
  public playHint() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('medium');

    try {
      const notes = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6 holographic sweep
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGainNode) return;
        const now = this.ctx.currentTime + idx * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch {
      // Audio fallback
    }
  }

  /** Coin collection: sparkling dual-pitch casino chime with harmonic overtone */
  public playCoin() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    try {
      const now = this.ctx.currentTime;

      // Note 1: B5
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.sfxGainNode);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Note 2: E6 with crystal bell overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1318.51, now + 0.075);
      gain2.gain.setValueAtTime(0.16, now + 0.075);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc2.connect(gain2);
      gain2.connect(this.sfxGainNode);
      osc2.start(now + 0.075);
      osc2.stop(now + 0.34);
    } catch {
      // Audio fallback
    }
  }

  /** Combo Multiplier: cybernetic power-up chord arpeggios for x2, x3, x5 */
  public playCombo(multiplier: number) {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic(multiplier >= 5 ? 'success' : 'medium');

    try {
      const now = this.ctx.currentTime;
      const baseFreq = multiplier >= 5 ? 1318.51 : multiplier >= 3 ? 1046.5 : 783.99;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.39);

      if (multiplier >= 5) {
        // Double harmony shimmer on x5 super combo
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1567.98, now + 0.06);
        gain2.gain.setValueAtTime(0.15, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        osc2.connect(gain2);
        gain2.connect(this.sfxGainNode);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.44);
      }
    } catch {
      // Audio fallback
    }
  }

  /** Level completion: triumphant multi-voice victory fanfare */
  public playVictory() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('success');

    try {
      // Triumphant 6-note victory fanfare: C5 -> E5 -> G5 -> C6 -> E6 -> G6
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      chord.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGainNode) return;
        const now = this.ctx.currentTime + i * 0.08;
        const isFinal = i === chord.length - 1;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isFinal ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const volume = isFinal ? 0.25 : 0.16;
        const duration = isFinal ? 1.0 : 0.45;

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now);
        osc.stop(now + duration + 0.05);
      });
    } catch {
      // Audio fallback
    }
  }

  /** Star award chime */
  public playStar(starIndex: number) {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('medium');

    try {
      const now = this.ctx.currentTime;
      const pitches = [523.25, 659.25, 783.99]; // C5, E5, G5
      const freq = pitches[Math.min(starIndex, 2)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio fallback
    }
  }

  /** Game over / Time up buzzer & sci-fi power-down decrescendo */
  public playBuzzer() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('error');

    try {
      const now = this.ctx.currentTime;

      // Descending futuristic power-down sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.42);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(80, now + 0.42);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.46);
    } catch {
      // Audio fallback
    }
  }

  /** Countdown tick */
  public playTick() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.025);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Audio fallback
    }
  }

  /** Locked arrow unlocking snap & chime */
  public playUnlock() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('medium');

    try {
      const now = this.ctx.currentTime;

      // 1. Mechanical snap
      const snap = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snap.type = 'triangle';
      snap.frequency.setValueAtTime(320, now);
      snap.frequency.exponentialRampToValueAtTime(80, now + 0.06);
      snapGain.gain.setValueAtTime(0.18, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      snap.connect(snapGain);
      snapGain.connect(this.sfxGainNode);
      snap.start(now);
      snap.stop(now + 0.08);

      // 2. Bright gold bell chime
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(987.77, now + 0.05); // B5
      bellGain.gain.setValueAtTime(0.15, now + 0.05);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      bell.connect(bellGain);
      bellGain.connect(this.sfxGainNode);
      bell.start(now + 0.05);
      bell.stop(now + 0.3);
    } catch {
      // Audio fallback
    }
  }

  /** Teleport Arrow portal warp sound */
  public playTeleport() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('medium');

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.22);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio fallback
    }
  }

  /** Explosive Arrow EMP blast */
  public playExplosion() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('error');

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.28);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(90, now + 0.28);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // Audio fallback
    }
  }

  /** Double Arrow partial charge stage sound */
  public playDoubleStage() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('light');

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // Audio fallback
    }
  }

  /** Rotating Arrow ratchet click */
  public playRotate() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('light');

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.05);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio fallback
    }
  }

  /** Cube Face Swipe whoosh */
  public playCubeSwipe() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // Audio fallback
    }
  }

  /** Celebratory jingle when an ad is completed and reward is granted */
  public playAdReward() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    this.triggerHaptic('medium');

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.38);
      });
    } catch {
      // Audio fallback
    }
  }

  /** Subtle tick for ad countdown */
  public playAdTick() {
    if (this.isSoundMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio fallback
    }
  }
}

export const sounds = new SoundSystem();
