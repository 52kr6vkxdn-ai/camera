/* NOVA Engine — EditorCamera */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.EditorCamera = function(domElement, camera) {
  var THREE = window.THREE;
  this.domElement = domElement;
  this.camera     = camera;

  this._spherical       = new THREE.Spherical();
  this._target          = new THREE.Vector3();
  this._isDragging      = false;
  this._isPanning       = false;
  this._lastMouse       = { x: 0, y: 0 };
  this._moveSpeed       = 0.3;
  this._orbitSensitivity = 0.005;
  this._panSensitivity  = 0.002;
  this._zoomSpeed       = 1.1;

  // init spherical from camera position
  var v = new THREE.Vector3().copy(camera.position).sub(this._target);
  this._spherical.setFromVector3(v);

  this._bindEvents();
};

NOVA.EditorCamera.prototype.update = function(dt, input) {
  this._flyUpdate(dt, input);
};

NOVA.EditorCamera.prototype.focusOn = function(object) {
  var THREE = window.THREE;
  var box    = new THREE.Box3().setFromObject(object);
  var center = box.getCenter(new THREE.Vector3());
  var size   = box.getSize(new THREE.Vector3()).length();
  this._target.copy(center);
  this._spherical.radius = size * 2;
  this._applySpherical();
};

NOVA.EditorCamera.prototype.setMoveSpeed = function(v) { this._moveSpeed = parseFloat(v); };
NOVA.EditorCamera.prototype.getMoveSpeed = function()  { return this._moveSpeed; };

NOVA.EditorCamera.prototype._bindEvents = function() {
  var self = this;
  var el   = this.domElement;
  el.addEventListener('mousedown',    function(e) { self._onMouseDown(e); });
  el.addEventListener('mousemove',    function(e) { self._onMouseMove(e); });
  el.addEventListener('mouseup',      function()  { self._onMouseUp(); });
  el.addEventListener('wheel',        function(e) { self._onWheel(e); }, { passive: false });
  el.addEventListener('contextmenu',  function(e) { e.preventDefault(); });
};

NOVA.EditorCamera.prototype._onMouseDown = function(e) {
  if (e.button === 2) this._isDragging = true;
  if (e.button === 1) { this._isPanning = true; e.preventDefault(); }
  this._lastMouse = { x: e.clientX, y: e.clientY };
};

NOVA.EditorCamera.prototype._onMouseMove = function(e) {
  var THREE = window.THREE;
  var dx = e.clientX - this._lastMouse.x;
  var dy = e.clientY - this._lastMouse.y;
  this._lastMouse = { x: e.clientX, y: e.clientY };

  if (this._isDragging) {
    this._spherical.theta -= dx * this._orbitSensitivity;
    this._spherical.phi   -= dy * this._orbitSensitivity;
    this._spherical.phi    = Math.max(0.05, Math.min(Math.PI - 0.05, this._spherical.phi));
    this._applySpherical();
  }
  if (this._isPanning) {
    var forward = new THREE.Vector3();
    var right   = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    right.crossVectors(forward, this.camera.up).normalize();
    var v = new THREE.Vector3();
    v.copy(right).multiplyScalar(-dx * this._panSensitivity * this._spherical.radius);
    this._target.add(v);
    v.copy(this.camera.up).normalize().multiplyScalar(dy * this._panSensitivity * this._spherical.radius);
    this._target.add(v);
    this._applySpherical();
  }
};

NOVA.EditorCamera.prototype._onMouseUp = function() {
  this._isDragging = false;
  this._isPanning  = false;
};

NOVA.EditorCamera.prototype._onWheel = function(e) {
  e.preventDefault();
  var factor = e.deltaY > 0 ? this._zoomSpeed : 1 / this._zoomSpeed;
  this._spherical.radius = Math.max(0.1, Math.min(500, this._spherical.radius * factor));
  this._applySpherical();
};

NOVA.EditorCamera.prototype._flyUpdate = function(dt, input) {
  if (!input) return;
  var THREE   = window.THREE;
  var speed   = this._moveSpeed * 10 * dt;
  var forward = new THREE.Vector3();
  var right   = new THREE.Vector3();
  this.camera.getWorldDirection(forward);
  right.crossVectors(forward, this.camera.up).normalize();

  var moved = false;
  if (input.isKeyDown('KeyA'))      { this.camera.position.addScaledVector(right,   -speed); moved = true; }
  if (input.isKeyDown('KeyD'))      { this.camera.position.addScaledVector(right,    speed); moved = true; }
  if (input.isKeyDown('ArrowUp'))   { this.camera.position.addScaledVector(forward,  speed); moved = true; }
  if (input.isKeyDown('ArrowDown')) { this.camera.position.addScaledVector(forward, -speed); moved = true; }
  if (input.isKeyDown('ArrowLeft')) { this.camera.position.addScaledVector(right,   -speed); moved = true; }
  if (input.isKeyDown('ArrowRight')){ this.camera.position.addScaledVector(right,    speed); moved = true; }

  if (moved) {
    var v = new THREE.Vector3().copy(this.camera.position).sub(this._target);
    this._spherical.setFromVector3(v);
  }
};

NOVA.EditorCamera.prototype._applySpherical = function() {
  var THREE = window.THREE;
  var v = new THREE.Vector3().setFromSpherical(this._spherical).add(this._target);
  this.camera.position.copy(v);
  this.camera.lookAt(this._target);
};
