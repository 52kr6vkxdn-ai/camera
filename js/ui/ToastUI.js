/**
 * NOVA Engine — ToastUI
 * Displays transient notification toasts.
 */

export class ToastUI {
  constructor(container) {
    this._container = container;
  }

  /**
   * @param {string} msg
   * @param {'info'|'success'|'warn'|'error'} type
   * @param {number} duration  ms
   */
  show(msg, type = 'info', duration = 3000) {
    if (!this._container) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    this._container.appendChild(el);

    // Animate in
    requestAnimationFrame(() => el.classList.add('toast-visible'));

    setTimeout(() => {
      el.classList.remove('toast-visible');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, duration);
  }
}
