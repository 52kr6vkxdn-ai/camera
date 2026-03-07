/* NOVA Engine — InputManager */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.InputManager = function(domElement) {
  this.domElement    = domElement;
  this._keys         = {};
  this._keysJustDown = {};
  this._mouse        = { x: 0, y: 0, buttons: 0 };
  this._bind();
};

NOVA.InputManager.prototype.isKeyDown     = function(code) { return !!this._keys[code]; };
NOVA.InputManager.prototype.isKeyJustDown = function(code) { return !!this._keysJustDown[code]; };
NOVA.InputManager.prototype.getMouse      = function()     { return { x: this._mouse.x, y: this._mouse.y, buttons: this._mouse.buttons }; };
NOVA.InputManager.prototype.flush         = function()     { this._keysJustDown = {}; };

NOVA.InputManager.prototype._bind = function() {
  var self = this;
  this._onKeyDown = function(e) { self._keys[e.code] = true; self._keysJustDown[e.code] = true; };
  this._onKeyUp   = function(e) { delete self._keys[e.code]; };
  this._onMouseMove = function(e) {
    var rect = self.domElement.getBoundingClientRect();
    self._mouse.x       = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
    self._mouse.y       = ((e.clientY - rect.top)  / rect.height) * -2 + 1;
    self._mouse.buttons = e.buttons;
  };
  window.addEventListener('keydown', this._onKeyDown);
  window.addEventListener('keyup',   this._onKeyUp);
  this.domElement.addEventListener('mousemove', this._onMouseMove);
};
