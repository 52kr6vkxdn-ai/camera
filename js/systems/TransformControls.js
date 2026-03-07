/**
 * NOVA Engine — TransformControls
 * Wraps Three.js TransformControls; responds to tool mode changes and snap.
 */

import * as THREE from 'three';
import { TransformControls as ThreeTransformControls } from 'three/addons/controls/TransformControls.js';

export class TransformControls {
  constructor(camera, domElement, scene, selection, history, snap, events) {
    this._camera    = camera;
    this._scene     = scene;
    this._selection = selection;
    this._history   = history;
    this._snap      = snap;
    this._events    = events;

    this._controls  = new ThreeTransformControls(camera, domElement);
    this._controls.addEventListener('dragging-changed', e => {
      // Disable orbit while dragging
      events?.emit('transform:dragging', e.value);
    });

    scene.add(this._controls);
    this._mode = 'translate';

    this._listenSelection();
    this._listenEvents();
    this._bindKeys();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  setMode(mode) {
    this._mode = mode;
    this._controls.setMode(mode);
  }

  update() {
    // TransformControls updates itself; kept for extensibility
  }

  detach() {
    this._controls.detach();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _listenSelection() {
    this._events?.on('selection:changed', obj => {
      if (obj) this._controls.attach(obj);
      else      this._controls.detach();
    });
  }

  _listenEvents() {
    this._events?.on('tool:changed', mode => this.setMode(mode));
    this._events?.on('snap:changed', ({ enabled, value }) => {
      if (this._mode === 'translate') {
        this._controls.setTranslationSnap(enabled ? value : null);
        this._controls.setRotationSnap(enabled ? THREE.MathUtils.degToRad(15) : null);
        this._controls.setScaleSnap(enabled ? 0.25 : null);
      }
    });
  }

  _bindKeys() {
    window.addEventListener('keydown', e => {
      if (document.activeElement?.tagName === 'INPUT') return;
      switch (e.key) {
        case 'q': case 'Q': this._events?.emit('tool:ui', 'select');    break;
        case 'w': case 'W': this._events?.emit('tool:ui', 'translate'); break;
        case 'e': case 'E': this._events?.emit('tool:ui', 'rotate');    break;
        case 'r': case 'R': this._events?.emit('tool:ui', 'scale');     break;
        case 'f': case 'F':
          if (this._selection.selected) {
            this._events?.emit('camera:focus', this._selection.selected);
          }
          break;
        case 'Delete': case 'Backspace':
          if (this._selection.selected) {
            this._events?.emit('object:delete', this._selection.selected);
          }
          break;
      }
    });
  }
}
