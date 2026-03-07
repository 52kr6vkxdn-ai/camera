/**
 * NOVA Engine — Engine Core
 * Manages the main render/update loop and play/pause/stop states.
 */

export class Engine {
  constructor(nova) {
    this.nova = nova;
    this.running = false;
    this.rafId = null;
    this._clock = { last: 0, delta: 0 };
  }

  start() {
    this.running = true;
    this._clock.last = performance.now();
    this._loop(this._clock.last);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  _loop(now) {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(t => this._loop(t));

    this._clock.delta = (now - this._clock.last) / 1000;
    this._clock.last = now;
    const dt = Math.min(this._clock.delta, 0.05); // cap at 50ms

    this._update(dt);
    this._render();
  }

  _update(dt) {
    const { nova } = this;
    nova.camera.update(dt, nova.input);
    nova.transform.update();
    nova.gizmos.update(nova.selection.selected);
    nova.input.flush();
  }

  _render() {
    const { nova } = this;
    nova.post.render(nova.scene.scene, nova.renderer.camera);
    nova.ui.stats.update();
  }
}
