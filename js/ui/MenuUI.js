/**
 * NOVA Engine — MenuUI
 * Top menu bar: File, Edit, GameObject, View, Help dropdowns.
 */

export class MenuUI {
  constructor(nova) {
    this._nova = nova;
    this._openMenu = null;

    this._menus = {
      'menu-file':       this._fileMenu(),
      'menu-edit':       this._editMenu(),
      'menu-gameobject': this._gameObjectMenu(),
      'menu-view':       this._viewMenu(),
      'menu-help':       this._helpMenu(),
    };

    this._build();
  }

  // ── Menu definitions ──────────────────────────────────────────────────────

  _fileMenu() {
    return [
      { label: 'New Scene',     action: () => { this._nova.scene.clear(); this._nova.factory.populateDefaults(); this._nova.events?.emit('scene:changed', {}); } },
      { label: 'Export Scene',  action: () => this._nova.serializer.downloadExport() },
      { label: 'Import Scene…', action: () => document.getElementById('btn-import-asset')?.click() },
      { separator: true },
      { label: 'Export Logs',   action: () => document.getElementById('btn-export-logs')?.click() },
    ];
  }

  _editMenu() {
    return [
      { label: 'Undo  Ctrl+Z',  action: () => this._nova.history.undo() },
      { label: 'Redo  Ctrl+Y',  action: () => this._nova.history.redo() },
      { separator: true },
      { label: 'Delete Object', action: () => {
          if (this._nova.selection.selected)
            this._nova.events?.emit('object:delete', this._nova.selection.selected);
        }
      },
      { label: 'Select All',    action: () => this._nova.ui.toast?.show('Select all coming soon', 'info') },
    ];
  }

  _gameObjectMenu() {
    const create = type => () => {
      const obj = this._nova.factory.create(type);
      if (obj) { this._nova.events?.emit('scene:changed', { added: obj }); this._nova.selection.select(obj); }
    };
    return [
      { label: 'Cube',       action: create('cube') },
      { label: 'Sphere',     action: create('sphere') },
      { label: 'Plane',      action: create('plane') },
      { label: 'Cylinder',   action: create('cylinder') },
      { separator: true },
      { label: 'Dir Light',  action: create('dirLight') },
      { label: 'Point Light',action: create('pointLight') },
      { label: 'Spot Light', action: create('spotLight') },
    ];
  }

  _viewMenu() {
    return [
      { label: 'Toggle Grid',  action: () => document.getElementById('btn-grid')?.click() },
      { label: 'Toggle Bloom', action: () => document.getElementById('btn-bloom')?.click() },
      { label: 'Toggle Snap',  action: () => document.getElementById('btn-snap')?.click() },
      { separator: true },
      { label: 'Focus Selected (F)', action: () => {
          if (this._nova.selection.selected)
            this._nova.events?.emit('camera:focus', this._nova.selection.selected);
        }
      },
    ];
  }

  _helpMenu() {
    return [
      { label: 'Keyboard Shortcuts', action: () => this._nova.ui.toast?.show('Q/W/E/R: Tools | G: Grid | B: Bloom | F: Focus | Del: Delete | Ctrl+Z/Y: Undo/Redo', 'info', 6000) },
      { label: 'About NOVA Engine',  action: () => this._nova.ui.toast?.show('NOVA Engine — Three.js modular 3D editor', 'info', 4000) },
    ];
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  _build() {
    Object.entries(this._menus).forEach(([id, items]) => {
      const trigger = document.getElementById(id);
      if (!trigger) return;

      const dropdown = document.createElement('div');
      dropdown.className = 'menu-dropdown';
      dropdown.style.display = 'none';

      items.forEach(item => {
        if (item.separator) {
          dropdown.appendChild(Object.assign(document.createElement('div'), { className: 'menu-sep' }));
          return;
        }
        const el = Object.assign(document.createElement('div'), {
          className: 'menu-dd-item',
          textContent: item.label,
        });
        el.addEventListener('click', () => { item.action?.(); this._closeAll(); });
        dropdown.appendChild(el);
      });

      trigger.parentElement.style.position = 'relative';
      trigger.parentElement.appendChild(dropdown);

      trigger.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = dropdown.style.display !== 'none';
        this._closeAll();
        if (!isOpen) dropdown.style.display = 'block';
      });
    });

    document.addEventListener('click', () => this._closeAll());
  }

  _closeAll() {
    document.querySelectorAll('.menu-dropdown').forEach(d => d.style.display = 'none');
  }
}
