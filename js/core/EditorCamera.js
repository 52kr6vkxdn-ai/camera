/**
 * NOVA Engine — EditorCamera
 * Handles orbit, pan, zoom, and WASD fly camera for the editor.
 */

import * as THREE from 'three';

const _v3 = new THREE.Vector3();
const _right = new THREE.Vector3();
const _forward = new THREE.Vector3();

export class EditorCamera {
  constructor(domElement, camera) {
    this.domElement = domElement;
    this.camera = camera;

    // Orbit state
    this._spherical = new THREE.Spherical();
    this._target = new THREE.Vector3();
    this._isDragging = false;
    this._isPanning = false;
    this._lastMouse = { x: 0, y: 0 };
    this._moveSpeed = 0.3;
    this._orbitSensitivity = 0.005;
    this._panSensitivity = 0.002;
    this._zoomSpeed = 1.1;

    // Set initial spherical from camera position
    _v3.copy(camera.position).sub(this._target);
    this._spherical.setFromVector3(_v3);

    this._bindEvents();
  }

  // ── Public ────────────────────────────────────────────────────────────────

  update(dt, input) {
    this._flyUpdate(dt, input);
  }

  focusOn(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    this._target.copy(center);
    this._spherical.radius = size * 2;
    this._applySpherical();
  }

  setMoveSpeed(val) {
    this._moveSpeed = parseFloat(val);
  }

  getMoveSpeed() {
    return this._moveSpeed;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _bindEvents() {
    const el = this.domElement;
    el.addEventListener('mousedown', e => this._onMouseDown(e));
    el.addEventListener('mousemove', e => this._onMouseMove(e));
    el.addEventListener('mouseup', () => this._onMouseUp());
    el.addEventListener('wheel', e => this._onWheel(e), { passive: false });
    el.addEventListener('contextmenu', e => e.preventDefault());
  }

  _onMouseDown(e) {
    if (e.button === 2) { this._isDragging = true; }
    if (e.button === 1) { this._isPanning = true; e.preventDefault(); }
    this._lastMouse = { x: e.clientX, y: e.clientY };
  }

  _onMouseMove(e) {
    const dx = e.clientX - this._lastMouse.x;
    const dy = e.clientY - this._lastMouse.y;
    this._lastMouse = { x: e.clientX, y: e.clientY };

    if (this._isDragging) {
      this._spherical.theta -= dx * this._orbitSensitivity;
      this._spherical.phi   -= dy * this._orbitSensitivity;
      this._spherical.phi = Math.max(0.05, Math.min(Math.PI - 0.05, this._spherical.phi));
      this._applySpherical();
    }

    if (this._isPanning) {
      this.camera.getWorldDirection(_forward);
      _right.crossVectors(_forward, this.camera.up).normalize();
      _v3.copy(_right).multiplyScalar(-dx * this._panSensitivity * this._spherical.radius);
      this._target.add(_v3);
      _v3.copy(this.camera.up).normalize().multiplyScalar(dy * this._panSensitivity * this._spherical.radius);
      this._target.add(_v3);
      this._applySpherical();
    }
  }

  _onMouseUp() {
    this._isDragging = false;
    this._isPanning = false;
  }

  _onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? this._zoomSpeed : 1 / this._zoomSpeed;
    this._spherical.radius = Math.max(0.1, Math.min(500, this._spherical.radius * factor));
    this._applySpherical();
  }

  _flyUpdate(dt, input) {
    if (!input) return;
    const speed = this._moveSpeed * 10 * dt;
    this.camera.getWorldDirection(_forward);
    _right.crossVectors(_forward, this.camera.up).normalize();

    let moved = false;
    if (input.isKeyDown('KeyA')) { this.camera.position.addScaledVector(_right, -speed); moved = true; }
    if (input.isKeyDown('KeyD')) { this.camera.position.addScaledVector(_right, speed); moved = true; }
    if (input.isKeyDown('ArrowUp')) { this.camera.position.addScaledVector(_forward, speed); moved = true; }
    if (input.isKeyDown('ArrowDown')) { this.camera.position.addScaledVector(_forward, -speed); moved = true; }
    if (input.isKeyDown('ArrowLeft')) { this.camera.position.addScaledVector(_right, -speed); moved = true; }
    if (input.isKeyDown('ArrowRight')) { this.camera.position.addScaledVector(_right, speed); moved = true; }

    if (moved) {
      _v3.copy(this.camera.position).sub(this._target);
      this._spherical.setFromVector3(_v3);
    }
  }

  _applySpherical() {
    _v3.setFromSpherical(this._spherical).add(this._target);
    this.camera.position.copy(_v3);
    this.camera.lookAt(this._target);
  }
}
