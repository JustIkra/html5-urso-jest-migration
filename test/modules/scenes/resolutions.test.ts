import ModulesScenesResolutions from '../../../src/ts/modules/scenes/resolutions';

describe('ModulesScenesResolutions', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockPixiWrapper: {
    showCanvas: ReturnType<typeof vi.fn>;
    hideCanvas: ReturnType<typeof vi.fn>;
    resize: ReturnType<typeof vi.fn>;
    setWorldScale: ReturnType<typeof vi.fn>;
    setCanvasWidth: ReturnType<typeof vi.fn>;
    setCanvasHeight: ReturnType<typeof vi.fn>;
  };
  let mockResolutionsConfig: {
    get: ReturnType<typeof vi.fn>;
    getAdaptive: ReturnType<typeof vi.fn>;
    maxSize: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = {
      ...mockUrso,
      device: {
        ...mockUrso.device,
        ScreenOrientation: { LANDSCAPE: 'landscape', PORTRAIT: 'portrait' },
      },
    };

    mockPixiWrapper = {
      showCanvas: vi.fn(),
      hideCanvas: vi.fn(),
      resize: vi.fn(),
      setWorldScale: vi.fn(),
      setCanvasWidth: vi.fn(),
      setCanvasHeight: vi.fn(),
    };

    mockResolutionsConfig = {
      get: vi.fn(() => [
        { name: 'default', width: 1920, height: 1080, orientation: 'landscape', adaptive: false },
      ]),
      getAdaptive: vi.fn(() => ({
        desktop: { supported: false, limits: { landscape: { min: 1, max: 2 }, portrait: { min: 0.5, max: 1 } } },
        mobile: { supported: false, limits: { landscape: { min: 1, max: 2 }, portrait: { min: 0.5, max: 1 } } },
      })),
      maxSize: vi.fn(() => 1920),
    };

    ModulesScenesResolutions.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'PixiWrapper') return mockPixiWrapper;
      if (path === 'ResolutionsConfig') return mockResolutionsConfig;
      return {};
    }) as ModulesScenesResolutions['getInstance'];

    ModulesScenesResolutions.prototype.emit = vi.fn() as ModulesScenesResolutions['emit'];
    ModulesScenesResolutions.prototype.addListener = vi.fn() as ModulesScenesResolutions['addListener'];
  });

  afterEach(() => {
    delete (ModulesScenesResolutions.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesScenesResolutions.prototype as { emit?: unknown }).emit;
    delete (ModulesScenesResolutions.prototype as { addListener?: unknown }).addListener;
  });

  it('should be a singleton', () => {
    const sut = new ModulesScenesResolutions();
    expect(sut.singleton).toBe(true);
  });

  it('should call refreshSceneSize in constructor', () => {
    const sut = new ModulesScenesResolutions();
    // After construction, _templateSize should be populated
    expect(sut._templateSize.width).toBeGreaterThan(0);
  });

  it('should return template size via getTemplateSize()', () => {
    const sut = new ModulesScenesResolutions();
    const size = sut.getTemplateSize();
    expect(size).toBe(sut._templateSize);
    expect(size.width).toBe(1920);
    expect(size.height).toBe(1080);
  });

  describe('refreshSceneSize', () => {
    it('should apply resolution to pixi wrapper', () => {
      const sut = new ModulesScenesResolutions();
      // Reset mocks after constructor calls
      mockPixiWrapper.showCanvas.mockClear();
      mockPixiWrapper.resize.mockClear();

      sut.refreshSceneSize();
      expect(mockPixiWrapper.showCanvas).toHaveBeenCalled();
      expect(mockPixiWrapper.resize).toHaveBeenCalled();
      expect(mockPixiWrapper.setWorldScale).toHaveBeenCalled();
    });

    it('should emit NEW_RESOLUTION event', () => {
      const sut = new ModulesScenesResolutions();
      (sut.emit as ReturnType<typeof vi.fn>).mockClear();

      sut.refreshSceneSize();
      const resolutionCalls = (sut.emit as ReturnType<typeof vi.fn>).mock.calls.filter(
        (c: unknown[]) => c[0] === mockUrso.events.MODULES_SCENES_NEW_RESOLUTION,
      );
      expect(resolutionCalls.length).toBeGreaterThan(0);
    });

    it('should return true', () => {
      const sut = new ModulesScenesResolutions();
      expect(sut.refreshSceneSize()).toBe(true);
    });
  });

  describe('preResize', () => {
    it('should hide canvas on mobile', () => {
      mockUrso.helper.mobileAndTabletCheck.mockReturnValue(true);
      const sut = new ModulesScenesResolutions();
      mockPixiWrapper.hideCanvas.mockClear();
      sut.preResize();
      expect(mockPixiWrapper.hideCanvas).toHaveBeenCalled();
    });

    it('should not hide canvas on desktop', () => {
      mockUrso.helper.mobileAndTabletCheck.mockReturnValue(false);
      const sut = new ModulesScenesResolutions();
      mockPixiWrapper.hideCanvas.mockClear();
      sut.preResize();
      expect(mockPixiWrapper.hideCanvas).not.toHaveBeenCalled();
    });
  });

  describe('_getWindowSize', () => {
    it('should return window dimensions', () => {
      const sut = new ModulesScenesResolutions();
      const size = sut._getWindowSize();
      expect(size.width).toBeGreaterThanOrEqual(0);
      expect(size.height).toBeGreaterThanOrEqual(0);
    });
  });

  describe('_getOrientation', () => {
    it('should return landscape for wider windows', () => {
      const sut = new ModulesScenesResolutions();
      expect(sut._getOrientation({ width: 1920, height: 1080 })).toBe('landscape');
    });

    it('should return portrait for taller windows', () => {
      const sut = new ModulesScenesResolutions();
      expect(sut._getOrientation({ width: 1080, height: 1920 })).toBe('portrait');
    });
  });

  describe('orientation change', () => {
    it('should emit ORIENTATION_CHANGE when orientation differs', () => {
      const sut = new ModulesScenesResolutions();
      sut._currentOrientation = null;
      (sut.emit as ReturnType<typeof vi.fn>).mockClear();

      sut.refreshSceneSize();

      const orientationCalls = (sut.emit as ReturnType<typeof vi.fn>).mock.calls.filter(
        (c: unknown[]) => c[0] === mockUrso.events.MODULES_SCENES_ORIENTATION_CHANGE,
      );
      expect(orientationCalls.length).toBeGreaterThan(0);
    });

    it('should not emit ORIENTATION_CHANGE when orientation unchanged', () => {
      const sut = new ModulesScenesResolutions();
      // Set orientation to match what refreshSceneSize will compute
      sut._currentOrientation = sut._templateSize.orientation;
      (sut.emit as ReturnType<typeof vi.fn>).mockClear();

      sut.refreshSceneSize();

      const orientationCalls = (sut.emit as ReturnType<typeof vi.fn>).mock.calls.filter(
        (c: unknown[]) => c[0] === mockUrso.events.MODULES_SCENES_ORIENTATION_CHANGE,
      );
      expect(orientationCalls.length).toBe(0);
    });
  });

  describe('_subscribeOnce', () => {
    it('should register event listeners', () => {
      const sut = new ModulesScenesResolutions();
      sut._subscribeOnce();
      expect(sut.addListener).toHaveBeenCalledTimes(3);
    });
  });
});
