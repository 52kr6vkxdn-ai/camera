/**
 * NOVA Engine — InputManager
 * Tracks keyboard and mouse state, fires named events.
 */

export class InputManager {
  constructor(domElement) {
    this.domElement = domElement;
    this._keys = new Set();
    this._keysJustDown = new Set();
    this._mouse = { x: 0, y: 0, buttons: 0 };
    this._listeners = [];

    this._bind();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  isKeyDown(code)      { return this._keys.has(code); }
  isKeyJustDown(code)  { return this._keysJustDown.has(code); }
  getMouse()           { return { ...this._mouse }; }

  /** Call once per frame at the END of the update to clear transient state. */
  flush() {
    this._keysJustDown.clear();
  }

  on(event, handler) {
    this._listeners.push({ event, handler });
    window.addEventListener(event, handler);
  }

  destroy() {
    this._listeners.forEach(({ event, handler }) =>
      window.removeEventListener(event, handler));
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
    this.domElement.removeEventListener('mousemove', this._onMouseMove);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _bind() {
    this._onKeyDown   = e => { this._keys.add(e.code); this._keysJustDown.add(e.code); };
    this._onKeyUp     = e => this._keys.delete(e.code);
    this._onMouseMove = e => {
      const rect = this.domElement.getBoundingClientRect();
      this._mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this._mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this._mouse.buttons = e.buttons;
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
    this.domElement.addEventListener('mousemove', this._onMouseMove);
  }
}
