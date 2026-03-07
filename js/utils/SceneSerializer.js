/* NOVA Engine — SceneSerializer */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.SceneSerializer = function(sceneManager, factory) {
  this._scene   = sceneManager;
  this._factory = factory;
};

NOVA.SceneSerializer.prototype.export = function() {
  var objects = [];
  this._scene.getAll().forEach(function(obj) {
    if (obj.userData.isGrid || obj.userData.isGizmo) return;
    var entry = {
      id:       obj.userData.novaId,
      name:     obj.name,
      type:     obj.userData.type || (obj.isLight ? 'light' : 'mesh'),
      position: obj.position.toArray(),
      rotation: obj.rotation.toArray(),
      scale:    obj.scale.toArray()
    };
    if (obj.isMesh && obj.material) {
      entry.color     = obj.material.color ? obj.material.color.getHex() : 0xffffff;
      entry.roughness = obj.material.roughness;
      entry.metalness = obj.material.metalness;
    }
    if (obj.isLight) {
      entry.color     = obj.color ? obj.color.getHex() : 0xffffff;
      entry.intensity = obj.intensity;
    }
    objects.push(entry);
  });
  return JSON.stringify({ version: 1, objects: objects }, null, 2);
};

NOVA.SceneSerializer.prototype.downloadExport = function(filename) {
  filename = filename || 'nova-scene.json';
  var json = this.export();
  var blob = new Blob([json], { type: 'application/json' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

NOVA.SceneSerializer.prototype.importFromFile = function(file) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        self._loadData(data);
        resolve(data);
      } catch(err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

NOVA.SceneSerializer.prototype._loadData = function(data) {
  if (!data.objects) return;
  this._scene.clear();
  var self = this;
  data.objects.forEach(function(entry) {
    var obj = self._factory.create(entry.type);
    if (!obj) return;
    obj.name = entry.name;
    obj.position.fromArray(entry.position);
    obj.rotation.fromArray(entry.rotation);
    obj.scale.fromArray(entry.scale);
    if (entry.color != null) {
      if (obj.isMesh  && obj.material) obj.material.color.setHex(entry.color);
      if (obj.isLight && obj.color)    obj.color.setHex(entry.color);
    }
    if (obj.isMesh && entry.roughness != null) obj.material.roughness = entry.roughness;
    if (obj.isMesh && entry.metalness != null) obj.material.metalness = entry.metalness;
    if (obj.isLight && entry.intensity != null) obj.intensity = entry.intensity;
  });
};
