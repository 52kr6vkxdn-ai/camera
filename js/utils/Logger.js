/* NOVA Engine — Logger */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.Logger = function(events) {
  this._events = events;
};
NOVA.Logger.prototype.debug = function(msg, data) { this._log('debug', msg, data); };
NOVA.Logger.prototype.info  = function(msg, data) { this._log('info',  msg, data); };
NOVA.Logger.prototype.warn  = function(msg, data) { this._log('warn',  msg, data); };
NOVA.Logger.prototype.error = function(msg, data) { this._log('error', msg, data); };
NOVA.Logger.prototype._log  = function(level, msg, data) {
  var entry = {
    level: level,
    msg: typeof msg === 'string' ? msg : JSON.stringify(msg),
    data: data,
    timestamp: new Date().toLocaleTimeString()
  };
  if (this._events) this._events.emit('log', entry);
  var fn = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  console[fn]('[NOVA ' + level.toUpperCase() + ']', entry.msg, data || '');
};
