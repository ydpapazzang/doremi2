type AudioContextWithWebkit = Window & {
  webkitAudioContext?: typeof AudioContext;
};

type EffectStep = {
  frequency: number;
  duration: number;
  delay: number;
};

type AudioBufferCache = Map<string, AudioBuffer>;

const PIANO_SAMPLE_BASE = "/audio/piano";

function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const audioWindow = window as AudioContextWithWebkit;
  const AudioContextClass = window.AudioContext ?? audioWindow.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  return new AudioContextClass();
}

class PianoAudioService {
  private context: AudioContext | null = null;

  private sampleCache: AudioBufferCache = new Map();

  private missingSamples = new Set<string>();

  private preloadPromise: Promise<void> | null = null;

  private getContext() {
    if (!this.context) {
      this.context = createAudioContext();
    }

    return this.context;
  }

  async resume() {
    const context = this.getContext();
    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      await context.resume();
    }
  }

  async warmup() {
    const context = this.getContext();
    if (!context) {
      return;
    }

    await this.resume();
  }

  preload(notes: string[]) {
    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    this.preloadPromise = this.preloadSamples(notes);
    return this.preloadPromise;
  }

  async playNote(note: string) {
    const samplePlayed = await this.playSample(note);
    if (!samplePlayed) {
      await this.playSynthNote(note);
    }
  }

  async playCorrect() {
    await this.playSequence([
      { frequency: 784, duration: 0.12, delay: 0 },
      { frequency: 1046.5, duration: 0.18, delay: 0.14 },
    ]);
  }

  async playWrong() {
    await this.playSequence([
      { frequency: 220, duration: 0.16, delay: 0 },
      { frequency: 196, duration: 0.2, delay: 0.18 },
    ]);
  }

  private async preloadSamples(notes: string[]) {
    await Promise.all(notes.map((note) => this.loadSample(note).catch(() => undefined)));
  }

  private async playSample(note: string) {
    const context = this.getContext();
    if (!context) {
      return false;
    }

    const buffer = await this.loadSample(note);
    if (!buffer) {
      return false;
    }

    await this.resume();

    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = 0.9;

    source.buffer = buffer;
    source.connect(gain);
    gain.connect(context.destination);
    source.start();
    return true;
  }

  private async loadSample(note: string) {
    if (this.sampleCache.has(note)) {
      return this.sampleCache.get(note) ?? null;
    }

    if (this.missingSamples.has(note)) {
      return null;
    }

    const context = this.getContext();
    if (!context) {
      return null;
    }

    try {
      const response = await fetch(getSampleUrl(note));
      if (!response.ok) {
        this.missingSamples.add(note);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
      this.sampleCache.set(note, audioBuffer);
      return audioBuffer;
    } catch {
      this.missingSamples.add(note);
      return null;
    }
  }

  private async playSynthNote(note: string) {
    const context = this.getContext();
    if (!context) {
      return;
    }

    await this.resume();

    const frequency = noteToFrequency(note);
    const now = context.currentTime;
    const gain = context.createGain();
    const oscillator = context.createOscillator();
    const overtone = context.createOscillator();
    const filter = context.createBiquadFilter();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, now);

    overtone.type = "sine";
    overtone.frequency.setValueAtTime(frequency * 2, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2600, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.24, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    oscillator.connect(filter);
    overtone.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    overtone.start(now);
    oscillator.stop(now + 0.95);
    overtone.stop(now + 0.95);
  }

  private async playSequence(steps: EffectStep[]) {
    const context = this.getContext();
    if (!context) {
      return;
    }

    await this.resume();
    const startTime = context.currentTime;

    for (const step of steps) {
      const gain = context.createGain();
      const oscillator = context.createOscillator();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(step.frequency, startTime + step.delay);

      gain.gain.setValueAtTime(0.0001, startTime + step.delay);
      gain.gain.exponentialRampToValueAtTime(0.18, startTime + step.delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + step.delay + step.duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime + step.delay);
      oscillator.stop(startTime + step.delay + step.duration + 0.02);
    }
  }
}

export const pianoAudio = new PianoAudioService();

function getSampleUrl(note: string) {
  const normalized = note.replace("#", "sharp").replace("b", "flat");
  return `${PIANO_SAMPLE_BASE}/${normalized}.mp3`;
}

function noteToFrequency(note: string) {
  const match = /^([A-G])([#b]?)(\d)$/.exec(note);
  if (!match) {
    return 261.63;
  }

  const [, step, accidental, octave] = match;
  const semitoneMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let semitone = semitoneMap[step];
  if (accidental === "#") semitone += 1;
  if (accidental === "b") semitone -= 1;
  const midi = (Number(octave) + 1) * 12 + semitone;
  return 440 * 2 ** ((midi - 69) / 12);
}
