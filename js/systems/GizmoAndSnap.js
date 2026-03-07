/* NOVA Engine — GizmoSystem */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.GizmoSystem = function(scene, camera) {
  this._scene  = scene;
  this._camera = camera;
  this._helper = null;
};

NOVA.GizmoSystem.prototype.update = function(selected) {
  if (this._helper) {
    this._scene.remove(this._helper);
    this._helper = null;
  }
  if (!selected) return;

  if (selected.isMesh) {
    var box = new THREE.Box3().setFromObject(selected);
    this._helper = new THREE.Box3Helper(box, 0x00d4ff);
    this._helper.userData.isGizmo = true;
    this._scene.add(this._helper);
  }
  if (selected.isLight) {
    if (selected.isDirectionalLight)
      this._helper = new THREE.DirectionalLightHelper(selected, 1, 0xffff00);
    else if (selected.isPointLight)
      this._helper = new THREE.PointLightHelper(selected, 0.3, 0xffff00);
    else if (selected.isSpotLight)
      this._helper = new THREE.SpotLightHelper(selected, 0xffff00);
    if (this._helper) {
      this._helper.userData.isGizmo = true;
      this._scene.add(this._helper);
    }
  }
};

/* ─── SnapSystem ─────────────────────────────────────────────── */

NOVA.SnapSystem = function() {
  this.enabled   = false;
  this.gridSize  = 0.5;
  this.rotDeg    = 15;
  this.scaleFrac = 0.25;
};

NOVA.SnapSystem.prototype.toggle   = function() { this.enabled = !this.enabled; return this.enabled; };
NOVA.SnapSystem.prototype.getLabel = function() { return 'Snap: ' + this.gridSize + 'm'; };
NOVA.SnapSystem.prototype.snap     = function(v) {
  return this.enabled ? Math.round(v / this.gridSize) * this.gridSize : v;
};
