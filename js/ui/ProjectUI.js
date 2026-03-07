/**
 * NOVA Engine — ProjectUI
 * Handles the Project panel: asset creation, import, and export buttons.
 */

export class ProjectUI {
  constructor(gridEl, factory, serializer, events, toast) {
    this._el         = gridEl;
    this._factory    = factory;
    this._serializer = serializer;
    this._events     = events;
    this._toast      = toast;

    this._bindAssetGrid();
    this._bindImport();
    this._bindExport();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _bindAssetGrid() {
    // Double-click or click on built-in asset items
    this._el?.querySelectorAll('.asset-item[data-create]').forEach(item => {
      item.addEventListener('dblclick', () => {
        const type = item.dataset.create;
        const obj  = this._factory.create(type);
        if (obj) {
          this._events?.emit('scene:changed', { added: obj });
          this._toast?.show(`Created ${obj.name}`, 'success');
        }
      });
    });
  }

  _bindImport() {
    const trigger = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.glb,.gltf';
      input.addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          if (file.name.endsWith('.json')) {
            await this._serializer.importFromFile(file);
            this._events?.emit('scene:changed', {});
            this._toast?.show('Scene imported', 'success');
          } else {
            this._toast?.show('GLB/GLTF import coming soon', 'info');
          }
        } catch (err) {
          this._toast?.show('Import failed: ' + err.message, 'error');
        }
      });
      input.click();
    };

    document.getElementById('btn-import')?.addEventListener('click', trigger);
    document.getElementById('btn-import-asset')?.addEventListener('click', trigger);
  }

  _bindExport() {
    const doExport = () => {
      this._serializer.downloadExport();
      this._toast?.show('Scene exported', 'success');
    };
    document.getElementById('btn-export-scene')?.addEventListener('click', doExport);
    document.getElementById('btn-export-scene-btn')?.addEventListener('click', doExport);
  }
}
