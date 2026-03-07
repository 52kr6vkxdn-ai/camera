/**
 * NOVA Engine — ConsoleUI
 * Renders log entries to the console panel with filtering.
 */

export class ConsoleUI {
  constructor(logContainer, logger, events) {
    this._el      = logContainer;
    this._logger  = logger;
    this._events  = events;
    this._entries = [];
    this._filters = new Set(['debug','info','warn','error']);

    this._bindClear();
    this._bindFilters();
    this._bindExport();

    events?.on('log', entry => this._addEntry(entry));
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _addEntry(entry) {
    this._entries.push(entry);
    if (this._filters.has(entry.level)) this._renderEntry(entry);
  }

  _renderEntry(entry) {
    if (!this._el) return;
    const row = document.createElement('div');
    row.className = `log-row log-${entry.level}`;
    row.innerHTML = `<span class="log-time">${entry.timestamp}</span>
                     <span class="log-badge ${entry.level}">${entry.level.toUpperCase()}</span>
                     <span class="log-msg">${_escape(entry.msg)}</span>`;
    this._el.appendChild(row);
    this._el.scrollTop = this._el.scrollHeight;
  }

  _rebuildList() {
    if (!this._el) return;
    this._el.innerHTML = '';
    this._entries
      .filter(e => this._filters.has(e.level))
      .forEach(e => this._renderEntry(e));
  }

  _bindClear() {
    document.getElementById('btn-clear-console')?.addEventListener('click', () => {
      this._entries = [];
      if (this._el) this._el.innerHTML = '';
    });
  }

  _bindFilters() {
    document.querySelectorAll('.console-filter-btn').forEach(btn => {
      const level = btn.dataset.filter;
      btn.classList.toggle('active', this._filters.has(level));
      btn.addEventListener('click', () => {
        if (this._filters.has(level)) this._filters.delete(level);
        else                          this._filters.add(level);
        btn.classList.toggle('active', this._filters.has(level));
        this._rebuildList();
      });
    });
  }

  _bindExport() {
    document.getElementById('btn-export-logs')?.addEventListener('click', () => {
      const text = this._entries.map(e =>
        `[${e.timestamp}] [${e.level.toUpperCase()}] ${e.msg}`).join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: 'nova-logs.txt' });
      a.click(); URL.revokeObjectURL(url);
    });
  }
}

function _escape(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
