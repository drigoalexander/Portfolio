/**
 * The scene's sound, opt-in and silent until enabled. Apple's audio rules:
 * every sound has a visible cause and fires on the same frame as its
 * motion — the wind you hear is the wind the crown leans in (fed from
 * `useSceneLife` each frame), crickets only while it's night, and a soft
 * wooden tock when an apple is struck. Pure Web Audio, no files.
 */
export function createAmbience() {
  let ctx: AudioContext | null = null;
  let master: GainNode, windGain: GainNode, windFilter: BiquadFilterNode;
  let on = false;
  let cricketIn = 0;

  const init = () => {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    // two seconds of pink-ish noise, looped, low-passed into wind
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + w * 0.029;
      b1 = 0.985 * b1 + w * 0.032;
      b2 = 0.95 * b2 + w * 0.048;
      d[i] = (b0 + b1 + b2) * 0.35;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 380;
    windGain = ctx.createGain();
    windGain.gain.value = 0;
    src.connect(windFilter).connect(windGain).connect(master);
    src.start();
  };

  const blip = (freq: number, peak: number, at: number, len: number, bend?: number) => {
    if (!ctx) return;
    const o = ctx.createOscillator();
    const e = ctx.createGain();
    o.frequency.setValueAtTime(freq, at);
    if (bend) o.frequency.exponentialRampToValueAtTime(bend, at + len * 0.7);
    e.gain.setValueAtTime(0.0001, at);
    e.gain.exponentialRampToValueAtTime(peak, at + 0.006);
    e.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(e).connect(master);
    o.start(at);
    o.stop(at + len + 0.02);
  };

  return {
    get enabled() {
      return on;
    },
    enable(v: boolean) {
      on = v;
      if (v && !ctx) init();
      if (ctx) void (v ? ctx.resume() : ctx.suspend());
    },
    /** per frame: `wind` -1..1 from the scroll, `night` 1 at night → 0 by day */
    frame(dt: number, wind: number, night: number) {
      if (!on || !ctx) return;
      const a = Math.min(Math.abs(wind), 1);
      windGain.gain.setTargetAtTime(0.025 + a * 0.22, ctx.currentTime, 0.05);
      windFilter.frequency.setTargetAtTime(320 + a * 900, ctx.currentTime, 0.08);
      cricketIn -= dt;
      if (night > 0.2 && cricketIn <= 0) {
        cricketIn = 0.45 + Math.random() * 0.5;
        for (let k = 0; k < 3; k++) blip(4300 + Math.random() * 300, 0.018 * night, ctx.currentTime + k * 0.055, 0.04);
      }
    },
    tock(strength: number) {
      if (on && ctx) blip(560, 0.12 * (0.4 + strength * 0.6), ctx.currentTime, 0.14, 260);
    },
  };
}
