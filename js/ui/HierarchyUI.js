/* NOVA Engine — HierarchyUI */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.HierarchyUI = function(listEl, searchEl, sceneManager, selection, events, history) {
  this._el        = listEl;
  this._searchEl  = searchEl;
  this._scene     = sceneManager;
  this._selection = selection;
  this._events    = events;
  this._history   = history;
  this._query     = '';

  var self = this;
  if (events) {
    events.on('scene:changed',     function()    { self.refresh(); });
    events.on('selection:changed', function()    { self._highlightSelected(); });
    events.on('object:delete',     function(obj) { self._deleteObject(obj); });
  }

  if (searchEl) searchEl.addEventListener('input', function(e) {
    self._query = e.target.value.toLowerCase();
    self.refresh();
  });

  var addBtn = document.getElementById('btn-add-obj');
  if (addBtn) addBtn.addEventListener('click', function() {
    if (events) events.emit('context:open', null);
  });

  this.refresh();
};

NOVA.HierarchyUI.prototype.refresh = function() {
  if (!this._el) return;
  this._el.innerHTML = '';
  var self    = this;
  var objects = this._scene.getAll().filter(function(o) {
    return !o.userData.isGrid && !o.userData.isGizmo;
  });
  var filtered = this._query
    ? objects.filter(function(o) { return o.name.toLowerCase().indexOf(self._query) !== -1; })
    : objects;
  filtered.forEach(function(obj) { self._el.appendChild(self._buildRow(obj)); });
  this._highlightSelected();
};

NOVA.HierarchyUI.prototype._buildRow = function(obj) {
  var self = this;
  var row  = document.createElement('div');
  row.className  = 'hierarchy-item';
  row.dataset.id = obj.userData.novaId;
  row.innerHTML  =
    '<span class="hierarchy-icon">' + _iconFor(obj) + '</span>' +
    '<span class="hierarchy-name" data-id="' + obj.userData.novaId + '">' + obj.name + '</span>';
  row.addEventListener('click',   function()  { self._selection.select(obj); });
  row.addEventListener('dblclick',function()  { self._startRename(row, obj); });
  return row;
};

NOVA.HierarchyUI.prototype._highlightSelected = function() {
  var sel = this._selection.selected;
  if (!this._el) return;
  this._el.querySelectorAll('.hierarchy-item').forEach(function(row) {
    row.classList.toggle('selected', !!(sel && row.dataset.id === sel.userData.novaId));
  });
};

NOVA.HierarchyUI.prototype._startRename = function(row, obj) {
  var self     = this;
  var nameSpan = row.querySelector('.hierarchy-name');
  var input    = document.createElement('input');
  input.className = 'hierarchy-rename-input';
  input.value     = obj.name;
  nameSpan.replaceWith(input);
  input.focus(); input.select();

  var commit = function() {
    var newName = input.value.trim() || obj.name;
    var oldName = obj.name;
    obj.name = newName;
    var span = document.createElement('span');
    span.className   = 'hierarchy-name';
    span.textContent = newName;
    input.replaceWith(span);
    if (self._history) self._history.push({
      do:   function() { obj.name = newName; self.refresh(); },
      undo: function() { obj.name = oldName; self.refresh(); }
    });
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter')  { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.value = obj.name; input.blur(); }
  });
};

NOVA.HierarchyUI.prototype._deleteObject = function(obj) {
  var self  = this;
  var scene = this._scene;
  if (this._history) this._history.push({
    do:   function() { scene.remove(obj); self._selection.deselect(); self.refresh(); },
    undo: function() { scene.add(obj);    self.refresh(); }
  });
  scene.remove(obj);
  this._selection.deselect();
  this.refresh();
  if (this._events) this._events.emit('scene:changed', {});
};

function _iconFor(obj) {
  if (obj.isLight) return '<i class="fa-solid fa-lightbulb" style="color:#ffd166"></i>';
  var map = {
    cube:'fa-cube', sphere:'fa-globe', plane:'fa-square', capsule:'fa-capsules',
    cylinder:'fa-database', cone:'fa-mountain', torus:'fa-life-ring',
    'torus-knot':'fa-infinity', icosphere:'fa-gem', octahedron:'fa-gem'
  };
  var cls = map[obj.userData.type || ''] || 'fa-shapes';
  return '<i class="fa-solid ' + cls + '"></i>';
}
