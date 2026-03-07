/**
 * NOVA Engine — ToolbarUI
 * Play / Pause / Stop controls and viewport tool buttons.
 */

export class ToolbarUI {
  constructor(nova) {
    this._nova = nova;
    this._currentTool = 'translate';

    this._bindPlayControls();
    this._bindToolButtons();
    this._bindViewportToggles();
    this._bindSpeedDisplay();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _bindPlayControls() {
    const { nova } = this;
    const btnPlay  = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnStop  = document.getElementById('btn-stop');
    const hudMode  = document.getElementById('hud-mode');

    const setActive = id => {
      [btnPlay, btnPause, btnStop].forEach(b => b?.classList.remove('active'));
      document.getElementById(id)?.classList.add('active');
    };

    btnPlay?.addEventListener('click', () => {
      nova.isPlaying = true;
      setActive('btn-play');
      if (hudMode) hudMode.textContent = 'PLAYING';
      nova.events?.emit('play', {});
      nova.ui.toast?.show('Play mode', 'info', 1500);
    });

    btnPause?.addEventListener('click', () => {
      if (!nova.isPlaying) return;
      setActive('btn-pause');
      if (hudMode) hudMode.textContent = 'PAUSED';
      nova.events?.emit('pause', {});
    });

    btnStop?.addEventListener('click', () => {
      nova.isPlaying = false;
      setActive('btn-stop');
      if (hudMode) hudMode.textContent = 'EDITOR';
      nova.events?.emit('stop', {});
    });

    // Space = play/stop toggle
    window.addEventListener('keydown', e => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        nova.isPlaying ? btnStop?.click() : btnPlay?.click();
      }
      if (e.code === 'Escape') btnStop?.click();
    });
  }

  _bindToolButtons() {
    const { nova } = this;
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      if (btn.hasAttribute('data-tool-toggle')) return; // handled below
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        if (tool === 'select') {
          nova.transform?.detach();
        } else {
          nova.events?.emit('tool:changed', tool);
        }

        document.querySelectorAll('.tool-btn[data-tool]:not([data-tool-toggle])')
          .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._currentTool = tool;
        nova.events?.emit('tool:ui', tool);
      });
    });

    // Keyboard shortcuts echo back to UI
    nova.events?.on('tool:ui', tool => {
      document.querySelectorAll('.tool-btn[data-tool]:not([data-tool-toggle])')
        .forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
    });
  }

  _bindViewportToggles() {
    const { nova } = this;

    // Grid toggle
    document.getElementById('btn-grid')?.addEventListener('click', function () {
      const visible = nova.scene.isGridVisible();
      nova.scene.setGridVisible(!visible);
      this.classList.toggle('active', !visible);
    });

    // Snap toggle
    document.getElementById('btn-snap')?.addEventListener('click', function () {
      const enabled = nova.snap.toggle();
      this.classList.toggle('active', enabled);
      document.getElementById('snap-indicator')?.classList.toggle('visible', enabled);
      nova.events?.emit('snap:changed', { enabled, value: nova.snap.gridSize });
      nova.ui.toast?.show(`Snap ${enabled ? 'enabled' : 'disabled'}`, 'info', 1500);
    });

    // Bloom toggle
    document.getElementById('btn-bloom')?.addEventListener('click', function () {
      const enabled = !nova.post.isBloomEnabled();
      nova.post.setBloom(enabled);
      this.classList.toggle('active', enabled);
      nova.ui.toast?.show(`Bloom ${enabled ? 'on' : 'off'}`, 'info', 1500);
    });

    // Keyboard shortcut for grid (G) and bloom (B)
    window.addEventListener('keydown', e => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'g' || e.key === 'G') document.getElementById('btn-grid')?.click();
      if (e.key === 'b' || e.key === 'B') document.getElementById('btn-bloom')?.click();
    });
  }

  _bindSpeedDisplay() {
    const valEl = document.getElementById('move-speed-val');
    if (!valEl) return;

    valEl.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      const speed = Math.max(0.05, Math.min(2, this._nova.camera.getMoveSpeed() + delta));
      this._nova.camera.setMoveSpeed(speed);
      valEl.textContent = speed.toFixed(2);
    });
  }
}
