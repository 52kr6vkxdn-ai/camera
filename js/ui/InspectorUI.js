/* NOVA Engine — InspectorUI */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.InspectorUI = function(container, selection, sceneManager, events, history) {
  this._el      = container;
  this._sel     = selection;
  this._scene   = sceneManager;
  this._events  = events;
  this._history = history;
  var self = this;
  if (events) events.on('selection:changed', function(obj) { self._render(obj); });
};

NOVA.InspectorUI.prototype._render = function(obj) {
  if (!this._el) return;
  if (!obj) { this._el.innerHTML = INSPECTOR_EMPTY; return; }
  var html = this._buildHeader(obj) + this._buildTransform(obj);
  if (obj.isMesh && obj.material) html += this._buildMaterial(obj);
  if (obj.isLight)                html += this._buildLight(obj);
  this._el.innerHTML = html;
  this._bindTransformInputs(obj);
  this._bindMaterialInputs(obj);
  this._bindLightInputs(obj);
};

NOVA.InspectorUI.prototype._buildHeader = function(obj) {
  return '<div class="inspector-header">' +
    '<input class="inspector-name" id="inp-name" value="' + _esc(obj.name) + '" />' +
    '<label class="inspector-toggle"><input type="checkbox" id="inp-visible" ' + (obj.visible ? 'checked' : '') + '><span>Visible</span></label>' +
    '</div>';
};

NOVA.InspectorUI.prototype._buildTransform = function(obj) {
  var p = obj.position, r = obj.rotation, s = obj.scale;
  var deg = function(v) { return (v * 180 / Math.PI).toFixed(2); };
  return '<div class="inspector-section"><div class="section-title">Transform</div><div class="prop-grid">' +
    _xyz('pos', 'Position', [p.x.toFixed(3), p.y.toFixed(3), p.z.toFixed(3)]) +
    _xyz('rot', 'Rotation', [deg(r.x), deg(r.y), deg(r.z)]) +
    _xyz('scl', 'Scale',    [s.x.toFixed(3), s.y.toFixed(3), s.z.toFixed(3)]) +
    '</div></div>';
};

NOVA.InspectorUI.prototype._buildMaterial = function(obj) {
  var m   = obj.material;
  var hex = '#' + ((m.color ? m.color.getHex() : 0xffffff).toString(16).padStart(6, '0'));
  return '<div class="inspector-section"><div class="section-title">Material</div>' +
    '<div class="prop-row"><label>Color</label><input type="color" id="inp-color" value="' + hex + '"></div>' +
    '<div class="prop-row"><label>Roughness</label><input type="range" id="inp-roughness" min="0" max="1" step="0.01" value="' + (m.roughness || 0.5) + '"><span class="range-val" id="val-roughness">' + (m.roughness || 0.5).toFixed(2) + '</span></div>' +
    '<div class="prop-row"><label>Metalness</label><input type="range" id="inp-metalness" min="0" max="1" step="0.01" value="' + (m.metalness || 0) + '"><span class="range-val" id="val-metalness">' + (m.metalness || 0).toFixed(2) + '</span></div>' +
    '<div class="prop-row"><label>Wireframe</label><input type="checkbox" id="inp-wireframe" ' + (m.wireframe ? 'checked' : '') + '></div>' +
    '</div>';
};

NOVA.InspectorUI.prototype._buildLight = function(obj) {
  var hex = '#' + ((obj.color ? obj.color.getHex() : 0xffffff).toString(16).padStart(6, '0'));
  return '<div class="inspector-section"><div class="section-title">Light</div>' +
    '<div class="prop-row"><label>Color</label><input type="color" id="inp-light-color" value="' + hex + '"></div>' +
    '<div class="prop-row"><label>Intensity</label><input type="range" id="inp-intensity" min="0" max="10" step="0.1" value="' + (obj.intensity || 1) + '"><span class="range-val" id="val-intensity">' + (obj.intensity || 1).toFixed(1) + '</span></div>' +
    (obj.isPointLight || obj.isSpotLight ? '<div class="prop-row"><label>Distance</label><input type="range" id="inp-distance" min="0" max="100" step="0.5" value="' + (obj.distance || 20) + '"><span class="range-val" id="val-distance">' + (obj.distance || 20).toFixed(1) + '</span></div>' : '') +
    '<div class="prop-row"><label>Cast Shadow</label><input type="checkbox" id="inp-castshadow" ' + (obj.castShadow ? 'checked' : '') + '></div>' +
    '</div>';
};

NOVA.InspectorUI.prototype._bindTransformInputs = function(obj) {
  var self    = this;
  var el      = this._el;
  var events  = this._events;

  var nameEl = el.querySelector('#inp-name');
  if (nameEl) nameEl.addEventListener('change', function(e) {
    obj.name = e.target.value;
    if (events) events.emit('scene:changed', {});
  });

  var visEl = el.querySelector('#inp-visible');
  if (visEl) visEl.addEventListener('change', function(e) { obj.visible = e.target.checked; });

  var axes = ['x','y','z'];
  function bindAxes(prefix, prop, transform) {
    axes.forEach(function(ax) {
      var inp = el.querySelector('#inp-' + prefix + '-' + ax);
      if (inp) inp.addEventListener('change', function(e) {
        var v = parseFloat(e.target.value) || 0;
        obj[prop][ax] = transform ? transform(v) : v;
      });
    });
  }
  bindAxes('pos', 'position');
  bindAxes('rot', 'rotation', function(v) { return v * Math.PI / 180; });
  bindAxes('scl', 'scale');
};

NOVA.InspectorUI.prototype._bindMaterialInputs = function(obj) {
  if (!obj.isMesh || !obj.material) return;
  var el = this._el;
  var m  = obj.material;

  var colorEl = el.querySelector('#inp-color');
  if (colorEl) colorEl.addEventListener('input', function(e) { if (m.color) m.color.set(e.target.value); });

  function bindRange(id, valId, prop) {
    var inp = el.querySelector(id);
    if (!inp) return;
    inp.addEventListener('input', function(e) {
      var v = parseFloat(e.target.value);
      m[prop] = v;
      var vEl = el.querySelector(valId);
      if (vEl) vEl.textContent = v.toFixed(2);
    });
  }
  bindRange('#inp-roughness', '#val-roughness', 'roughness');
  bindRange('#inp-metalness', '#val-metalness', 'metalness');

  var wfEl = el.querySelector('#inp-wireframe');
  if (wfEl) wfEl.addEventListener('change', function(e) { m.wireframe = e.target.checked; });
};

NOVA.InspectorUI.prototype._bindLightInputs = function(obj) {
  if (!obj.isLight) return;
  var el = this._el;

  var lcEl = el.querySelector('#inp-light-color');
  if (lcEl) lcEl.addEventListener('input', function(e) { if (obj.color) obj.color.set(e.target.value); });

  function bindRange(id, valId, prop, dec) {
    dec = dec || 1;
    var inp = el.querySelector(id);
    if (!inp) return;
    inp.addEventListener('input', function(e) {
      var v = parseFloat(e.target.value);
      obj[prop] = v;
      var vEl = el.querySelector(valId);
      if (vEl) vEl.textContent = v.toFixed(dec);
    });
  }
  bindRange('#inp-intensity', '#val-intensity', 'intensity');
  bindRange('#inp-distance',  '#val-distance',  'distance');

  var csEl = el.querySelector('#inp-castshadow');
  if (csEl) csEl.addEventListener('change', function(e) { obj.castShadow = e.target.checked; });
};

var INSPECTOR_EMPTY = '<div class="empty-state"><i class="fa-solid fa-circle-info" style="font-size:24px"></i><p>Select an object to edit its properties.</p></div>';

function _xyz(prefix, label, vals) {
  return '<div class="prop-xyz"><label>' + label + '</label><div class="xyz-inputs">' +
    '<label class="axis x">X<input type="number" id="inp-' + prefix + '-x" step="0.1" value="' + vals[0] + '"></label>' +
    '<label class="axis y">Y<input type="number" id="inp-' + prefix + '-y" step="0.1" value="' + vals[1] + '"></label>' +
    '<label class="axis z">Z<input type="number" id="inp-' + prefix + '-z" step="0.1" value="' + vals[2] + '"></label>' +
    '</div></div>';
}

function _esc(str) { return String(str).replace(/"/g, '&quot;'); }
