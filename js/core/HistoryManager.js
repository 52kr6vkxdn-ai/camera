/**
 * NOVA Engine — HistoryManager
 * Simple command-pattern undo/redo stack.
 * Each command is { do: fn, undo: fn, label?: string }.
 */

const MAX_HISTORY = 100;

export class HistoryManager {
  constructor(events) {
    this._events = events;
    this._stack  = [];
    this._index  = -1;

    this._bindKeys();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  push(command) {
    // Truncate redo branch
    this._stack = this._stack.slice(0, this._index + 1);
    this._stack.push(command);
    if (this._stack.length > MAX_HISTORY) this._stack.shift();
    this._index = this._stack.length - 1;
    this._events?.emit('history:changed', this._state());
  }

  undo() {
    if (this._index < 0) return;
    this._stack[this._index].undo();
    this._index--;
    this._events?.emit('history:changed', this._state());
  }

  redo() {
    if (this._index >= this._stack.length - 1) return;
    this._index++;
    this._stack[this._index].do();
    this._events?.emit('history:changed', this._state());
  }

  canUndo() { return this._index >= 0; }
  canRedo() { return this._index < this._stack.length - 1; }
  clear()   { this._stack = []; this._index = -1; }

  // ── Private ───────────────────────────────────────────────────────────────

  _state() {
    return { canUndo: this.canUndo(), canRedo: this.canRedo() };
  }

  _bindKeys() {
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); this.undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); this.redo();
      }
    });
  }
}
