/**
 * NOVA Engine — SceneManager
 * Owns the Three.js scene, tracks objects & lights, manages the grid helper.
 */

import * as THREE from 'three';

export class SceneManager {
  constructor(renderer) {
    this._renderer = renderer;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1e);
    this.scene.fog = new THREE.FogExp2(0x1a1a1e, 0.008);

    /** @type {Map<string, THREE.Object3D>} */
    this.objects = new Map();
    /** @type {Set<THREE.Light>} */
    this.lights = new Set();

    this._grid = null;
    this._gridVisible = true;
    this._idCounter = 0;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  add(object, name = null) {
    if (!object.userData.novaId) {
      object.userData.novaId = `obj_${++this._idCounter}`;
    }
    if (name) object.name = name;
    this.scene.add(object);
    this.objects.set(object.userData.novaId, object);
    if (object.isLight) this.lights.add(object);
    return object;
  }

  remove(object) {
    this.scene.remove(object);
    this.objects.delete(object.userData.novaId);
    if (object.isLight) this.lights.delete(object);
    // Recursively clean children
    object.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });
  }

  getById(id) {
    return this.objects.get(id) || null;
  }

  getAll() {
    return [...this.objects.values()];
  }

  getObjectCount() {
    return this.objects.size;
  }

  getLightCount() {
    return this.lights.size;
  }

  // ── Grid ─────────────────────────────────────────────────────────────────

  buildGrid() {
    if (this._grid) {
      this.scene.remove(this._grid);
      this._grid.dispose();
    }
    this._grid = new THREE.GridHelper(100, 100, 0x333340, 0x252530);
    this._grid.material.transparent = true;
    this._grid.material.opacity = 0.6;
    this._grid.userData.isGrid = true;
    if (this._gridVisible) this.scene.add(this._grid);
  }

  setGridVisible(visible) {
    this._gridVisible = visible;
    if (visible && this._grid && !this._grid.parent) {
      this.scene.add(this._grid);
    } else if (!visible && this._grid?.parent) {
      this.scene.remove(this._grid);
    }
  }

  isGridVisible() {
    return this._gridVisible;
  }

  // ── Serialization helpers ─────────────────────────────────────────────────

  clear() {
    const ids = [...this.objects.keys()];
    ids.forEach(id => {
      const obj = this.objects.get(id);
      this.remove(obj);
    });
  }
}
