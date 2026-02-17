import ModulesScenesPixiWrapper from '../../../src/ts/modules/scenes/pixiWrapper';

describe('ModulesScenesPixiWrapper', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockApp: {
    init: ReturnType<typeof vi.fn>;
    canvas: HTMLCanvasElement;
    stage: { addChild: ReturnType<typeof vi.fn> };
    ticker: { add: ReturnType<typeof vi.fn>; maxFPS: number };
    renderer: { resize: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.config = {
      ...mockUrso.config,
      fps: { limit: 60, optimizeLowPerformance: false },
      gameContainerSelector: '#game',
    };
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockApp = {
      init: vi.fn(() => Promise.resolve()),
      canvas: document.createElement('canvas'),
      stage: { addChild: vi.fn() },
      ticker: { add: vi.fn(), maxFPS: 60 },
      renderer: { resize: vi.fn() },
    };

    (globalThis as Record<string, unknown>).PIXI = {
      Application: vi.fn(() => mockApp),
      Container: vi.fn(() => ({
        label: '',
        addChild: vi.fn(),
        removeChild: vi.fn(),
        scale: { x: 1, y: 1 },
      })),
    };

    ModulesScenesPixiWrapper.prototype.getInstance = vi.fn(() => ({})) as ModulesScenesPixiWrapper['getInstance'];
    ModulesScenesPixiWrapper.prototype.emit = vi.fn() as ModulesScenesPixiWrapper['emit'];
    ModulesScenesPixiWrapper.prototype.addListener = vi.fn() as ModulesScenesPixiWrapper['addListener'];
  });

  afterEach(() => {
    delete (ModulesScenesPixiWrapper.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesScenesPixiWrapper.prototype as { emit?: unknown }).emit;
    delete (ModulesScenesPixiWrapper.prototype as { addListener?: unknown }).addListener;
  });

  it('should be a singleton', () => {
    const sut = new ModulesScenesPixiWrapper();
    expect(sut.singleton).toBe(true);
  });

  it('should initialize with default values', () => {
    const sut = new ModulesScenesPixiWrapper();
    expect(sut['_loopStopped']).toBe(false);
    expect(sut['_loopPaused']).toBe(false);
    expect(sut['_mouseCoords']).toEqual({ x: 0, y: 0 });
    expect(sut.passiveCallIntervalId).toBeNull();
  });

  describe('init', () => {
    it('should create PIXI app and set up root/world', async () => {
      const sut = new ModulesScenesPixiWrapper();
      await sut.init();
      expect(mockApp.init).toHaveBeenCalled();
      expect(mockApp.stage.addChild).toHaveBeenCalled();
      expect(mockApp.ticker.add).toHaveBeenCalled();
    });
  });

  describe('pause / resume', () => {
    it('should set _loopPaused to true on pause', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut.pause();
      expect(sut['_loopPaused']).toBe(true);
      expect(sut.isPaused()).toBe(true);
    });

    it('should set _loopPaused to false on resume', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut.pause();
      sut.resume();
      expect(sut['_loopPaused']).toBe(false);
      expect(sut.isPaused()).toBe(false);
    });
  });

  describe('resize', () => {
    it('should call renderer.resize', async () => {
      const sut = new ModulesScenesPixiWrapper();
      await sut.init();
      sut.resize(800, 600);
      expect(mockApp.renderer.resize).toHaveBeenCalledWith(800, 600);
    });
  });

  describe('hideCanvas / showCanvas', () => {
    it('should set canvas display to none on hide', async () => {
      const sut = new ModulesScenesPixiWrapper();
      await sut.init();
      sut.hideCanvas();
      expect(mockApp.canvas.style.display).toBe('none');
    });

    it('should set canvas display to empty on show', async () => {
      const sut = new ModulesScenesPixiWrapper();
      await sut.init();
      sut.hideCanvas();
      sut.showCanvas();
      expect(mockApp.canvas.style.display).toBe('');
    });
  });

  describe('setWorldScale', () => {
    it('should set world scale', () => {
      const sut = new ModulesScenesPixiWrapper();
      // Manually create world to avoid calling init
      sut.world = { scale: { x: 1, y: 1 }, label: '', addChild: vi.fn(), removeChild: vi.fn() };
      sut.setWorldScale(2, 3);
      expect(sut.world.scale.x).toBe(2);
      expect(sut.world.scale.y).toBe(3);
    });
  });

  describe('setCanvasWidth / setCanvasHeight', () => {
    it('should set canvas width in px', async () => {
      const sut = new ModulesScenesPixiWrapper();
      await sut.init();
      sut.setCanvasWidth(960);
      expect(mockApp.canvas.style.width).toBe('960px');
    });

    it('should set canvas height in px', async () => {
      const sut = new ModulesScenesPixiWrapper();
      await sut.init();
      sut.setCanvasHeight(540);
      expect(mockApp.canvas.style.height).toBe('540px');
    });
  });

  describe('getRenderer', () => {
    it('should return the pixi app', async () => {
      const sut = new ModulesScenesPixiWrapper();
      await sut.init();
      expect(sut.getRenderer()).toBe(mockApp);
    });
  });

  describe('getPixiWorld', () => {
    it('should return the world container', () => {
      const sut = new ModulesScenesPixiWrapper();
      const world = { scale: { x: 1, y: 1 }, label: '', addChild: vi.fn(), removeChild: vi.fn() };
      sut.world = world;
      expect(sut.getPixiWorld()).toBe(world);
    });
  });

  describe('setNewScene', () => {
    it('should set currentScene and recreate world', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut['_root'] = { label: '', addChild: vi.fn(), removeChild: vi.fn(), scale: { x: 1, y: 1 } };
      sut.world = { label: '', addChild: vi.fn(), removeChild: vi.fn(), scale: { x: 1, y: 1 } };
      const model = { update: vi.fn(), render: vi.fn() };
      sut.setNewScene(model);
      expect(sut.currentScene).toBe(model);
    });
  });

  describe('getFps / getFpsData', () => {
    it('should return current fps', () => {
      const sut = new ModulesScenesPixiWrapper();
      expect(sut.getFps()).toBe(60);
    });

    it('should return fps data with fps and limit', () => {
      const sut = new ModulesScenesPixiWrapper();
      const data = sut.getFpsData();
      expect(data).toEqual({ fps: 60, limit: 60 });
    });
  });

  describe('getCachedMouseCoords', () => {
    it('should return mouse coordinates', () => {
      const sut = new ModulesScenesPixiWrapper();
      expect(sut.getCachedMouseCoords()).toEqual({ x: 0, y: 0 });
    });
  });

  describe('_validateCoordinate', () => {
    it('should return coordinate if positive', () => {
      const sut = new ModulesScenesPixiWrapper();
      expect(sut._validateCoordinate(42)).toBe(42);
    });

    it('should return 0 if coordinate is negative', () => {
      const sut = new ModulesScenesPixiWrapper();
      expect(sut._validateCoordinate(-5)).toBe(0);
    });

    it('should return 0 if coordinate is 0', () => {
      const sut = new ModulesScenesPixiWrapper();
      expect(sut._validateCoordinate(0)).toBe(0);
    });
  });

  describe('_getDeltaFrame', () => {
    it('should convert delta time to delta frame (60fps basis)', () => {
      const sut = new ModulesScenesPixiWrapper();
      expect(sut._getDeltaFrame(1000)).toBeCloseTo(60);
      expect(sut._getDeltaFrame(16.67)).toBeCloseTo(1, 0);
    });
  });

  describe('_loop', () => {
    it('should return true', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut.currentScene = null;
      sut['_app'] = mockApp;
      expect(sut._loop()).toBe(true);
    });
  });

  describe('_updateCurrentFPS', () => {
    it('should update FPS after 1 second', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut['_lastTimeCheckFPS'] = 0;
      sut['_frames'] = 59; // _frames++ happens first, so 59+1=60 frames in 1s
      sut._updateCurrentFPS(1000);
      expect(sut['_currentFPS']).toBe(60);
      expect(sut['_frames']).toBe(0);
    });

    it('should not update FPS before 1 second', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut['_lastTimeCheckFPS'] = 0;
      sut['_currentFPS'] = 60;
      sut['_frames'] = 10;
      sut._updateCurrentFPS(500);
      expect(sut['_currentFPS']).toBe(60);
      expect(sut['_frames']).toBe(11);
    });
  });

  describe('_visibilityChangeHandler', () => {
    it('should clear interval when becoming visible', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut.passiveCallIntervalId = setInterval(() => {}, 1000);
      sut._visibilityChangeHandler('visible');
      expect(sut.passiveCallIntervalId).toBeNull();
    });

    it('should set interval when becoming hidden', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut._visibilityChangeHandler('hidden');
      expect(sut.passiveCallIntervalId).not.toBeNull();
      clearInterval(sut.passiveCallIntervalId!);
    });
  });

  describe('_checkMouse', () => {
    it('should not emit if coords unchanged', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut.world = { scale: { x: 1, y: 1 }, label: '', addChild: vi.fn(), removeChild: vi.fn() };
      sut.interaction = null;
      // checkDeepEqual returns true by default
      mockUrso.helper.checkDeepEqual.mockReturnValue(true);
      sut._checkMouse();
      expect(sut.emit).not.toHaveBeenCalled();
    });

    it('should emit MOUSE_NEW_POSITION when coords change', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut.world = { scale: { x: 1, y: 1 }, label: '', addChild: vi.fn(), removeChild: vi.fn() };
      sut.interaction = { eventData: { data: { global: { x: 100, y: 200 } } } };
      mockUrso.helper.checkDeepEqual.mockReturnValue(false);
      sut._checkMouse();
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_SCENES_MOUSE_NEW_POSITION,
        { x: 100, y: 200 },
      );
    });
  });

  describe('_subscribeOnce', () => {
    it('should register visibility change listener', () => {
      const sut = new ModulesScenesPixiWrapper();
      sut._subscribeOnce();
      expect(sut.addListener).toHaveBeenCalledWith(
        mockUrso.events.EXTRA_BROWSEREVENTS_WINDOW_VISIBILITYCHANGE,
        expect.any(Function),
        true,
      );
    });
  });
});
