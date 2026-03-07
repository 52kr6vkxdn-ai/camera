/* NOVA Engine — ProjectUI */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.ProjectUI = function(gridEl, factory, serializer, events, toast) {
  this._el         = gridEl;
  this._factory    = factory;
  this._serializer = serializer;
  this._events     = events;
  this._toast      = toast;
  this._bindAssetGrid();
  this._bindImport();
  this._bindExport();
};

NOVA.ProjectUI.prototype._bindAssetGrid = function() {
  var self = this;
  if (!this._el) return;
  this._el.querySelectorAll('.asset-item[data-create]').forEach(function(item) {
    item.addEventListener('dblclick', function() {
      var obj = self._factory.create(item.dataset.create);
      if (obj) {
        if (self._events) self._events.emit('scene:changed', { added: obj });
        if (self._toast)  self._toast.show('Created ' + obj.name, 'success');
      }
    });
  });
};

NOVA.ProjectUI.prototype._bindImport = function() {
  var self = this;
  var trigger = function() {
    var input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,.glb,.gltf';
    input.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      if (file.name.endsWith('.json')) {
        self._serializer.importFromFile(file).then(function() {
          if (self._events) self._events.emit('scene:changed', {});
          if (self._toast)  self._toast.show('Scene imported', 'success');
        }).catch(function(err) {
          if (self._toast) self._toast.show('Import failed: ' + err.message, 'error');
        });
      } else {
        if (self._toast) self._toast.show('GLB/GLTF import coming soon', 'info');
      }
    });
    input.click();
  };
  var b1 = document.getElementById('btn-import');
  var b2 = document.getElementById('btn-import-asset');
  if (b1) b1.addEventListener('click', trigger);
  if (b2) b2.addEventListener('click', trigger);
};

NOVA.ProjectUI.prototype._bindExport = function() {
  var self = this;
  var doExport = function() {
    self._serializer.downloadExport();
    if (self._toast) self._toast.show('Scene exported', 'success');
  };
  var b1 = document.getElementById('btn-export-scene');
  var b2 = document.getElementById('btn-export-scene-btn');
  if (b1) b1.addEventListener('click', doExport);
  if (b2) b2.addEventListener('click', doExport);
};

/* ─── ToolbarUI ──────────────────────────────────────────────── */

NOVA.ToolbarUI = function(nova) {
  this._nova = nova;
  this._currentTool = 'translate';
  this._bindPlayControls();
  this._bindToolButtons();
  this._bindViewportToggles();
  this._bindSpeedDisplay();
};

NOVA.ToolbarUI.prototype._bindPlayControls = function() {
  var nova    = this._nova;
  var btnPlay = document.getElementById('btn-play');
  var btnPause= document.getElementById('btn-pause');
  var btnStop = document.getElementById('btn-stop');
  var hudMode = document.getElementById('hud-mode');

  var setActive = function(id) {
    [btnPlay, btnPause, btnStop].forEach(function(b) { if (b) b.classList.remove('active'); });
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
  };

  if (btnPlay) btnPlay.addEventListener('click', function() {
    nova.isPlaying = true;
    setActive('btn-play');
    if (hudMode) hudMode.textContent = 'PLAYING';
    if (nova.events) nova.events.emit('play', {});
    if (nova.ui.toast) nova.ui.toast.show('Play mode', 'info', 1500);
  });
  if (btnPause) btnPause.addEventListener('click', function() {
    if (!nova.isPlaying) return;
    setActive('btn-pause');
    if (hudMode) hudMode.textContent = 'PAUSED';
    if (nova.events) nova.events.emit('pause', {});
  });
  if (btnStop) btnStop.addEventListener('click', function() {
    nova.isPlaying = false;
    setActive('btn-stop');
    if (hudMode) hudMode.textContent = 'EDITOR';
    if (nova.events) nova.events.emit('stop', {});
  });

  window.addEventListener('keydown', function(e) {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (nova.isPlaying) { if (btnStop) btnStop.click(); }
      else                { if (btnPlay) btnPlay.click(); }
    }
    if (e.code === 'Escape' && btnStop) btnStop.click();
  });
};

NOVA.ToolbarUI.prototype._bindToolButtons = function() {
  var nova = this._nova;
  var self = this;
  document.querySelectorAll('.tool-btn[data-tool]').forEach(function(btn) {
    if (btn.hasAttribute('data-tool-toggle')) return;
    btn.addEventListener('click', function() {
      var tool = btn.dataset.tool;
      if (tool === 'select') { if (nova.transform) nova.transform.detach(); }
      else { if (nova.events) nova.events.emit('tool:changed', tool); }
      document.querySelectorAll('.tool-btn[data-tool]:not([data-tool-toggle])').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      self._currentTool = tool;
      if (nova.events) nova.events.emit('tool:ui', tool);
    });
  });
  if (nova.events) nova.events.on('tool:ui', function(tool) {
    document.querySelectorAll('.tool-btn[data-tool]:not([data-tool-toggle])').forEach(function(b) {
      b.classList.toggle('active', b.dataset.tool === tool);
    });
  });
};

NOVA.ToolbarUI.prototype._bindViewportToggles = function() {
  var nova = this._nova;

  var gridBtn = document.getElementById('btn-grid');
  if (gridBtn) gridBtn.addEventListener('click', function() {
    var v = nova.scene.isGridVisible();
    nova.scene.setGridVisible(!v);
    gridBtn.classList.toggle('active', !v);
  });

  var snapBtn = document.getElementById('btn-snap');
  if (snapBtn) snapBtn.addEventListener('click', function() {
    var enabled = nova.snap.toggle();
    snapBtn.classList.toggle('active', enabled);
    var si = document.getElementById('snap-indicator');
    if (si) si.classList.toggle('visible', enabled);
    if (nova.events) nova.events.emit('snap:changed', { enabled: enabled, value: nova.snap.gridSize });
    if (nova.ui.toast) nova.ui.toast.show('Snap ' + (enabled ? 'enabled' : 'disabled'), 'info', 1500);
  });

  var bloomBtn = document.getElementById('btn-bloom');
  if (bloomBtn) bloomBtn.addEventListener('click', function() {
    var enabled = !nova.post.isBloomEnabled();
    nova.post.setBloom(enabled);
    bloomBtn.classList.toggle('active', enabled);
    if (nova.ui.toast) nova.ui.toast.show('Bloom ' + (enabled ? 'on' : 'off'), 'info', 1500);
  });

  window.addEventListener('keydown', function(e) {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (e.key === 'g' || e.key === 'G') { if (gridBtn) gridBtn.click(); }
    if (e.key === 'b' || e.key === 'B') { if (bloomBtn) bloomBtn.click(); }
  });
};

NOVA.ToolbarUI.prototype._bindSpeedDisplay = function() {
  var nova  = this._nova;
  var valEl = document.getElementById('move-speed-val');
  if (!valEl) return;
  valEl.addEventListener('wheel', function(e) {
    e.preventDefault();
    var delta = e.deltaY < 0 ? 0.05 : -0.05;
    var speed = Math.max(0.05, Math.min(2, nova.camera.getMoveSpeed() + delta));
    nova.camera.setMoveSpeed(speed);
    valEl.textContent = speed.toFixed(2);
  });
};

/* ─── ContextMenuUI ──────────────────────────────────────────── */

NOVA.ContextMenuUI = function(menuEl, factory, selection, camera, sceneManager, events) {
  this._el        = menuEl;
  this._factory   = factory;
  this._selection = selection;
  this._camera    = camera;
  this._scene     = sceneManager;
  this._events    = events;
  this._bindViewport();
  this._bindItems();
  this._bindDismiss();
  this._bindKeyShortcuts();
  var self = this;
  if (events) events.on('context:open', function(pos) {
    self._show(window.innerWidth / 2, window.innerHeight / 2);
  });
};

NOVA.ContextMenuUI.prototype._bindViewport = function() {
  var self = this;
  var sv = document.getElementById('scene-view');
  if (sv) sv.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    self._show(e.clientX, e.clientY);
  });
};

NOVA.ContextMenuUI.prototype._bindItems = function() {
  var self = this;
  if (!this._el) return;
  this._el.querySelectorAll('.ctx-item[data-action]').forEach(function(item) {
    item.addEventListener('click', function() {
      self._hide();
      self._handleAction(item.dataset.action);
    });
  });
};

NOVA.ContextMenuUI.prototype._bindDismiss = function() {
  var self = this;
  document.addEventListener('click', function(e) { if (self._el && !self._el.contains(e.target)) self._hide(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') self._hide(); });
};

NOVA.ContextMenuUI.prototype._bindKeyShortcuts = function() {
  var self = this;
  var shortcuts = { '1':'cube','2':'sphere','3':'plane','4':'cylinder','5':'dirLight' };
  window.addEventListener('keydown', function(e) {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
    if (shortcuts[e.key]) self._handleAction(shortcuts[e.key]);
  });
};

NOVA.ContextMenuUI.prototype._handleAction = function(action) {
  if (action === 'focus') {
    if (this._selection.selected && this._events) this._events.emit('camera:focus', this._selection.selected);
  } else if (action === 'delete') {
    if (this._selection.selected && this._events) this._events.emit('object:delete', this._selection.selected);
  } else {
    var obj = this._factory.create(action);
    if (obj) {
      if (this._events) this._events.emit('scene:changed', { added: obj });
      this._selection.select(obj);
    }
  }
};

NOVA.ContextMenuUI.prototype._show = function(x, y) {
  if (!this._el) return;
  this._el.style.display = 'block';
  var rect = this._el.getBoundingClientRect();
  this._el.style.left = Math.min(x, window.innerWidth  - rect.width  - 8) + 'px';
  this._el.style.top  = Math.min(y, window.innerHeight - rect.height - 8) + 'px';
};

NOVA.ContextMenuUI.prototype._hide = function() {
  if (this._el) this._el.style.display = 'none';
};

/* ─── MenuUI ─────────────────────────────────────────────────── */

NOVA.MenuUI = function(nova) {
  this._nova = nova;
  var self   = this;
  var menus  = {
    'menu-file':       self._fileMenu(),
    'menu-edit':       self._editMenu(),
    'menu-gameobject': self._gameObjectMenu(),
    'menu-view':       self._viewMenu(),
    'menu-help':       self._helpMenu()
  };
  self._build(menus);
};

NOVA.MenuUI.prototype._fileMenu = function() {
  var n = this._nova;
  return [
    { label: 'New Scene',    action: function() { n.scene.clear(); n.factory.populateDefaults(); if (n.events) n.events.emit('scene:changed', {}); } },
    { label: 'Export Scene', action: function() { n.serializer.downloadExport(); } },
    { label: 'Import Scene…',action: function() { var b = document.getElementById('btn-import-asset'); if (b) b.click(); } },
    { separator: true },
    { label: 'Export Logs',  action: function() { var b = document.getElementById('btn-export-logs'); if (b) b.click(); } }
  ];
};

NOVA.MenuUI.prototype._editMenu = function() {
  var n = this._nova;
  return [
    { label: 'Undo  Ctrl+Z', action: function() { n.history.undo(); } },
    { label: 'Redo  Ctrl+Y', action: function() { n.history.redo(); } },
    { separator: true },
    { label: 'Delete Object',action: function() { if (n.selection.selected && n.events) n.events.emit('object:delete', n.selection.selected); } },
    { label: 'Select All',   action: function() { if (n.ui.toast) n.ui.toast.show('Select all coming soon', 'info'); } }
  ];
};

NOVA.MenuUI.prototype._gameObjectMenu = function() {
  var n = this._nova;
  var make = function(type) { return function() {
    var obj = n.factory.create(type);
    if (obj && n.events) n.events.emit('scene:changed', { added: obj });
    if (obj) n.selection.select(obj);
  }; };
  return [
    { label: 'Cube',       action: make('cube') },
    { label: 'Sphere',     action: make('sphere') },
    { label: 'Plane',      action: make('plane') },
    { label: 'Cylinder',   action: make('cylinder') },
    { separator: true },
    { label: 'Dir Light',  action: make('dirLight') },
    { label: 'Point Light',action: make('pointLight') },
    { label: 'Spot Light', action: make('spotLight') }
  ];
};

NOVA.MenuUI.prototype._viewMenu = function() {
  var n = this._nova;
  return [
    { label: 'Toggle Grid',        action: function() { var b = document.getElementById('btn-grid');  if (b) b.click(); } },
    { label: 'Toggle Bloom',       action: function() { var b = document.getElementById('btn-bloom'); if (b) b.click(); } },
    { label: 'Toggle Snap',        action: function() { var b = document.getElementById('btn-snap');  if (b) b.click(); } },
    { separator: true },
    { label: 'Focus Selected (F)', action: function() { if (n.selection.selected && n.events) n.events.emit('camera:focus', n.selection.selected); } }
  ];
};

NOVA.MenuUI.prototype._helpMenu = function() {
  var n = this._nova;
  return [
    { label: 'Keyboard Shortcuts', action: function() { if (n.ui.toast) n.ui.toast.show('Q/W/E/R: Tools | G: Grid | B: Bloom | F: Focus | Del: Delete | Ctrl+Z/Y: Undo/Redo', 'info', 6000); } },
    { label: 'About NOVA Engine',  action: function() { if (n.ui.toast) n.ui.toast.show('NOVA Engine — Three.js 3D editor', 'info', 4000); } }
  ];
};

NOVA.MenuUI.prototype._build = function(menus) {
  var self = this;
  Object.keys(menus).forEach(function(id) {
    var items   = menus[id];
    var trigger = document.getElementById(id);
    if (!trigger) return;
    var dropdown = document.createElement('div');
    dropdown.className    = 'menu-dropdown';
    dropdown.style.display = 'none';
    items.forEach(function(item) {
      if (item.separator) {
        var sep = document.createElement('div'); sep.className = 'menu-sep';
        dropdown.appendChild(sep); return;
      }
      var el = document.createElement('div');
      el.className   = 'menu-dd-item';
      el.textContent = item.label;
      el.addEventListener('click', function() { if (item.action) item.action(); self._closeAll(); });
      dropdown.appendChild(el);
    });
    trigger.parentElement.style.position = 'relative';
    trigger.parentElement.appendChild(dropdown);
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      var open = dropdown.style.display !== 'none';
      self._closeAll();
      if (!open) dropdown.style.display = 'block';
    });
  });
  document.addEventListener('click', function() { self._closeAll(); });
};

NOVA.MenuUI.prototype._closeAll = function() {
  document.querySelectorAll('.menu-dropdown').forEach(function(d) { d.style.display = 'none'; });
};

/* ─── StatsHUD ───────────────────────────────────────────────── */

NOVA.StatsHUD = function(rendererWrapper, sceneManager, fpsDom, triDom, dcDom, objDom, lightDom, modeDom) {
  this._rw       = rendererWrapper;
  this._scene    = sceneManager;
  this._fpsDom   = fpsDom;
  this._triDom   = triDom;
  this._dcDom    = dcDom;
  this._objDom   = objDom;
  this._lightDom = lightDom;
  this._modeDom  = modeDom;
  this._last     = performance.now();
  this._frames   = 0;
};

NOVA.StatsHUD.prototype.update = function() {
  this._frames++;
  var now     = performance.now();
  var elapsed = now - this._last;
  if (elapsed < 500) return;
  var fps = Math.round((this._frames / elapsed) * 1000);
  this._frames = 0;
  this._last   = now;
  var info = this._rw.renderer.info;
  if (this._fpsDom)   this._fpsDom.textContent   = fps;
  if (this._triDom)   this._triDom.textContent   = _fmtNum(info.render.triangles);
  if (this._dcDom)    this._dcDom.textContent    = info.render.calls;
  if (this._objDom)   this._objDom.textContent   = this._scene.getObjectCount();
  if (this._lightDom) this._lightDom.textContent = this._scene.getLightCount();
  if (this._fpsDom) {
    var badge = this._fpsDom.closest ? this._fpsDom.closest('.stat-badge') : null;
    if (badge) {
      badge.classList.toggle('warn',  fps < 30 && fps >= 15);
      badge.classList.toggle('error', fps < 15);
    }
  }
};

function _fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
  return n;
}
