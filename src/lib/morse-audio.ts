import { getMorsePattern } from "./morse-code";

const TONE_FREQUENCY_HZ = 600;
const RAMP_SECONDS = 0.005; // short attack/release to avoid clicks

// Minimal typings for APIs missing from the standard lib but present on iOS
// Safari: the webkit-prefixed AudioContext (older iOS) and the Audio Session
// API (iOS 16.4+), which lets us opt out of the hardware ring/silent switch.
type WebkitWindow = typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

type AudioSessionNavigator = Navigator & {
  audioSession?: { type: string };
};

// Resolves the AudioContext constructor, falling back to the webkit-prefixed
// one that older iOS Safari versions expose. Returns null when unsupported.
function getAudioContextCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as WebkitWindow).webkitAudioContext ?? null;
}

// Plays Morse tones for a single character through the Web Audio API,
// scheduling each dit/dah as a gain envelope on a shared oscillator.
export class MorseAudioPlayer {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private playToken = 0;
  private removeGestureUnlock: (() => void) | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const Ctor = getAudioContextCtor();
      if (!Ctor) {
        throw new Error("Web Audio API is not supported in this browser");
      }
      this.ctx = new Ctor();
      // On iOS, Web Audio is silenced by the hardware ring/silent switch
      // unless the page declares a "playback" audio session. Set it so
      // learners still hear tones with the phone on silent.
      const nav = navigator as AudioSessionNavigator;
      if (nav.audioSession) {
        try {
          nav.audioSession.type = "playback";
        } catch {
          // Non-fatal: some browsers expose the property but reject writes.
        }
      }
      this.registerGestureUnlock();
    }
    return this.ctx;
  }

  // iOS only unlocks audio inside a real user gesture; auto-playing on mount
  // (page navigation) does not count. Resume the context on the first touch,
  // click, or key press anywhere in the document so the first tone is heard.
  private registerGestureUnlock(): void {
    if (this.removeGestureUnlock || typeof document === "undefined") return;
    const events = ["pointerdown", "touchend", "keydown"] as const;
    const remove = () => {
      for (const type of events) {
        document.removeEventListener(type, unlock, true);
      }
      this.removeGestureUnlock = null;
    };
    const unlock = () => {
      remove();
      void this.resume();
    };
    for (const type of events) {
      document.addEventListener(type, unlock, true);
    }
    this.removeGestureUnlock = remove;
  }

  async resume(): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    if (!this.oscillator) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = TONE_FREQUENCY_HZ;
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      this.oscillator = osc;
      this.gain = gain;
    }
  }

  // Cancels any in-flight playback and silences the tone immediately.
  stop(): void {
    this.playToken += 1;
    if (this.gain && this.ctx) {
      this.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  // Starts a continuous tone for as long as the caller holds a key down
  // (a telegraph sidetone), independent of playChar()'s scheduled envelopes.
  async toneOn(): Promise<void> {
    await this.resume();
    const ctx = this.ctx!;
    const gain = this.gain!;
    this.playToken += 1;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + RAMP_SECONDS);
  }

  // Stops the sidetone started by toneOn().
  toneOff(): void {
    if (!this.ctx || !this.gain) return;
    const ctx = this.ctx;
    const gain = this.gain;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + RAMP_SECONDS);
  }

  // Plays the Morse pattern for `char` at the given unit duration (ms).
  // Resolves once playback finishes, or immediately if superseded by a
  // newer call (stop() or another playChar()).
  async playChar(char: string, unitMs: number): Promise<void> {
    await this.resume();
    const ctx = this.ctx!;
    const gain = this.gain!;
    const token = ++this.playToken;

    const pattern = getMorsePattern(char);

    // Cancel any envelope still scheduled from a previous, superseded call
    // so overlapping playChar() calls (fast typing) don't stack tones.
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);

    if (pattern.length === 0) return;

    const unit = unitMs / 1000;
    const ramp = Math.min(RAMP_SECONDS, unit / 4);
    let t = ctx.currentTime + 0.02;

    for (let i = 0; i < pattern.length; i++) {
      const duration = pattern[i] === "-" ? unit * 3 : unit;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(1, t + ramp);
      gain.gain.setValueAtTime(1, t + duration - ramp);
      gain.gain.linearRampToValueAtTime(0, t + duration);
      t += duration;
      if (i < pattern.length - 1) t += unit; // intra-character gap
    }

    const totalMs = (t - ctx.currentTime) * 1000;
    await new Promise<void>((resolve) => setTimeout(resolve, totalMs));
    if (token !== this.playToken) return;
  }

  dispose(): void {
    this.removeGestureUnlock?.();
    this.stop();
    this.oscillator?.stop();
    this.oscillator?.disconnect();
    this.gain?.disconnect();
    this.ctx?.close();
    this.ctx = null;
    this.oscillator = null;
    this.gain = null;
  }
}
