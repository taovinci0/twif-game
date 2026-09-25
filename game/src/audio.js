// TWIF: Subnet One — all audio, synthesised at runtime.
//
// Nothing here is a file. No .mp3, no .wav, no base64, no network, no library:
// oscillators, one noise buffer generated in JS, biquads, envelopes and a short
// impulse response built from decaying noise. The build budget is 10 MB and
// recorded audio would have been the largest thing in it, so the payload cost of
// this entire soundtrack is the bytes of this source file.
//
// Two rules the rest of the code depends on.
//
// 1. NOTHING IN HERE THROWS. A browser refuses an AudioContext until a real user
//    gesture, and a console error fails the jam gate, so every public method is
//    wrapped and every one of them is safe to call before unlock(). Called early
//    they do nothing at all — they never warn, never queue, never retry.
// 2. NODES DIE. Every transient voice stops itself and disconnects its whole
//    chain from the ended handler, and a voice counter refuses new sounds past a
//    ceiling. A ten minute session must not accumulate graph.
//
// The music is a scheduler, not a loop. There is no sample, no buffer boundary
// and therefore no seam to hear: a sparse modal koto figure over a low drone,
// with a colder detuned layer that fades up for the corporate/combat state. It
// is deliberately thin. A judge has this in their ears for ten minutes and a
// busy bed is worse than no bed.

const A4 = 440;
const mtof = (m) => A4 * Math.pow(2, (m - 69) / 12);

// D hirajoshi — D E F A Bb. The one scale choice that makes a handful of
// detuned oscillators read as "samurai" without a single sampled instrument.
const SCALE_LOW  = [50, 52, 53, 57, 58];
const SCALE_MID  = [62, 64, 65, 69, 70];
const SCALE_HIGH = [74, 76, 77, 81, 82];

// Per-state mix and behaviour. Gains are conservative on purpose; the master
// sits at 0.7 and the drone at 0.30 of that is a presence, not a texture.
const STATES = {
  off:     { drone: 0.00, air: 0.00, cold: 0.00, bpm: 72,  density: 0.00, mode: 'calm' },
  hub:     { drone: 0.30, air: 0.16, cold: 0.04, bpm: 58,  density: 0.28, mode: 'calm' },
  explore: { drone: 0.25, air: 0.22, cold: 0.06, bpm: 70,  density: 0.34, mode: 'calm' },
  combat:  { drone: 0.20, air: 0.09, cold: 0.26, bpm: 96,  density: 0.42, mode: 'combat' },
  drive:   { drone: 0.17, air: 0.07, cold: 0.16, bpm: 104, density: 0.30, mode: 'drive' },
};

export class Audio {
  constructor() {
    this.ctx = null;
    this.ready = false;          // true only once a context is actually running
    this.muted = false;
    this.volume = 0.7;           // honoured whether or not a context exists yet
    this.state = 'off';
    this.suspended = false;

    this._voices = 0;
    // Hard ceiling on simultaneous transient voices. Measured, not guessed: real
    // play peaks around twenty (a swing is six voices, a koto pluck three and it
    // rings for 1.5 s), and the probe shows the live node count flat at this
    // ceiling even when driven ten times harder than the game can drive it.
    this._voiceCap = 34;
    this._nextStep = 0;          // scheduler cursor, in ctx time
    this._step = 0;
    this._stride = 0;            // metres walked since the last footstep
    this._duck = 1;              // music ducking for nodeActivate()
    this._engine = null;
    this._timer = null;
    this._lastSword = -1;

    // Hidden tab goes silent. Suspending the context also parks the scheduler,
    // which is the difference between a backgrounded tab costing nothing and a
    // backgrounded tab costing a core.
    this._onVis = () => this._safe(() => {
      if (!this.ctx) return;
      if (document.hidden) {
        this.suspended = true;
        this._rampMaster(0, 0.08);
        if (this.ctx.state === 'running') this.ctx.suspend();
      } else {
        this.suspended = false;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this._rampMaster(this.muted ? 0 : this.volume, 0.25);
        // the cursor is stale after a suspend; re-seat it on the new clock
        this._nextStep = this.ctx.currentTime + 0.1;
      }
    });
    try {
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this._onVis);
      }
    } catch (e) { /* no document: nothing to listen to */ }
  }

  // ---------------------------------------------------------------- plumbing

  /** Every public method runs inside this. Audio never takes the game down. */
  _safe(fn) {
    try { return fn(); } catch (e) { return undefined; }
  }

  /** True when there is a live, audible context. The guard on every sound. */
  get _on() {
    return this.ready && !this.muted && !this.suspended && this.volume > 0.0005
      && this.ctx && this.ctx.state === 'running' && this._voices < this._voiceCap;
  }

  /**
   * Build the graph and start the clock. MUST be called from inside a real
   * pointer/click handler — see the integration notes. Safe to call repeatedly;
   * later calls only nudge a suspended context back to running.
   */
  unlock() {
    return this._safe(() => {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.ready = this.ctx.state !== 'closed';
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;                       // no Web Audio: the game is silent, and fine
      const ctx = this.ctx = new AC();

      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      // One limiter across the whole mix. Four enforcers, an engine and a bell
      // can land on the same millisecond and without this that clips.
      const lim = ctx.createDynamicsCompressor();
      lim.threshold.value = -9; lim.knee.value = 6; lim.ratio.value = 4;
      lim.attack.value = 0.003; lim.release.value = 0.22;
      this.master.connect(lim); lim.connect(ctx.destination);

      this.dry = ctx.createGain(); this.dry.gain.value = 0.9;
      this.dry.connect(this.master);

      // The street is wet stone between tall buildings. A 1.5 s impulse built
      // from decaying noise with two early reflections is most of what sells it,
      // and it is one node for the entire game.
      this.wet = ctx.createGain(); this.wet.gain.value = 0.30;
      this.conv = ctx.createConvolver();
      this.conv.buffer = this._ir(1.5, 3.1);
      this.conv.connect(this.wet); this.wet.connect(this.master);

      this.bus = ctx.createGain();                     // sfx
      this.bus.connect(this.dry); this.bus.connect(this.conv);

      this.musicBus = ctx.createGain(); this.musicBus.gain.value = 1;
      this.musicBus.connect(this.dry); this.musicBus.connect(this.conv);

      this.noise = this._noiseBuffer(2.0);
      this._beds();

      this.ready = true;
      this._nextStep = ctx.currentTime + 0.12;

      // The scheduler runs off a timer as well as off update(), so the bed keeps
      // time on the title screen and through a stalled frame. Both paths are
      // driven by ctx.currentTime, so neither can double-schedule a note.
      this._timer = setInterval(() => this._safe(() => this._schedule()), 120);

      if (this.state !== 'off') this.music(this.state, 0.6);
    });
  }

  _noiseBuffer(sec) {
    const ctx = this.ctx, n = Math.max(1, Math.floor(ctx.sampleRate * sec));
    const b = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  _ir(sec, decay) {
    const ctx = this.ctx, n = Math.max(1, Math.floor(ctx.sampleRate * sec));
    const b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < n; i++) {
        const t = i / n;
        let v = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
        // two discrete early reflections: the far wall across the street
        if (i > 1500 + c * 90 && i < 1560 + c * 90) v += (Math.random() * 2 - 1) * 0.5;
        if (i > 4100 + c * 150 && i < 4180 + c * 150) v += (Math.random() * 2 - 1) * 0.3;
        d[i] = v * 0.8;
      }
    }
    return b;
  }

  /**
   * Register a transient voice. `src` is the thing that ends; `chain` is every
   * node created for it. When the source ends the whole chain is disconnected,
   * which is what keeps the graph from growing over a ten minute session.
   */
  _track(src, chain) {
    this._voices++;
    src.onended = () => {
      this._voices = Math.max(0, this._voices - 1);
      for (let i = 0; i < chain.length; i++) { try { chain[i].disconnect(); } catch (e) {} }
      try { src.disconnect(); } catch (e) {}
      src.onended = null;
    };
  }

  /** Percussive envelope: near-instant attack, exponential tail. */
  _env(t, peak, atk, dec) {
    const g = this.ctx.createGain();
    const p = Math.max(0.0002, peak);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(p, t + Math.max(0.001, atk));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.002, atk + dec));
    g.gain.setValueAtTime(0, t + atk + dec + 0.01);
    return g;
  }

  /** One filtered noise hit. Returns nothing; it wires and schedules itself. */
  _noiseHit(t, dur, peak, type, freq, q, out, sweepTo) {
    if (!this._on) return;
    const ctx = this.ctx;
    const s = ctx.createBufferSource();
    s.buffer = this.noise; s.loop = true;
    s.playbackRate.value = 0.75 + Math.random() * 0.5;
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = this._env(t, peak, 0.002, dur);
    s.connect(f); f.connect(g); g.connect(out || this.bus);
    s.start(t); s.stop(t + dur + 0.03);
    this._track(s, [f, g]);
  }

  /** One pitched voice with a glide and an envelope. */
  _tone(t, type, f0, f1, dur, peak, out, atk) {
    if (!this._on) return null;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(8, f1), t + dur);
    const g = this._env(t, peak, atk === undefined ? 0.003 : atk, dur);
    o.connect(g); g.connect(out || this.bus);
    o.start(t); o.stop(t + dur + 0.05);
    this._track(o, [g]);
    return o;
  }

  // ---------------------------------------------------------------- beds
  // Four permanently running voices, about twenty nodes in total, created once.
  // Their gains are all that ever changes, which is what makes a state change a
  // crossfade rather than a start and a stop.

  _beds() {
    const ctx = this.ctx, t = ctx.currentTime;

    // --- drone: D1 weight, D2/A2 body, opened and closed by a very slow LFO
    this.gDrone = ctx.createGain(); this.gDrone.gain.value = 0;
    this.gDrone.connect(this.musicBus);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 230; lp.Q.value = 0.8;
    lp.connect(this.gDrone);
    for (const [midi, type, gain, cents] of [
      [38, 'sine', 0.55, 0], [50, 'sawtooth', 0.22, -7],
      [50, 'sawtooth', 0.20, 6], [57, 'sawtooth', 0.12, 3],
    ]) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = mtof(midi) * Math.pow(2, cents / 1200);
      const g = ctx.createGain(); g.gain.value = gain;
      o.connect(g); g.connect(lp); o.start(t);
    }
    const dl = ctx.createOscillator(); dl.frequency.value = 0.045;
    const dg = ctx.createGain(); dg.gain.value = 70;
    dl.connect(dg); dg.connect(lp.frequency); dl.start(t);

    // --- air: the city at night. Filtered noise, drifting, almost subliminal.
    this.gAir = ctx.createGain(); this.gAir.gain.value = 0;
    this.gAir.connect(this.musicBus);
    const air = ctx.createBufferSource();
    air.buffer = this._noiseBuffer(4.0); air.loop = true;
    const af = ctx.createBiquadFilter();
    af.type = 'bandpass'; af.frequency.value = 520; af.Q.value = 0.55;
    air.connect(af); af.connect(this.gAir); air.start(t);
    const al = ctx.createOscillator(); al.frequency.value = 0.06;
    const ag = ctx.createGain(); ag.gain.value = 190;
    al.connect(ag); ag.connect(af.frequency); al.start(t);

    // --- cold: the corporate layer. Detuned squares, a fifth apart, high-passed
    // so it sits above the drone instead of fighting it, with a slow tremolo
    // that reads as machinery rather than as music.
    this.gCold = ctx.createGain(); this.gCold.gain.value = 0;
    this.gCold.connect(this.musicBus);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 380;
    const trem = ctx.createGain(); trem.gain.value = 0.7;
    hp.connect(trem); trem.connect(this.gCold);
    for (const [midi, cents, gain] of [[62, -9, 0.16], [62, 11, 0.14], [69, 4, 0.09], [74, -5, 0.05]]) {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = mtof(midi) * Math.pow(2, cents / 1200);
      const g = ctx.createGain(); g.gain.value = gain;
      o.connect(g); g.connect(hp); o.start(t);
    }
    const tl = ctx.createOscillator(); tl.frequency.value = 4.6;
    const tg = ctx.createGain(); tg.gain.value = 0.22;
    tl.connect(tg); tg.connect(trem.gain); tl.start(t);
  }

  // ---------------------------------------------------------------- music

  /** 'hub' | 'explore' | 'combat' | 'drive' | 'off', crossfaded. */
  music(state, fade) {
    return this._safe(() => {
      if (!STATES[state]) return;
      this.state = state;
      if (!this.ready || !this.ctx) return;         // remembered; applied at unlock
      const s = STATES[state], t = this.ctx.currentTime, f = fade === undefined ? 1.6 : fade;
      const to = (node, v) => {
        if (!node) return;
        node.gain.cancelScheduledValues(t);
        node.gain.setValueAtTime(node.gain.value, t);
        node.gain.linearRampToValueAtTime(v, t + f);
      };
      to(this.gDrone, s.drone);
      to(this.gAir, s.air);
      to(this.gCold, s.cold);
    });
  }

  /**
   * The note scheduler. Called from update() and from a timer; both compare
   * against ctx.currentTime so a note is never scheduled twice. Lookahead is
   * 0.35 s, which survives a dropped frame without being audibly late.
   */
  _schedule() {
    if (!this.ready || this.muted || this.suspended) return;
    if (!this.ctx || this.ctx.state !== 'running') return;
    const s = STATES[this.state];
    if (!s || s.density <= 0) return;
    const now = this.ctx.currentTime;
    if (this._nextStep < now) this._nextStep = now + 0.05;   // re-seat after a stall
    const spb = 60 / s.bpm / 2;                              // one eighth
    let budget = 16;                                         // never run away
    while (this._nextStep < now + 0.35 && budget-- > 0) {
      this._note(this._nextStep, this._step, s);
      this._step = (this._step + 1) % 64;
      this._nextStep += spb;
    }
  }

  _note(t, step, s) {
    if (!this._on) return;
    const bar = Math.floor(step / 8) % 8;
    const beat = step % 8;

    if (s.mode === 'combat') {
      // A low pulse on the beat and a cold cluster off it. Nothing melodic —
      // the melody stopping IS the combat cue.
      if (beat % 2 === 0) {
        this._tone(t, 'sine', mtof(38), mtof(36), 0.16, 0.10, this.musicBus);
      }
      if (beat === 3 || beat === 7) {
        const m = SCALE_LOW[(step + bar) % SCALE_LOW.length];
        this._tone(t, 'sawtooth', mtof(m + 12) * 0.997, null, 0.13, 0.045, this.musicBus, 0.004);
        this._tone(t, 'sawtooth', mtof(m + 12) * 1.004, null, 0.11, 0.035, this.musicBus, 0.004);
      }
      // a taiko-ish floor hit at the top of the bar
      if (beat === 0 && bar % 2 === 0) {
        this._tone(t, 'sine', 84, 44, 0.24, 0.13, this.musicBus);
        this._noiseHit(t, 0.07, 0.05, 'bandpass', 260, 1.1, this.musicBus);
      }
      return;
    }

    if (s.mode === 'drive') {
      // Driving wants motion and no tune to argue with the engine.
      const m = (beat < 4 ? SCALE_LOW[0] : SCALE_LOW[2]);
      if (beat % 2 === 0) this._tone(t, 'triangle', mtof(m), null, 0.14, 0.09, this.musicBus, 0.005);
      this._noiseHit(t, 0.018, beat % 2 ? 0.020 : 0.030, 'highpass', 6500, 0, this.musicBus);
      if (beat === 0 && bar % 4 === 0) this._pluck(t, SCALE_MID[2], 0.10);
      return;
    }

    // calm: a koto figure that never quite repeats. Sparse by construction —
    // one note every second or two, a low answer now and then, an octave
    // echo occasionally. Ten minutes of this should not register as a loop.
    if (beat % 2 !== 0) return;
    if (Math.random() > s.density) return;
    const high = Math.random() < 0.25;
    const pool = high ? SCALE_HIGH : SCALE_MID;
    const m = pool[Math.floor(Math.random() * pool.length)];
    this._pluck(t, m, high ? 0.055 : 0.085);
    if (Math.random() < 0.18) this._pluck(t + 0.34, m - 12, 0.035);   // room answer
    if (beat === 0 && bar % 4 === 0 && Math.random() < 0.5) {
      this._tone(t, 'triangle', mtof(SCALE_LOW[0]), null, 0.9, 0.05, this.musicBus, 0.02);
    }
  }

  /**
   * A plucked string. Triangle body plus a quiet octave, a lowpass that closes
   * as it decays, and a 12 ms noise "nail" at the attack — that click is what
   * stops it sounding like a sine with a fade.
   */
  _pluck(t, midi, peak) {
    if (!this._on) return;
    const ctx = this.ctx, f = mtof(midi);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2600, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + 1.1);
    const g = this._env(t, peak, 0.006, 1.5);
    lp.connect(g); g.connect(this.musicBus);

    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2.01;
    const g2 = ctx.createGain(); g2.gain.value = 0.28;
    o.connect(lp); o2.connect(g2); g2.connect(lp);
    o.start(t); o.stop(t + 1.7); o2.start(t); o2.stop(t + 0.55);
    this._track(o, [lp, g, g2]);
    this._track(o2, []);
    this._noiseHit(t, 0.012, peak * 0.5, 'bandpass', 2800, 2.5, this.musicBus);
  }

  // ---------------------------------------------------------------- sfx

  /** Swing whoosh. hit=true adds the impact on the same frame. */
  sword(hit) {
    return this._safe(() => {
      if (!this._on) return;
      const t = this.ctx.currentTime;
      // The swing and its impact arrive from two different call sites about 130 ms
      // apart (attackTime 0.42, hit window at 0.7 of it), so the whoosh is
      // suppressed if one just went out and sword(true) then only adds the
      // impact. 0.25 s cannot eat a real second swing: attackTime plus
      // attackCooldown is 0.58 s.
      if (t - this._lastSword > 0.25) {
        this._lastSword = t;
        // air: a bandpass sweeping up then dying — the blade passing the ear
        this._noiseHit(t, 0.20, 0.13, 'bandpass', 700, 1.4, this.bus, 2600);
        // steel: a faint high ring so it is a sword and not a stick
        this._tone(t + 0.01, 'triangle', 2400, 1700, 0.13, 0.020, this.bus, 0.004);
      }
      if (!hit) return;
      const h = t + 0.005;
      this._tone(h, 'sine', 190, 55, 0.13, 0.42, this.bus);            // body
      this._noiseHit(h, 0.10, 0.26, 'bandpass', 1500, 1.2, this.bus);  // cut
      this._noiseHit(h, 0.06, 0.12, 'highpass', 4200, 0, this.bus);    // edge
      this._tone(h, 'square', 1180, 880, 0.09, 0.05, this.bus, 0.001); // clang
    });
  }

  /** An enforcer takes a hit. Part impact, part corrupted data. */
  enemyHit() {
    return this._safe(() => {
      if (!this._on) return;
      const t = this.ctx.currentTime;
      this._noiseHit(t, 0.08, 0.20, 'bandpass', 420, 1.6, this.bus);
      this._tone(t, 'square', 330, 210, 0.07, 0.07, this.bus, 0.001);
      this._tone(t + 0.03, 'square', 1500, 1500, 0.035, 0.035, this.bus, 0.001);
    });
  }

  /** An enforcer goes down: it de-resolves rather than dies. */
  enemyDown() {
    return this._safe(() => {
      if (!this._on) return;
      const t = this.ctx.currentTime;
      this._tone(t, 'triangle', 520, 120, 0.34, 0.14, this.bus);
      this._noiseHit(t, 0.32, 0.16, 'lowpass', 2200, 0, this.bus, 220);
      // three descending digital blips: the visor losing signal
      for (let i = 0; i < 3; i++) {
        this._tone(t + 0.06 + i * 0.055, 'square', 1400 - i * 380, null, 0.04, 0.045, this.bus, 0.001);
      }
      this._tone(t + 0.02, 'sine', 90, 42, 0.30, 0.20, this.bus);
    });
  }

  /** TWIF takes damage. Low, ugly, short. */
  playerHurt() {
    return this._safe(() => {
      if (!this._on) return;
      const t = this.ctx.currentTime;
      this._tone(t, 'sawtooth', 230, 62, 0.34, 0.20, this.bus, 0.004);
      this._noiseHit(t, 0.16, 0.20, 'lowpass', 900, 0, this.bus, 180);
      this._tone(t + 0.01, 'sine', 150, 48, 0.22, 0.24, this.bus);
    });
  }

  /**
   * One stride. `surface` is a hint, not a requirement: unknown values get
   * stone, which is most of this city.
   */
  footstep(surface) {
    return this._safe(() => {
      if (!this._on) return;
      const t = this.ctx.currentTime;
      const S = {
        stone:  [230, 1.3, 0.085, 3600, 0.022],
        road:   [180, 1.0, 0.075, 2600, 0.016],
        metal:  [520, 2.2, 0.070, 5200, 0.030],
        timber: [150, 1.6, 0.090, 2200, 0.014],
        wet:    [260, 1.1, 0.080, 6000, 0.034],
      }[surface] || [230, 1.3, 0.085, 3600, 0.022];
      const jitter = 0.85 + Math.random() * 0.3;
      this._noiseHit(t, 0.07, S[2] * jitter, 'bandpass', S[0] * jitter, S[1], this.bus);
      this._noiseHit(t, 0.045, S[4], 'highpass', S[3], 0, this.bus);
      this._tone(t, 'sine', 110, 60, 0.06, 0.05, this.bus);
    });
  }

  // ---------------------------------------------------------------- van
  // The engine is one continuous voice, not a sample: two sawtooths a fifth
  // apart plus a sub and a noise layer through a lowpass, all of which follow
  // speed. Five nodes, alive only while driving.

  vanStart() {
    return this._safe(() => {
      if (!this.ready || this._engine) return;
      const ctx = this.ctx, t = ctx.currentTime;
      const out = ctx.createGain(); out.gain.value = 0.0001;
      out.connect(this.dry);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 620; lp.Q.value = 3.0;
      lp.connect(out);

      const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 58;
      const g1 = ctx.createGain(); g1.gain.value = 0.42;
      const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = 87;
      const g2 = ctx.createGain(); g2.gain.value = 0.16;
      const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = 29;
      const gs = ctx.createGain(); gs.gain.value = 0.38;
      const n = ctx.createBufferSource(); n.buffer = this.noise; n.loop = true;
      const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 340; nf.Q.value = 0.8;
      const gn = ctx.createGain(); gn.gain.value = 0.10;
      o1.connect(g1); g1.connect(lp);
      o2.connect(g2); g2.connect(lp);
      sub.connect(gs); gs.connect(lp);
      n.connect(nf); nf.connect(gn); gn.connect(lp);
      o1.start(t); o2.start(t); sub.start(t); n.start(t);

      out.gain.exponentialRampToValueAtTime(0.16, t + 0.25);
      this._engine = { out, lp, o1, o2, sub, n, nf, g1, g2, gs, gn };
      // ignition cough, so the van starting is an event
      this._noiseHit(t, 0.22, 0.14, 'bandpass', 180, 1.0, this.bus);
      this._tone(t, 'sawtooth', 40, 70, 0.3, 0.14, this.bus, 0.02);
    });
  }

  /** speed01 is 0..1 of top speed. Smoothed here, so call it every frame. */
  vanEngine(speed01) {
    return this._safe(() => {
      const e = this._engine;
      if (!e || !this.ctx) return;
      const v = Math.max(0, Math.min(1, speed01 || 0));
      const t = this.ctx.currentTime, k = 0.09;
      // Deliberately not linear: most of the pitch travel is in the first half
      // of the speed range, which is where the van actually spends its time.
      const f = 52 + Math.pow(v, 0.7) * 150;
      e.o1.frequency.setTargetAtTime(f, t, k);
      e.o2.frequency.setTargetAtTime(f * 1.5, t, k);
      e.sub.frequency.setTargetAtTime(f * 0.5, t, k);
      e.nf.frequency.setTargetAtTime(300 + v * 900, t, k);
      e.lp.frequency.setTargetAtTime(520 + v * 1500, t, k);
      e.out.gain.setTargetAtTime(0.13 + v * 0.14, t, 0.12);
      e.gn.gain.setTargetAtTime(0.07 + v * 0.10, t, 0.15);
    });
  }

  vanStop() {
    return this._safe(() => {
      const e = this._engine;
      if (!e) return;
      this._engine = null;
      const t = this.ctx.currentTime;
      e.out.gain.cancelScheduledValues(t);
      e.out.gain.setValueAtTime(Math.max(0.0002, e.out.gain.value), t);
      e.out.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      e.o1.frequency.setTargetAtTime(40, t, 0.15);
      e.sub.frequency.setTargetAtTime(20, t, 0.15);
      const stop = t + 0.45;
      e.o1.stop(stop); e.o2.stop(stop); e.sub.stop(stop); e.n.stop(stop);
      // one handler, one teardown: the whole engine leaves the graph together
      e.n.onended = () => {
        for (const k of ['out', 'lp', 'o1', 'o2', 'sub', 'n', 'nf', 'g1', 'g2', 'gs', 'gn']) {
          try { e[k].disconnect(); } catch (err) {}
        }
        e.n.onended = null;
      };
    });
  }

  // ---------------------------------------------------------------- ui / beats

  /** 'select' | 'confirm' | 'deny' */
  ui(kind) {
    return this._safe(() => {
      if (!this._on) return;
      const t = this.ctx.currentTime;
      if (kind === 'confirm') {
        this._tone(t, 'triangle', mtof(74), null, 0.10, 0.10, this.bus, 0.003);
        this._tone(t + 0.075, 'triangle', mtof(81), null, 0.22, 0.09, this.bus, 0.003);
      } else if (kind === 'deny') {
        this._tone(t, 'square', 150, 110, 0.14, 0.07, this.bus, 0.002);
        this._tone(t + 0.005, 'square', 143, 104, 0.14, 0.05, this.bus, 0.002);
      } else {
        this._tone(t, 'sine', mtof(81), null, 0.07, 0.07, this.bus, 0.002);
        this._noiseHit(t, 0.02, 0.02, 'highpass', 6000, 0, this.bus);
      }
    });
  }

  /**
   * The node lights up. The biggest sound in the game and the only one allowed
   * three seconds: a rising filtered swell, a bell built from four inharmonic
   * partials on D, a sub drop underneath and a three-note figure on top. The
   * music ducks under it and comes back.
   */
  nodeActivate() {
    return this._safe(() => {
      if (!this.ready || !this.ctx || this.ctx.state !== 'running') return;
      const t = this.ctx.currentTime;

      // duck the bed so the bell has the room to itself
      if (this.musicBus) {
        const g = this.musicBus.gain;
        g.cancelScheduledValues(t);
        g.setValueAtTime(g.value, t);
        g.linearRampToValueAtTime(0.35, t + 0.3);
        g.linearRampToValueAtTime(1, t + 3.2);
      }
      if (!this._on) return;

      // swell in
      this._noiseHit(t, 1.05, 0.14, 'bandpass', 220, 1.6, this.bus, 4200);
      // the strike
      const s = t + 1.0, f = mtof(62);
      const partials = [[1, 0.20, 2.6], [2.01, 0.11, 1.8], [2.99, 0.07, 1.2], [4.21, 0.04, 0.8]];
      for (const [mul, gain, dec] of partials) {
        this._tone(s, 'sine', f * mul, null, dec, gain, this.bus, 0.004);
      }
      this._tone(s, 'sine', f * 0.5, f * 0.25, 1.4, 0.24, this.bus, 0.01);   // drop
      this._noiseHit(s, 0.4, 0.12, 'highpass', 5000, 0, this.bus);           // shimmer
      // and the answer: D A D climbing out of the reverb
      this._pluck(s + 0.42, 62, 0.09);
      this._pluck(s + 0.60, 69, 0.08);
      this._pluck(s + 0.82, 74, 0.10);
    });
  }

  // ---------------------------------------------------------------- mix

  _rampMaster(v, time) {
    if (!this.master || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(Math.max(0, v), t + (time || 0.15));
  }

  setMaster(v) {
    return this._safe(() => {
      this.volume = Math.max(0, Math.min(1, typeof v === 'number' ? v : 0.7));
      // A zeroed slider counts as silence: `_on` refuses to build voices at all,
      // so a volume of 0 costs the same as a mute rather than rendering silently.
      if (!this.muted && !this.suspended) this._rampMaster(this.volume, 0.12);
    });
  }

  mute(on) {
    return this._safe(() => {
      this.muted = !!on;
      this._rampMaster(this.muted ? 0 : this.volume, 0.12);
      if (this.muted && this._engine) this.vanStop();
    });
  }

  /**
   * Continuous work. Safe to call every frame, before unlock, and with no
   * arguments. Pass the game's own state object and it will also drive footsteps,
   * the engine pitch and the music state for you — see the integration notes for
   * which fields it reads and how to opt out.
   */
  update(dt, gameState) {
    return this._safe(() => {
      this._schedule();
      if (!gameState || !this.ready) return;
      const g = gameState;
      const step = Math.max(0, Math.min(0.1, dt || 0));

      if (g.inVan) {
        if (!this._engine) this.vanStart();
        const top = typeof g.vanTopSpeed === 'number' ? g.vanTopSpeed : 26;
        this.vanEngine(Math.abs(g.speed || 0) / top);
        this._stride = 0;
      } else if (this._engine) {
        this.vanStop();
      }

      // Footsteps from distance travelled, not from a timer: running strides
      // are faster because the player is covering ground faster, for free.
      if (!g.inVan && !g.over) {
        const sp = Math.abs(g.speed || 0);
        if (sp > 0.7) {
          this._stride += sp * step;
          if (this._stride >= 1.85) { this._stride = 0; this.footstep(g.surface); }
        } else {
          this._stride = Math.min(this._stride, 1.2);
        }
      }

      if (g.music !== false) {
        const want = g.over ? 'off'
          : g.inVan ? 'drive'
          : (g.enemies > 0) ? 'combat'
          : (g.stage === 'hub' || g.stage === 'complete' || g.stage === 'return') ? 'hub'
          : 'explore';
        if (want !== this.state) this.music(want);
      }
    });
  }

  /** Optional. Tear everything down; only useful if the game is reloaded in place. */
  dispose() {
    return this._safe(() => {
      if (this._timer) { clearInterval(this._timer); this._timer = null; }
      try { document.removeEventListener('visibilitychange', this._onVis); } catch (e) {}
      this.vanStop();
      this.ready = false;
      if (this.ctx && this.ctx.state !== 'closed') this.ctx.close();
      this.ctx = null;
    });
  }
}
