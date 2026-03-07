/**
 * NOVA Engine — Renderer
 * Wraps Three.js WebGLRenderer and manages resize/camera setup.
 */

import * as THREE from 'three';

export class Renderer {
  constructor(container) {
    this.container = container;
    this.renderer = null;
    this.camera = null;
  }

  async init() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.container.appendChild(this.renderer.domElement);
    this._setupCamera();
    this._setupResize();
    this._resize();
  }

  _setupCamera() {
    const { clientWidth: w, clientHeight: h } = this.container;
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.01, 10000);
    this.camera.position.set(5, 4, 8);
    this.camera.lookAt(0, 0, 0);
  }

  _setupResize() {
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  get domElement() {
    return this.renderer.domElement;
  }
}
