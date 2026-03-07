/* NOVA Engine — SelectionManager */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.SelectionManager = function(events) {
  this._events  = events;
  this.selected = null;
};

NOVA.SelectionManager.prototype.select = function(object) {
  if (this.selected === object) return;
  this.selected = object;
  if (this._events) this._events.emit('selection:changed', object);
};

NOVA.SelectionManager.prototype.deselect = function() {
  if (!this.selected) return;
  this.selected = null;
  if (this._events) this._events.emit('selection:changed', null);
};

NOVA.SelectionManager.prototype.toggle = function(object) {
  if (this.selected === object) this.deselect(); else this.select(object);
};

NOVA.SelectionManager.prototype.isSelected = function(object) {
  return this.selected === object;
};

NOVA.SelectionManager.prototype.pickFromMouse = function(mouseVec2, camera, objects) {
  var THREE    = window.THREE;
  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouseVec2, camera);
  var meshes = objects.filter(function(o) { return !o.userData.isGrid && !o.isLight; });
  var hits   = raycaster.intersectObjects(meshes, true);
  if (hits.length > 0) {
    var obj = hits[0].object;
    while (obj.parent && obj.parent.type !== 'Scene') obj = obj.parent;
    this.select(obj);
    return obj;
  }
  this.deselect();
  return null;
};

/* ─── HistoryManager ─────────────────────────────────────────── */

NOVA.HistoryManager = function(events) {
  this._events = events;
  this._stack  = [];
  this._index  = -1;
  this._bindKeys();
};

NOVA.HistoryManager.prototype.push = function(command) {
  this._stack = this._stack.slice(0, this._index + 1);
  this._stack.push(command);
  if (this._stack.length > 100) this._stack.shift();
  this._index = this._stack.length - 1;
  if (this._events) this._events.emit('history:changed', { canUndo: this.canUndo(), canRedo: this.canRedo() });
};

NOVA.HistoryManager.prototype.undo = function() {
  if (this._index < 0) return;
  this._stack[this._index].undo();
  this._index--;
  if (this._events) this._events.emit('history:changed', { canUndo: this.canUndo(), canRedo: this.canRedo() });
};

NOVA.HistoryManager.prototype.redo = function() {
  if (this._index >= this._stack.length - 1) return;
  this._index++;
  this._stack[this._index].do();
  if (this._events) this._events.emit('history:changed', { canUndo: this.canUndo(), canRedo: this.canRedo() });
};

NOVA.HistoryManager.prototype.canUndo = function() { return this._index >= 0; };
NOVA.HistoryManager.prototype.canRedo = function() { return this._index < this._stack.length - 1; };
NOVA.HistoryManager.prototype.clear   = function() { this._stack = []; this._index = -1; };

NOVA.HistoryManager.prototype._bindKeys = function() {
  var self = this;
  window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); self.undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); self.redo(); }
  });
};
