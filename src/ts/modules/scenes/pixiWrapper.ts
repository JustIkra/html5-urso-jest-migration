import type { UrsoInstance } from '../../types';

interface Coords {
  x: number;
  y: number;
}

interface FpsData {
  fps: number;
  limit: number;
}

interface PixiApp {
  init: (opts: Record<string, unknown>) => Promise<void>;
  canvas: HTMLCanvasElement;
  stage: { addChild: (child: unknown) => void };
  ticker: { add: (fn: () => void) => void; maxFPS: number };
  renderer: { resize: (w: number, h: number) => void };
}

interface PixiContainer {
  label: string;
  addChild: (child: unknown) => void;
  removeChild: (child: unknown) => void;
  scale: { x: number; y: number };
}

const NORMAL_FPS_COUNT = 60;
const LOW_PERFORMANCE_FPS_COUNT = 30;

class ModulesScenesPixiWrapper {
  public readonly singleton = true;

  public scenes: Record<string, unknown> = {};
  public world!: PixiContainer;
  public currentScene: { update: (dt: number) => void; render: () => void } | null = null;
  public interaction: { eventData?: { data?: { global?: Coords } } } | null = null;
  public passiveCallIntervalId: ReturnType<typeof setInterval> | null = null;

  public _renderer: unknown;
  public _root!: PixiContainer;
  public _loaderScene: unknown;
  public _app!: PixiApp;

  public _loopStopped = false;
  public _loopPaused = false;
  public _loopLastCall = 0;

  public _mouseCoords: Coords = { x: 0, y: 0 };

  public _maxFPSLimit: number = Urso.config.fps.limit;
  public _lastUpdateTime = 0;
  public _frames = 0;
  public _currentFPS: number = Urso.config.fps.limit;
  public _lastTimeCheckFPS = 0;

  public getInstance!: UrsoInstance['getInstance'];
  public emit!: UrsoInstance['emit'];
  public addListener!: UrsoInstance['addListener'];

  constructor() {
    this._loop = this._loop.bind(this);
  }

  async init(): Promise<void> {
    const app = new PIXI.Application();
    (window as unknown as Record<string, unknown>).__PIXI_APP__ = app;

    this._root = new PIXI.Container();
    this._root.label = 'root';
    this._createWorld();

    const parent = document.querySelector(Urso.config.gameContainerSelector!) || document.body;
    await app.init({
      background: '0x222222',
      resolution: 1,
    });
    parent.appendChild(app.canvas);
    app.stage.addChild(this._root);
    this._app = app;
    this._app.ticker.add(this._loop);

    this._loaderScene = this.getInstance('Model');
    this.getInstance('Resolutions');
  }

  isPaused(): boolean {
    return this._loopPaused;
  }

  pause(): void {
    this._loopPaused = true;
  }

  resume(): void {
    this._loopLastCall = Date.now();
    this._loopPaused = false;
  }

  resize(width: number, height: number): void {
    this._app.renderer.resize(width, height);
  }

  hideCanvas(): void {
    this._app.canvas.style.display = 'none';
  }

  showCanvas(): void {
    this._app.canvas.style.display = '';
  }

  setWorldScale(x: number, y: number): void {
    this.world.scale.x = x;
    this.world.scale.y = y;
  }

  setCanvasWidth(val: number): void {
    this._app.canvas.style.width = val + 'px';
  }

  setCanvasHeight(val: number): void {
    this._app.canvas.style.height = val + 'px';
  }

  getRenderer(): PixiApp {
    return this._app;
  }

  getPixiWorld(): PixiContainer {
    return this.world;
  }

  setNewScene(model: { update: (dt: number) => void; render: () => void }): void {
    this._createWorld();
    this.currentScene = model;
  }

  getFps(): number {
    return this._currentFPS;
  }

  getFpsData(): FpsData {
    return {
      fps: this._currentFPS,
      limit: this._maxFPSLimit,
    };
  }

  getCachedMouseCoords(): Coords {
    return this._mouseCoords;
  }

  generateTexture(_obj: unknown): void {
    // FIXME — not yet implemented in PixiJS v8 migration
  }

  _setPixiSettings(): void {
    // FIXME — not yet implemented in PixiJS v8 migration
  }

  _createWorld(): void {
    if (this.world) this._root.removeChild(this.world);
    this.world = new PIXI.Container();
    this._root.addChild(this.world);
  }

  _requestAnimFrame(loopFunction: () => void): void {
    (
      window.requestAnimationFrame ||
      (window as unknown as Record<string, unknown>).webkitRequestAnimationFrame as typeof requestAnimationFrame ||
      function (callback: () => void) { window.setTimeout(callback, 0); }
    )(loopFunction);
  }

  _getDeltaTime(): number {
    const newTime = Date.now();
    const deltaTime = Urso.scenes.timeScale * (newTime - this._loopLastCall);
    this._loopLastCall = newTime;
    return Urso.math.intMakeBetween(deltaTime, 0, 1000);
  }

  _getDeltaFrame(deltaTime: number): number {
    return (deltaTime * 60) / 1000;
  }

  _loop(): boolean {
    this._fpsCheckAllowUpdate();
    this._update();
    return true;
  }

  _fpsCheckAllowUpdate(): boolean {
    const currentTime = Urso.time.get();
    this._updateCurrentFPS(currentTime);

    if (Urso.config.fps.optimizeLowPerformance) {
      if (this._currentFPS < NORMAL_FPS_COUNT) this._maxFPSLimit = LOW_PERFORMANCE_FPS_COUNT;
      else this._maxFPSLimit = Urso.config.fps.limit;
    }

    if (currentTime - this._lastUpdateTime < ~~(1000 / this._maxFPSLimit)) return false;

    this._lastUpdateTime = currentTime;
    this._app.ticker.maxFPS = this._maxFPSLimit;
    return true;
  }

  _updateCurrentFPS(currentTime: number): void {
    this._frames++;
    if (currentTime - this._lastTimeCheckFPS < 1000) return;
    this._currentFPS = Math.round((1000 * this._frames) / (currentTime - this._lastTimeCheckFPS));
    this._lastTimeCheckFPS = currentTime;
    this._frames = 0;
  }

  _update(): void {
    if (!this.currentScene) return;

    const deltaTime = this._getDeltaTime();
    const _deltaFrame = this._getDeltaFrame(deltaTime);

    this._checkMouse();
    this.emit(Urso.events.MODULES_SCENES_UPDATE, deltaTime);

    this.currentScene.update(deltaTime);
    this.currentScene.render();
  }

  _checkMouse(): boolean | void {
    const newCoords = this._getMouseCoords();

    if (Urso.helper.checkDeepEqual(this._mouseCoords, newCoords)) return true;

    this._mouseCoords = newCoords;
    this.emit(Urso.events.MODULES_SCENES_MOUSE_NEW_POSITION, this._mouseCoords);
  }

  _getMouseCoords(): Coords {
    const globalCoords = this.interaction?.eventData?.data?.global || { x: 0, y: 0 };

    const coords: Coords = {
      x: ~~(globalCoords.x / this.world.scale.x),
      y: ~~(globalCoords.y / this.world.scale.y),
    };

    coords.x = this._validateCoordinate(coords.x);
    coords.y = this._validateCoordinate(coords.y);

    return coords;
  }

  _validateCoordinate(c: number): number {
    return c > 0 ? c : 0;
  }

  _visibilityChangeHandler(state: string): void {
    const isVisible = state === 'visible';

    if (isVisible) {
      if (this.passiveCallIntervalId) {
        clearInterval(this.passiveCallIntervalId);
        this.passiveCallIntervalId = null;
      }
      return;
    }

    this.passiveCallIntervalId = setInterval(() => {
      // FIXME — passive update disabled during v8 migration
    }, 16);
  }

  _pointerEventHandler(event: MouseEvent | TouchEvent): void {
    const canvas = this._app?.canvas;
    if (!canvas) return;

    let clientX: number, clientY: number;
    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    } else {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    this.interaction = {
      eventData: { data: { global: { x, y } } },
    };
  }

  _subscribeOnce(): void {
    this.addListener(
      Urso.events.EXTRA_BROWSEREVENTS_WINDOW_VISIBILITYCHANGE,
      this._visibilityChangeHandler.bind(this) as () => void,
      true,
    );

    this.addListener(
      Urso.events.EXTRA_BROWSEREVENTS_POINTER_EVENT,
      this._pointerEventHandler.bind(this) as () => void,
      true,
    );
  }
}

export default ModulesScenesPixiWrapper;
