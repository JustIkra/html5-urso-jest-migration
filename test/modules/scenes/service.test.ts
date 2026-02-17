import ModulesScenesService from '../../../src/ts/modules/scenes/service';
import ModulesScenesModel from '../../../src/ts/modules/scenes/model';

describe('ModulesScenesService', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockPixiWrapper: {
    init: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
    isPaused: ReturnType<typeof vi.fn>;
    setNewScene: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = {
      ...mockUrso,
      template: {
        parse: vi.fn(() => ({
          styles: {},
          assets: [],
          objects: [{ type: 8 }],
          components: [],
        })),
        scene: vi.fn((name: string) => ({
          styles: {},
          assets: [],
          objects: [{ type: 8 }],
          components: [],
          _templatePath: `Templates.Scenes.${name}`,
        })),
      },
      assets: { preload: vi.fn((_a: unknown, cb: () => void) => cb()) },
    };

    (globalThis as Record<string, unknown>).gsap = {
      globalTimeline: { timeScale: vi.fn() },
    };

    mockPixiWrapper = {
      init: vi.fn(() => Promise.resolve()),
      pause: vi.fn(),
      resume: vi.fn(),
      isPaused: vi.fn(() => false),
      setNewScene: vi.fn(),
    };

    ModulesScenesService.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'PixiWrapper') return mockPixiWrapper;
      if (path === 'Model') return new ModulesScenesModel();
      return {};
    }) as ModulesScenesService['getInstance'];

    ModulesScenesService.prototype.emit = vi.fn() as ModulesScenesService['emit'];
  });

  afterEach(() => {
    delete (ModulesScenesService.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesScenesService.prototype as { emit?: unknown }).emit;
  });

  it('should be a singleton', () => {
    const sut = new ModulesScenesService();
    expect(sut.singleton).toBe(true);
  });

  it('should have default timeScale of 1', () => {
    const sut = new ModulesScenesService();
    expect(sut.timeScale).toBe(1);
  });

  describe('init', () => {
    it('should initialize pixi wrapper', async () => {
      const sut = new ModulesScenesService();
      await sut.init();
      expect(mockPixiWrapper.init).toHaveBeenCalled();
    });
  });

  describe('pause / resume', () => {
    it('should pause pixi wrapper and emit PAUSE', () => {
      const sut = new ModulesScenesService();
      sut.pause();
      expect(mockPixiWrapper.pause).toHaveBeenCalled();
      expect(sut.emit).toHaveBeenCalledWith(mockUrso.events.MODULES_SCENES_PAUSE);
    });

    it('should resume pixi wrapper and emit RESUME', () => {
      const sut = new ModulesScenesService();
      sut.resume();
      expect(mockPixiWrapper.resume).toHaveBeenCalled();
      expect(sut.emit).toHaveBeenCalledWith(mockUrso.events.MODULES_SCENES_RESUME);
    });
  });

  describe('getTimeScale / setTimeScale', () => {
    it('should return timeScale when not paused', () => {
      const sut = new ModulesScenesService();
      sut.timeScale = 1.5;
      expect(sut.getTimeScale()).toBe(1.5);
    });

    it('should return 0 when paused', () => {
      mockPixiWrapper.isPaused.mockReturnValue(true);
      const sut = new ModulesScenesService();
      expect(sut.getTimeScale()).toBe(0);
    });

    it('should set timeScale and update gsap', () => {
      const sut = new ModulesScenesService();
      sut.setTimeScale(2);
      expect(sut.timeScale).toBe(2);
      expect((globalThis as unknown as { gsap: { globalTimeline: { timeScale: ReturnType<typeof vi.fn> } } }).gsap.globalTimeline.timeScale).toHaveBeenCalledWith(2);
    });
  });

  describe('display', () => {
    it('should display a scene', () => {
      const sut = new ModulesScenesService();
      sut.display('Main');
      expect(sut.emit).toHaveBeenCalledWith(mockUrso.events.MODULES_SCENES_DISPLAY_START, 'Main');
      expect(mockPixiWrapper.setNewScene).toHaveBeenCalled();
      expect(sut.emit).toHaveBeenCalledWith(mockUrso.events.MODULES_SCENES_DISPLAY_FINISHED);
    });

    it('should return false if display is already in progress', () => {
      const sut = new ModulesScenesService();
      sut._displayInProgress = true;
      expect(sut.display('Main')).toBe(false);
    });

    it('should return false if no template found', () => {
      (mockUrso as unknown as Record<string, unknown>).template = { scene: vi.fn(() => null), parse: vi.fn() };
      (globalThis as Record<string, unknown>).Urso = mockUrso;
      const sut = new ModulesScenesService();
      expect(sut.display('NonExistent')).toBe(false);
    });

    it('should destroy previous scene model', () => {
      const sut = new ModulesScenesService();
      const destroyFn = vi.fn();
      sut._sceneModel = { destroy: destroyFn } as unknown as ModulesScenesModel;
      sut.display('NewScene');
      expect(destroyFn).toHaveBeenCalled();
    });

    it('should clear local observers and set prefix', () => {
      const sut = new ModulesScenesService();
      sut.display('Main');
      expect(mockUrso.observer.clearAllLocal).toHaveBeenCalled();
      expect(mockUrso.observer.setPrefix).toHaveBeenCalledWith('Main');
    });

    it('should reset displayInProgress after assets loaded', () => {
      const sut = new ModulesScenesService();
      sut.display('Main');
      expect(sut._displayInProgress).toBe(false);
    });
  });

  describe('loadUpdate', () => {
    it('should emit load progress when scene model exists', () => {
      const sut = new ModulesScenesService();
      sut.display('Main');
      (sut.emit as ReturnType<typeof vi.fn>).mockClear();
      sut.loadUpdate(50);
      expect(sut.emit).toHaveBeenCalledWith(mockUrso.events.MODULES_ASSETS_LOAD_PROGRESS, 50);
    });

    it('should not emit when no scene model', () => {
      const sut = new ModulesScenesService();
      sut.loadUpdate(50);
      expect(sut.emit).not.toHaveBeenCalledWith(mockUrso.events.MODULES_ASSETS_LOAD_PROGRESS, expect.anything());
    });
  });

  describe('addObject', () => {
    it('should create object from template', () => {
      const sut = new ModulesScenesService();
      sut._currentSceneTemplate = { styles: {}, assets: [], objects: [], components: [] };
      const result = sut.addObject({ type: 8 });
      expect(mockUrso.objects.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return null when assets need to be preloaded', () => {
      (mockUrso as unknown as Record<string, unknown>).template = {
        parse: vi.fn(() => ({ styles: {}, assets: [{ type: 6, key: 'img' }], objects: [], components: [] })),
        scene: vi.fn(),
      };
      (mockUrso as unknown as Record<string, unknown>).assets = { preload: vi.fn() };
      (globalThis as Record<string, unknown>).Urso = mockUrso;

      const sut = new ModulesScenesService();
      sut._currentSceneTemplate = { styles: {}, assets: [], objects: [], components: [] };
      const result = sut.addObject({ type: 15 });
      expect(result).toBeNull();
    });
  });
});
