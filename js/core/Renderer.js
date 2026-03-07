/* NOVA Engine — Renderer */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.Renderer = function(container) {
  this.container = container;
  this.renderer  = null;
  this.camera    = null;
};

NOVA.Renderer.prototype.init = function() {
  var THREE = window.THREE;
  this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  this.renderer.shadowMap.enabled = true;
  this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  this.renderer.outputColorSpace  = THREE.SRGBColorSpace;
  this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  this.renderer.toneMappingExposure = 1.0;
  this.container.appendChild(this.renderer.domElement);
  this._setupCamera();
  this._setupResize();
  this._resize();
};

NOVA.Renderer.prototype._setupCamera = function() {
  var THREE = window.THREE;
  var w = this.container.clientWidth;
  var h = this.container.clientHeight;
  this.camera = new THREE.PerspectiveCamera(60, w / h, 0.01, 10000);
  this.camera.position.set(5, 4, 8);
  this.camera.lookAt(0, 0, 0);
};

NOVA.Renderer.prototype._setupResize = function() {
  var self = this;
  window.addEventListener('resize', function() { self._resize(); });
};

NOVA.Renderer.prototype._resize = function() {
  var w = this.container.clientWidth;
  var h = this.container.clientHeight;
  this.renderer.setSize(w, h);
  this.camera.aspect = w / h;
  this.camera.updateProjectionMatrix();
};
