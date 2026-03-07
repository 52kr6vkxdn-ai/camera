/**
 * NOVA Engine — SelectionManager
 * Tracks the currently selected Three.js object and emits selection events.
 */

import * as THREE from 'three';

export class SelectionManager {
  constructor(events) {
    this._events  = events;
    this.selected = null;

    // Highlight material overlay
    this._outline = null;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  select(object) {
    if (this.selected === object) return;
    this.selected = object;
    this._events?.emit('selection:changed', object);
  }

  deselect() {
    if (!this.selected) return;
    this.selected = null;
    this._events?.emit('selection:changed', null);
  }

  toggle(object) {
    this.selected === object ? this.deselect() : this.select(object);
  }

  isSelected(object) {
    return this.selected === object;
  }

  /** Pick from screen-space mouse position using a raycaster. */
  pickFromMouse(mouseVec2, camera, objects) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseVec2, camera);
    const meshes = objects.filter(o => !o.userData.isGrid && !o.isLight);
    const hits = raycaster.intersectObjects(meshes, true);
    if (hits.length > 0) {
      let obj = hits[0].object;
      // Walk up to a root scene child
      while (obj.parent && obj.parent.type !== 'Scene') obj = obj.parent;
      this.select(obj);
      return obj;
    }
    this.deselect();
    return null;
  }
}
