/**
 * NOVA Engine — HierarchyUI
 * Renders the scene object list; handles selection, rename, delete, search.
 */

export class HierarchyUI {
  constructor(listEl, searchEl, sceneManager, selection, events, history) {
    this._el        = listEl;
    this._searchEl  = searchEl;
    this._scene     = sceneManager;
    this._selection = selection;
    this._events    = events;
    this._history   = history;
    this._query     = '';

    events?.on('scene:changed',     () => this.refresh());
    events?.on('selection:changed', () => this._highlightSelected());
    events?.on('object:delete',     obj => this._deleteObject(obj));

    searchEl?.addEventListener('input', e => {
      this._query = e.target.value.toLowerCase();
      this.refresh();
    });

    document.getElementById('btn-add-obj')?.addEventListener('click', () => {
      events?.emit('context:open', null);
    });

    this.refresh();
  }

  refresh() {
    if (!this._el) return;
    this._el.innerHTML = '';
    const objects = this._scene.getAll().filter(o =>
      !o.userData.isGrid && !o.userData.isGizmo
    );
    const filtered = this._query
      ? objects.filter(o => o.name.toLowerCase().includes(this._query))
      : objects;

    filtered.forEach(obj => this._el.appendChild(this._buildRow(obj)));
    this._highlightSelected();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _buildRow(obj) {
    const row = document.createElement('div');
    row.className = 'hierarchy-item';
    row.dataset.id = obj.userData.novaId;

    const icon = _iconForObject(obj);
    row.innerHTML = `<span class="hierarchy-icon">${icon}</span>
                     <span class="hierarchy-name" data-id="${obj.userData.novaId}">${obj.name}</span>`;

    row.addEventListener('click', () => this._selection.select(obj));
    row.addEventListener('dblclick', () => this._startRename(row, obj));

    return row;
  }

  _highlightSelected() {
    const sel = this._selection.selected;
    this._el?.querySelectorAll('.hierarchy-item').forEach(row => {
      row.classList.toggle('selected', sel && row.dataset.id === sel.userData.novaId);
    });
  }

  _startRename(row, obj) {
    const nameSpan = row.querySelector('.hierarchy-name');
    const input = document.createElement('input');
    input.className = 'hierarchy-rename-input';
    input.value = obj.name;
    nameSpan.replaceWith(input);
    input.focus(); input.select();

    const commit = () => {
      const newName = input.value.trim() || obj.name;
      const oldName = obj.name;
      obj.name = newName;
      input.replaceWith(Object.assign(document.createElement('span'), {
        className: 'hierarchy-name', textContent: newName,
      }));
      this._history?.push({
        do:   () => { obj.name = newName; this.refresh(); },
        undo: () => { obj.name = oldName; this.refresh(); },
      });
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = obj.name; input.blur(); }
    });
  }

  _deleteObject(obj) {
    const sceneRef = this._scene;
    this._history?.push({
      do:   () => { sceneRef.remove(obj); this._selection.deselect(); this.refresh(); },
      undo: () => { sceneRef.add(obj); this.refresh(); },
    });
    sceneRef.remove(obj);
    this._selection.deselect();
    this.refresh();
    this._events?.emit('scene:changed', {});
  }
}

function _iconForObject(obj) {
  if (obj.isLight) return '<i class="fa-solid fa-lightbulb" style="color:#ffd166"></i>';
  const type = obj.userData.type ?? '';
  const map = {
    cube:       'fa-cube',
    sphere:     'fa-globe',
    plane:      'fa-square',
    capsule:    'fa-capsules',
    cylinder:   'fa-database',
    cone:       'fa-mountain',
    torus:      'fa-life-ring',
    'torus-knot':'fa-infinity',
    icosphere:  'fa-gem',
    octahedron: 'fa-gem',
  };
  const cls = map[type] ?? 'fa-shapes';
  return `<i class="fa-solid ${cls}"></i>`;
}
