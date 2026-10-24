// m8kit: live panels and a browser demo engine for the M8 guide.
//
// A page loads this module once and declares what it wants to show:
//
//   <m8-player src="../songs/low-tide.json" step="3"></m8-player>   transport (one per page)
//   <m8-phrase phrase="30"></m8-phrase>        the phrase as the M8 draws it
//   <m8-chain chain="03"></m8-chain>
//   <m8-instrument inst="03" show="params mods banks"></m8-instrument>
//   <m8-roll tracks="2,3"></m8-roll>           piano roll, chord lane, top voice
//   <m8-progression></m8-progression>          the chords, where they are going
//   <m8-envelope inst="03" mod="1"></m8-envelope>
//   <m8-filter inst="03"></m8-filter>          cutoff over time + response over a spectrum
//
// Everything comes from the song spec. Every element in the spec carries the walkthrough
// step that introduces it; a page at step N plays and draws everything up to N and marks
// what step N adds as new.
//
// The sound is a stand-in made with Web Audio, not the M8. Value scales (cutoff in Hz,
// LFO depth) are the demo's own and are labeled as such wherever they are shown.

// ---------------------------------------------------------------- notes and numbers

const PC = { 'C-': 0, 'C#': 1, 'D-': 2, 'D#': 3, 'E-': 4, 'F-': 5, 'F#': 6, 'G-': 7, 'G#': 8, 'A-': 9, 'A#': 10, 'B-': 11 };
const SPELL = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export function midiOf(name) {
  const m = /^([A-G][-#])(-?\d+)$/.exec(name ?? '');
  return m ? (Number(m[2]) + 1) * 12 + PC[m[1]] : null;
}
const spell = (midi) => SPELL[midi % 12] + (Math.floor(midi / 12) - 1);
const hex = (s) => parseInt(s, 16);
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Demo scales. The M8's own curves are not published; these are chosen to sound right.
const cutoffHz = (v) => 20 * 2 ** (v / 255 * 10);          // 00 = 20 Hz, FF = 20 kHz
const lfoCents = (amt) => amt / 255 * 4800;                // 40 = about one octave each way
const resQ = (v) => 0.7 + v / 255 * 14;

// ---------------------------------------------------------------- song model

function build(spec, step) {
  const on = (x) => (x?.step ?? 0) <= step;
  const tracks = [];
  for (const t of spec.tracks.filter(on)) {
    const events = [];
    let pos = 0;
    for (const row of spec.song) {
      const chainId = row.chains[String(t.n)];
      if (!chainId) break;
      const chain = (spec.chains[chainId] ?? []).filter(on);
      chain.forEach((c, ci) => {
        const ph = spec.phrases[c.ph] ?? { rows: {} };
        for (let r = 0; r < 16; r++) {
          const cell = ph.rows[String(r)];
          if (cell && on(cell)) {
            events.push({
              t: pos + r, note: midiOf(cell.n), name: cell.n, v: hex(cell.v ?? '64'),
              inst: cell.i, fx: (cell.fx ?? []).filter(on), phrase: c.ph, chainRow: ci, row: r,
            });
          }
        }
        pos += 16;
      });
    }
    if (pos === 0) continue;
    events.forEach((e, i) => {
      const next = events[i + 1];
      e.end = next ? next.t : pos + (events[0]?.t ?? 0);
    });
    tracks.push({ ...t, len: pos, events, chainId: spec.song[0].chains[String(t.n)] });
  }
  const len = Math.max(16, ...tracks.map((t) => t.len));
  const insts = {};
  for (const [id, inst] of Object.entries(spec.instruments)) {
    if (!on(inst)) continue;
    insts[id] = {
      ...inst,
      id,
      params: Object.fromEntries(inst.params),
      mods: (inst.mods ?? []).filter(on),
      banks: (inst.banks ?? []).filter(on),
    };
  }
  return { spec, step, tracks, len, insts, on };
}

// The notes a Hypersynth event actually sounds: the played note plus its bank's intervals.
function chordOf(model, ev) {
  const inst = model.insts[ev.inst];
  if (!inst || inst.type !== 'HYPERSYNTH') return [ev.note];
  const bankId = ev.fx.find((f) => f.bank)?.bank ?? inst.params.CHORD ?? '00';
  const bank = inst.banks.find((b) => b.bank === bankId) ?? inst.banks[0];
  return bank ? bank.iv.map((i) => ev.note + hex(i)) : [ev.note];
}

function eventAt(track, pos) {
  const local = ((pos % track.len) + track.len) % track.len;
  let hit = null;
  for (const e of track.events) if (e.t <= local) hit = e;
  return hit ?? track.events[track.events.length - 1] ?? null;
}

// ---------------------------------------------------------------- envelope model
// Kept in JS as well as in the audio graph, so the panels can show exactly what plays.

const ticks = (tempo) => 60 / tempo / 24; // seconds per tick (24 per quarter note)

// Freeze a param at its current value from time t (Firefox lacks cancelAndHoldAtTime).
function hold(param, t) {
  if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(t);
  else param.cancelScheduledValues(t);
}

class Env {
  constructor(p, tempo) {
    const tk = ticks(tempo);
    this.amt = hex(p.AMT ?? 'FF') / 255;
    this.atk = hex(p.ATK ?? '00') * tk;
    this.dec = hex(p.DEC ?? '00') * tk;
    this.sus = hex(p.SUS ?? 'FF') / 255;
    this.rel = hex(p.REL ?? '00') * tk;
    this.trig = null; this.from = 0; this.off = null; this.offLevel = 0;
  }
  level(t) {
    if (this.trig == null || t < this.trig) return this.trig == null ? 0 : this.from;
    if (this.off != null && t >= this.off) {
      return this.rel ? Math.max(0, this.offLevel * (1 - (t - this.off) / this.rel)) : 0;
    }
    return this.held(t);
  }
  held(t) {
    const dt = t - this.trig;
    const atk = this.atk * (1 - this.from / this.amt || 0);
    if (dt < atk) return this.from + (this.amt - this.from) * (dt / atk);
    const d = dt - atk;
    if (this.dec && d < this.dec) return this.amt + (this.amt * this.sus - this.amt) * (d / this.dec);
    return this.amt * this.sus;
  }
  stage(t) {
    if (this.trig == null) return 'idle';
    if (this.off != null && t >= this.off) return this.level(t) > 0.001 ? 'release' : 'idle';
    const dt = t - this.trig;
    const atk = this.atk * (1 - this.from / this.amt || 0);
    if (dt < atk) return 'attack';
    if (this.dec && dt - atk < this.dec) return 'decay';
    return 'sustain';
  }
  // 6.6: a retrigger of the same instrument resumes the attack from the current level.
  trigger(t, param) {
    this.from = this.level(t);
    this.trig = t; this.off = null;
    const atk = this.atk * (1 - this.from / this.amt || 0);
    hold(param, t);
    param.setValueAtTime(this.from, t);
    param.linearRampToValueAtTime(this.amt, t + Math.max(atk, 0.005));
    if (this.dec) param.linearRampToValueAtTime(this.amt * this.sus, t + atk + this.dec);
  }
  release(t, param) {
    this.offLevel = this.level(t);
    this.off = t;
    hold(param, t);
    param.setValueAtTime(this.offLevel, t);
    param.linearRampToValueAtTime(0, t + Math.max(this.rel, 0.01));
  }
}

// ---------------------------------------------------------------- voices

function wave(ctx, shape) {
  // Harmonic recipes for the Hypersynth shapes the guide uses; others fall back to saw.
  const n = 48;
  const real = new Float32Array(n), imag = new Float32Array(n);
  const tilt = { 'SAW': 1, 'SOFT SAW': 1.45, 'DARK SAW': 1.9 }[shape];
  for (let k = 1; k < n; k++) {
    if (tilt) imag[k] = 1 / k ** tilt;
    else if (shape === 'TRIANGLE') imag[k] = k % 2 ? ((k - 1) / 2 % 2 ? -1 : 1) / (k * k) : 0;
    else if (shape === 'SQUARE SOFT') imag[k] = k % 2 ? 1 / k ** 1.4 : 0;
    else imag[k] = k === 1 ? 1 : 0; // sines
  }
  return ctx.createPeriodicWave(real, imag);
}

class Voice {
  constructor(engine, inst) {
    const { ctx } = engine;
    this.engine = engine; this.inst = inst;
    const p = inst.params;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = p.FILTER === 'HIGHPASS' ? 'highpass' : 'lowpass';
    this.filter.frequency.value = cutoffHz(hex(p.CUTOFF ?? 'FF'));
    this.filter.Q.value = resQ(hex(p.RES ?? '00'));
    this.vca = ctx.createGain();
    this.vca.gain.value = 0;
    this.out = ctx.createGain();
    this.filter.connect(this.vca).connect(this.out);
    engine.route(this.out, p);
    const envMod = inst.mods.find((m) => m.type.startsWith('ADSR') && m.dest === 'VOLUME');
    this.env = envMod ? new Env(envMod.p, engine.tempo) : null;
    this.lfo = null;
    const lfoMod = inst.mods.find((m) => m.type === 'LFO' && m.dest === 'CUTOFF');
    if (lfoMod) {
      const period = hex(lfoMod.p.FREQ) * (60 / engine.tempo / 4); // FREQ in steps (demo reading)
      this.lfo = { period, cents: lfoCents(hex(lfoMod.p.AMT)), start: engine.t0 };
      const osc = ctx.createOscillator();
      osc.frequency.value = 1 / period;
      const depth = ctx.createGain();
      depth.gain.value = this.lfo.cents;
      osc.connect(depth).connect(this.filter.detune);
      osc.start(engine.t0);
      this.nodes = [osc];
    } else {
      this.nodes = [];
    }
    this.oscs = [];
  }
  cutoffAt(t) {
    const base = cutoffHz(hex(this.inst.params.CUTOFF ?? 'FF'));
    if (!this.lfo) return base;
    const ph = (t - this.lfo.start) / this.lfo.period;
    return base * 2 ** (Math.sin(2 * Math.PI * ph) * this.lfo.cents / 1200);
  }
  levelAt(t) { return this.env ? this.env.level(t) : (this.gate ? 1 : 0); }
  trigger(ev, notes, t) {
    this.setNotes(notes, t, ev.v / 0x7f);
    if (this.env) this.env.trigger(t, this.vca.gain);
    else {
      hold(this.vca.gain, t);
      this.vca.gain.setTargetAtTime(1, t, 0.004);
    }
    this.gate = true;
  }
  release(t) {
    this.gate = false;
    if (this.env) this.env.release(t, this.vca.gain);
    else { hold(this.vca.gain, t); this.vca.gain.setTargetAtTime(0, t, 0.03); }
  }
  stop() {
    const t = this.engine.ctx.currentTime;
    for (const o of [...this.nodes, ...this.oscs.flat()]) try { o.stop(t + 0.05); } catch {}
  }
}

// Hypersynth stand-in: each interval is a pair of detuned oscillators (SWARM), spread in
// stereo (WIDTH), plus a square sub one or two octaves down (SUBOSC), as the manual describes.
class HyperVoice extends Voice {
  setNotes(notes, t, vel) {
    const { ctx } = this.engine;
    const p = this.inst.params;
    if (!this.pw) this.pw = wave(ctx, p.SHAPE);
    const detune = hex(p.SWARM ?? '00') / 255 * 40;
    const width = hex(p.WIDTH ?? '00') / 255;
    while (this.oscs.length < 6) {
      const pair = [-1, 1].map((side) => {
        const o = ctx.createOscillator();
        o.setPeriodicWave(this.pw);
        o.detune.value = side * detune;
        const g = ctx.createGain(); g.gain.value = 0;
        const pan = ctx.createStereoPanner();
        o.connect(g).connect(pan).connect(this.filter);
        o.start(t);
        o._g = g; o._pan = pan;
        return o;
      });
      this.oscs.push(pair);
    }
    const level = 0.16 * vel;
    this.oscs.forEach((pair, i) => {
      const n = notes[i];
      pair.forEach((o, side) => {
        if (n != null) o.frequency.setValueAtTime(hz(n), t);
        o._g.gain.setTargetAtTime(n != null ? level : 0, t, 0.01);
        const spread = notes.length > 1 ? (i / (notes.length - 1)) * 2 - 1 : 0;
        o._pan.pan.setValueAtTime(Math.max(-1, Math.min(1, (spread * 0.7 + (side ? 0.3 : -0.3)) * width)), t);
      });
    });
    const sub = hex(p.SUBOSC ?? '00');
    if (sub) {
      if (!this.sub) {
        this.sub = ctx.createOscillator(); this.sub.type = 'square';
        this.subG = ctx.createGain(); this.sub.connect(this.subG).connect(this.filter); this.sub.start(t);
        this.oscs.push([this.sub]);
      }
      this.sub.frequency.setValueAtTime(hz(notes[0] - (sub >= 0x80 ? 12 : 24)), t);
      this.subG.gain.setTargetAtTime(0.12 * vel, t, 0.01);
    }
  }
}

// Macrosynth SINE TRIANGLE stand-in: a sine and a triangle (balance on COLOR) into a
// wavefolder (strength on TIMBRE). Close in spirit only.
class MacroVoice extends Voice {
  setNotes(notes, t, vel) {
    const { ctx } = this.engine;
    const p = this.inst.params;
    if (!this.oscs.length) {
      const mix = hex(p.COLOR ?? '00') / 255;
      const fold = ctx.createWaveShaper();
      const k = 1 + hex(p.TIMBRE ?? '00') / 255 * 6;
      const curve = new Float32Array(1024);
      for (let i = 0; i < curve.length; i++) curve[i] = Math.sin((i / 511.5 - 1) * k * Math.PI / 2);
      fold.curve = curve;
      const pre = ctx.createGain(); pre.gain.value = 0.9;
      const s = ctx.createOscillator(); s.type = 'sine';
      const tr = ctx.createOscillator(); tr.type = 'triangle';
      const gs = ctx.createGain(); gs.gain.value = 1 - mix;
      const gt = ctx.createGain(); gt.gain.value = mix;
      s.connect(gs).connect(pre); tr.connect(gt).connect(pre);
      pre.connect(fold).connect(this.filter);
      s.start(t); tr.start(t);
      this.oscs = [[s, tr]];
      this.out.gain.value = 0.5;
    }
    for (const o of this.oscs[0]) o.frequency.setValueAtTime(hz(notes[0]), t);
    this.out.gain.setValueAtTime(0.55 * vel, t);
  }
}

// ---------------------------------------------------------------- engine

function impulse(ctx, seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      lp += 0.35 * ((Math.random() * 2 - 1) - lp);
      d[i] = lp * (1 - i / len) ** decay;
    }
  }
  return buf;
}

class Engine {
  constructor(model) {
    this.model = model;
    this.tempo = model.spec.tempo;
    this.stepDur = 60 / this.tempo / 4;
  }
  async start() {
    const ctx = this.ctx = new AudioContext({ latencyHint: 'playback' });
    await ctx.resume();
    this.t0 = ctx.currentTime + 0.12;
    const master = this.master = ctx.createGain();
    master.gain.value = 0.8;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10; limiter.ratio.value = 12; limiter.attack.value = 0.003;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 4096;
    master.connect(limiter).connect(this.analyser).connect(ctx.destination);
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = impulse(ctx, 4.5, 2.4);
    this.reverb.connect(master);
    this.delay = ctx.createDelay(2);
    this.delay.delayTime.value = this.stepDur * 3; // dotted eighth
    const fb = ctx.createGain(); fb.gain.value = 0.35;
    const dlp = ctx.createBiquadFilter(); dlp.frequency.value = 2500;
    this.delay.connect(dlp).connect(fb).connect(this.delay);
    dlp.connect(master);
    this.voices = new Map();   // "track:inst" -> voice
    this.trackOut = new Map(); // track -> { gain, analyser }
    for (const tr of this.model.tracks) {
      const g = ctx.createGain();
      const a = ctx.createAnalyser(); a.fftSize = 4096;
      g.connect(a);
      this.trackOut.set(tr.n, { gain: g, analyser: a, muted: false });
    }
    this.next = this.t0;
    this.stepIndex = 0;
    this.timer = setInterval(() => this.pump(), 25);
    this.pump();
  }
  route(out, p) {
    const { ctx } = this;
    const tr = this._routing;
    out.connect(tr.gain);
    const dry = ctx.createGain(); dry.gain.value = hex(p.DRY ?? 'C0') / 255;
    tr.gain.connect(dry).connect(this.master);
    const rev = ctx.createGain(); rev.gain.value = hex(p.REV ?? '00') / 255 * 0.6;
    out.connect(rev).connect(this.reverb);
    const del = ctx.createGain(); del.gain.value = hex(p.DEL ?? '00') / 255 * 0.5;
    out.connect(del).connect(this.delay);
  }
  voiceFor(track, instId) {
    const key = `${track.n}:${instId}`;
    let v = this.voices.get(key);
    if (!v) {
      const inst = this.model.insts[instId];
      if (!inst) return null;
      this._routing = this.trackOut.get(track.n);
      v = new (inst.type === 'HYPERSYNTH' ? HyperVoice : MacroVoice)(this, inst);
      v.track = track.n;
      this.voices.set(key, v);
    }
    return v;
  }
  pump() {
    const { ctx } = this;
    while (this.next < ctx.currentTime + 0.15) {
      for (const tr of this.model.tracks) {
        const local = this.stepIndex % tr.len;
        for (const ev of tr.events) {
          if (ev.t !== local) continue;
          const v = this.voiceFor(tr, ev.inst);
          if (!v) continue;
          // One voice per track, as on the M8: a new instrument cuts the old one.
          for (const [k, other] of this.voices) if (other !== v && other.track === tr.n && other.gate) other.release(this.next);
          v.trigger(ev, chordOf(this.model, ev), this.next);
        }
      }
      this.next += this.stepDur;
      this.stepIndex++;
    }
  }
  pos() {
    // Song position in steps (16ths), as a float.
    return Math.max(0, (this.ctx.currentTime - this.t0) / this.stepDur);
  }
  mute(n, on) {
    const t = this.trackOut.get(n);
    if (!t) return;
    t.muted = on;
    t.gain.gain.setTargetAtTime(on ? 0 : 1, this.ctx.currentTime, 0.02);
  }
  // Stop sends every voice an OFF, then lets the release ring before closing.
  async stop() {
    clearInterval(this.timer);
    const t = this.ctx.currentTime;
    let ring = 0.1;
    for (const v of this.voices.values()) {
      if (v.gate) v.release(t);
      if (v.env) ring = Math.max(ring, v.env.rel);
    }
    this.stoppedAt = t;
    this.closing = setTimeout(() => {
      for (const v of this.voices.values()) v.stop();
      this.ctx.close();
    }, (ring + 0.6) * 1000);
  }
}

// ---------------------------------------------------------------- page player

const pages = { player: null, panels: new Set() };
const ready = new Promise((resolve) => { pages.resolve = resolve; });

function css(el, name) {
  return getComputedStyle(el).getPropertyValue(name).trim() || '#000';
}

function canvasFor(el, h) {
  let c = el.querySelector('canvas');
  if (!c) { c = document.createElement('canvas'); el.prepend(c); }
  const w = el.clientWidth || 320;
  const dpr = window.devicePixelRatio || 1;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    c.style.height = h + 'px';
  }
  const g = c.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, w, h };
}

class M8Player extends HTMLElement {
  async connectedCallback() {
    pages.player = this;
    this.step = Number(this.getAttribute('step') ?? 99);
    this.innerHTML = `<div class="m8-transport">
      <button type="button" class="m8-play" aria-pressed="false">Play</button>
      <span class="m8-where" aria-live="off">Loading…</span>
      <span class="m8-mutes"></span>
    </div>`;
    const spec = await (await fetch(this.getAttribute('src'))).json();
    this.model = build(spec, this.step);
    const label = this.getAttribute('label');
    const where = this.querySelector('.m8-where');
    this.idle = `${spec.tempo} BPM · ${this.model.len / 16} bar${this.model.len > 16 ? 's' : ''}`;
    where.textContent = this.idle;
    if (label) { where.title = label; this.querySelector('.m8-play').setAttribute('aria-label', `Play: ${label}`); }
    const mutes = this.querySelector('.m8-mutes');
    for (const tr of this.model.tracks) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'm8-mute'; b.setAttribute('aria-pressed', 'false');
      b.textContent = `T${tr.n}`;
      b.setAttribute('aria-label', `Mute track ${tr.n}, ${tr.name}`);
      b.title = `Mute T${tr.n} ${tr.name}`;
      b.addEventListener('click', () => {
        const on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(on));
        this.engine?.mute(tr.n, on);
        this.muted = { ...this.muted, [tr.n]: on };
      });
      mutes.append(b);
    }
    this.muted = {};
    this.querySelector('.m8-play').addEventListener('click', () => this.toggle());
    pages.resolve(this);
    this.loop();
  }
  async toggle() {
    const btn = this.querySelector('.m8-play');
    if (this.engine && !this.engine.stoppedAt) {
      await this.engine.stop();
      this.last = this.engine;
      btn.textContent = 'Play'; btn.setAttribute('aria-pressed', 'false');
      return;
    }
    this.engine = new Engine(this.model);
    await this.engine.start();
    for (const [n, on] of Object.entries(this.muted)) if (on) this.engine.mute(Number(n), true);
    btn.textContent = 'Stop'; btn.setAttribute('aria-pressed', 'true');
  }
  // What the panels read every frame.
  state() {
    const e = this.engine;
    if (!e || !e.ctx || e.ctx.state === 'closed') return { playing: false, pos: null, t: 0, engine: null };
    const t = e.ctx.currentTime;
    const playing = !e.stoppedAt;
    const pos = playing ? e.pos() : (e.stoppedAt - e.t0) / e.stepDur;
    return { playing, pos: Math.max(0, pos), t, engine: e };
  }
  loop() {
    const s = this.state();
    const where = this.querySelector('.m8-where');
    if (s.playing) {
      const p = Math.floor(s.pos) % this.model.len;
      where.textContent = `Bar ${Math.floor(p / 16) + 1} · row ${(p % 16).toString(16).toUpperCase()}`;
    } else if (s.engine) {
      where.textContent = 'Stopped · release ringing';
    } else if (this.idle && where.textContent !== this.idle && this.model) {
      where.textContent = this.idle;
    }
    for (const panel of pages.panels) panel.frame?.(s);
    requestAnimationFrame(() => this.loop());
  }
}

class Panel extends HTMLElement {
  async connectedCallback() {
    if (this._init) return;
    this._init = true;
    this.classList.add('m8-panel');
    const player = await ready;
    this.player = player;
    this.model = player.model;
    this.setup?.();
    pages.panels.add(this);
    new ResizeObserver(() => this.setup?.()).observe(this);
  }
  isNew(x) { return (x?.step ?? 0) === this.model.step; }
}

// ---------------------------------------------------------------- tracker mirrors

function newTag() { return '<span class="m8-new" title="Added in this step">new</span>'; }

class M8Phrase extends Panel {
  setup() {
    if (this._built) return; this._built = true;
    const id = this.getAttribute('phrase');
    const ph = this.model.spec.phrases[id] ?? { rows: {} };
    const uses = Object.values(this.model.spec.chains).flat()
      .filter((c) => c.ph === id && this.model.on(c)).length;
    const rows = [];
    for (let r = 0; r < 16; r++) {
      const c = ph.rows[String(r)];
      const shown = c && this.model.on(c);
      const fx = [0, 1, 2].map((k) => {
        const f = shown ? (c.fx ?? []).filter(this.model.on)[k] : null;
        if (!f) return '<td class="m8-dim">--- 00</td>';
        if (f.bank) {
          return `<td class="${this.isNew(f) ? 'm8-is-new' : ''}"><abbr class="m8-unknown" title="Hypersynth's chord-bank command: look up its name in the FX help list">···</abbr> ${f.bank}</td>`;
        }
        return `<td class="${this.isNew(f) ? 'm8-is-new' : ''}">${f.cmd} ${f.val}</td>`;
      }).join('');
      const isNew = shown && (this.isNew(c) || (c.fx ?? []).some((f) => this.isNew(f)));
      rows.push(`<tr data-row="${r}" class="${isNew ? 'm8-row-new' : ''}">
        <th scope="row"><span class="m8-cursor" aria-hidden="true">▶</span>${r.toString(16).toUpperCase()}</th>
        <td class="${shown ? (this.isNew(c) ? 'm8-is-new' : '') : 'm8-dim'}">${shown ? c.n : '---'}</td>
        <td class="${shown ? '' : 'm8-dim'}">${shown ? c.v : '--'}</td>
        <td class="${shown ? '' : 'm8-dim'}">${shown ? c.i : '--'}</td>
        ${fx}
        <td class="m8-newcol">${isNew ? newTag() : ''}</td></tr>`);
    }
    this.innerHTML = `<figure class="m8-screen">
      <figcaption><span class="m8-title">PHRASE ${id}${uses > 1 ? '*' : ''}</span>
        ${uses > 1 ? `<span class="m8-note">* used ${uses} times in the chain</span>` : ''}</figcaption>
      <table class="m8-grid"><thead><tr><th></th><th>N</th><th>V</th><th>I</th><th>FX1</th><th>FX2</th><th>FX3</th><th></th></tr></thead>
      <tbody>${rows.join('')}</tbody></table>
      ${ph.about ? `<p class="m8-note">${ph.about}</p>` : ''}
      ${Object.values(ph.rows).some((c) => (c.fx ?? []).some((f) => f.bank && this.model.on(f)))
        ? '<p class="m8-note"><span class="m8-unknown">···</span> is the chord-bank command. Its name is in the FX help list: <kbd>EDIT</kbd>+<kbd>UP</kbd> on the FX1 column.</p>' : ''}
    </figure>`;
  }
  frame(s) {
    const id = this.getAttribute('phrase');
    let row = -1;
    if (s.pos != null && s.playing) {
      for (const tr of this.model.tracks) {
        const local = Math.floor(s.pos) % tr.len;
        const chain = this.model.spec.chains[tr.chainId].filter(this.model.on);
        if (chain[Math.floor(local / 16)]?.ph === id) row = local % 16;
      }
    }
    if (row === this._row) return;
    this._row = row;
    this.querySelectorAll('tr[data-row]').forEach((tr) => tr.classList.toggle('m8-current', Number(tr.dataset.row) === row));
  }
}

class M8Chain extends Panel {
  setup() {
    if (this._built) return; this._built = true;
    const id = this.getAttribute('chain');
    const chain = this.model.spec.chains[id] ?? [];
    const rows = [];
    for (let r = 0; r < 16; r++) {
      const c = chain[r];
      const shown = c && this.model.on(c);
      const nu = shown && this.isNew(c);
      rows.push(`<tr data-row="${r}" class="${nu ? 'm8-row-new' : ''}">
        <th scope="row"><span class="m8-cursor" aria-hidden="true">▶</span>${r.toString(16).toUpperCase()}</th>
        <td class="${shown ? (nu ? 'm8-is-new' : '') : 'm8-dim'}">${shown ? c.ph : '--'}</td>
        <td class="m8-dim">${shown ? (c.tsp ?? '00') : '00'}</td>
        <td class="m8-newcol">${nu ? newTag() : ''}</td></tr>`);
    }
    this.innerHTML = `<figure class="m8-screen"><figcaption><span class="m8-title">CHAIN ${id}</span></figcaption>
      <table class="m8-grid"><thead><tr><th></th><th>PH</th><th>TSP</th><th></th></tr></thead><tbody>${rows.join('')}</tbody></table></figure>`;
  }
  frame(s) {
    const id = this.getAttribute('chain');
    const tr = this.model.tracks.find((t) => t.chainId === id);
    const row = s.playing && tr ? Math.floor((Math.floor(s.pos) % tr.len) / 16) : -1;
    if (row === this._row) return;
    this._row = row;
    this.querySelectorAll('tr[data-row]').forEach((t) => t.classList.toggle('m8-current', Number(t.dataset.row) === row));
  }
}

class M8Instrument extends Panel {
  setup() {
    if (this._built) return; this._built = true;
    const id = this.getAttribute('inst');
    const raw = this.model.spec.instruments[id];
    if (!raw) { this.textContent = `No instrument ${id} in this song.`; return; }
    const show = (this.getAttribute('show') ?? 'params mods banks').split(/\s+/);
    const instNew = this.isNew(raw);
    let html = `<figure class="m8-screen"><figcaption><span class="m8-title">INST. ${id}</span>${instNew && show.includes('params') ? newTag() : ''}</figcaption>`;
    if (show.includes('params')) {
      html += `<dl class="m8-params">
        <div><dt>TYPE</dt><dd>${raw.type}</dd></div><div><dt>NAME</dt><dd>${raw.name}</dd></div>
        ${raw.params.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>`;
    }
    if (show.includes('banks') && raw.banks) {
      const banks = raw.banks.filter(this.model.on);
      html += `<table class="m8-banks"><caption>Chord banks (CHORD)</caption>
        <thead><tr><th>Bank</th><th>Intervals</th><th>Notes</th><th>Over the root</th><th></th></tr></thead><tbody>
        ${banks.map((b) => `<tr class="${this.isNew(b) ? 'm8-row-new' : ''}"><td>${b.bank}</td><td class="m8-nowrap">${b.iv.join(' ')}</td><td class="m8-nowrap">${b.shape}</td><td>${b.use}</td><td>${this.isNew(b) ? newTag() : ''}</td></tr>`).join('')}
        </tbody></table>`;
    }
    if (show.includes('mods')) {
      const mods = (raw.mods ?? []).filter(this.model.on);
      if (mods.length) {
        html += `<div class="m8-mods">${mods.map((m) => `<div class="m8-mod ${this.isNew(m) ? 'm8-is-new' : ''}">
          <p class="m8-modhead">MOD ${m.slot} <b>${m.type}</b> → ${m.dest} ${this.isNew(m) ? newTag() : ''}</p>
          <dl class="m8-params">${Object.entries(m.p).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>`).join('')}</div>`;
      }
    }
    this.innerHTML = html + '</figure>';
  }
}

// ---------------------------------------------------------------- roll

class M8Roll extends Panel {
  setup() {
    const want = (this.getAttribute('tracks') ?? '').split(',').map(Number).filter(Boolean);
    this.tracks = this.model.tracks.filter((t) => !want.length || want.includes(t.n));
    this.notes = [];
    for (const tr of this.tracks) {
      const reps = this.model.len / tr.len;
      for (let k = 0; k < reps; k++) {
        for (const ev of tr.events) {
          const t0 = ev.t + k * tr.len;
          const t1 = Math.min(ev.end + k * tr.len, this.model.len);
          const chord = chordOf(this.model, ev);
          chord.forEach((n, i) => this.notes.push({ n, t0, t1, track: tr.n, top: i === chord.length - 1, inst: this.model.insts[ev.inst]?.type }));
        }
      }
    }
    const ns = this.notes.map((x) => x.n);
    this.lo = Math.min(...ns) - 2; this.hi = Math.max(...ns) + 2;
    if (!this.querySelector('.m8-readout')) {
      this.innerHTML = `<p class="m8-legend">${this.tracks.map((t) => {
        const kind = this.notes.find((x) => x.track === t.n)?.inst === 'HYPERSYNTH' ? 'outlined, hatched blocks; the top voice is the thick line' : 'solid blocks';
        return `<span>T${t.n} ${t.name}: ${kind}</span>`;
      }).join('')}</p><p class="m8-readout" aria-live="off"></p>`;
    }
    this.draw(null);
  }
  frame(s) {
    const p = s.pos == null ? null : s.pos % this.model.len;
    if (p === this._p) return;
    this._p = p;
    this.draw(s.playing ? p : null);
  }
  draw(p) {
    const lane = 26, left = 36, rowH = Math.max(5, Math.min(9, 260 / (this.hi - this.lo)));
    const H = lane + (this.hi - this.lo) * rowH + 18;
    const { g, w, h } = canvasFor(this, H);
    const ink = css(this, '--m8-ink'), mid = css(this, '--m8-mid'), faint = css(this, '--m8-faint'), paper = css(this, '--m8-paper');
    const W = w - left - 4;
    const L = this.model.len;
    const x = (t) => left + (t / L) * W;
    const y = (n) => lane + (this.hi - n) * rowH;
    g.clearRect(0, 0, w, h);
    g.font = '12px ui-monospace, Menlo, monospace';
    g.textBaseline = 'middle';
    // pitch grid: a light band on every C, labels on C
    for (let n = this.lo; n <= this.hi; n++) {
      if (n % 12 === 0) {
        g.fillStyle = faint; g.fillRect(left, y(n) - rowH / 2, W, 1);
        g.fillStyle = mid; g.fillText(spell(n), 2, y(n));
      }
    }
    // bars and beats
    for (let t = 0; t <= L; t += 4) {
      g.fillStyle = t % 16 === 0 ? mid : faint;
      g.fillRect(x(t), lane - 4, t % 16 === 0 ? 1.5 : 1, h - lane - 14);
    }
    // chord lane
    const harmony = this.model.step >= 3 || this.hasAttribute('chords') ? this.model.spec.harmony : [];
    const bars = L / 16;
    g.textBaseline = 'alphabetic';
    // Each name sits inside its own bars. A name too long for its bars is left out, unless it
    // is the chord sounding now, which is drawn bold on a paper backing so it stays legible.
    let current = null;
    for (const hm of harmony) {
      if (hm.bar > bars) continue;
      const bar = p == null ? -1 : Math.floor(p / 16) + 1;
      const cur = bar >= hm.bar && bar < hm.bar + (hm.hold ?? 1);
      const x0 = x((hm.bar - 1) * 16) + 3, span = x((hm.bar - 1 + (hm.hold ?? 1)) * 16) - x0 - 4;
      g.font = `${cur ? 700 : 500} 13px system-ui, sans-serif`;
      if (cur) { current = { hm, x0 }; continue; }
      if (g.measureText(hm.chord).width > span) continue;
      g.fillStyle = mid;
      g.fillText(hm.chord, x0, 17);
    }
    if (current) {
      g.font = '700 13px system-ui, sans-serif';
      const tw = g.measureText(current.hm.chord).width;
      const x0 = Math.min(current.x0, w - tw - 4);
      g.fillStyle = paper; g.fillRect(x0 - 3, 2, tw + 6, 20);
      g.fillStyle = ink; g.fillText(current.hm.chord, x0, 17);
    }
    g.font = '12px ui-monospace, Menlo, monospace';
    g.fillStyle = mid;
    for (let b = 0; b < bars; b++) g.fillText(String(b + 1), x(b * 16) + 3, h - 3);
    // notes
    const sounding = [];
    for (const nt of this.notes) {
      const on = p != null && p >= nt.t0 && p < nt.t1;
      if (on) sounding.push(nt);
      const x0 = x(nt.t0) + 1, x1 = x(nt.t1) - 1, yy = y(nt.n) - rowH / 2 + 1, hh = rowH - 2;
      if (nt.inst === 'HYPERSYNTH') {
        g.fillStyle = on ? mid : paper;
        g.fillRect(x0, yy, x1 - x0, hh);
        g.save(); g.beginPath(); g.rect(x0, yy, x1 - x0, hh); g.clip();
        g.strokeStyle = on ? ink : mid; g.lineWidth = 1;
        for (let k = x0 - hh; k < x1; k += 5) { g.beginPath(); g.moveTo(k, yy + hh); g.lineTo(k + hh, yy); g.stroke(); }
        g.restore();
        g.strokeStyle = ink; g.lineWidth = on ? 2 : 1;
        g.strokeRect(x0, yy, x1 - x0, hh);
      } else {
        g.fillStyle = on ? ink : mid;
        g.fillRect(x0, yy, x1 - x0, hh);
      }
    }
    // top voice line
    const tops = this.notes.filter((nt) => nt.top && nt.inst === 'HYPERSYNTH').sort((a, b) => a.t0 - b.t0);
    if (tops.length) {
      // Through the middle of the top notes, on a paper halo, so it reads as its own line.
      const path = () => {
        g.beginPath();
        tops.forEach((nt, i) => {
          const yy = y(nt.n);
          if (i) g.lineTo(x(nt.t0), yy); else g.moveTo(x(nt.t0), yy);
          g.lineTo(x(nt.t1), yy);
        });
      };
      g.lineJoin = 'round'; g.lineCap = 'round';
      path(); g.strokeStyle = paper; g.lineWidth = 7; g.stroke();
      path(); g.strokeStyle = ink; g.lineWidth = 3; g.stroke();
    }
    // playhead
    if (p != null) { g.fillStyle = ink; g.fillRect(x(p) - 1, lane - 6, 2, h - lane - 10); }
    // readout
    const ro = this.querySelector('.m8-readout');
    if (ro) {
      if (p == null) ro.textContent = 'Press Play to hear it. Sounding notes show here.';
      else {
        const byTrack = this.tracks.map((t) => {
          const ns = sounding.filter((s) => s.track === t.n).map((s) => spell(s.n));
          return ns.length ? `T${t.n} ${ns.join(' ')}` : null;
        }).filter(Boolean);
        const hm = harmony.filter((h0) => h0.bar <= Math.floor(p / 16) + 1).pop();
        ro.textContent = `Bar ${Math.floor(p / 16) + 1}${hm ? ' · ' + hm.chord : ''} · sounding: ${byTrack.join(' | ') || 'nothing'}`;
      }
    }
  }
}

// ---------------------------------------------------------------- progression

class M8Progression extends Panel {
  setup() {
    if (this._built) return; this._built = true;
    const hs = this.model.spec.harmony;
    this.innerHTML = `<ol class="m8-prog">${hs.map((h, i) => `
      <li data-i="${i}">
        <span class="m8-roman">${h.roman}</span>
        <span class="m8-chord">${h.chord}</span>
        <span class="m8-sub">bar${h.hold ? 's' : ''} ${h.bar}${h.hold ? '–' + (h.bar + h.hold - 1) : ''} · root ${h.bass} · pad ${h.upper}</span>
        <span class="m8-move">→ ${h.move}</span>
        <span class="m8-state"></span>
      </li>`).join('')}</ol>`;
  }
  frame(s) {
    const hs = this.model.spec.harmony;
    let cur = -1;
    if (s.playing && s.pos != null) {
      const bar = Math.floor((s.pos % this.model.len) / 16) + 1;
      hs.forEach((h, i) => { if (bar >= h.bar) cur = i; });
      if (this.model.len < 128) cur = -1;
    }
    if (cur === this._cur) return;
    this._cur = cur;
    this.querySelectorAll('li').forEach((li, i) => {
      const isCur = i === cur, isNext = cur >= 0 && i === (cur + 1) % hs.length;
      li.classList.toggle('m8-current', isCur);
      li.classList.toggle('m8-next', isNext);
      li.querySelector('.m8-state').textContent = isCur ? 'now' : isNext ? 'next' : '';
    });
  }
}

// ---------------------------------------------------------------- envelope

class M8Envelope extends Panel {
  setup() {
    const inst = this.model.insts[this.getAttribute('inst')];
    const slot = Number(this.getAttribute('mod') ?? 1);
    this.mod = inst?.mods.find((m) => m.slot === slot);
    if (!this.mod) { this.textContent = 'This envelope arrives in a later step.'; return; }
    this.env = new Env(this.mod.p, this.model.spec.tempo);
    if (!this.querySelector('.m8-readout')) {
      const tk = ticks(this.model.spec.tempo);
      const p = this.mod.p;
      const row = (k, label) => p[k] == null ? '' : `<li><b>${k} ${p[k]}</b> ${label(hex(p[k]))}</li>`;
      const time = (v) => `= ${v} ticks = ${(v * tk).toFixed(2)} s at ${this.model.spec.tempo} BPM (${(v / 96).toFixed(2).replace(/\.00$/, '')} bar${v === 96 ? '' : 's'})`;
      this.insertAdjacentHTML('beforeend', `<ul class="m8-facts">
        ${row('ATK', time)}${row('DEC', (v) => v ? time(v) : '= no decay: straight to the sustain level')}${row('SUS', (v) => `= hold at ${Math.round(v / 2.55)}% while the note is held`)}${row('REL', time)}
        </ul><p class="m8-readout" aria-live="off"></p>`);
    }
    this.draw(null);
  }
  frame(s) {
    if (!this.mod) return;
    const v = s.engine && [...s.engine.voices.values()].find((x) => x.inst.id === this.getAttribute('inst'));
    this.draw(v?.env ? { env: v.env, t: s.t } : null);
  }
  draw(live) {
    const { g, w, h } = canvasFor(this, 176);
    const ink = css(this, '--m8-ink'), mid = css(this, '--m8-mid'), faint = css(this, '--m8-faint');
    const e = this.env;
    const barSec = 240 / this.model.spec.tempo;
    const holdShown = Math.max(e.atk * 0.6, 0.8);
    const total = e.atk + e.dec + holdShown + e.rel;
    const L = 8, R = w - 8, T = 8, B = h - 64;
    const x = (t) => L + (t / total) * (R - L);
    const y = (lv) => B - lv * (B - T);
    g.clearRect(0, 0, w, h);
    // shape
    g.strokeStyle = ink; g.lineWidth = 2.5; g.beginPath();
    g.moveTo(x(0), y(0)); g.lineTo(x(e.atk), y(e.amt));
    g.lineTo(x(e.atk + e.dec), y(e.amt * e.sus));
    g.lineTo(x(e.atk + e.dec + holdShown), y(e.amt * e.sus));
    g.lineTo(x(total), y(0)); g.stroke();
    g.fillStyle = mid; g.fillRect(L, B, R - L, 1);
    // a tick per bar along the time axis
    for (let t = 0, i = 0; t <= total + 1e-6; t += barSec, i++) {
      g.fillStyle = mid; g.fillRect(x(t) - 0.5, B, 1.5, 6);
    }
    const off = e.atk + e.dec + holdShown;
    g.font = '12px system-ui, sans-serif'; g.textBaseline = 'top';
    // stage names under the baseline, out of the dot's way
    const labels = [['ATK', e.atk / 2], ['SUS', e.atk + e.dec + holdShown / 2], ['REL', off + e.rel / 2]];
    for (const [k, t] of labels) { g.fillStyle = mid; g.fillText(k, x(t) - 11, B + 9); }
    // gate bar: held from 0 to OFF
    g.fillStyle = mid; g.fillRect(x(0), B + 30, x(off) - x(0), 6);
    g.fillText('note held', x(0), B + 40);
    g.fillStyle = ink; g.fillRect(x(off) - 1, B + 24, 2, 18);
    g.fillText('OFF', x(off) + 5, B + 40);
    g.fillStyle = mid; g.textAlign = 'right';
    g.fillText('ticks: one bar each', R, B + 40);
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    // the dot
    const ro = this.querySelector('.m8-readout');
    if (live) {
      const lv = live.env.level(live.t);
      const st = live.env.stage(live.t);
      let tt;
      if (st === 'attack') tt = (live.t - live.env.trig) + e.atk * (live.env.from / e.amt);
      else if (st === 'decay' || st === 'sustain') tt = Math.min(e.atk + e.dec + holdShown * 0.5, (live.t - live.env.trig) + e.atk * (live.env.from / e.amt));
      else if (st === 'release') tt = off + (live.t - live.env.off);
      else tt = total;
      g.fillStyle = ink; g.beginPath(); g.arc(x(Math.min(tt, total)), y(lv), 6, 0, Math.PI * 2); g.fill();
      if (ro) ro.textContent = `Now: ${st}, level ${Math.round(lv * 100)}%`;
    } else if (ro) ro.textContent = 'Press Play: a dot rides this shape. Press Stop to send an OFF and watch the release.';
  }
}

// ---------------------------------------------------------------- filter

class M8Filter extends Panel {
  setup() {
    this.inst = this.model.insts[this.getAttribute('inst')];
    if (!this.inst) { this.textContent = 'This instrument arrives in a later step.'; return; }
    this.lfo = this.inst.mods.find((m) => m.type === 'LFO' && m.dest === 'CUTOFF');
    if (!this.querySelector('.m8-readout')) this.insertAdjacentHTML('beforeend', '<p class="m8-readout" aria-live="off"></p>');
    const off = new OfflineAudioContext(1, 128, 44100);
    this.bq = off.createBiquadFilter();
    this.bq.type = 'lowpass';
    this.bq.Q.value = resQ(hex(this.inst.params.RES ?? '00'));
    this.freqs = new Float32Array(160).map((_, i) => 20 * 2 ** (i / 159 * 10));
    this.mag = new Float32Array(160); this.ph = new Float32Array(160);
    this.draw(null);
  }
  frame(s) {
    if (!this.inst) return;
    const v = s.engine && [...s.engine.voices.values()].find((x) => x.inst.id === this.inst.id);
    this.draw(v && s.playing ? { v, t: s.t, an: s.engine.trackOut.get(v.track).analyser, sr: s.engine.ctx.sampleRate } : null);
  }
  draw(live) {
    const { g, w, h } = canvasFor(this, 248);
    const ink = css(this, '--m8-ink'), mid = css(this, '--m8-mid'), faint = css(this, '--m8-faint');
    g.clearRect(0, 0, w, h);
    const base = cutoffHz(hex(this.inst.params.CUTOFF ?? 'FF'));
    const period = this.lfo ? hex(this.lfo.p.FREQ) * 60 / this.model.spec.tempo / 4 : 1;
    const cents = this.lfo ? lfoCents(hex(this.lfo.p.AMT)) : 0;
    const now = live ? live.v.cutoffAt(live.t) : base;
    const fy = (f, top, bot) => bot - (Math.log2(f / 20) / 10) * (bot - top);
    g.font = '12px system-ui, sans-serif';
    // top: cutoff over one LFO cycle
    const L = 40, R = w - 8, T1 = 14, B1 = 92;
    g.fillStyle = mid; g.fillText(this.lfo ? `Cutoff over one LFO cycle (${(period / (240 / this.model.spec.tempo)).toFixed(0)} bars)` : 'Cutoff (no LFO yet: it stays put)', L, 10);
    for (const f of [100, 1000, 10000]) {
      const yy = fy(f, T1, B1);
      g.fillStyle = faint; g.fillRect(L, yy, R - L, 1);
      g.fillStyle = mid; g.fillText(f >= 1000 ? f / 1000 + 'k' : String(f), 4, yy + 4);
    }
    g.strokeStyle = ink; g.lineWidth = 2; g.beginPath();
    for (let i = 0; i <= 200; i++) {
      const f = base * 2 ** (Math.sin(2 * Math.PI * i / 200) * cents / 1200);
      const xx = L + (i / 200) * (R - L), yy = fy(f, T1, B1);
      i ? g.lineTo(xx, yy) : g.moveTo(xx, yy);
    }
    g.stroke();
    // a tick and number per bar of the cycle, to match the transport's "Bar n"
    const cycleBars = Math.round(period / (240 / this.model.spec.tempo));
    if (this.lfo && cycleBars > 1 && cycleBars <= 32) {
      g.fillStyle = mid;
      for (let b = 0; b < cycleBars; b++) {
        const xx = L + (b / cycleBars) * (R - L);
        g.fillRect(xx, B1 - 4, 1.5, 8);
        g.fillText(String(b + 1), xx + 3, B1 + 14);
      }
    }
    if (live && this.lfo) {
      const ph = (((live.t - live.v.lfo.start) / period) % 1 + 1) % 1;
      g.fillStyle = ink; g.beginPath(); g.arc(L + ph * (R - L), fy(now, T1, B1), 6, 0, Math.PI * 2); g.fill();
    }
    // bottom: spectrum + response
    const T2 = 132, B2 = h - 18;
    g.fillStyle = mid; g.fillText('Filter curve (line) over the sound of this track (bars)', L, T2 - 6);
    const xf = (f) => L + (Math.log2(f / 20) / 10) * (R - L);
    if (live) {
      const an = live.an;
      const bins = new Float32Array(an.frequencyBinCount);
      an.getFloatFrequencyData(bins);
      g.fillStyle = mid;
      const cols = 90;
      for (let c = 0; c < cols; c++) {
        const f0 = 20 * 2 ** (c / cols * 10), f1 = 20 * 2 ** ((c + 1) / cols * 10);
        let mx = -140;
        const i0 = Math.floor(f0 / (live.sr / 2) * bins.length), i1 = Math.max(i0 + 1, Math.floor(f1 / (live.sr / 2) * bins.length));
        for (let i = i0; i < i1 && i < bins.length; i++) mx = Math.max(mx, bins[i]);
        const lv = Math.max(0, (mx + 100) / 80);
        g.fillRect(xf(f0), B2 - lv * (B2 - T2), Math.max(1, xf(f1) - xf(f0) - 1), lv * (B2 - T2));
      }
    }
    this.bq.frequency.value = now;
    this.bq.getFrequencyResponse(this.freqs, this.mag, this.ph);
    g.strokeStyle = ink; g.lineWidth = 2.5; g.beginPath();
    this.freqs.forEach((f, i) => {
      const db = 20 * Math.log10(this.mag[i] || 1e-6);
      const yy = T2 + (1 - Math.max(0, Math.min(1, (db + 40) / 52))) * (B2 - T2);
      i ? g.lineTo(xf(f), yy) : g.moveTo(xf(f), yy);
    });
    g.stroke();
    g.fillStyle = faint; g.fillRect(L, B2, R - L, 1);
    g.fillStyle = mid;
    for (const f of [100, 1000, 10000]) g.fillText(f >= 1000 ? f / 1000 + 'k' : String(f), xf(f) - 6, h - 3);
    const ro = this.querySelector('.m8-readout');
    if (ro) {
      const p = this.inst.params;
      ro.textContent = `CUTOFF ${p.CUTOFF}${this.lfo ? ` + LFO (AMT ${this.lfo.p.AMT})` : ''}: now about ${Math.round(now)} Hz on the demo's scale. RES ${p.RES}.`;
    }
  }
}

customElements.define('m8-player', M8Player);
customElements.define('m8-phrase', M8Phrase);
customElements.define('m8-chain', M8Chain);
customElements.define('m8-instrument', M8Instrument);
customElements.define('m8-roll', M8Roll);
customElements.define('m8-progression', M8Progression);
customElements.define('m8-envelope', M8Envelope);
customElements.define('m8-filter', M8Filter);
