/**
 * NOVA Engine — Main Entry Point
 * Bootstraps all systems and starts the editor loop.
 */

import { Engine } from './core/Engine.js';
import { SceneManager } from './core/SceneManager.js';
import { Renderer } from './core/Renderer.js';
import { InputManager } from './core/InputManager.js';
import { EditorCamera } from './core/EditorCamera.js';
import { ObjectFactory } from './core/ObjectFactory.js';
import { SelectionManager } from './core/SelectionManager.js';
import { HistoryManager } from './core/HistoryManager.js';
import { TransformControls } from './systems/TransformControls.js';
import { GizmoSystem } from './systems/GizmoSystem.js';
import { PostProcessing } from './systems/PostProcessing.js';
import { SnapSystem } from './systems/SnapSystem.js';
import { HierarchyUI } from './ui/HierarchyUI.js';
import { InspectorUI } from './ui/InspectorUI.js';
import { ProjectUI } from './ui/ProjectUI.js';
import { ConsoleUI } from './ui/ConsoleUI.js';
import { ToolbarUI } from './ui/ToolbarUI.js';
import { ContextMenuUI } from './ui/ContextMenuUI.js';
import { ToastUI } from './ui/ToastUI.js';
import { MenuUI } from './ui/MenuUI.js';
import { LoadingUI } from './ui/LoadingUI.js';
import { StatsHUD } from './ui/StatsHUD.js';
import { Logger } from './utils/Logger.js';
import { EventBus } from './utils/EventBus.js';
import { SceneSerializer } from './utils/SceneSerializer.js';

// ─── Global Engine State ───────────────────────────────────────────────────────
export const nova = {
  engine: null,
  scene: null,
  renderer: null,
  camera: null,
  input: null,
  selection: null,
  history: null,
  transform: null,
  gizmos: null,
  post: null,
  snap: null,
  factory: null,
  serializer: null,
  logger: null,
  events: null,
  // UI
  ui: {
    hierarchy: null,
    inspector: null,
    project: null,
    console: null,
    toolbar: null,
    contextMenu: null,
    toast: null,
    menu: null,
    loading: null,
    stats: null,
  },
  isPlaying: false,
};

window.nova = nova; // expose globally for debugging

async function init() {
  // 1. Core utilities first
  nova.events = new EventBus();
  nova.logger = new Logger(nova.events);

  // 2. Loading UI
  nova.ui.loading = new LoadingUI();
  nova.ui.loading.show();
  nova.ui.loading.setProgress(5, 'Initializing renderer...');

  // 3. Core systems
  nova.renderer = new Renderer(document.getElementById('canvas-container'));
  await nova.renderer.init();
  nova.ui.loading.setProgress(20, 'Building scene...');

  nova.scene = new SceneManager(nova.renderer.renderer);
  nova.camera = new EditorCamera(nova.renderer.renderer.domElement, nova.renderer.camera);

  nova.ui.loading.setProgress(35, 'Loading input system...');
  nova.input = new InputManager(nova.renderer.renderer.domElement);
  nova.history = new HistoryManager(nova.events);
  nova.selection = new SelectionManager(nova.events);
  nova.factory = new ObjectFactory(nova.scene, nova.events, nova.history);
  nova.serializer = new SceneSerializer(nova.scene, nova.factory);

  nova.ui.loading.setProgress(50, 'Setting up tools...');

  // 4. Systems
  nova.snap = new SnapSystem();
  nova.transform = new TransformControls(
    nova.renderer.camera,
    nova.renderer.renderer.domElement,
    nova.scene.scene,
    nova.selection,
    nova.history,
    nova.snap,
    nova.events
  );
  nova.gizmos = new GizmoSystem(nova.scene.scene, nova.renderer.camera);
  nova.post = new PostProcessing(nova.renderer.renderer, nova.scene.scene, nova.renderer.camera);

  nova.ui.loading.setProgress(65, 'Building UI...');

  // 5. UI systems
  nova.ui.toast = new ToastUI(document.getElementById('toast-container'));
  nova.ui.console = new ConsoleUI(document.getElementById('console-logs'), nova.logger, nova.events);
  nova.ui.hierarchy = new HierarchyUI(
    document.getElementById('hierarchy-list'),
    document.getElementById('hierarchy-search'),
    nova.scene,
    nova.selection,
    nova.events,
    nova.history
  );
  nova.ui.inspector = new InspectorUI(
    document.getElementById('inspector-content'),
    nova.selection,
    nova.scene,
    nova.events,
    nova.history
  );
  nova.ui.project = new ProjectUI(
    document.getElementById('asset-grid'),
    nova.factory,
    nova.serializer,
    nova.events,
    nova.ui.toast
  );
  nova.ui.toolbar = new ToolbarUI(nova);
  nova.ui.contextMenu = new ContextMenuUI(
    document.getElementById('context-menu'),
    nova.factory,
    nova.selection,
    nova.renderer.camera,
    nova.scene,
    nova.events
  );
  nova.ui.menu = new MenuUI(nova);
  nova.ui.stats = new StatsHUD(
    nova.renderer,
    nova.scene,
    document.getElementById('fps-val'),
    document.getElementById('tri-val'),
    document.getElementById('dc-val'),
    document.getElementById('hud-objects'),
    document.getElementById('hud-lights'),
    document.getElementById('hud-mode')
  );

  nova.ui.loading.setProgress(85, 'Populating default scene...');

  // 6. Default scene
  nova.factory.populateDefaults();
  nova.scene.buildGrid();

  nova.ui.loading.setProgress(100, 'Ready!');
  nova.logger.info('NOVA Engine initialized.');
  nova.ui.toast.show('NOVA Engine ready', 'success');

  setTimeout(() => {
    nova.ui.loading.hide();
    nova.engine = new Engine(nova);
    nova.engine.start();
  }, 600);
}

init().catch(err => {
  console.error('NOVA Engine failed to initialize:', err);
});
