/**
 * NOVA Engine — InspectorUI
 * Renders transform, material, and light properties for the selected object.
 */

import * as THREE from 'three';

export class InspectorUI {
  constructor(container, selection, sceneManager, events, history) {
    this._el       = container;
    this._sel      = selection;
    this._scene    = sceneManager;
    this._events   = events;
    this._history  = history;

    events?.on('selection:changed', obj => this._render(obj));
  }

  _render(obj) {
    if (!this._el) return;
    if (!obj) { this._el.innerHTML = EMPTY_STATE; return; }

    const sections = [
      this._buildHeader(obj),
      this._buildTransform(obj),
    ];

    if (obj.isMesh && obj.material) sections.push(this._buildMaterial(obj));
    if (obj.isLight)                sections.push(this._buildLight(obj));

    this._el.innerHTML = sections.join('');
    this._bindTransformInputs(obj);
    this._bindMaterialInputs(obj);
    this._bindLightInputs(obj);
  }

  // ── Builders ──────────────────────────────────────────────────────────────

  _buildHeader(obj) {
    return `
      <div class="inspector-header">
        <input class="inspector-name" id="inp-name" value="${_esc(obj.name)}" />
        <label class="inspector-toggle">
          <input type="checkbox" id="inp-visible" ${obj.visible ? 'checked' : ''}>
          <span>Visible</span>
        </label>
      </div>`;
  }

  _buildTransform(obj) {
    const p = obj.position, r = obj.rotation, s = obj.scale;
    const deg = v => THREE.MathUtils.radToDeg(v).toFixed(2);
    return `
      <div class="inspector-section">
        <div class="section-title">Transform</div>
        <div class="prop-grid">
          ${xyz('pos', 'Position', [p.x.toFixed(3), p.y.toFixed(3), p.z.toFixed(3)])}
          ${xyz('rot', 'Rotation', [deg(r.x), deg(r.y), deg(r.z)])}
          ${xyz('scl', 'Scale',    [s.x.toFixed(3), s.y.toFixed(3), s.z.toFixed(3)])}
        </div>
      </div>`;
  }

  _buildMaterial(obj) {
    const m = obj.material;
    const hex = '#' + (m.color?.getHex()?.toString(16).padStart(6,'0') ?? 'ffffff');
    return `
      <div class="inspector-section">
        <div class="section-title">Material</div>
        <div class="prop-row">
          <label>Color</label>
          <input type="color" id="inp-color" value="${hex}">
        </div>
        <div class="prop-row">
          <label>Roughness</label>
          <input type="range" id="inp-roughness" min="0" max="1" step="0.01" value="${m.roughness ?? 0.5}">
          <span class="range-val" id="val-roughness">${(m.roughness ?? 0.5).toFixed(2)}</span>
        </div>
        <div class="prop-row">
          <label>Metalness</label>
          <input type="range" id="inp-metalness" min="0" max="1" step="0.01" value="${m.metalness ?? 0}">
          <span class="range-val" id="val-metalness">${(m.metalness ?? 0).toFixed(2)}</span>
        </div>
        <div class="prop-row">
          <label>Wireframe</label>
          <input type="checkbox" id="inp-wireframe" ${m.wireframe ? 'checked' : ''}>
        </div>
      </div>`;
  }

  _buildLight(obj) {
    const hex = '#' + (obj.color?.getHex()?.toString(16).padStart(6,'0') ?? 'ffffff');
    return `
      <div class="inspector-section">
        <div class="section-title">Light</div>
        <div class="prop-row">
          <label>Color</label>
          <input type="color" id="inp-light-color" value="${hex}">
        </div>
        <div class="prop-row">
          <label>Intensity</label>
          <input type="range" id="inp-intensity" min="0" max="10" step="0.1" value="${obj.intensity ?? 1}">
          <span class="range-val" id="val-intensity">${(obj.intensity ?? 1).toFixed(1)}</span>
        </div>
        ${obj.isPointLight || obj.isSpotLight ? `
        <div class="prop-row">
          <label>Distance</label>
          <input type="range" id="inp-distance" min="0" max="100" step="0.5" value="${obj.distance ?? 20}">
          <span class="range-val" id="val-distance">${(obj.distance ?? 20).toFixed(1)}</span>
        </div>` : ''}
        <div class="prop-row">
          <label>Cast Shadow</label>
          <input type="checkbox" id="inp-castshadow" ${obj.castShadow ? 'checked' : ''}>
        </div>
      </div>`;
  }

  // ── Binding ───────────────────────────────────────────────────────────────

  _bindTransformInputs(obj) {
    this._el?.querySelector('#inp-name')?.addEventListener('change', e => {
      obj.name = e.target.value; this._events?.emit('scene:changed', {});
    });
    this._el?.querySelector('#inp-visible')?.addEventListener('change', e => {
      obj.visible = e.target.checked;
    });

    const axes = ['x','y','z'];
    const bind = (prefix, prop, transform) => {
      axes.forEach(ax => {
        const el = this._el?.querySelector(`#inp-${prefix}-${ax}`);
        el?.addEventListener('change', e => {
          const v = parseFloat(e.target.value) || 0;
          obj[prop][ax] = transform ? transform(v) : v;
        });
      });
    };

    bind('pos', 'position');
    bind('rot', 'rotation', v => THREE.MathUtils.degToRad(v));
    bind('scl', 'scale');
  }

  _bindMaterialInputs(obj) {
    if (!obj.isMesh || !obj.material) return;
    const m = obj.material;

    this._el?.querySelector('#inp-color')?.addEventListener('input', e => {
      m.color?.set(e.target.value);
    });

    const bindRange = (id, valId, prop) => {
      this._el?.querySelector(id)?.addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        m[prop] = v;
        const valEl = this._el?.querySelector(valId);
        if (valEl) valEl.textContent = v.toFixed(2);
      });
    };
    bindRange('#inp-roughness', '#val-roughness', 'roughness');
    bindRange('#inp-metalness', '#val-metalness', 'metalness');

    this._el?.querySelector('#inp-wireframe')?.addEventListener('change', e => {
      m.wireframe = e.target.checked;
    });
  }

  _bindLightInputs(obj) {
    if (!obj.isLight) return;

    this._el?.querySelector('#inp-light-color')?.addEventListener('input', e => {
      obj.color?.set(e.target.value);
    });

    const bindRange = (id, valId, prop, decimals = 1) => {
      this._el?.querySelector(id)?.addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        obj[prop] = v;
        const valEl = this._el?.querySelector(valId);
        if (valEl) valEl.textContent = v.toFixed(decimals);
      });
    };
    bindRange('#inp-intensity', '#val-intensity', 'intensity');
    bindRange('#inp-distance',  '#val-distance',  'distance');

    this._el?.querySelector('#inp-castshadow')?.addEventListener('change', e => {
      obj.castShadow = e.target.checked;
    });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const EMPTY_STATE = `
  <div class="empty-state">
    <i class="fa-solid fa-circle-info" style="font-size:24px"></i>
    <p>Select an object to edit its properties.</p>
  </div>`;

function xyz(prefix, label, vals) {
  const [x, y, z] = vals;
  return `
    <div class="prop-xyz">
      <label>${label}</label>
      <div class="xyz-inputs">
        <label class="axis x">X<input type="number" id="inp-${prefix}-x" step="0.1" value="${x}"></label>
        <label class="axis y">Y<input type="number" id="inp-${prefix}-y" step="0.1" value="${y}"></label>
        <label class="axis z">Z<input type="number" id="inp-${prefix}-z" step="0.1" value="${z}"></label>
      </div>
    </div>`;
}

function _esc(str) {
  return String(str).replace(/"/g, '&quot;');
}
