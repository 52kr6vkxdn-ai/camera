/**
 * NOVA Engine — StatsHUD
 * Updates FPS, triangle count, draw call, and HUD stats every frame.
 */

export class StatsHUD {
  constructor(rendererWrapper, sceneManager, fpsDom, triDom, dcDom, objDom, lightDom, modeDom) {
    this._rw       = rendererWrapper;
    this._scene    = sceneManager;
    this._fpsDom   = fpsDom;
    this._triDom   = triDom;
    this._dcDom    = dcDom;
    this._objDom   = objDom;
    this._lightDom = lightDom;
    this._modeDom  = modeDom;

    this._lastTime = performance.now();
    this._frames   = 0;
    this._fps      = 0;
  }

  update() {
    this._frames++;
    const now = performance.now();
    const elapsed = now - this._lastTime;

    if (elapsed >= 500) {
      this._fps = Math.round((this._frames / elapsed) * 1000);
      this._frames = 0;
      this._lastTime = now;

      const info = this._rw.renderer.info;

      if (this._fpsDom)   this._fpsDom.textContent   = this._fps;
      if (this._triDom)   this._triDom.textContent   = _fmt(info.render.triangles);
      if (this._dcDom)    this._dcDom.textContent    = info.render.calls;
      if (this._objDom)   this._objDom.textContent   = this._scene.getObjectCount();
      if (this._lightDom) this._lightDom.textContent = this._scene.getLightCount();

      // Colour fps badge
      if (this._fpsDom) {
        const badge = this._fpsDom.closest?.('.stat-badge');
        if (badge) {
          badge.classList.toggle('warn',  this._fps < 30 && this._fps >= 15);
          badge.classList.toggle('error', this._fps < 15);
        }
      }
    }
  }
}

function _fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n;
}
