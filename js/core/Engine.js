/* NOVA Engine — Engine (main loop) */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.Engine = function(nova) {
  this.nova    = nova;
  this.running = false;
  this.rafId   = null;
  this._last   = 0;
};

NOVA.Engine.prototype.start = function() {
  this.running = true;
  this._last   = performance.now();
  var self = this;
  this.rafId = requestAnimationFrame(function(t) { self._loop(t); });
};

NOVA.Engine.prototype.stop = function() {
  this.running = false;
  if (this.rafId) cancelAnimationFrame(this.rafId);
};

NOVA.Engine.prototype._loop = function(now) {
  if (!this.running) return;
  var self = this;
  this.rafId = requestAnimationFrame(function(t) { self._loop(t); });
  var dt = Math.min((now - this._last) / 1000, 0.05);
  this._last = now;
  this._update(dt);
  this._render();
};

NOVA.Engine.prototype._update = function(dt) {
  var n = this.nova;
  n.camera.update(dt, n.input);
  n.transform.update();
  n.gizmos.update(n.selection.selected);
  n.input.flush();
};

NOVA.Engine.prototype._render = function() {
  var n = this.nova;
  n.post.render(n.scene.scene, n.renderer.camera);
  n.ui.stats.update();
};
