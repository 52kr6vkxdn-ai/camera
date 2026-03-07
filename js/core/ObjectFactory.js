/**
 * NOVA Engine — ObjectFactory
 * Creates all supported primitives and lights, wires up undo/redo.
 */

import * as THREE from 'three';

// ── Material helpers ──────────────────────────────────────────────────────────

function pbr(color = 0x888888, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.6,
    metalness: opts.metalness ?? 0.1,
    ...opts,
  });
}

// ── Geometry registry ─────────────────────────────────────────────────────────

const GEO = {
  cube:       () => new THREE.BoxGeometry(1, 1, 1),
  sphere:     () => new THREE.SphereGeometry(0.5, 32, 24),
  plane:      () => new THREE.PlaneGeometry(2, 2),
  capsule:    () => new THREE.CapsuleGeometry(0.35, 0.7, 8, 24),
  cylinder:   () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
  cone:       () => new THREE.ConeGeometry(0.5, 1, 32),
  torus:      () => new THREE.TorusGeometry(0.5, 0.2, 16, 64),
  'torus-knot': () => new THREE.TorusKnotGeometry(0.4, 0.15, 128, 16),
  icosphere:  () => new THREE.IcosahedronGeometry(0.5, 2),
  octahedron: () => new THREE.OctahedronGeometry(0.5),
};

const GEO_COLORS = {
  cube:       0x5b8dee,
  sphere:     0xb07fe8,
  plane:      0x4ecdc4,
  capsule:    0x54d4e0,
  cylinder:   0xf4a261,
  cone:       0xa1887f,
  torus:      0xf06292,
  'torus-knot': 0x66bb6a,
  icosphere:  0xffd166,
  octahedron: 0x80cbc4,
};

export class ObjectFactory {
  constructor(sceneManager, events, history) {
    this._scene   = sceneManager;
    this._events  = events;
    this._history = history;
    this._nameCounters = {};
  }

  // ── Public API ──────────────────────────────────────────────────────────

  createPrimitive(type) {
    const geoFn = GEO[type];
    if (!geoFn) { console.warn(`Unknown primitive: ${type}`); return null; }

    const geo = geoFn();
    const mat = pbr(GEO_COLORS[type] ?? 0x888888);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = this._uniqueName(type);
    mesh.userData.type = type;

    const obj = this._scene.add(mesh);
    this._history?.push({
      do:   () => this._scene.add(obj),
      undo: () => this._scene.remove(obj),
    });
    this._events?.emit('scene:changed', { added: obj });
    return obj;
  }

  createLight(type) {
    let light;
    switch (type) {
      case 'dirLight': {
        light = new THREE.DirectionalLight(0xffffff, 1.5);
        light.position.set(5, 8, 3);
        light.castShadow = true;
        light.shadow.mapSize.set(2048, 2048);
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 100;
        light.shadow.camera.left = light.shadow.camera.bottom = -10;
        light.shadow.camera.right = light.shadow.camera.top = 10;
        break;
      }
      case 'pointLight': {
        light = new THREE.PointLight(0xffffff, 1, 20);
        light.position.set(0, 3, 0);
        light.castShadow = true;
        break;
      }
      case 'spotLight': {
        light = new THREE.SpotLight(0xffffff, 1.5);
        light.position.set(3, 6, 3);
        light.angle = Math.PI / 6;
        light.penumbra = 0.2;
        light.castShadow = true;
        break;
      }
      case 'hemiLight': {
        light = new THREE.HemisphereLight(0x87ceeb, 0x3d2b1f, 0.8);
        break;
      }
      case 'areaLight':
      default: {
        // RectAreaLight is used but requires a polyfill in Three.js
        // Fall back to a point light as placeholder
        light = new THREE.PointLight(0xffffff, 1, 15);
        light.position.set(0, 3, 0);
        break;
      }
    }

    light.name = this._uniqueName(type);
    light.userData.type = type;

    const obj = this._scene.add(light);
    this._history?.push({
      do:   () => this._scene.add(obj),
      undo: () => this._scene.remove(obj),
    });
    this._events?.emit('scene:changed', { added: obj });
    return obj;
  }

  /** Create based on type string (auto-routes primitive vs light). */
  create(type) {
    const lightTypes = ['dirLight','pointLight','spotLight','hemiLight','areaLight'];
    return lightTypes.includes(type)
      ? this.createLight(type)
      : this.createPrimitive(type);
  }

  /** Populate a basic default scene. */
  populateDefaults() {
    // Floor plane
    const floor = this.createPrimitive('plane');
    floor.rotation.x = -Math.PI / 2;
    floor.scale.set(10, 10, 10);
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    floor.material.color.set(0x2a2a30);
    floor.material.roughness = 0.9;
    floor.name = 'Floor';

    // A cube
    const cube = this.createPrimitive('cube');
    cube.position.set(0, 0.5, 0);
    cube.name = 'Cube';

    // Ambient light
    const ambient = new THREE.AmbientLight(0x404060, 0.5);
    ambient.name = 'Ambient Light';
    ambient.userData.type = 'ambientLight';
    this._scene.add(ambient);

    // Directional light
    const dir = this.createLight('dirLight');
    dir.name = 'Sun';
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _uniqueName(base) {
    this._nameCounters[base] = (this._nameCounters[base] ?? 0) + 1;
    const n = this._nameCounters[base];
    return n === 1 ? `${base}` : `${base}_${n}`;
  }
}
