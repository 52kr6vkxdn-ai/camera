/* NOVA Engine — EventBus */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.EventBus = function() {
  this._handlers = {};
};
NOVA.EventBus.prototype.on = function(event, handler) {
  if (!this._handlers[event]) this._handlers[event] = [];
  this._handlers[event].push(handler);
};
NOVA.EventBus.prototype.off = function(event, handler) {
  var list = this._handlers[event];
  if (!list) return;
  var idx = list.indexOf(handler);
  if (idx !== -1) list.splice(idx, 1);
};
NOVA.EventBus.prototype.emit = function(event, data) {
  var list = this._handlers[event];
  if (!list) return;
  list.slice().forEach(function(h) { h(data); });
};
NOVA.EventBus.prototype.once = function(event, handler) {
  var self = this;
  var wrapper = function(data) { handler(data); self.off(event, wrapper); };
  this.on(event, wrapper);
};
