// Keyboard + touch, from the first build. Everything here is driven by REAL
// pointer/key/touch events — a gate must be able to exercise the game the way a
// player does, never through a debug hook.
import { clamp } from './config.js?v=202609260045';

export class Input {
  constructor() {
    this.move = { x: 0, y: 0 };          // -1..1, y = forward
    this.look = { x: 0, y: 0 };          // accumulated delta, consumed each frame
    this.run = false;
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    this._edge = { attack: false, action: false, dodge: false };
    this._keys = new Set();
    this._lookId = null; this._lookLast = { x: 0, y: 0 };
    this._stickId = null; this._stickOrigin = { x: 0, y: 0 };
    this._bind();
  }

  /** Consume an edge-triggered press. Returns true once per press. */
  take(name) { const v = this._edge[name]; this._edge[name] = false; return v; }
  /** Consume accumulated look delta. */
  takeLook() { const l = { x: this.look.x, y: this.look.y }; this.look.x = 0; this.look.y = 0; return l; }

  _bind() {
    addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this._keys.add(e.code);
      if (e.code === 'KeyJ' || e.code === 'KeyF') this._edge.attack = true;
      if (e.code === 'KeyE' || e.code === 'Enter') this._edge.action = true;
      // NOT Shift: Shift is the run modifier (see poll()), so binding dodge to it
      // fired a 15 m/s burst every time the player held sprint -- TWIF lurching
      // forward for no reason the player could see.
      if (e.code === 'Space' || e.code === 'KeyK') this._edge.dodge = true;
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => this._keys.delete(e.code));
    addEventListener('blur', () => this._keys.clear());

    const canvas = document.getElementById('c');
    // desktop look: drag anywhere on the canvas
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      this._lookId = e.pointerId; this._lookLast = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this._lookId) return;
      this.look.x += e.clientX - this._lookLast.x;
      this.look.y += e.clientY - this._lookLast.y;
      this._lookLast = { x: e.clientX, y: e.clientY };
    });
    const endLook = (e) => { if (e.pointerId === this._lookId) this._lookId = null; };
    canvas.addEventListener('pointerup', endLook);
    canvas.addEventListener('pointercancel', endLook);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch' && e.button === 0) this._edge.attack = true;
    });

    // ---- touch
    const stick = document.getElementById('stick');
    const sbase = document.getElementById('sbase');
    const snub  = document.getElementById('snub');
    const look  = document.getElementById('look');
    const RADIUS = 54;

    const placeStick = (x, y) => {
      sbase.style.left = x + 'px'; sbase.style.top = y + 'px';
      snub.style.left = x + 'px';  snub.style.top = y + 'px';
    };
    stick.addEventListener('pointerdown', (e) => {
      this._stickId = e.pointerId;
      const r = stick.getBoundingClientRect();
      this._stickOrigin = { x: e.clientX - r.left, y: e.clientY - r.top };
      placeStick(this._stickOrigin.x, this._stickOrigin.y);
      sbase.style.opacity = '1'; snub.style.opacity = '1';
      stick.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    stick.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this._stickId) return;
      const r = stick.getBoundingClientRect();
      let dx = (e.clientX - r.left) - this._stickOrigin.x;
      let dy = (e.clientY - r.top) - this._stickOrigin.y;
      const len = Math.hypot(dx, dy);
      if (len > RADIUS) { dx = dx / len * RADIUS; dy = dy / len * RADIUS; }
      snub.style.left = (this._stickOrigin.x + dx) + 'px';
      snub.style.top  = (this._stickOrigin.y + dy) + 'px';
      this.move.x = clamp(dx / RADIUS, -1, 1);
      this.move.y = clamp(-dy / RADIUS, -1, 1);
      this.run = len > RADIUS * 0.72;
      e.preventDefault();
    });
    const endStick = (e) => {
      if (e.pointerId !== this._stickId) return;
      this._stickId = null; this.move.x = 0; this.move.y = 0; this.run = false;
      sbase.style.opacity = '0'; snub.style.opacity = '0';
    };
    stick.addEventListener('pointerup', endStick);
    stick.addEventListener('pointercancel', endStick);

    look.addEventListener('pointerdown', (e) => {
      this._lookId = e.pointerId; this._lookLast = { x: e.clientX, y: e.clientY };
      look.setPointerCapture(e.pointerId); e.preventDefault();
    });
    look.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this._lookId) return;
      this.look.x += e.clientX - this._lookLast.x;
      this.look.y += e.clientY - this._lookLast.y;
      this._lookLast = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    });
    look.addEventListener('pointerup', endLook);
    look.addEventListener('pointercancel', endLook);

    const btn = (id, name) => {
      const el = document.getElementById(id);
      el.addEventListener('pointerdown', (e) => {
        this._edge[name] = true; el.classList.add('dn'); e.preventDefault();
      });
      const up = () => el.classList.remove('dn');
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    };
    btn('batk', 'attack'); btn('bact', 'action'); btn('bdog', 'dodge');

    if (this.isTouch) document.getElementById('touch').classList.add('on');
  }

  /** Keyboard contribution, merged with the stick each frame. */
  poll() {
    const k = this._keys;
    let x = 0, y = 0;
    if (k.has('KeyW') || k.has('ArrowUp')) y += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) y -= 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
    if (x || y) {
      const l = Math.hypot(x, y) || 1;
      this.move.x = x / l; this.move.y = y / l;
      this.run = k.has('ShiftLeft') || k.has('ShiftRight');
    } else if (this._stickId === null) {
      this.move.x = 0; this.move.y = 0;
    }
    return this.move;
  }
}
