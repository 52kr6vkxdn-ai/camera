/* NOVA Engine — TransformControls system */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.TransformSystem = function(camera, domElement, scene, selection, history, snap, events) {
  this._camera    = camera;
  this._scene     = scene;
  this._selection = selection;
  this._history   = history;
  this._snap      = snap;
  this._events    = events;
  this._mode      = 'translate';
  this._controls  = null;

  this._init(camera, domElement, scene);
  this._listenSelection();
  this._listenEvents();
  this._bindKeys();
};

NOVA.TransformSystem.prototype._init = function(camera, domElement, scene) {
  // THREE.TransformControls loaded via UMD addon script
  this._controls = new THREE.TransformControls(camera, domElement);
  var self = this;
  this._controls.addEventListener('dragging-changed', function(e) {
    if (self._events) self._events.emit('transform:dragging', e.value);
  });
  scene.add(this._controls);
};

NOVA.TransformSystem.prototype.setMode = function(mode) {
  this._mode = mode;
  this._controls.setMode(mode);
};

NOVA.TransformSystem.prototype.update = function() {};

NOVA.TransformSystem.prototype.detach = function() {
  this._controls.detach();
};

NOVA.TransformSystem.prototype._listenSelection = function() {
  var self = this;
  this._events.on('selection:changed', function(obj) {
    if (obj) self._controls.attach(obj);
    else     self._controls.detach();
  });
};

NOVA.TransformSystem.prototype._listenEvents = function() {
  var self = this;
  this._events.on('tool:changed', function(mode) { self.setMode(mode); });
  this._events.on('snap:changed', function(s) {
    self._controls.setTranslationSnap(s.enabled ? s.value : null);
    self._controls.setRotationSnap(s.enabled ? THREE.MathUtils.degToRad(15) : null);
    self._controls.setScaleSnap(s.enabled ? 0.25 : null);
  });
};

NOVA.TransformSystem.prototype._bindKeys = function() {
  var self = this;
  window.addEventListener('keydown', function(e) {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    var k = e.key;
    if (k === 'q' || k === 'Q') self._events.emit('tool:ui', 'select');
    if (k === 'w' || k === 'W') self._events.emit('tool:ui', 'translate');
    if (k === 'e' || k === 'E') self._events.emit('tool:ui', 'rotate');
    if (k === 'r' || k === 'R') self._events.emit('tool:ui', 'scale');
    if ((k === 'f' || k === 'F') && self._selection.selected)
      self._events.emit('camera:focus', self._selection.selected);
    if ((k === 'Delete' || k === 'Backspace') && self._selection.selected)
      self._events.emit('object:delete', self._selection.selected);
  });
};
