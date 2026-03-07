/* NOVA Engine — SceneManager */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.SceneManager = function() {
  var THREE = window.THREE;
  this.scene = new THREE.Scene();
  this.scene.background = new THREE.Color(0x1a1a1e);
  this.scene.fog = new THREE.FogExp2(0x1a1a1e, 0.008);
  this.objects     = {};
  this._lights     = [];
  this._grid       = null;
  this._gridVisible = true;
  this._idCounter  = 0;
};

NOVA.SceneManager.prototype.add = function(object, name) {
  if (!object.userData.novaId) {
    object.userData.novaId = 'obj_' + (++this._idCounter);
  }
  if (name) object.name = name;
  this.scene.add(object);
  this.objects[object.userData.novaId] = object;
  if (object.isLight) this._lights.push(object);
  return object;
};

NOVA.SceneManager.prototype.remove = function(object) {
  this.scene.remove(object);
  delete this.objects[object.userData.novaId];
  var idx = this._lights.indexOf(object);
  if (idx !== -1) this._lights.splice(idx, 1);
  object.traverse(function(child) {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach(function(m) { m.dispose(); });
      else child.material.dispose();
    }
  });
};

NOVA.SceneManager.prototype.getById = function(id) {
  return this.objects[id] || null;
};

NOVA.SceneManager.prototype.getAll = function() {
  return Object.values(this.objects);
};

NOVA.SceneManager.prototype.getObjectCount = function() {
  return Object.keys(this.objects).length;
};

NOVA.SceneManager.prototype.getLightCount = function() {
  return this._lights.length;
};

NOVA.SceneManager.prototype.buildGrid = function() {
  var THREE = window.THREE;
  if (this._grid) {
    this.scene.remove(this._grid);
  }
  this._grid = new THREE.GridHelper(100, 100, 0x333340, 0x252530);
  this._grid.material.transparent = true;
  this._grid.material.opacity = 0.6;
  this._grid.userData.isGrid = true;
  if (this._gridVisible) this.scene.add(this._grid);
};

NOVA.SceneManager.prototype.setGridVisible = function(visible) {
  this._gridVisible = visible;
  if (visible && this._grid && !this._grid.parent) {
    this.scene.add(this._grid);
  } else if (!visible && this._grid && this._grid.parent) {
    this.scene.remove(this._grid);
  }
};

NOVA.SceneManager.prototype.isGridVisible = function() {
  return this._gridVisible;
};

NOVA.SceneManager.prototype.clear = function() {
  var self = this;
  var ids = Object.keys(this.objects);
  ids.forEach(function(id) {
    self.remove(self.objects[id]);
  });
};
