/**
 * NOVA Engine — PostProcessing
 * Manages EffectComposer with bloom post-processing.
 * Gracefully degrades if postprocessing addons aren't available.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class PostProcessing {
  constructor(renderer, scene, camera) {
    this._renderer = renderer;
    this._scene    = scene;
    this._camera   = camera;
    this._bloomEnabled = false;
    this._composer = null;

    this._setupComposer(scene, camera);

    window.addEventListener('resize', () => this._onResize());
  }

  // ── Public API ────────────────────────────────────────────────────────────

  setBloom(enabled) {
    this._bloomEnabled = enabled;
    if (this._bloomPass) this._bloomPass.enabled = enabled;
  }

  isBloomEnabled() { return this._bloomEnabled; }

  render(scene, camera) {
    if (this._composer) {
      // Update passes with current scene/camera in case they changed
      this._renderPass.scene  = scene;
      this._renderPass.camera = camera;
      this._composer.render();
    } else {
      this._renderer.render(scene, camera);
    }
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _setupComposer(scene, camera) {
    try {
      const size = new THREE.Vector2();
      this._renderer.getSize(size);

      this._composer = new EffectComposer(this._renderer);

      this._renderPass = new RenderPass(scene, camera);
      this._composer.addPass(this._renderPass);

      this._bloomPass = new UnrealBloomPass(size, 0.6, 0.4, 0.85);
      this._bloomPass.enabled = false;
      this._composer.addPass(this._bloomPass);

      this._outputPass = new OutputPass();
      this._composer.addPass(this._outputPass);
    } catch (e) {
      console.warn('PostProcessing: EffectComposer not available, using raw render.', e);
      this._composer = null;
    }
  }

  _onResize() {
    if (!this._composer) return;
    const w = this._renderer.domElement.clientWidth;
    const h = this._renderer.domElement.clientHeight;
    this._composer.setSize(w, h);
  }
}
