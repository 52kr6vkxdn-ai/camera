/**
 * NOVA Engine — GizmoSystem
 * Draws a selection box outline around the selected object.
 */

import * as THREE from 'three';

export class GizmoSystem {
  constructor(scene, camera) {
    this._scene    = scene;
    this._camera   = camera;
    this._box      = null;
    this._helper   = null;
  }

  update(selected) {
    // Remove old helper
    if (this._helper) {
      this._scene.remove(this._helper);
      this._helper = null;
    }

    if (!selected) return;

    // Box3Helper for meshes
    if (selected.isMesh) {
      const box = new THREE.Box3().setFromObject(selected);
      this._helper = new THREE.Box3Helper(box, 0x00d4ff);
      this._helper.userData.isGizmo = true;
      this._scene.add(this._helper);
    }

    // Light helpers
    if (selected.isLight) {
      if (selected.isDirectionalLight) {
        this._helper = new THREE.DirectionalLightHelper(selected, 1, 0xffff00);
      } else if (selected.isPointLight) {
        this._helper = new THREE.PointLightHelper(selected, 0.3, 0xffff00);
      } else if (selected.isSpotLight) {
        this._helper = new THREE.SpotLightHelper(selected, 0xffff00);
      }
      if (this._helper) {
        this._helper.userData.isGizmo = true;
        this._scene.add(this._helper);
      }
    }
  }
}
