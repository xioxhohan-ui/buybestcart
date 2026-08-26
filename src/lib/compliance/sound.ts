'use client';

/**
 * Procedural Web Audio API Sound Synthesizer for Amazon Compliance Guard
 * Generates an instantaneous, high-fidelity alert chime with zero external audio assets.
 */

const SOUND_STORAGE_KEY = 'bbc_compliance_sound_enabled';

/**
 * Checks if sound alert is enabled in user settings
 */
export function isComplianceSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    if (val === null) return true; // Default enabled
    return val === 'true';
  } catch {
    return true;
  }
}

/**
 * Toggles compliance sound alert setting
 */
export function setComplianceSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // LocalStorage failover
  }
}

/**
 * Plays a discrete, high-severity warning chime (880Hz -> 587.33Hz dual-tone bell)
 * Non-looping, duration ~400ms.
 */
export function playComplianceAlertSound(): void {
  if (typeof window === 'undefined') return;
  if (!isComplianceSoundEnabled()) return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Master Gain (Volume control)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Oscillator 1 (Primary high tone: A5 - 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // High pitch start
    osc1.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.35); // Glide to D5

    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    osc1.connect(gain1);
    gain1.connect(masterGain);

    // Oscillator 2 (Harmonic overtone: E6 - 1318.5Hz for crisp alert presence)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.28);

    gain2.gain.setValueAtTime(0.12, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc2.connect(gain2);
    gain2.connect(masterGain);

    // Start & Stop
    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime + 0.04);

    osc1.stop(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.35);

    // Clean up AudioContext after sound finishes
    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        // Safe close
      }
    }, 500);
  } catch (err) {
    // Non-blocking audio failover
    console.debug('Compliance sound notice:', err);
  }
}

/**
 * Plays a discrete, subtle success confirmation chime (523.25Hz -> 659.25Hz -> 783.99Hz C-E-G chord)
 */
export function playComplianceSuccessSound(): void {
  if (typeof window === 'undefined') return;
  if (!isComplianceSoundEnabled()) return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.26);
    });

    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        // Safe close
      }
    }, 600);
  } catch {
    // Safe audio failover
  }
}
