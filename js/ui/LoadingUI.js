/**
 * NOVA Engine — LoadingUI
 * Controls the full-screen loading overlay.
 */

export class LoadingUI {
  constructor() {
    this._overlay = document.getElementById('loading-overlay');
    this._bar     = this._overlay?.querySelector('.loading-bar');
    this._text    = this._overlay?.querySelector('.loading-text');
  }

  show() {
    if (this._overlay) this._overlay.style.display = 'flex';
  }

  hide() {
    if (!this._overlay) return;
    this._overlay.style.transition = 'opacity 0.5s';
    this._overlay.style.opacity = '0';
    setTimeout(() => { this._overlay.style.display = 'none'; }, 500);
  }

  setProgress(pct, label) {
    if (this._bar)  this._bar.style.width  = `${Math.min(100, pct)}%`;
    if (this._text) this._text.textContent = label ?? '';
  }
}
