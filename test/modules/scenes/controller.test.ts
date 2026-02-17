import ModulesScenesController from '../../../src/ts/modules/scenes/controller';

describe('ModulesScenesController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockService: {
    init: ReturnType<typeof vi.fn>;
    display: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
    loadUpdate: ReturnType<typeof vi.fn>;
    addObject: ReturnType<typeof vi.fn>;
    getTimeScale: ReturnType<typeof vi.fn>;
    setTimeScale: ReturnType<typeof vi.fn>;
  };
  let mockPixiWrapper: {
    getFps: ReturnType<typeof vi.fn>;
    getFpsData: ReturnType<typeof vi.fn>;
    getPixiWorld: ReturnType<typeof vi.fn>;
    getCachedMouseCoords: ReturnType<typeof vi.fn>;
    getRenderer: ReturnType<typeof vi.fn>;
    generateTexture: ReturnType<typeof vi.fn>;
  };
  let mockResolutions: {
    getTemplateSize: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockService = {
      init: vi.fn(() => Promise.resolve()),
      display: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      loadUpdate: vi.fn(),
      addObject: vi.fn(() => ({ type: 8 })),
      getTimeScale: vi.fn(() => 1),
      setTimeScale: vi.fn(),
    };

    mockPixiWrapper = {
      getFps: vi.fn(() => 60),
      getFpsData: vi.fn(() => ({ fps: 60, limit: 60 })),
      getPixiWorld: vi.fn(() => ({ label: 'world' })),
      getCachedMouseCoords: vi.fn(() => ({ x: 10, y: 20 })),
      getRenderer: vi.fn(() => ({})),
      generateTexture: vi.fn(() => ({})),
    };

    mockResolutions = {
      getTemplateSize: vi.fn(() => ({ orientation: 'landscape', width: 1920, height: 1080 })),
    };

    ModulesScenesController.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Service') return mockService;
      if (path === 'PixiWrapper') return mockPixiWrapper;
      if (path === 'Resolutions') return mockResolutions;
      return {};
    }) as ModulesScenesController['getInstance'];
  });

  afterEach(() => {
    delete (ModulesScenesController.prototype as { getInstance?: unknown }).getInstance;
  });

  it('should be a singleton', () => {
    const sut = new ModulesScenesController();
    expect(sut.singleton).toBe(true);
  });

  describe('init', () => {
    it('should initialize service', async () => {
      const sut = new ModulesScenesController();
      await sut.init();
      expect(mockService.init).toHaveBeenCalled();
    });
  });

  describe('display', () => {
    it('should delegate to service', () => {
      const sut = new ModulesScenesController();
      sut._service = mockService;
      sut.display('Main');
      expect(mockService.display).toHaveBeenCalledWith('Main');
    });
  });

  describe('getFps', () => {
    it('should return fps from pixi wrapper', () => {
      const sut = new ModulesScenesController();
      expect(sut.getFps()).toBe(60);
    });
  });

  describe('getFpsData', () => {
    it('should return fps data from pixi wrapper', () => {
      const sut = new ModulesScenesController();
      expect(sut.getFpsData()).toEqual({ fps: 60, limit: 60 });
    });
  });

  describe('pause / resume', () => {
    it('should delegate pause to service', () => {
      const sut = new ModulesScenesController();
      sut._service = mockService;
      sut.pause();
      expect(mockService.pause).toHaveBeenCalled();
    });

    it('should delegate resume to service', () => {
      const sut = new ModulesScenesController();
      sut._service = mockService;
      sut.resume();
      expect(mockService.resume).toHaveBeenCalled();
    });
  });

  describe('loadUpdate', () => {
    it('should delegate to service', () => {
      const sut = new ModulesScenesController();
      sut._service = mockService;
      sut.loadUpdate(75);
      expect(mockService.loadUpdate).toHaveBeenCalledWith(75);
    });
  });

  describe('getPixiWorld', () => {
    it('should return pixi world from wrapper', () => {
      const sut = new ModulesScenesController();
      expect(sut.getPixiWorld()).toEqual({ label: 'world' });
    });
  });

  describe('getTemplateSize', () => {
    it('should return template size from resolutions', () => {
      const sut = new ModulesScenesController();
      expect(sut.getTemplateSize()).toEqual({ orientation: 'landscape', width: 1920, height: 1080 });
    });
  });

  describe('getMouseCoords', () => {
    it('should return cached mouse coords', () => {
      const sut = new ModulesScenesController();
      expect(sut.getMouseCoords()).toEqual({ x: 10, y: 20 });
    });
  });

  describe('addObject', () => {
    it('should delegate to service', () => {
      const sut = new ModulesScenesController();
      sut._service = mockService;
      const result = sut.addObject({ type: 8 }, null, false);
      expect(mockService.addObject).toHaveBeenCalledWith({ type: 8 }, null, false);
      expect(result).toEqual({ type: 8 });
    });
  });

  describe('generateTexture', () => {
    it('should delegate to pixi wrapper', () => {
      const sut = new ModulesScenesController();
      sut.generateTexture({});
      expect(mockPixiWrapper.generateTexture).toHaveBeenCalled();
    });
  });

  describe('getRenderer', () => {
    it('should delegate to pixi wrapper', () => {
      const sut = new ModulesScenesController();
      sut.getRenderer();
      expect(mockPixiWrapper.getRenderer).toHaveBeenCalled();
    });
  });

  describe('timeScale getter/setter', () => {
    it('should get time scale from service', () => {
      const sut = new ModulesScenesController();
      sut._service = mockService;
      expect(sut.timeScale).toBe(1);
    });

    it('should set time scale on service', () => {
      const sut = new ModulesScenesController();
      sut._service = mockService;
      sut.timeScale = 2;
      expect(mockService.setTimeScale).toHaveBeenCalledWith(2);
    });
  });
});
