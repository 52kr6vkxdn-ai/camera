/* NOVA Engine — ObjectFactory */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.ObjectFactory = function(sceneManager, events, history) {
  this._scene   = sceneManager;
  this._events  = events;
  this._history = history;
  this._nameCounters = {};
};

NOVA.ObjectFactory._GEO = {
  cube:         function() { return new THREE.BoxGeometry(1, 1, 1); },
  sphere:       function() { return new THREE.SphereGeometry(0.5, 32, 24); },
  plane:        function() { return new THREE.PlaneGeometry(2, 2); },
  capsule:      function() { return new THREE.CapsuleGeometry(0.35, 0.7, 8, 24); },
  cylinder:     function() { return new THREE.CylinderGeometry(0.5, 0.5, 1, 32); },
  cone:         function() { return new THREE.ConeGeometry(0.5, 1, 32); },
  torus:        function() { return new THREE.TorusGeometry(0.5, 0.2, 16, 64); },
  'torus-knot': function() { return new THREE.TorusKnotGeometry(0.4, 0.15, 128, 16); },
  icosphere:    function() { return new THREE.IcosahedronGeometry(0.5, 2); },
  octahedron:   function() { return new THREE.OctahedronGeometry(0.5); }
};

NOVA.ObjectFactory._GEO_COLORS = {
  cube: 0x5b8dee, sphere: 0xb07fe8, plane: 0x4ecdc4, capsule: 0x54d4e0,
  cylinder: 0xf4a261, cone: 0xa1887f, torus: 0xf06292,
  'torus-knot': 0x66bb6a, icosphere: 0xffd166, octahedron: 0x80cbc4
};

NOVA.ObjectFactory._LIGHT_TYPES = ['dirLight','pointLight','spotLight','hemiLight','areaLight'];

NOVA.ObjectFactory.prototype.createPrimitive = function(type) {
  var geoFn = NOVA.ObjectFactory._GEO[type];
  if (!geoFn) { console.warn('Unknown primitive: ' + type); return null; }
  var color = NOVA.ObjectFactory._GEO_COLORS[type] || 0x888888;
  var geo   = geoFn();
  var mat   = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6, metalness: 0.1 });
  var mesh  = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = this._uniqueName(type);
  mesh.userData.type = type;
  var obj = this._scene.add(mesh);
  var scene = this._scene;
  if (this._history) this._history.push({
    do:   function() { scene.add(obj); },
    undo: function() { scene.remove(obj); }
  });
  if (this._events) this._events.emit('scene:changed', { added: obj });
  return obj;
};

NOVA.ObjectFactory.prototype.createLight = function(type) {
  var light;
  switch (type) {
    case 'dirLight':
      light = new THREE.DirectionalLight(0xffffff, 1.5);
      light.position.set(5, 8, 3);
      light.castShadow = true;
      light.shadow.mapSize.set(2048, 2048);
      light.shadow.camera.near = 0.1; light.shadow.camera.far = 100;
      light.shadow.camera.left = light.shadow.camera.bottom = -10;
      light.shadow.camera.right = light.shadow.camera.top = 10;
      break;
    case 'pointLight':
      light = new THREE.PointLight(0xffffff, 1, 20);
      light.position.set(0, 3, 0);
      light.castShadow = true;
      break;
    case 'spotLight':
      light = new THREE.SpotLight(0xffffff, 1.5);
      light.position.set(3, 6, 3);
      light.angle = Math.PI / 6;
      light.penumbra = 0.2;
      light.castShadow = true;
      break;
    case 'hemiLight':
      light = new THREE.HemisphereLight(0x87ceeb, 0x3d2b1f, 0.8);
      break;
    default:
      light = new THREE.PointLight(0xffffff, 1, 15);
      light.position.set(0, 3, 0);
      break;
  }
  light.name = this._uniqueName(type);
  light.userData.type = type;
  var obj   = this._scene.add(light);
  var scene = this._scene;
  if (this._history) this._history.push({
    do:   function() { scene.add(obj); },
    undo: function() { scene.remove(obj); }
  });
  if (this._events) this._events.emit('scene:changed', { added: obj });
  return obj;
};

NOVA.ObjectFactory.prototype.create = function(type) {
  return NOVA.ObjectFactory._LIGHT_TYPES.indexOf(type) !== -1
    ? this.createLight(type)
    : this.createPrimitive(type);
};

NOVA.ObjectFactory.prototype.populateDefaults = function() {
  var floor = this.createPrimitive('plane');
  floor.rotation.x = -Math.PI / 2;
  floor.scale.set(10, 10, 10);
  floor.position.y = -0.001;
  floor.receiveShadow = true;
  floor.material.color.set(0x2a2a30);
  floor.material.roughness = 0.9;
  floor.name = 'Floor';

  var cube = this.createPrimitive('cube');
  cube.position.set(0, 0.5, 0);
  cube.name = 'Cube';

  var ambient = new THREE.AmbientLight(0x404060, 0.5);
  ambient.name = 'Ambient Light';
  ambient.userData.type = 'ambientLight';
  this._scene.add(ambient);

  var dir = this.createLight('dirLight');
  dir.name = 'Sun';
};

NOVA.ObjectFactory.prototype._uniqueName = function(base) {
  this._nameCounters[base] = (this._nameCounters[base] || 0) + 1;
  var n = this._nameCounters[base];
  return n === 1 ? base : base + '_' + n;
};
