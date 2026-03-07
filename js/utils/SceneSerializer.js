/**
 * NOVA Engine — SceneSerializer
 * Exports and imports the scene as JSON.
 */

import * as THREE from 'three';

export class SceneSerializer {
  constructor(sceneManager, factory) {
    this._scene   = sceneManager;
    this._factory = factory;
  }

  // ── Export ────────────────────────────────────────────────────────────────

  export() {
    const objects = [];
    this._scene.getAll().forEach(obj => {
      if (obj.userData.isGrid || obj.userData.isGizmo) return;
      const entry = {
        id:       obj.userData.novaId,
        name:     obj.name,
        type:     obj.userData.type ?? (obj.isLight ? 'light' : 'mesh'),
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale:    obj.scale.toArray(),
      };
      if (obj.isMesh && obj.material) {
        entry.color    = obj.material.color?.getHex();
        entry.roughness = obj.material.roughness;
        entry.metalness = obj.material.metalness;
      }
      if (obj.isLight) {
        entry.color     = obj.color?.getHex();
        entry.intensity = obj.intensity;
      }
      objects.push(entry);
    });
    return JSON.stringify({ version: 1, objects }, null, 2);
  }

  downloadExport(filename = 'nova-scene.json') {
    const json = this.export();
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Import ────────────────────────────────────────────────────────────────

  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          this._loadData(data);
          resolve(data);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  _loadData(data) {
    if (!data.objects) return;
    this._scene.clear();
    data.objects.forEach(entry => {
      const obj = this._factory.create(entry.type);
      if (!obj) return;
      obj.name = entry.name;
      obj.position.fromArray(entry.position);
      obj.rotation.fromArray(entry.rotation);
      obj.scale.fromArray(entry.scale);
      if (entry.color != null) {
        if (obj.isMesh)  obj.material.color.setHex(entry.color);
        if (obj.isLight) obj.color.setHex(entry.color);
      }
      if (obj.isMesh && entry.roughness != null) obj.material.roughness = entry.roughness;
      if (obj.isMesh && entry.metalness != null) obj.material.metalness = entry.metalness;
      if (obj.isLight && entry.intensity != null) obj.intensity = entry.intensity;
    });
  }
}
