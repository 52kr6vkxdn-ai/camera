/**
 * NOVA Engine — ContextMenuUI
 * Right-click context menu for creating objects and viewport actions.
 */

export class ContextMenuUI {
  constructor(menuEl, factory, selection, camera, sceneManager, events) {
    this._el        = menuEl;
    this._factory   = factory;
    this._selection = selection;
    this._camera    = camera;
    this._scene     = sceneManager;
    this._events    = events;
    this._spawnPos  = { x: 0, y: 0 };

    this._bindViewport();
    this._bindItems();
    this._bindDismiss();

    // Keyboard shortcuts for primitives
    this._bindKeyShortcuts();

    // External open
    events?.on('context:open', pos => {
      if (pos) this._spawnPos = pos;
      this._show(window.innerWidth / 2, window.innerHeight / 2);
    });
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _bindViewport() {
    document.getElementById('scene-view')?.addEventListener('contextmenu', e => {
      e.preventDefault();
      this._spawnPos = this._screenToNDC(e.clientX, e.clientY);
      this._show(e.clientX, e.clientY);
    });
  }

  _bindItems() {
    this._el?.querySelectorAll('.ctx-item[data-action]').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this._hide();
        this._handleAction(action);
      });
    });
  }

  _bindDismiss() {
    document.addEventListener('click', e => {
      if (!this._el?.contains(e.target)) this._hide();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this._hide();
    });
  }

  _bindKeyShortcuts() {
    const shortcuts = {
      '1': 'cube', '2': 'sphere', '3': 'plane',
      '4': 'cylinder', '5': 'dirLight',
    };
    window.addEventListener('keydown', e => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (shortcuts[e.key]) this._handleAction(shortcuts[e.key]);
    });
  }

  _handleAction(action) {
    switch (action) {
      case 'focus':
        if (this._selection.selected) {
          this._events?.emit('camera:focus', this._selection.selected);
        }
        break;
      case 'delete':
        if (this._selection.selected) {
          this._events?.emit('object:delete', this._selection.selected);
        }
        break;
      default: {
        const obj = this._factory.create(action);
        if (obj) {
          this._events?.emit('scene:changed', { added: obj });
          this._selection.select(obj);
        }
        break;
      }
    }
  }

  _show(screenX, screenY) {
    if (!this._el) return;
    const menu = this._el;
    menu.style.display = 'block';
    const rect = menu.getBoundingClientRect();
    const x = Math.min(screenX, window.innerWidth  - rect.width  - 8);
    const y = Math.min(screenY, window.innerHeight - rect.height - 8);
    menu.style.left = `${x}px`;
    menu.style.top  = `${y}px`;
  }

  _hide() {
    if (this._el) this._el.style.display = 'none';
  }

  _screenToNDC(x, y) {
    const vp = document.getElementById('scene-view')?.getBoundingClientRect();
    if (!vp) return { x: 0, y: 0 };
    return {
      x:  ((x - vp.left) / vp.width)  * 2 - 1,
      y: -((y - vp.top)  / vp.height) * 2 + 1,
    };
  }
}
