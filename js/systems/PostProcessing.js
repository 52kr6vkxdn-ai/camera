/* NOVA Engine — PostProcessing */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.PostProcessing = function(renderer, scene, camera) {
  this._renderer      = renderer;
  this._scene         = scene;
  this._camera        = camera;
  this._bloomEnabled  = false;
  this._composer      = null;
  this._bloomPass     = null;
  this._renderPass    = null;

  this._setup(scene, camera);
  var self = this;
  window.addEventListener('resize', function() { self._onResize(); });
};

NOVA.PostProcessing.prototype._setup = function(scene, camera) {
  try {
    var THREE   = window.THREE;
    var size    = new THREE.Vector2();
    this._renderer.getSize(size);

    this._composer   = new THREE.EffectComposer(this._renderer);
    this._renderPass = new THREE.RenderPass(scene, camera);
    this._composer.addPass(this._renderPass);

    this._bloomPass = new THREE.UnrealBloomPass(size, 0.6, 0.4, 0.85);
    this._bloomPass.enabled = false;
    this._composer.addPass(this._bloomPass);

    this._composer.addPass(new THREE.OutputPass());
  } catch(e) {
    console.warn('PostProcessing unavailable, using plain render.', e);
    this._composer = null;
  }
};

NOVA.PostProcessing.prototype.setBloom = function(enabled) {
  this._bloomEnabled = enabled;
  if (this._bloomPass) this._bloomPass.enabled = enabled;
};

NOVA.PostProcessing.prototype.isBloomEnabled = function() { return this._bloomEnabled; };

NOVA.PostProcessing.prototype.render = function(scene, camera) {
  if (this._composer) {
    if (this._renderPass) { this._renderPass.scene = scene; this._renderPass.camera = camera; }
    this._composer.render();
  } else {
    this._renderer.render(scene, camera);
  }
};

NOVA.PostProcessing.prototype._onResize = function() {
  if (!this._composer) return;
  var w = this._renderer.domElement.clientWidth;
  var h = this._renderer.domElement.clientHeight;
  this._composer.setSize(w, h);
};
