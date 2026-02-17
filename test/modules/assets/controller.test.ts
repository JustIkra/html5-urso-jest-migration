import ModulesAssetsController from '../../../src/ts/modules/assets/controller';

describe('ModulesAssetsController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockService = {
      updateQuality: vi.fn(),
      getQuality: vi.fn(() => 'auto'),
      getCurrentResolution: vi.fn(() => 1),
      sortAssets: vi.fn(() => ({ 0: [] })),
      startLoad: vi.fn(),
      loadGroup: vi.fn(),
      checkWebPSupport: vi.fn(),
      preloadAllImagesInGPU: vi.fn(),
    };

    mockUrso.getInstance = vi.fn((path: string) => {
      if (path === 'Service') return mockService;
      return {};
    });

    (globalThis as Record<string, unknown>).Urso = mockUrso;

    ModulesAssetsController.prototype.getInstance = mockUrso.getInstance as ModulesAssetsController['getInstance'];
  });

  afterEach(() => {
    delete (ModulesAssetsController.prototype as unknown as Record<string, unknown>).getInstance;
  });

  it('should be a singleton', () => {
    const sut = new ModulesAssetsController();
    expect(sut.singleton).toBe(true);
  });

  describe('updateQuality', () => {
    it('should call service updateQuality when useBinPath is true', () => {
      mockUrso.config.useBinPath = true;
      const sut = new ModulesAssetsController();
      sut.updateQuality();
      expect(mockService.updateQuality).toHaveBeenCalled();
    });

    it('should not call service updateQuality when useBinPath is false', () => {
      mockUrso.config.useBinPath = false;
      const sut = new ModulesAssetsController();
      sut.updateQuality();
      expect(mockService.updateQuality).not.toHaveBeenCalled();
    });

    it('should log quality to console', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const sut = new ModulesAssetsController();
      sut.updateQuality();
      expect(consoleSpy).toHaveBeenCalledWith('[ASSETS] Quality set to', 'auto');
      consoleSpy.mockRestore();
    });
  });

  describe('getQuality', () => {
    it('should delegate to service getQuality', () => {
      const sut = new ModulesAssetsController();
      expect(sut.getQuality()).toBe('auto');
      expect(mockService.getQuality).toHaveBeenCalled();
    });
  });

  describe('getCurrentResolution', () => {
    it('should delegate to service getCurrentResolution', () => {
      const sut = new ModulesAssetsController();
      expect(sut.getCurrentResolution()).toBe(1);
      expect(mockService.getCurrentResolution).toHaveBeenCalled();
    });
  });

  describe('preload', () => {
    it('should sort assets and start load', () => {
      const sut = new ModulesAssetsController();
      const callback = vi.fn();
      const updateCb = vi.fn();
      sut.preload([{ type: 6, key: 'bg', path: '/bg.png' }], callback, updateCb);
      expect(mockService.sortAssets).toHaveBeenCalled();
      expect(mockService.startLoad).toHaveBeenCalledWith({ 0: [] }, callback, updateCb);
    });
  });

  describe('loadGroup', () => {
    it('should delegate to service loadGroup with null assetsSpace', () => {
      const sut = new ModulesAssetsController();
      const callback = vi.fn();
      sut.loadGroup('myGroup', callback);
      expect(mockService.loadGroup).toHaveBeenCalledWith(null, 'myGroup', callback, expect.any(Function));
    });
  });

  describe('checkWebPSupport', () => {
    it('should delegate to service checkWebPSupport', () => {
      const sut = new ModulesAssetsController();
      sut.checkWebPSupport();
      expect(mockService.checkWebPSupport).toHaveBeenCalled();
    });
  });

  describe('preloadAllImagesInGPU', () => {
    it('should delegate to service preloadAllImagesInGPU', () => {
      const sut = new ModulesAssetsController();
      sut.preloadAllImagesInGPU();
      expect(mockService.preloadAllImagesInGPU).toHaveBeenCalled();
    });
  });
});
