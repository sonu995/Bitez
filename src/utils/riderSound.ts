// Audio synthesizer for Rider delivery alerts using Web Audio API
// Generates realistic, high-fidelity delivery bells and ringtones without external mp3 dependencies

let audioCtx: AudioContext | null = null;
let isMuted = false;
let ringIntervalId: any = null;

export const isSoundMuted = () => isMuted;

export const setSoundMuted = (muted: boolean) => {
  isMuted = muted;
  if (muted) {
    stopDeliveryRing();
  }
};

export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.warn('AudioContext init error:', e);
    return null;
  }
};

// Initialize / unlock audio on first user touch/click
export const unlockAudio = () => {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch (e) {}
};

/**
 * Single burst of the delivery ringtone:
 * Crisp, multi-tone metallic bell with harmonic overtones (B5 -> E6 -> B5 -> E6 -> D6 -> G6)
 */
export const playDeliveryRingBurst = () => {
  if (isMuted) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const playBell = (startTime: number, freq1: number, freq2: number, duration = 0.28, peakGain = 0.35) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq1, startTime);
      osc1.frequency.exponentialRampToValueAtTime(freq1 * 0.985, startTime + duration);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq2, startTime);
      osc2.frequency.exponentialRampToValueAtTime(freq2 * 0.99, startTime + duration);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(gain);
      osc2.connect(gainNodeFilter(ctx, gain));

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    // Helper filter to give high metallic brilliance
    const gainNodeFilter = (context: AudioContext, inputGain: GainNode) => {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2400;
      filter.Q.value = 1.2;
      inputGain.connect(filter);
      filter.connect(context.destination);
      return context.destination;
    };

    // Ring Tone Pattern:
    // Pulse 1: "Ding-Dong!"
    playBell(now + 0.0, 987.77, 1975.53, 0.26, 0.35);  // B5 + B6
    playBell(now + 0.14, 1318.51, 2637.02, 0.35, 0.4); // E6 + E7

    // Pulse 2: Repeat "Ding-Dong!"
    playBell(now + 0.50, 987.77, 1975.53, 0.26, 0.35);
    playBell(now + 0.64, 1318.51, 2637.02, 0.35, 0.4);

    // Pulse 3: High resolution chime "Ding!"
    playBell(now + 1.05, 1567.98, 3135.96, 0.55, 0.45); // G6 + G7

    // Phone vibration if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 100, 250, 100, 350]);
      } catch {}
    }
  } catch (err) {
    console.warn('playDeliveryRingBurst error:', err);
  }
};

/**
 * Start repeating delivery ring until rider accepts or dismisses (max 30s)
 */
export const startDeliveryRing = (onAutoStop?: () => void) => {
  stopDeliveryRing();
  playDeliveryRingBurst();

  let count = 0;
  const maxRings = 8; // Rings every 2.8s for ~22 seconds

  ringIntervalId = setInterval(() => {
    count++;
    if (count >= maxRings) {
      stopDeliveryRing();
      if (onAutoStop) onAutoStop();
      return;
    }
    playDeliveryRingBurst();
  }, 2800);
};

/**
 * Stop any ongoing repeating ring
 */
export const stopDeliveryRing = () => {
  if (ringIntervalId) {
    clearInterval(ringIntervalId);
    ringIntervalId = null;
  }
};

/**
 * Joyful success chime when a delivery task is accepted
 */
export const playTaskAcceptedSound = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;

    const playNote = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.25);
    };

    playNote(now, 1046.5);       // C6
    playNote(now + 0.12, 1318.51); // E6
    playNote(now + 0.24, 1567.98); // G6
    playNote(now + 0.36, 2093.00); // C7
  } catch {}
};

/**
 * Celebration chime when OTP is verified and delivery is complete
 */
export const playDeliveredSuccessSound = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;

    const playTone = (time: number, freq: number, dur = 0.2) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.35, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    };

    playTone(now + 0.0, 523.25, 0.15); // C5
    playTone(now + 0.1, 659.25, 0.15); // E5
    playTone(now + 0.2, 783.99, 0.15); // G5
    playTone(now + 0.3, 1046.5, 0.4);  // C6
  } catch {}
};
