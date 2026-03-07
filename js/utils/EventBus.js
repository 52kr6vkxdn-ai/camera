/**
 * NOVA Engine — EventBus
 * Minimal synchronous publish/subscribe.
 */

export class EventBus {
  constructor() {
    this._handlers = new Map();
  }

  on(event, handler) {
    if (!this._handlers.has(event)) this._handlers.set(event, []);
    this._handlers.get(event).push(handler);
  }

  off(event, handler) {
    const list = this._handlers.get(event);
    if (!list) return;
    const idx = list.indexOf(handler);
    if (idx !== -1) list.splice(idx, 1);
  }

  emit(event, data) {
    const list = this._handlers.get(event);
    if (!list) return;
    list.forEach(h => h(data));
  }

  once(event, handler) {
    const wrapper = data => { handler(data); this.off(event, wrapper); };
    this.on(event, wrapper);
  }
}
