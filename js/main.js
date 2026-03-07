/* NOVA Engine — Bootstrap */
(function() {
  'use strict';

  window.NOVA = window.NOVA || {};

  var nova = {
    engine: null, scene: null, renderer: null, camera: null,
    input: null, selection: null, history: null, transform: null,
    gizmos: null, post: null, snap: null, factory: null,
    serializer: null, logger: null, events: null, isPlaying: false,
    ui: { hierarchy: null, inspector: null, project: null, console: null,
          toolbar: null, contextMenu: null, toast: null, menu: null,
          loading: null, stats: null }
  };
  window.nova = nova;

  function init() {
    // 1. Utilities
    nova.events = new NOVA.EventBus();
    nova.logger = new NOVA.Logger(nova.events);

    // 2. Loading
    nova.ui.loading = new NOVA.LoadingUI();
    nova.ui.loading.show();
    nova.ui.loading.setProgress(5, 'Initializing renderer...');

    // 3. Renderer
    nova.renderer = new NOVA.Renderer(document.getElementById('canvas-container'));
    nova.renderer.init();
    nova.ui.loading.setProgress(20, 'Building scene...');

    // 4. Scene + Camera
    nova.scene  = new NOVA.SceneManager();
    nova.camera = new NOVA.EditorCamera(nova.renderer.renderer.domElement, nova.renderer.camera);
    nova.ui.loading.setProgress(35, 'Loading input system...');

    // 5. Core systems
    nova.input     = new NOVA.InputManager(nova.renderer.renderer.domElement);
    nova.history   = new NOVA.HistoryManager(nova.events);
    nova.selection = new NOVA.SelectionManager(nova.events);
    nova.factory   = new NOVA.ObjectFactory(nova.scene, nova.events, nova.history);
    nova.serializer= new NOVA.SceneSerializer(nova.scene, nova.factory);
    nova.ui.loading.setProgress(50, 'Setting up tools...');

    // 6. Systems
    nova.snap      = new NOVA.SnapSystem();
    nova.transform = new NOVA.TransformSystem(
      nova.renderer.camera,
      nova.renderer.renderer.domElement,
      nova.scene.scene,
      nova.selection,
      nova.history,
      nova.snap,
      nova.events
    );
    nova.gizmos = new NOVA.GizmoSystem(nova.scene.scene, nova.renderer.camera);
    nova.post   = new NOVA.PostProcessing(nova.renderer.renderer, nova.scene.scene, nova.renderer.camera);
    nova.ui.loading.setProgress(65, 'Building UI...');

    // 7. UI
    nova.ui.toast   = new NOVA.ToastUI(document.getElementById('toast-container'));
    nova.ui.console = new NOVA.ConsoleUI(document.getElementById('console-logs'), nova.logger, nova.events);

    nova.ui.hierarchy = new NOVA.HierarchyUI(
      document.getElementById('hierarchy-list'),
      document.getElementById('hierarchy-search'),
      nova.scene, nova.selection, nova.events, nova.history
    );
    nova.ui.inspector = new NOVA.InspectorUI(
      document.getElementById('inspector-content'),
      nova.selection, nova.scene, nova.events, nova.history
    );
    nova.ui.project = new NOVA.ProjectUI(
      document.getElementById('asset-grid'),
      nova.factory, nova.serializer, nova.events, nova.ui.toast
    );
    nova.ui.toolbar     = new NOVA.ToolbarUI(nova);
    nova.ui.contextMenu = new NOVA.ContextMenuUI(
      document.getElementById('context-menu'),
      nova.factory, nova.selection, nova.renderer.camera, nova.scene, nova.events
    );
    nova.ui.menu  = new NOVA.MenuUI(nova);
    nova.ui.stats = new NOVA.StatsHUD(
      nova.renderer, nova.scene,
      document.getElementById('fps-val'),
      document.getElementById('tri-val'),
      document.getElementById('dc-val'),
      document.getElementById('hud-objects'),
      document.getElementById('hud-lights'),
      document.getElementById('hud-mode')
    );

    nova.ui.loading.setProgress(85, 'Populating default scene...');

    // 8. Camera focus event
    nova.events.on('camera:focus', function(obj) { nova.camera.focusOn(obj); });

    // 9. Default scene
    nova.factory.populateDefaults();
    nova.scene.buildGrid();

    nova.ui.loading.setProgress(100, 'Ready!');
    nova.logger.info('NOVA Engine initialized.');
    nova.ui.toast.show('NOVA Engine ready', 'success');

    setTimeout(function() {
      nova.ui.loading.hide();
      nova.engine = new NOVA.Engine(nova);
      nova.engine.start();
    }, 600);
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
