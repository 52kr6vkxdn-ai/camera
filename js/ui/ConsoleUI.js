/* NOVA Engine — ConsoleUI */
var NOVA = window.NOVA = window.NOVA || {};

NOVA.ConsoleUI = function(logContainer, logger, events) {
  this._el      = logContainer;
  this._logger  = logger;
  this._events  = events;
  this._entries = [];
  this._filters = { debug: true, info: true, warn: true, error: true };

  this._bindClear();
  this._bindFilters();
  this._bindExport();

  var self = this;
  if (events) events.on('log', function(entry) { self._addEntry(entry); });
};

NOVA.ConsoleUI.prototype._addEntry = function(entry) {
  this._entries.push(entry);
  if (this._filters[entry.level]) this._renderEntry(entry);
};

NOVA.ConsoleUI.prototype._renderEntry = function(entry) {
  if (!this._el) return;
  var row = document.createElement('div');
  row.className = 'log-row log-' + entry.level;
  row.innerHTML =
    '<span class="log-time">' + entry.timestamp + '</span>' +
    '<span class="log-badge ' + entry.level + '">' + entry.level.toUpperCase() + '</span>' +
    '<span class="log-msg">' + _escHtml(entry.msg) + '</span>';
  this._el.appendChild(row);
  this._el.scrollTop = this._el.scrollHeight;
};

NOVA.ConsoleUI.prototype._rebuildList = function() {
  if (!this._el) return;
  this._el.innerHTML = '';
  var self = this;
  this._entries.forEach(function(e) {
    if (self._filters[e.level]) self._renderEntry(e);
  });
};

NOVA.ConsoleUI.prototype._bindClear = function() {
  var self = this;
  var btn = document.getElementById('btn-clear-console');
  if (btn) btn.addEventListener('click', function() {
    self._entries = [];
    if (self._el) self._el.innerHTML = '';
  });
};

NOVA.ConsoleUI.prototype._bindFilters = function() {
  var self = this;
  document.querySelectorAll('.console-filter-btn').forEach(function(btn) {
    var level = btn.dataset.filter;
    btn.classList.toggle('active', !!self._filters[level]);
    btn.addEventListener('click', function() {
      self._filters[level] = !self._filters[level];
      btn.classList.toggle('active', self._filters[level]);
      self._rebuildList();
    });
  });
};

NOVA.ConsoleUI.prototype._bindExport = function() {
  var self = this;
  var btn = document.getElementById('btn-export-logs');
  if (btn) btn.addEventListener('click', function() {
    var text = self._entries.map(function(e) {
      return '[' + e.timestamp + '] [' + e.level.toUpperCase() + '] ' + e.msg;
    }).join('\n');
    var blob = new Blob([text], { type: 'text/plain' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url; a.download = 'nova-logs.txt'; a.click();
    URL.revokeObjectURL(url);
  });
};

function _escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
