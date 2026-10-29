// m8kit: live panels and a browser demo engine for the M8 guide.
//
// A page loads this module once and declares what it wants to show:
//
//   <m8-player src="../songs/low-tide.json" step="3"></m8-player>   transport (one per page)
//   <m8-song></m8-song>                        the song view: chains per track, per row
//   <m8-phrase phrase="30"></m8-phrase>        the phrase as the M8 draws it ("30,31" = one
//                                              line per phrase; `compact` = used rows only)
//   <m8-chain chain="03"></m8-chain>
//   <m8-table table="0C"></m8-table>           an instrument table or a TBL table
//   <m8-instrument inst="03" show="params mods banks"></m8-instrument>
//   <m8-roll tracks="2,3"></m8-roll>           piano roll, chord lane, top voice
//   <m8-progression></m8-progression>          the chords, where they are going
//   <m8-envelope inst="03" mod="1"></m8-envelope>   ADSR, AHD, or a trig envelope (the duck)
//   <m8-filter inst="03"></m8-filter>          cutoff over time + response over a spectrum
//
// Everything comes from the song spec. Every element in the spec carries the walkthrough
// step that introduces it (`step`), and may carry the last step it belongs to (`until`); a
// page at step N plays and draws what is on at N and marks what step N adds as new.
//
// The sound is a stand-in made with Web Audio, not the M8: "the notes, not the tone". Value
// scales (cutoff in Hz, LFO depth) are the demo's own and are labeled as such where shown.
// Instruments marked `"demo": false` (drum models, samples) make no sound, but their notes
// still draw and still fire trig envelopes on other instruments.

// ---------------------------------------------------------------- notes and numbers

const PC = { 'C-': 0, 'C#': 1, 'D-': 2, 'D#': 3, 'E-': 4, 'F-': 5, 'F#': 6, 'G-': 7, 'G#': 8, 'A-': 9, 'A#': 10, 'B-': 11 };
const SPELL = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export function midiOf(name) {
  const m = /^([A-G][-#])(-?\d+)$/.exec(name ?? '');
  return m ? (Number(m[2]) + 1) * 12 + PC[m[1]] : null;
}
const spell = (midi) => SPELL[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
const hex = (s) => parseInt(s, 16);
const isHex = (s) => /^[0-9A-F]{2}$/i.test(s ?? '');
const sgn = (s) => { const v = hex(s ?? '00'); return v >= 0x80 ? v - 0x100 : v; }; // FF = -1
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const fxOf = (ev, cmd) => (ev.fx ?? []).find((f) => f.cmd === cmd);

// Demo scales. The M8's own curves are not published; these are chosen to sound right.
const cutoffHz = (v) => 20 * 2 ** (v / 255 * 10);          // 00 = 20 Hz, FF = 20 kHz
const lfoCents = (amt) => amt / 255 * 4800;                // 40 = about one octave each way
const resQ = (v) => 0.7 + v / 255 * 14;
const djHz = (v) => (v >= 0x80 ? 20000 : 30 * 2 ** (v / 0x80 * 9.4)); // DJ filter: 80 = open

// ---------------------------------------------------------------- song model

function build(spec, step) {
  const on = (x) => (x?.step ?? 0) <= step && (x?.until == null || step <= x.until);
  // A phrase cell is shown if its note is on, or any of its FX is.
  const visible = (c) => !!c && ((c.n && on(c)) || (c.fx ?? []).some(on));
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
  const songRows = (spec.song ?? []).filter(on);
  const tracks = [];
  for (const t of spec.tracks.filter(on)) {
    const events = [];
    const segs = [];
    let pos = 0;              // in steps (16ths); fractional when a groove swings a row
    let groove = [6, 6];      // ticks per row: groove 00. GRV changes it and it holds.
    let last = null;          // what is sounding, for rows that change it without retriggering
    for (const row of songRows) {
      const chainId = row.chains[String(t.n)];
      if (!chainId) break; // "--": the track's song list ends here
      const chain = (spec.chains[chainId] ?? []).filter(on);
      const seg = { start: pos, songRow: row.row, chainId, phrases: [] };
      chain.forEach((c, ci) => {
        const ph = spec.phrases[c.ph] ?? { rows: {} };
        const tsp = sgn(c.tsp);
        const phStart = pos;
        let tick = 0;
        for (let r = 0; r < 16; r++) {
          const cell = ph.rows[String(r)];
          if (visible(cell)) {
            const fx = (cell.fx ?? []).filter(on);
            const grv = fx.find((f) => f.cmd === 'GRV');
            if (grv) groove = spec.grooves?.[grv.val] ?? [6, 6];
            const crd = fx.find((f) => f.cmd === 'CRD');
            const base = { t: pos + tick / 6, fx, phrase: c.ph, chainRow: ci, row: r, songRow: row.row };
            const hasNote = cell.n && on(cell);
            if (hasNote && cell.n === 'OFF') {
              events.push({ ...base, off: true });
              last = null;
            } else if (hasNote) {
              // A note with an I column retriggers; without one it changes the note in place.
              const retrig = !!cell.i;
              const inst = cell.i ?? last?.inst ?? null;
              const vh = cell.v ?? last?.vh ?? '64';
              const ev = {
                ...base, note: midiOf(cell.n) + tsp, name: cell.n, v: hex(vh), vh, inst, change: !retrig,
                bank: crd?.val ?? (retrig ? insts[inst]?.params.CHORD : last?.bank),
              };
              events.push(ev); last = ev;
            } else if (last) {
              // FX with no note (CRD, say): the held note keeps sounding and changes in place.
              const ev = { ...base, note: last.note, name: last.name, v: last.v, vh: last.vh, inst: last.inst, change: true, bank: crd?.val ?? last.bank };
              events.push(ev); last = ev;
            } else {
              events.push({ ...base, fxOnly: true }); // commands on a track with no note (DJC)
            }
          }
          tick += groove[r % groove.length];
        }
        seg.phrases.push({ ph: c.ph, start: phStart, tsp });
        pos += tick / 6;
      });
      seg.end = pos;
      segs.push(seg);
    }
    if (pos === 0) continue;
    const len = Math.round(pos);
    expandTables(spec, insts, events, len);
    events.sort((a, b) => a.t - b.t);
    events.forEach((e, i) => {
      const next = events[i + 1];
      e.end = next ? next.t : len + (events[0]?.t ?? 0);
    });
    const audible = events.some((e) => e.inst && insts[e.inst] && insts[e.inst].demo !== false);
    tracks.push({ ...t, len, events, segs, audible, chainId: segs[0]?.chainId });
  }
  const len = Math.max(16, ...tracks.map((t) => t.len));
  // Harmony entries show from their own step, only inside the song's length. They describe
  // one loop; `loopBars` is its length, so an arrangement cycles through it.
  const harmony = (spec.harmony ?? []).filter((h) => (h.step ?? 0) <= step && (h.bar - 1) * 16 < len);
  const loopBars = Math.max(1, ...harmony.map((h) => h.bar + (h.hold ?? 1) - 1));
  return { spec, step, tracks, len, insts, on, harmony, loopBars, songRows };
}

// Tables: rows of transposes (N), volumes (V) and FX, run at the instrument's TABLE TIC
// (ticks per row) for as long as the note plays. The demo reads N, V and HOP 0Y, which
// jumps to row Y and keeps no time of its own (unverified: see the Tables page).
function expandTables(spec, insts, events, len) {
  const subs = [];
  events.forEach((ev, k) => {
    if (ev.off || ev.fxOnly || ev.change) return;
    const inst = insts[ev.inst];
    if (!inst) return;
    const id = fxOf(ev, 'TBL')?.val ?? inst.table;
    const table = spec.tables?.[id];
    if (!table) return;
    const tic = hex(fxOf(ev, 'TIC')?.val ?? inst.params['TABLE TIC'] ?? '01');
    if (!tic || tic > 0xFB) return; // TIC00 and the map modes aren't modeled
    let stop = len;
    for (let j = k + 1; j < events.length; j++) if (!events[j].fxOnly) { stop = events[j].t; break; }
    const rowAt = (r) => table.rows[String(r)] ?? {};
    const resolve = (r) => {
      for (let g = 0; g < 17; g++) {
        const h = (rowAt(r).fx ?? []).find((f) => f.cmd === 'HOP');
        if (!h || hex(h.val) >> 4) return r;
        r = hex(h.val) & 0xF;
      }
      return r;
    };
    const base = ev.note, v0 = ev.v;
    const apply = (r, e) => {
      const tr = rowAt(r);
      e.note = base + sgn(tr.n ?? '00');
      e.v = tr.v ? Math.round(v0 * hex(tr.v) / 0x7f) : v0;
      e.table = id; e.tableRow = r;
    };
    let row = resolve(0);
    apply(row, ev);
    let t = ev.t + tic / 6, guard = 0;
    while (t < stop - 1e-6 && guard++ < 1024) {
      row = resolve((row + 1) % 16);
      const sub = { ...ev, t, change: true, sub: true, fx: [] };
      apply(row, sub);
      subs.push(sub);
      t += tic / 6;
    }
  });
  events.push(...subs);
}

// The notes a Hypersynth event actually sounds: the played note plus its bank's intervals.
// The bank comes from CRD, or carries over from the row before.
function chordOf(model, ev) {
  const inst = model.insts[ev.inst];
  if (!inst || inst.type !== 'HYPERSYNTH') return [ev.note];
  const bankId = ev.bank ?? inst.params.CHORD ?? '00';
  const bank = inst.banks.find((b) => b.bank === bankId) ?? inst.banks[0];
  return bank ? bank.iv.map((i) => ev.note + hex(i)) : [ev.note];
}

// Where a track is at song position `pos`: song row, chain row, phrase, phrase row.
function locate(tr, pos) {
  const p = ((pos % tr.len) + tr.len) % tr.len;
  const seg = tr.segs.find((s) => p >= s.start && p < s.end) ?? tr.segs[0];
  const k = Math.max(0, Math.min(seg.phrases.length - 1, Math.floor((p - seg.start) / 16)));
  const ph = seg.phrases[k];
  return { seg, chainRow: k, ph: ph?.ph, row: Math.min(15, Math.floor(p - (ph?.start ?? 0))) };
}

// ---------------------------------------------------------------- envelope model
// Kept in JS as well as in the audio graph, so the panels can show exactly what plays.

const ticks = (tempo) => 60 / tempo / 24; // seconds per tick (24 per quarter note)

// Freeze a param at its current value from time t (Firefox lacks cancelAndHoldAtTime).
function hold(param, t) {
  if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(t);
  else param.cancelScheduledValues(t);
}

// ADSR. On 6.6.3 its times are seconds, not ticks (Andrew's unit: ATK 60 reads "0.200
// SECONDS"), and the hex-to-seconds curve isn't published. So a mod carries the target in
// seconds as `sec: {ATK: 2.869, REL: 3.663}`; a time given only as hex is read as ticks.
class Env {
  constructor(mod, tempo) {
    const p = mod.p, sec = mod.sec ?? {};
    const tk = ticks(tempo);
    const time = (k) => sec[k] ?? (isHex(p[k]) ? hex(p[k]) * tk : 0);
    this.amt = hex(p.AMT ?? 'FF') / 255;
    this.atk = time('ATK');
    this.dec = time('DEC');
    this.sus = hex(p.SUS ?? 'FF') / 255;
    this.rel = time('REL');
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

// AHD and trig envelopes: attack, hold, decay, all in ticks (6 to a row). A trig
// envelope's amount can be negative; `amt` in the spec (-1 to 1) is the demo's reading.
function ahdOf(mod, tempo) {
  const tk = ticks(tempo), p = mod.p;
  const amt = mod.amt ?? (isHex(p.AMT) ? hex(p.AMT) / 255 : 1);
  return { a: hex(p.ATK ?? '00') * tk, h: hex(p.HOLD ?? '00') * tk, d: hex(p.DEC ?? '00') * tk, amt };
}
const ahdAt = (e, dt) => (dt < 0 ? 0 : dt < e.a ? dt / e.a : dt < e.a + e.h ? 1 : dt < e.a + e.h + e.d ? 1 - (dt - e.a - e.h) / e.d : 0);

// ---------------------------------------------------------------- voices

function wave(ctx, shape) {
  // Harmonic recipes for the Hypersynth shapes the guide uses; others fall back to sine.
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
    this.duck = ctx.createGain(); // trig envelopes on VOLUME act here
    this.out = ctx.createGain();
    this.filter.connect(this.vca).connect(this.duck).connect(this.out);
    engine.route(this.out, p);
    const envMod = inst.mods.find((m) => m.type.startsWith('ADSR') && m.dest === 'VOLUME');
    this.env = envMod ? new Env(envMod, engine.tempo) : null;
    this.ducks = inst.mods.filter((m) => m.type === 'TRIG ENV' && m.dest === 'VOLUME').map((m) => ({ mod: m, e: ahdOf(m, engine.tempo) }));
    this.duckHits = [];
    this.lfo = null;
    const lfoMod = inst.mods.find((m) => m.type === 'LFO' && m.dest === 'CUTOFF');
    if (lfoMod) {
      // FREQ is a period in steps: 10 = one phrase, 80 = eight (help line on 6.6.3).
      const period = hex(lfoMod.p.FREQ) * (60 / engine.tempo / 4);
      const start = Math.max(engine.t0, ctx.currentTime);
      this.lfo = { period, cents: lfoCents(hex(lfoMod.p.AMT)), start };
      const osc = ctx.createOscillator();
      osc.frequency.value = 1 / period;
      const depth = ctx.createGain();
      depth.gain.value = this.lfo.cents;
      osc.connect(depth).connect(this.filter.detune);
      osc.start(start);
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
  duckAt(t) {
    let g = 1;
    for (const { e } of this.ducks) for (const h of this.duckHits) g = Math.min(g, 1 + e.amt * ahdAt(e, t - h));
    return g;
  }
  fireDuck(t) {
    const d = this.ducks[0];
    if (!d) return;
    const { a, h, d: dec, amt } = d.e;
    const g = this.duck.gain;
    hold(g, t);
    g.linearRampToValueAtTime(1 + amt, t + Math.max(a, 0.004));
    g.linearRampToValueAtTime(1 + amt, t + Math.max(a, 0.004) + h);
    g.linearRampToValueAtTime(1, t + Math.max(a, 0.004) + h + Math.max(dec, 0.01));
    this.duckHits.push(t);
    if (this.duckHits.length > 8) this.duckHits.shift();
  }
  trigger(ev, notes, t, glide) {
    this.setNotes(notes, t, ev.v / 0x7f, ev, glide);
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
  // Pitch to a note, gliding over `glide` seconds (PSL) when asked.
  pitch(param, f, t, glide) {
    if (glide && param._last) {
      param.setValueAtTime(param._last, t);
      param.exponentialRampToValueAtTime(f, t + glide);
    } else param.setValueAtTime(f, t);
    param._last = f;
  }
  stop() {
    const t = this.engine.ctx.currentTime;
    for (const o of [...this.nodes, ...this.oscs.flat(), this.sub].filter(Boolean)) try { o.stop(t + 0.05); } catch {}
  }
}

// Hypersynth stand-in: each interval is a pair of detuned oscillators (SWARM), spread in
// stereo (WIDTH), plus a square sub one or two octaves below the played note (SUBOSC).
// SUBOSC 80 is off; below 80 mixes in a sub two octaves down, above 80 one octave down,
// louder the further from 80 (manual; the default instrument shows SUBOSC 80).
class HyperVoice extends Voice {
  setNotes(notes, t, vel, ev, glide) {
    const { ctx } = this.engine;
    const p = this.inst.params;
    if (!this.pw) this.pw = wave(ctx, p.SHAPE);
    // SWARM detunes every saw: 80 is about a fifth up and down, FF an octave (Dirtywave
    // meetup, firmware 3.0). The curve between is unknown; the demo draws a straight line.
    const sw = hex(p.SWARM ?? '00');
    const detune = sw <= 0x80 ? sw / 0x80 * 700 : 700 + (sw - 0x80) / 0x7f * 500;
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
    const level = 0.14 * vel;
    this.oscs.forEach((pair, i) => {
      const n = notes[i];
      pair.forEach((o, side) => {
        if (n != null) this.pitch(o.frequency, hz(n), t, glide);
        // A chord change on a held note (CRD) slides the level, so it doesn't click.
        o._g.gain.setTargetAtTime(n != null ? level : 0, t, ev?.change ? 0.03 : 0.01);
        const spread = notes.length > 1 ? (i / (notes.length - 1)) * 2 - 1 : 0;
        o._pan.pan.setValueAtTime(Math.max(-1, Math.min(1, (spread * 0.7 + (side ? 0.3 : -0.3)) * width)), t);
      });
    });
    const sub = hex(p.SUBOSC ?? '80');
    const amount = Math.abs(sub - 0x80) / 0x80;
    if (amount > 0.01) {
      if (!this.sub) {
        this.sub = ctx.createOscillator(); this.sub.type = 'square';
        this.subG = ctx.createGain(); this.sub.connect(this.subG).connect(this.filter); this.sub.start(t);
      }
      this.pitch(this.sub.frequency, hz((ev?.note ?? notes[0]) - (sub > 0x80 ? 12 : 24)), t, glide);
      this.subG.gain.setTargetAtTime(0.12 * vel * amount, t, 0.01);
    }
  }
}

// Every other instrument plays on one plain stand-in: a sine and a triangle (balance on
// COLOR) into a wavefolder (strength on TIMBRE). It is the Macrosynth SINE TRIANGLE model in
// spirit, and only the notes for anything else.
class MacroVoice extends Voice {
  setNotes(notes, t, vel, ev, glide) {
    const { ctx } = this.engine;
    const p = this.inst.params;
    if (!this.oscs.length) {
      const mix = isHex(p.COLOR) ? hex(p.COLOR) / 255 : 0.3;
      const fold = ctx.createWaveShaper();
      const k = 1 + (isHex(p.TIMBRE) ? hex(p.TIMBRE) : 0x18) / 255 * 6;
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
    for (const o of this.oscs[0]) this.pitch(o.frequency, hz(notes[0]), t, glide);
    this.out.gain.setTargetAtTime(0.55 * vel, t, 0.005);
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
    this.voices = new Map();   // "track:inst" -> voice
    this.trackOut = new Map(); // track -> { gain, rev, del, analyser }
    this.starting = true;
    // Events indexed by the step they fall in, per track.
    this.byStep = new Map(model.tracks.map((tr) => {
      const at = Array.from({ length: tr.len }, () => []);
      for (const ev of tr.events) at[Math.min(tr.len - 1, Math.floor(ev.t + 1e-9))].push(ev);
      return [tr.n, at];
    }));
  }
  async start() {
    const ctx = this.ctx = new AudioContext({ latencyHint: 'playback' });
    await ctx.resume();
    this.t0 = ctx.currentTime + 0.12;
    const master = this.master = ctx.createGain();
    master.gain.value = 0.8;
    this.djf = ctx.createBiquadFilter(); // the mixer's DJ filter, moved by DJC
    this.djf.type = 'lowpass'; this.djf.frequency.value = 20000; this.djf.Q.value = 0.9;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10; limiter.ratio.value = 12; limiter.attack.value = 0.003;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 4096;
    master.connect(this.djf).connect(limiter).connect(this.analyser).connect(ctx.destination);
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = impulse(ctx, 4.5, 2.4);
    this.reverb.connect(master);
    this.delay = ctx.createDelay(2);
    this.delay.delayTime.value = this.stepDur * 3; // dotted eighth
    const fb = ctx.createGain(); fb.gain.value = 0.35;
    const dlp = ctx.createBiquadFilter(); dlp.frequency.value = 2500;
    this.delay.connect(dlp).connect(fb).connect(this.delay);
    dlp.connect(master);
    for (const tr of this.model.tracks) {
      const g = ctx.createGain();           // the track's mute point; dry signal through here
      const a = ctx.createAnalyser(); a.fftSize = 4096;
      g.connect(a); g.connect(master);
      const rev = ctx.createGain(); rev.connect(this.reverb); // sends, also muted with the track
      const del = ctx.createGain(); del.connect(this.delay);
      this.trackOut.set(tr.n, { gain: g, rev, del, analyser: a, muted: false });
    }
    // Make every voice up front, so trig envelopes hear the first hit and LFOs share t0.
    for (const tr of this.model.tracks) for (const ev of tr.events) if (ev.inst) this.voiceFor(tr, ev.inst);
    this.next = this.t0;
    this.stepIndex = 0;
    this.starting = false;
    this.timer = setInterval(() => this.pump(), 25);
    this.pump();
  }
  // A voice's dry level and sends sit before the track gain, so muting the track mutes
  // its reverb and delay too (as muting a track does on the M8).
  route(out, p) {
    const { ctx } = this;
    const tr = this._routing;
    const dry = ctx.createGain(); dry.gain.value = hex(p.DRY ?? 'C0') / 255;
    out.connect(dry).connect(tr.gain);
    const rev = ctx.createGain(); rev.gain.value = hex(p.REV ?? '00') / 255 * 0.6;
    out.connect(rev).connect(tr.rev);
    const del = ctx.createGain(); del.gain.value = hex(p.DEL ?? '00') / 255 * 0.5;
    out.connect(del).connect(tr.del);
  }
  voiceFor(track, instId) {
    const key = `${track.n}:${instId}`;
    let v = this.voices.get(key);
    if (!v) {
      const inst = this.model.insts[instId];
      if (!inst || inst.demo === false) return null;
      this._routing = this.trackOut.get(track.n);
      v = new (inst.type === 'HYPERSYNTH' ? HyperVoice : MacroVoice)(this, inst);
      v.track = track.n;
      this.voices.set(key, v);
    }
    return v;
  }
  pump() {
    const { ctx } = this;
    // After a stall (screen lock, hidden tab) skip to the first future step rather than
    // firing the whole backlog at once.
    if (this.next < ctx.currentTime) {
      const behind = Math.ceil((ctx.currentTime - this.next) / this.stepDur);
      this.next += behind * this.stepDur;
      this.stepIndex += behind;
    }
    while (this.next < ctx.currentTime + 0.3) {
      for (const tr of this.model.tracks) {
        const local = this.stepIndex % tr.len;
        for (const ev of this.byStep.get(tr.n)[local]) this.fire(tr, ev, this.next + (ev.t - local) * this.stepDur);
      }
      this.next += this.stepDur;
      this.stepIndex++;
    }
  }
  fire(tr, ev, when) {
    for (const f of ev.fx ?? []) if (f.cmd === 'DJC') this.djf.frequency.setTargetAtTime(djHz(hex(f.val)), when, 0.08);
    if (ev.fxOnly) return;
    if (ev.off) {
      for (const v of this.voices.values()) if (v.track === tr.n && v.gate) v.release(when);
      return;
    }
    // CHA X_: the note plays with chance X out of F.
    const cha = fxOf(ev, 'CHA');
    if (cha && !ev.change && Math.random() * 15 >= hex(cha.val) >> 4) return;
    if (!ev.change) {
      // Trig envelopes listening for this track (SRC 80-87) or this instrument (SRC = its number).
      for (const v of this.voices.values()) {
        for (const { mod } of v.ducks) {
          const src = hex(mod.p.SRC ?? '80');
          if (src >= 0x80 ? tr.n === src - 0x7f : ev.inst === mod.p.SRC) v.fireDuck(when);
        }
      }
    }
    const v = this.voiceFor(tr, ev.inst);
    if (!v) return; // a silent instrument: drawn, not heard
    const notes = chordOf(this.model, ev);
    const psl = fxOf(ev, 'PSL');
    const glide = psl ? hex(psl.val) * ticks(this.tempo) : 0;
    if (ev.change) {
      if (v.gate) v.setNotes(notes, when, ev.v / 0x7f, ev, glide);
      return;
    }
    // One voice per track, as on the M8: a new instrument cuts the old one.
    for (const other of this.voices.values()) if (other !== v && other.track === tr.n && other.gate) other.release(when);
    v.trigger(ev, notes, when, glide);
  }
  pos() {
    // Song position in steps (16ths), as a float.
    return Math.max(0, (this.ctx.currentTime - this.t0) / this.stepDur);
  }
  mute(n, on) {
    const t = this.trackOut.get(n);
    if (!t) return;
    t.muted = on;
    for (const g of [t.gain, t.rev, t.del]) g.gain.setTargetAtTime(on ? 0 : 1, this.ctx.currentTime, 0.02);
  }
  // Stop sends every voice an OFF, then lets the release ring before closing.
  async stop() {
    if (this.starting || this.stoppedAt) return;
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

const hx2 = (n) => n.toString(16).toUpperCase().padStart(2, '0');
const hx1 = (n) => n.toString(16).toUpperCase();

class M8Player extends HTMLElement {
  async connectedCallback() {
    pages.player = this;
    this.step = Number(this.getAttribute('step') ?? 99);
    // silent: the panels still read the spec, but there is no Play. For sounds a plain
    // browser tone would only misrepresent (drums, a recording).
    if (this.hasAttribute('silent')) {
      this.model = build(await (await fetch(this.getAttribute('src'))).json(), this.step);
      const note = document.createElement('p');
      note.className = 'demo-note';
      note.textContent = this.getAttribute('silent') || 'No demo sound for this one: the browser can\'t stand in for it.';
      this.replaceChildren(note);
      pages.resolve(this);
      this.loop();
      return;
    }
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
    // Mute buttons only for tracks the demo makes a sound on.
    const mutes = this.querySelector('.m8-mutes');
    for (const tr of this.model.tracks.filter((t) => t.audible)) {
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
    if (this.engine?.starting) return;
    if (this.engine && !this.engine.stoppedAt) {
      await this.engine.stop();
      btn.textContent = 'Play'; btn.setAttribute('aria-pressed', 'false');
      return;
    }
    this.engine = new Engine(this.model);
    btn.disabled = true;
    try { await this.engine.start(); } finally { btn.disabled = false; }
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
    if (where) {
      if (s.playing) {
        const p = Math.floor(s.pos) % this.model.len;
        const tr = this.model.tracks[0];
        if (this.model.songRows.length > 1 && tr) {
          const at = locate(tr, p);
          where.textContent = `Song ${at.seg.songRow} · bar ${at.chainRow + 1} · row ${hx1(at.row)}`;
        } else where.textContent = `Bar ${Math.floor(p / 16) + 1} · row ${hx1(p % 16)}`;
      } else if (s.engine) {
        where.textContent = 'Stopped · release ringing';
      } else if (this.idle && where.textContent !== this.idle && this.model) {
        where.textContent = this.idle;
      }
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
    new ResizeObserver(() => (this.resized ?? this.setup)?.call(this)).observe(this);
  }
  isNew(x) { return (x?.step ?? 0) === this.model.step; }
}

// ---------------------------------------------------------------- tracker mirrors

function newTag() { return '<span class="m8-new" title="Added in this step">new</span>'; }

class M8Phrase extends Panel {
  // One phrase row as the M8 draws it. `head` is the row-number cell (or a phrase number in
  // the combined view). A row with FX and no note shows the note columns empty.
  cells(c, head, dataAttr) {
    const on = this.model.on;
    const fxs = c ? (c.fx ?? []).filter(on) : [];
    const noteOn = !!c && !!c.n && on(c);
    const fx = [0, 1, 2].map((k) => {
      const f = fxs[k];
      if (!f) return '<td class="m8-dim">--- 00</td>';
      return `<td class="${this.isNew(f) ? 'm8-is-new' : ''}">${f.cmd} ${f.val}</td>`;
    }).join('');
    const isNew = (noteOn && this.isNew(c)) || fxs.some((f) => this.isNew(f));
    const col = (show, val, empty, nu) => `<td class="${show ? (nu ? 'm8-is-new' : '') : 'm8-dim'}">${show ? val : empty}</td>`;
    return `<tr ${dataAttr} class="${isNew ? 'm8-row-new' : ''}">
      <th scope="row"><span class="m8-cursor" aria-hidden="true">▶</span>${head}</th>
      ${col(noteOn, c?.n, '---', this.isNew(c))}
      ${col(noteOn && c.v != null && c.n !== 'OFF', c?.v, '--')}
      ${col(noteOn && c.i != null && c.n !== 'OFF', c?.i, '--')}
      ${fx}
      <td class="m8-newcol">${isNew ? newTag() : ''}</td></tr>`;
  }
  shown(c) { return !!c && ((c.n && this.model.on(c)) || (c.fx ?? []).some(this.model.on)); }
  usesOf(id) {
    const chains = new Set(this.model.songRows.flatMap((r) => Object.values(r.chains)));
    return [...chains].flatMap((cid) => (this.model.spec.chains[cid] ?? []).filter(this.model.on)).filter((c) => c.ph === id).length;
  }
  setup() {
    if (this._built) return; this._built = true;
    this.ids = this.getAttribute('phrase').split(',').map((x) => x.trim());
    const phs = this.ids.map((id) => this.model.spec.phrases[id] ?? { rows: {} });
    const head = (first) => `<thead><tr><th>${first}</th><th>N</th><th>V</th><th>I</th><th>FX1</th><th>FX2</th><th>FX3</th><th></th></tr></thead>`;
    if (this.ids.length > 1) {
      // Combined view: one line per phrase, each phrase's row 0. For phrases that are a
      // single row, which is most of them in a slow song.
      const rows = this.ids.map((id, i) => this.cells(phs[i].rows['0'], id, `data-ph="${id}"`)).join('');
      this.innerHTML = `<figure class="m8-screen">
        <figcaption><span class="m8-title">PHRASES ${this.ids[0]}–${this.ids[this.ids.length - 1]}</span>
          <span class="m8-note">row 0 of each; rows 1–F stay empty</span></figcaption>
        <table class="m8-grid">${head('PH')}<tbody>${rows}</tbody></table></figure>`;
      return;
    }
    const id = this.ids[0], ph = phs[0];
    const uses = this.usesOf(id);
    const compact = this.hasAttribute('compact');
    const last = Math.max(0, ...Object.keys(ph.rows).map(Number).filter((r) => this.shown(ph.rows[String(r)])));
    const shownRows = compact ? last + 1 : 16;
    const rows = [];
    for (let r = 0; r < shownRows; r++) {
      const c = ph.rows[String(r)];
      rows.push(this.cells(this.shown(c) ? c : null, hx1(r), `data-row="${r}"`));
    }
    const rest = compact && shownRows < 16 ? `<p class="m8-note">rows ${hx1(shownRows)}–F empty</p>` : '';
    this.innerHTML = `<figure class="m8-screen">
      <figcaption><span class="m8-title">PHRASE ${id}${uses > 1 ? '*' : ''}</span>
        ${uses > 1 ? `<span class="m8-note">* used ${uses} times in the song</span>` : ''}</figcaption>
      <table class="m8-grid">${head('')}<tbody>${rows.join('')}</tbody></table>
      ${rest}${ph.about ? `<p class="m8-note">${ph.about}</p>` : ''}
    </figure>`;
  }
  // Which phrase and row is the M8 on? Returns { ph, row } or null.
  playing(s) {
    if (s.pos == null || !s.playing) return null;
    for (const tr of this.model.tracks) {
      const at = locate(tr, s.pos);
      if (at.ph && this.ids.includes(at.ph)) return { ph: at.ph, row: at.row };
    }
    return null;
  }
  frame(s) {
    const at = this.playing(s);
    const key = at ? `${at.ph}:${at.row}` : '';
    if (key === this._key) return;
    this._key = key;
    if (this.ids.length > 1) {
      this.querySelectorAll('tr[data-ph]').forEach((tr) => tr.classList.toggle('m8-current', !!at && tr.dataset.ph === at.ph));
    } else {
      this.querySelectorAll('tr[data-row]').forEach((tr) => tr.classList.toggle('m8-current', !!at && Number(tr.dataset.row) === at.row));
    }
  }
}

// "new: rows 1–7" for a list of row numbers.
function runsNote(rows, fmt = hx1) {
  const runs = [];
  for (const r of rows) {
    const last = runs[runs.length - 1];
    if (last && last[1] === r - 1) last[1] = r; else runs.push([r, r]);
  }
  return runs.length ? `<span class="m8-note">new: row${rows.length > 1 ? 's' : ''} ${runs.map(([a, b]) => a === b ? fmt(a) : `${fmt(a)}–${fmt(b)}`).join(', ')}</span>` : '';
}

class M8Chain extends Panel {
  setup() {
    if (this._built) return; this._built = true;
    const id = this.getAttribute('chain');
    const chain = (this.model.spec.chains[id] ?? []).filter(this.model.on);
    const compact = this.hasAttribute('compact');
    const shownRows = compact ? Math.min(16, chain.length + 1) : 16;
    const rows = [];
    let prevNew = false;
    const newRows = [];
    for (let r = 0; r < shownRows; r++) {
      const c = chain[r];
      const nu = !!c && this.isNew(c);
      if (nu) newRows.push(r);
      rows.push(`<tr data-row="${r}" class="${nu ? 'm8-row-new' : ''}">
        <th scope="row"><span class="m8-cursor" aria-hidden="true">▶</span>${hx1(r)}</th>
        <td class="${c ? (nu ? 'm8-is-new' : '') : 'm8-dim'}">${c ? c.ph : '--'}</td>
        <td class="${c?.tsp && c.tsp !== '00' ? (nu ? 'm8-is-new' : '') : 'm8-dim'}">${c ? (c.tsp ?? '00') : '00'}</td>
        <td class="m8-newcol">${nu && !prevNew ? newTag() : ''}</td></tr>`);
      prevNew = nu;
    }
    const rest = compact && shownRows < 16 ? `<p class="m8-note">rows ${hx1(shownRows)}–F empty: the chain ends at the first empty row</p>` : '';
    this.innerHTML = `<figure class="m8-screen"><figcaption><span class="m8-title">CHAIN ${id}</span>${runsNote(newRows)}</figcaption>
      <table class="m8-grid"><thead><tr><th></th><th>PH</th><th>TSP</th><th></th></tr></thead><tbody>${rows.join('')}</tbody></table>${rest}</figure>`;
  }
  frame(s) {
    const id = this.getAttribute('chain');
    let row = -1;
    if (s.playing && s.pos != null) {
      for (const tr of this.model.tracks) {
        const at = locate(tr, s.pos);
        if (at.seg.chainId === id) { row = at.chainRow; break; }
      }
    }
    if (row === this._row) return;
    this._row = row;
    this.querySelectorAll('tr[data-row]').forEach((t) => t.classList.toggle('m8-current', Number(t.dataset.row) === row));
  }
}

// The song view: one column per track, one row per song row, chain numbers in the cells.
// As on the M8, a chain with no notes in it is drawn dim.
class M8Song extends Panel {
  setup() {
    if (this._built) return; this._built = true;
    const { spec, songRows, on } = this.model;
    const hasNotes = (cid) => (spec.chains[cid] ?? []).filter(on).some((c) =>
      Object.values(spec.phrases[c.ph]?.rows ?? {}).some((cell) => cell.n && cell.n !== 'OFF' && on(cell)));
    const cols = [1, 2, 3, 4, 5, 6, 7, 8];
    const newRows = [];
    const rows = songRows.map((r, i) => {
      const nu = this.isNew(r);
      if (nu) newRows.push(hex(r.row));
      return `<tr data-i="${i}" class="${nu ? 'm8-row-new' : ''}">
        <th scope="row"><span class="m8-cursor" aria-hidden="true">▶</span>${r.row}</th>
        ${cols.map((n) => {
          const c = r.chains[String(n)];
          return `<td class="${!c || !hasNotes(c) ? 'm8-dim' : ''}">${c ?? '--'}</td>`;
        }).join('')}</tr>`;
    }).join('');
    const end = `<tr class="m8-end"><th scope="row">${hx2(hex(songRows[songRows.length - 1]?.row ?? '00') + 1)}</th>${cols.map(() => '<td class="m8-dim">--</td>').join('')}</tr>`;
    this.innerHTML = `<figure class="m8-screen"><figcaption><span class="m8-title">SONG</span>${runsNote(newRows, hx2)}</figcaption>
      <table class="m8-grid m8-song"><thead><tr><th></th>${cols.map((n) => `<th>${n}</th>`).join('')}</tr></thead>
      <tbody>${rows}${end}</tbody></table>
      <p class="m8-note">dim: a chain with no notes in it, or "--", the end of a track's list</p></figure>`;
  }
  frame(s) {
    let i = -1;
    if (s.playing && s.pos != null && this.model.tracks[0]) {
      const at = locate(this.model.tracks[0], s.pos);
      i = this.model.songRows.findIndex((r) => r.row === at.seg.songRow);
    }
    if (i === this._i) return;
    this._i = i;
    this.querySelectorAll('tr[data-i]').forEach((t) => t.classList.toggle('m8-current', Number(t.dataset.i) === i));
  }
}

// A table as the M8 draws it: N (transpose), V, three FX columns.
class M8Table extends Panel {
  setup() {
    if (this._built) return; this._built = true;
    this.id = this.getAttribute('table');
    const table = this.model.spec.tables?.[this.id];
    if (!table) { this.textContent = `No table ${this.id} in this spec.`; return; }
    const rows = [];
    for (let r = 0; r < 16; r++) {
      const c = table.rows[String(r)];
      const fx = [0, 1, 2].map((k) => {
        const f = c?.fx?.[k];
        return f ? `<td>${f.cmd} ${f.val}</td>` : '<td class="m8-dim">--- 00</td>';
      }).join('');
      rows.push(`<tr data-row="${r}"><th scope="row"><span class="m8-cursor" aria-hidden="true">▶</span>${hx1(r)}</th>
        <td class="${c?.n ? '' : 'm8-dim'}">${c?.n ?? '00'}</td><td class="${c?.v ? '' : 'm8-dim'}">${c?.v ?? '--'}</td>${fx}</tr>`);
    }
    this.innerHTML = `<figure class="m8-screen"><figcaption><span class="m8-title">TABLE ${this.id}</span>
      ${table.about ? `<span class="m8-note">${table.about}</span>` : ''}</figcaption>
      <table class="m8-grid"><thead><tr><th></th><th>N</th><th>V</th><th>FX1</th><th>FX2</th><th>FX3</th></tr></thead><tbody>${rows.join('')}</tbody></table></figure>`;
  }
  frame(s) {
    let row = -1;
    if (s.playing && s.pos != null) {
      for (const tr of this.model.tracks) {
        const p = s.pos % tr.len;
        let cur = null;
        for (const ev of tr.events) { if (ev.t > p) break; if (!ev.fxOnly) cur = ev; }
        if (cur?.table === this.id) { row = cur.tableRow; break; }
      }
    }
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
      // Six interval slots per bank; slots a bank doesn't use are off.
      const slots = (iv) => [...iv, ...Array(Math.max(0, 6 - iv.length)).fill(null)]
        .map((x) => x == null ? '<span class="m8-dim" title="slot off">off</span>' : x).join(' ');
      html += `<table class="m8-banks"><caption>Chord banks (CHORD): bank, then six interval slots</caption>
        <thead><tr><th>Bank</th><th>Intervals</th><th>Notes</th><th>Chord</th><th></th></tr></thead><tbody>
        ${banks.map((b) => `<tr class="${this.isNew(b) ? 'm8-row-new' : ''}"><td>${b.bank}</td><td class="m8-nowrap">${slots(b.iv)}</td><td>${b.shape}</td><td>${b.use}</td><td>${this.isNew(b) ? newTag() : ''}</td></tr>`).join('')}
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
          if (ev.off || ev.fxOnly) continue;
          const t0 = ev.t + k * tr.len;
          const t1 = Math.min(ev.end + k * tr.len, this.model.len);
          const chord = chordOf(this.model, ev);
          chord.forEach((n, i) => this.notes.push({ n, t0, t1, track: tr.n, top: i === chord.length - 1, inst: this.model.insts[ev.inst]?.type }));
        }
      }
    }
    const ns = this.notes.map((x) => x.n);
    this.lo = Math.min(...ns) - 2; this.hi = Math.max(...ns) + 2;
    this.resized = () => { this._p = undefined; this.draw(this._lastP ?? null); };
    if (!this.querySelector('.m8-readout')) {
      this.innerHTML = `<p class="m8-legend">${this.tracks.map((t) => {
        const kind = this.notes.find((x) => x.track === t.n)?.inst === 'HYPERSYNTH' ? 'outlined, hatched blocks; the top voice is the thick line' : 'solid blocks';
        return `<span>T${t.n} ${t.name}: ${kind}<span class="book-only">.</span></span>`;
      }).join('')}</p><p class="m8-readout" aria-live="off"></p>`;
    }
    this.draw(null);
  }
  frame(s) {
    const p = s.pos == null ? null : s.pos % this.model.len;
    if (p === this._p) return;
    this._p = p;
    this._lastP = s.playing ? p : null;
    this.draw(this._lastP);
  }
  draw(p) {
    const lane = 26, left = 36, rowH = Math.max(4, Math.min(9, 280 / (this.hi - this.lo)));
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
    const harmony = this.model.harmony;
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
      const x0 = x(nt.t0) + 1, x1 = Math.max(x0 + 2, x(nt.t1) - 1), yy = y(nt.n) - rowH / 2 + 1, hh = rowH - 2;
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
        const bar = Math.floor(p / 16) % this.model.loopBars + 1;
        const hm = harmony.filter((h0) => h0.bar <= bar).pop();
        ro.textContent = `Bar ${Math.floor(p / 16) + 1}${hm ? ' · ' + hm.chord : ''} · sounding: ${byTrack.join(' | ') || 'nothing'}`;
      }
    }
  }
}

// ---------------------------------------------------------------- progression

class M8Progression extends Panel {
  setup() {
    if (this._built) return; this._built = true;
    const hs = this.model.harmony;
    this.innerHTML = `<ol class="m8-prog ${this.hasAttribute('list') ? 'm8-prog-list' : ''}">${hs.map((h, i) => `
      <li data-i="${i}">
        <span class="m8-roman">${h.roman}</span>
        <span class="m8-chord">${h.chord}<span class="book-only">:</span></span>
        <span class="m8-sub">bar${h.hold ? 's' : ''} ${h.bar}${h.hold ? '–' + (h.bar + h.hold - 1) : ''} · root ${h.bass} · pad ${h.upper}</span>
        <span class="m8-move">→ ${h.move}</span>
        <span class="m8-state"></span>
      </li>`).join('')}</ol>`;
  }
  frame(s) {
    const hs = this.model.harmony;
    let cur = -1;
    if (s.playing && s.pos != null) {
      const bar = Math.floor((s.pos % this.model.len) / 16) % this.model.loopBars + 1;
      hs.forEach((h, i) => { if (bar >= h.bar) cur = i; });
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
    this.kind = this.mod.type.startsWith('ADSR') ? 'adsr' : this.mod.type === 'TRIG ENV' ? 'trig' : 'ahd';
    const tempo = this.model.spec.tempo;
    const tk = ticks(tempo);
    const barSec = 240 / tempo;
    if (this.kind === 'adsr') this.env = new Env(this.mod, tempo);
    else this.ahd = ahdOf(this.mod, tempo);
    if (this.kind === 'trig') {
      // Where the source hits in one bar: its notes on the first bar of the song.
      const src = hex(this.mod.p.SRC ?? '80');
      const tr = src >= 0x80 ? this.model.tracks.find((t) => t.n === src - 0x7f) : this.model.tracks.find((t) => t.events.some((e) => e.inst === this.mod.p.SRC));
      this.srcName = src >= 0x80 ? `track ${src - 0x7f}` : `instrument ${this.mod.p.SRC}`;
      const first = tr?.events.find((e) => !e.fxOnly && !e.off);
      const bar0 = first ? Math.floor(first.t / 16) * 16 : 0;
      this.hits = (tr?.events ?? []).filter((e) => !e.change && !e.off && !e.fxOnly && (src >= 0x80 || e.inst === this.mod.p.SRC) && e.t >= bar0 && e.t < bar0 + 16).map((e) => e.t - bar0);
      this.srcTrack = tr;
    }
    this.resized = () => this.draw(this._live ?? null);
    if (!this.querySelector('.m8-readout')) {
      const p = this.mod.p, sec = this.mod.sec ?? {};
      const bars = (s) => s / barSec;
      const nice = (b) => (b === 1 ? 'one bar' : b === 2 ? 'two bars' : `${b.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')} bars`);
      let items = '';
      if (this.kind === 'adsr') {
        const found = (k) => p[k] && /^[0-9A-F]{2}$/.test(p[k]);
        const time = (k) => sec[k] != null && found(k)
          ? `<li><b>${k} ${p[k]}</b> = <b>${sec[k].toFixed(3)} s</b> on the help line, ${nice(Math.round(bars(sec[k]) * 100) / 100)} at ${tempo} BPM. ADSR times are seconds, not ticks.</li>`
          : sec[k] != null
          ? `<li><b>${k}</b>: raise it until the help line at the bottom of the screen reads <b>${sec[k].toFixed(2)} s</b>, ${nice(Math.round(bars(sec[k]) * 100) / 100)} at ${tempo} BPM. ADSR times are seconds, not ticks.</li>`
          : p[k] == null ? '' : `<li><b>${k} ${p[k]}</b> ${hex(p[k]) ? `= about ${(hex(p[k]) * tk).toFixed(2)} s read as ticks (check the help line)` : '= none'}</li>`;
        items = `${time('ATK')}${p.DEC != null ? (sec.DEC != null ? time('DEC') : `<li><b>DEC ${p.DEC}</b> ${hex(p.DEC) ? '' : '= no decay: straight to the sustain level'}</li>`) : ''}${p.SUS != null ? `<li><b>SUS ${p.SUS}</b> = hold at ${Math.round(hex(p.SUS) / 2.55)}% while the note is held</li>` : ''}${time('REL')}`;
      } else {
        const t = (k) => p[k] == null ? '' : `<li><b>${k} ${p[k]}</b> = ${hex(p[k])} ticks${hex(p[k]) ? ` = ${(hex(p[k]) / 6).toFixed(2).replace(/\.00$/, '')} row${hex(p[k]) === 6 ? '' : 's'}, ${(hex(p[k]) * tk).toFixed(2)} s` : ''}</li>`;
        items = `${t('ATK')}${t('HOLD')}${t('DEC')}${this.kind === 'trig' ? `<li><b>SRC ${p.SRC}</b> = fires on every note of ${this.srcName}</li><li><b>AMT</b>: negative, so it pulls the level down<span class="app-only"> (the demo dips it to ${Math.round((1 + this.ahd.amt) * 100)}%)</span></li>` : ''}`;
      }
      this.insertAdjacentHTML('beforeend', `<ul class="m8-facts">${items}</ul><p class="m8-readout" aria-live="off"></p>`);
    }
    this.draw(null);
  }
  frame(s) {
    if (!this.mod) return;
    const v = s.engine && [...s.engine.voices.values()].find((x) => x.inst.id === this.getAttribute('inst'));
    this._live = v && s.playing ? { v, env: v.env, t: s.t, pos: s.pos } : null;
    this.draw(this._live);
  }
  draw(live) {
    if (this.kind === 'trig') return this.drawTrig(live);
    const { g, w, h } = canvasFor(this, 176);
    const ink = css(this, '--m8-ink'), mid = css(this, '--m8-mid');
    const barSec = 240 / this.model.spec.tempo;
    let pts, total, off, labels, gated;
    if (this.kind === 'adsr') {
      const e = this.env;
      const holdShown = Math.max(e.atk * 0.6, 0.8);
      total = e.atk + e.dec + holdShown + e.rel;
      off = e.atk + e.dec + holdShown;
      pts = [[0, 0], [e.atk, e.amt], [e.atk + e.dec, e.amt * e.sus], [off, e.amt * e.sus], [total, 0]];
      labels = [['ATK', e.atk / 2], ['SUS', e.atk + e.dec + holdShown / 2], ['REL', off + e.rel / 2]];
      gated = true;
    } else {
      const e = this.ahd;
      total = Math.max(e.a + e.h + e.d, 0.05) * 1.15;
      pts = [[0, 0], [e.a, 1], [e.a + e.h, 1], [e.a + e.h + e.d, 0], [total, 0]];
      labels = [['ATK', e.a / 2], ['HOLD', e.a + e.h / 2], ['DEC', e.a + e.h + e.d / 2]];
      gated = false;
    }
    const L = 8, R = w - 8, T = 8, B = h - 64;
    const x = (t) => L + (t / total) * (R - L);
    const y = (lv) => B - lv * (B - T);
    g.clearRect(0, 0, w, h);
    g.strokeStyle = ink; g.lineWidth = 2.5; g.beginPath();
    pts.forEach(([t, lv], i) => (i ? g.lineTo(x(t), y(lv)) : g.moveTo(x(t), y(lv))));
    g.stroke();
    g.fillStyle = mid; g.fillRect(L, B, R - L, 1);
    // a tick per bar (ADSR) or per beat (AHD) along the time axis
    const unit = this.kind === 'adsr' ? barSec : barSec / 4;
    for (let t = 0; t <= total + 1e-6; t += unit) { g.fillStyle = mid; g.fillRect(x(t) - 0.5, B, 1.5, 6); }
    g.font = '12px system-ui, sans-serif'; g.textBaseline = 'top';
    let lastX = -99;
    for (const [k, t] of labels) {
      const lx = Math.max(x(t) - 11, lastX + 34);
      g.fillStyle = mid; g.fillText(k, lx, B + 9); lastX = lx;
    }
    if (gated) {
      g.fillStyle = mid; g.fillRect(x(0), B + 30, x(off) - x(0), 6);
      g.fillText('note held', x(0), B + 40);
      g.fillStyle = ink; g.fillRect(x(off) - 1, B + 24, 2, 18);
      g.fillText('OFF', x(off) + 5, B + 40);
    }
    g.fillStyle = mid; g.textAlign = 'right';
    g.fillText(this.kind === 'adsr' ? 'a tick per bar' : 'a tick per beat', R, B + (gated ? 40 : 28));
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    const ro = this.querySelector('.m8-readout');
    if (this.kind === 'adsr' && live?.env) {
      const e = this.env, holdShown = Math.max(e.atk * 0.6, 0.8);
      const lv = live.env.level(live.t);
      const st = live.env.stage(live.t);
      let tt;
      if (st === 'attack') tt = (live.t - live.env.trig) + e.atk * (live.env.from / e.amt);
      else if (st === 'decay' || st === 'sustain') tt = Math.min(e.atk + e.dec + holdShown * 0.5, (live.t - live.env.trig) + e.atk * (live.env.from / e.amt));
      else if (st === 'release') tt = off + (live.t - live.env.off);
      else tt = total;
      g.fillStyle = ink; g.beginPath(); g.arc(x(Math.min(tt, total)), y(lv), 6, 0, Math.PI * 2); g.fill();
      if (ro) ro.textContent = `Now: ${st}, level ${Math.round(lv * 100)}%`;
    } else if (ro) ro.textContent = this.kind === 'adsr' ? 'Press Play: a dot rides this shape. Press Stop to send an OFF and watch the release.' : 'The shape each note makes, in ticks.';
  }
  // The duck: the destination's level over one bar, dipping at each hit of the source.
  drawTrig(live) {
    const { g, w, h } = canvasFor(this, 168);
    const ink = css(this, '--m8-ink'), mid = css(this, '--m8-mid'), faint = css(this, '--m8-faint');
    const e = this.ahd, stepSec = 60 / this.model.spec.tempo / 4;
    const L = 30, R = w - 8, T = 10, B = h - 52;
    const x = (st) => L + (st / 16) * (R - L);
    const y = (lv) => B - lv * (B - T);
    const levelAt = (st) => {
      let lv = 1;
      for (const hit of this.hits) for (const k of [0, 16]) lv = Math.min(lv, 1 + e.amt * ahdAt(e, (st + k - hit) * stepSec));
      return lv;
    };
    g.clearRect(0, 0, w, h);
    g.font = '12px system-ui, sans-serif';
    g.fillStyle = faint; g.fillRect(L, y(1), R - L, 1);
    g.fillStyle = mid; g.fillText('100%', 0, y(1) + 4); g.fillText('0', 18, B + 4);
    g.fillRect(L, B, R - L, 1);
    for (let b = 0; b < 4; b++) { g.fillRect(x(b * 4) - 0.5, B, 1.5, 6); g.fillText(String(b + 1), x(b * 4) + 3, B + 18); }
    g.strokeStyle = ink; g.lineWidth = 2.5; g.beginPath();
    for (let i = 0; i <= 320; i++) { const st = i / 20; const xx = x(st), yy = y(levelAt(st)); i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
    g.stroke();
    // the hits: a solid triangle on the baseline, labeled
    for (const hit of this.hits) {
      const xx = x(hit);
      g.fillStyle = ink; g.beginPath(); g.moveTo(xx, B + 22); g.lineTo(xx - 6, B + 34); g.lineTo(xx + 6, B + 34); g.closePath(); g.fill();
    }
    g.fillStyle = mid; g.fillText(`▲ = a note on ${this.srcName}`, L, h - 4);
    g.textAlign = 'right'; g.fillText('one bar, beats 1–4', R, h - 4); g.textAlign = 'left';
    const ro = this.querySelector('.m8-readout');
    if (live) {
      const st = live.pos % 16;
      const lv = live.v.duckAt(live.t);
      g.fillStyle = ink; g.beginPath(); g.arc(x(st), y(levelAt(st)), 6, 0, Math.PI * 2); g.fill();
      if (ro) ro.textContent = `Now: row ${hx1(Math.floor(st))}, the pad at ${Math.round(lv * 100)}% of its level`;
    } else if (ro) ro.textContent = 'Press Play: a dot rides the dip as the bar goes by.';
  }
}

// ---------------------------------------------------------------- filter

class M8Filter extends Panel {
  setup() {
    this.inst = this.model.insts[this.getAttribute('inst')];
    if (!this.inst) { this.textContent = 'This instrument arrives in a later step.'; return; }
    this.lfo = this.inst.mods.find((m) => m.type === 'LFO' && m.dest === 'CUTOFF');
    this.resized = () => this.draw(this._live ?? null);
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
    this._live = v && s.playing ? { v, t: s.t, an: s.engine.trackOut.get(v.track).analyser, sr: s.engine.ctx.sampleRate } : null;
    this.draw(this._live);
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
customElements.define('m8-song', M8Song);
customElements.define('m8-phrase', M8Phrase);
customElements.define('m8-chain', M8Chain);
customElements.define('m8-table', M8Table);
customElements.define('m8-instrument', M8Instrument);
customElements.define('m8-roll', M8Roll);
customElements.define('m8-progression', M8Progression);
customElements.define('m8-envelope', M8Envelope);
customElements.define('m8-filter', M8Filter);

// Book mode (tools/render_pages.cjs adds html.book before its snapshot): app-only parts are
// removed outright, not just hidden, so no hidden panel is left for the snapshot to picture.
new MutationObserver(() => {
  if (document.documentElement.classList.contains('book')) document.querySelectorAll('.app-only').forEach((e) => e.remove());
}).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
