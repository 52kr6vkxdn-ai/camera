/* NOVA Engine — LoadingUI */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.LoadingUI = function() {
  this._overlay = document.getElementById('loading-overlay');
  this._bar     = this._overlay ? this._overlay.querySelector('.loading-bar')  : null;
  this._text    = this._overlay ? this._overlay.querySelector('.loading-text') : null;
};
NOVA.LoadingUI.prototype.show = function() {
  if (this._overlay) this._overlay.style.display = 'flex';
};
NOVA.LoadingUI.prototype.hide = function() {
  if (!this._overlay) return;
  var el = this._overlay;
  el.style.transition = 'opacity 0.5s';
  el.style.opacity    = '0';
  setTimeout(function() { el.style.display = 'none'; }, 500);
};
NOVA.LoadingUI.prototype.setProgress = function(pct, label) {
  if (this._bar)  this._bar.style.width    = Math.min(100, pct) + '%';
  if (this._text) this._text.textContent   = label || '';
};

/* ─── ToastUI ────────────────────────────────────────────────── */

NOVA.ToastUI = function(container) {
  this._container = container;
};
NOVA.ToastUI.prototype.show = function(msg, type, duration) {
  type     = type     || 'info';
  duration = duration || 3000;
  if (!this._container) return;
  var el = document.createElement('div');
  el.className   = 'toast toast-' + type;
  el.textContent = msg;
  this._container.appendChild(el);
  requestAnimationFrame(function() { el.classList.add('toast-visible'); });
  setTimeout(function() {
    el.classList.remove('toast-visible');
    el.addEventListener('transitionend', function() { el.remove(); }, { once: true });
  }, duration);
};
