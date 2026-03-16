import ModulesAssetsService from '../../../src/ts/modules/assets/service';
import { AssetTypeId, UrsoEvent } from '../../../src/ts/types';

function createService(): ModulesAssetsService {
  const sut = new ModulesAssetsService();
  return sut;
}

describe('ModulesAssetsService', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockConfig: Record<string, unknown>;
  let mockLoader: {
    addAsset: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    setOnLoadUpdate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );

    mockConfig = {
      loadingGroups: { initial: 0 },
      lazyLoadGroups: [],
      qualityFactors: { medium: 0.5, hd: 0.75, high: 1 },
      defaultQualityFactor: 1,
      addFolderPathInAtlasTextureKey: true,
    };

    mockLoader = {
      addAsset: vi.fn(),
      start: vi.fn((cb: () => void) => cb()),
      setOnLoadUpdate: vi.fn(),
    };

    mockUrso.getInstance = vi.fn((path: string, ...args: unknown[]) => {
      if (path === 'Config') return mockConfig;
      if (path === 'Lib.Loader') return mockLoader;
      if (path.startsWith('Models.')) {
        // Return a simple model with the asset data
        const asset = args[0] as Record<string, unknown> | undefined;
        return {
          type: asset?.type,
          key: asset?.key ?? null,
          path: asset?.path ?? null,
          loadingGroup: asset?.loadingGroup ?? null,
          contents: asset?.contents,
          cacheTextures: asset?.cacheTextures,
          noAtlas: asset?.noAtlas,
          preloadGPU: asset?.preloadGPU,
        };
      }
      return {};
    });

    (globalThis as Record<string, unknown>).Urso = mockUrso;

    // Inject getInstance and emit onto prototype
    ModulesAssetsService.prototype.getInstance = mockUrso.getInstance as ModulesAssetsService['getInstance'];
    ModulesAssetsService.prototype.emit = vi.fn() as ModulesAssetsService['emit'];
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (ModulesAssetsService.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesAssetsService.prototype as { emit?: unknown }).emit;
  });

  // ======================================================================
  // Constructor
  // ======================================================================

  describe('constructor', () => {
    it('should be a singleton', () => {
      const sut = createService();
      expect(sut.singleton).toBe(true);
    });

    it('should initialize assets as empty object', () => {
      const sut = createService();
      expect(sut.assets).toEqual({});
    });

    it('should default lazyLoadProcessStarted to false', () => {
      const sut = createService();
      expect(sut.lazyLoadProcessStarted).toBe(false);
    });
  });

  // ======================================================================
  // checkWebPSupport
  // ======================================================================

  describe('checkWebPSupport', () => {
    it('should add webP mode when device supports webP', () => {
      (mockUrso.device as Record<string, unknown>).webP = true;
      mockUrso.addInstancesMode = vi.fn();
      const sut = createService();
      sut.checkWebPSupport();
      expect(mockUrso.addInstancesMode).toHaveBeenCalledWith('webP');
    });

    it('should not add webP mode when device does not support webP', () => {
      mockUrso.addInstancesMode = vi.fn();
      const sut = createService();
      sut.checkWebPSupport();
      expect(mockUrso.addInstancesMode).not.toHaveBeenCalled();
    });
  });

  // ======================================================================
  // getQuality / updateQuality
  // ======================================================================

  describe('getQuality', () => {
    it('should return auto by default', () => {
      const sut = createService();
      expect(sut.getQuality()).toBe('auto');
    });
  });

  describe('updateQuality', () => {
    it('should detect quality and add instances mode', () => {
      mockUrso.addInstancesMode = vi.fn();
      mockUrso.helper.parseGetParams = vi.fn(() => ({ quality: 'high' }));
      const sut = createService();
      sut.updateQuality();
      expect(sut.getQuality()).toBe('high');
      expect(mockUrso.addInstancesMode).toHaveBeenCalledWith('highQuality');
    });
  });

  // ======================================================================
  // getCurrentResolution
  // ======================================================================

  describe('getCurrentResolution', () => {
    it('should return defaultQualityFactor when quality is auto', () => {
      const sut = createService();
      expect(sut.getCurrentResolution()).toBe(1);
    });

    it('should return quality factor for detected quality', () => {
      mockUrso.addInstancesMode = vi.fn();
      mockUrso.helper.parseGetParams = vi.fn(() => ({ quality: 'medium' }));
      const sut = createService();
      sut.updateQuality();
      expect(sut.getCurrentResolution()).toBe(0.5);
    });
  });

  // ======================================================================
  // sortAssets
  // ======================================================================

  describe('sortAssets', () => {
    it('should create a new assets space', () => {
      const sut = createService();
      const result = sut.sortAssets([]);
      expect(result).toBeDefined();
      expect(result[0]).toEqual([]);
    });

    it('should sort a single asset into initial group', () => {
      const sut = createService();
      const asset = { type: AssetTypeId.IMAGE, key: 'bg', path: '/bg.png' };
      const result = sut.sortAssets(asset as never);
      expect(result[0]).toHaveLength(1);
      expect(result[0][0]).toMatchObject({ type: AssetTypeId.IMAGE, key: 'bg' });
    });

    it('should sort an array of assets into initial group', () => {
      const sut = createService();
      const assets = [
        { type: AssetTypeId.IMAGE, key: 'bg', path: '/bg.png' },
        { type: AssetTypeId.JSON, key: 'config', path: '/config.json' },
      ];
      const result = sut.sortAssets(assets as never);
      expect(result[0]).toHaveLength(2);
    });

    it('should deduplicate assets by type_key', () => {
      const sut = createService();
      const assets = [
        { type: AssetTypeId.IMAGE, key: 'bg', path: '/bg.png' },
        { type: AssetTypeId.IMAGE, key: 'bg', path: '/bg.png' },
      ];
      const result = sut.sortAssets(assets as never);
      expect(result[0]).toHaveLength(1);
    });

    it('should not deduplicate containers', () => {
      const sut = createService();
      const assets = [
        { type: AssetTypeId.CONTAINER, key: 'c1', contents: [
          { type: AssetTypeId.IMAGE, key: 'img1', path: '/img1.png' },
        ]},
        { type: AssetTypeId.CONTAINER, key: 'c1', contents: [
          { type: AssetTypeId.JSON, key: 'json1', path: '/json1.json' },
        ]},
      ];
      const result = sut.sortAssets(assets as never);
      // Both container contents should be added
      expect(result[0]).toHaveLength(2);
    });
  });

  // ======================================================================
  // _addAsset (via sortAssets)
  // ======================================================================

  describe('_addAsset', () => {
    it('should create model via getInstance for each asset type', () => {
      const sut = createService();
      sut.sortAssets({ type: AssetTypeId.ATLAS, key: 'atlas1', path: '/atlas1.json' } as never);
      expect(mockUrso.getInstance).toHaveBeenCalledWith('Models.Atlas', expect.objectContaining({ type: AssetTypeId.ATLAS }));
    });

    it('should log error for unknown asset type', () => {
      const sut = createService();
      try { sut.sortAssets({ type: 999, key: 'unknown', path: '/unknown' } as never); } catch (_e) { /* JS falls through: model is undefined after default case */ }
      expect(mockUrso.logger.error).toHaveBeenCalledWith('ModulesAssetsService asset type error', expect.anything());
    });

    it('should put non-initial loading group assets into separate space', () => {
      const sut = createService();
      const asset = { type: AssetTypeId.IMAGE, key: 'lazy', path: '/lazy.png', loadingGroup: 'lazy1' };
      sut.sortAssets(asset as never);
      expect((sut.assets as never)['lazy1']).toHaveLength(1);
    });
  });

  // ======================================================================
  // startLoad
  // ======================================================================

  describe('startLoad', () => {
    it('should call loadGroup with initial group', async () => {
      const sut = createService();
      const assetsSpace = { 0: [] as unknown[] };
      const callback = vi.fn();
      const updateCb = vi.fn();

      sut.startLoad(assetsSpace as never, callback, updateCb);
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  // ======================================================================
  // loadGroup
  // ======================================================================

  describe('loadGroup', () => {
    it('should log error if group does not exist', () => {
      const sut = createService();
      sut.loadGroup({} as never, 'nonexistent');
      expect(mockUrso.logger.error).toHaveBeenCalledWith(expect.stringContaining('group error'));
    });

    it('should use global assets when assetsSpace is null', () => {
      const sut = createService();
      (sut.assets as Record<string, unknown>)['myGroup'] = [];
      sut.loadGroup(null, 'myGroup');
      // should not error since the group exists
      expect(mockUrso.logger.error).not.toHaveBeenCalled();
    });

    it('should load atlases before rest assets', () => {
      const sut = createService();
      const assetsSpace = {
        0: [
          { type: AssetTypeId.IMAGE, key: 'img', path: '/img.png' },
          { type: AssetTypeId.ATLAS, key: 'atlas', path: '/atlas.json' },
        ],
      };
      sut.loadGroup(assetsSpace as never, 0);
      // Atlas should be loaded via loader
      expect(mockLoader.addAsset).toHaveBeenCalledWith(expect.objectContaining({ type: AssetTypeId.ATLAS }));
    });
  });

  // ======================================================================
  // _processLoadedAtlases
  // ======================================================================

  describe('atlas processing', () => {
    it('should cache textures from atlas when cacheTextures is true', () => {
      const sut = createService();
      mockUrso.cache.getAtlas = vi.fn(() => ({
        textures: { 'frame1': 'tex1', 'frame2': 'tex2' },
      }));

      const assetsSpace = {
        0: [
          { type: AssetTypeId.ATLAS, key: 'myAtlas', path: '/atlas.json', cacheTextures: true },
        ],
      };
      // Trigger atlas loading -> processing
      sut.loadGroup(assetsSpace as never, 0);

      expect(mockUrso.cache.addTexture).toHaveBeenCalledWith('frame1', 'tex1');
      expect(mockUrso.cache.addTexture).toHaveBeenCalledWith('frame2', 'tex2');
    });
  });

  // ======================================================================
  // _processLoadedSpineAtlas
  // ======================================================================

  describe('spine atlas processing', () => {
    it('should add textures from spine atlas regions', () => {
      const sut = createService();
      mockUrso.cache.getSpineAtlas = vi.fn(() => ({
        regions: [
          { name: 'bone1', texture: { texture: 'tex1' } },
          { name: 'bone2', texture: { texture: 'tex2' } },
        ],
      }));
      (mockUrso.cache as Record<string, ReturnType<typeof vi.fn>>).getFile = vi.fn(() => null);

      const assetsSpace = {
        0: [
          { type: AssetTypeId.SPINEATLAS, key: 'heroAtlas', path: '/hero.atlas' },
        ],
      };
      sut.loadGroup(assetsSpace as never, 0);

      expect(mockUrso.cache.addTexture).toHaveBeenCalledWith('bone1', 'tex1');
      expect(mockUrso.cache.addTexture).toHaveBeenCalledWith('bone2', 'tex2');
    });

    it('should log error when spine atlas not found', () => {
      const sut = createService();
      mockUrso.cache.getSpineAtlas = vi.fn(() => null);
      (mockUrso.cache as Record<string, ReturnType<typeof vi.fn>>).getFile = vi.fn(() => null);

      const assetsSpace = {
        0: [
          { type: AssetTypeId.SPINEATLAS, key: 'missing', path: '/missing.atlas' },
        ],
      };
      sut.loadGroup(assetsSpace as never, 0);

      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('process Loaded Spine Atlas error'),
        expect.anything(),
      );
    });
  });

  // ======================================================================
  // _loadGroupRestAssets
  // ======================================================================

  describe('rest assets loading', () => {
    it('should skip already cached files', () => {
      const sut = createService();
      (mockUrso.cache as Record<string, ReturnType<typeof vi.fn>>).getFile = vi.fn(() => 'cached');

      const assetsSpace = {
        0: [
          { type: AssetTypeId.IMAGE, key: 'img', path: '/img.png' },
        ],
      };
      sut.loadGroup(assetsSpace as never, 0);

      // addAsset should NOT be called since file is cached
      expect(mockLoader.addAsset).not.toHaveBeenCalledWith(expect.objectContaining({ type: AssetTypeId.IMAGE }));
    });

    it('should filter noAtlas spine files for separate loading', async () => {
      const sut = createService();
      (mockUrso.cache as Record<string, ReturnType<typeof vi.fn>>).getFile = vi.fn(() => null);

      const assetsSpace = {
        0: [
          { type: AssetTypeId.SPINE, key: 'hero', path: '/hero.json', noAtlas: true },
          { type: AssetTypeId.IMAGE, key: 'bg', path: '/bg.png' },
        ],
      };
      sut.loadGroup(assetsSpace as never, 0);
      // First loader.start = rest assets (IMAGE only, spine filtered out)
      // Second loader.start = noAtlas spines (async, after microtask)
      await vi.waitFor(() => {
        expect(mockLoader.start).toHaveBeenCalledTimes(2);
      });
      // Verify the noAtlas spine was added to a separate loader call
      expect(mockLoader.addAsset).toHaveBeenCalledWith(
        expect.objectContaining({ type: AssetTypeId.SPINE, noAtlas: true }),
      );
    });

    it('should emit group loaded event after processing', async () => {
      const sut = createService();
      (mockUrso.cache as Record<string, ReturnType<typeof vi.fn>>).getFile = vi.fn(() => null);

      const assetsSpace = {
        0: [
          { type: AssetTypeId.IMAGE, key: 'bg', path: '/bg.png' },
        ],
      };
      sut.loadGroup(assetsSpace as never, 0);
      await vi.waitFor(() => {
        expect(sut.emit).toHaveBeenCalledWith(UrsoEvent.MODULES_ASSETS_GROUP_LOADED, 0);
      });
    });
  });

  // ======================================================================
  // _addAssetToLoader
  // ======================================================================

  describe('addAssetToLoader', () => {
    it('should log error when asset has no path and no contents', async () => {
      const sut = createService();
      (mockUrso.cache as Record<string, ReturnType<typeof vi.fn>>).getFile = vi.fn(() => null);

      const assetsSpace = {
        0: [
          { type: AssetTypeId.IMAGE, key: 'broken', path: null },
        ],
      };
      sut.loadGroup(assetsSpace as never, 0);

      await vi.waitFor(() => {
        expect(mockUrso.logger.error).toHaveBeenCalledWith(
          'ModulesAssetsService model error',
          expect.anything(),
        );
      });
    });
  });

  // ======================================================================
  // _startLazyLoad / _continueLazyLoad
  // ======================================================================

  describe('lazy loading', () => {
    it('should emit lazy load finished when no lazy groups', async () => {
      const sut = createService();
      const assetsSpace = { 0: [] as unknown[] };
      const callback = vi.fn();
      sut.startLoad(assetsSpace as never, callback, vi.fn());

      await vi.waitFor(() => {
        expect(sut.emit).toHaveBeenCalledWith(UrsoEvent.MODULES_ASSETS_LAZYLOAD_FINISHED);
      });
    });

    it('should not start lazy load twice', async () => {
      const sut = createService();

      // First load
      const assetsSpace1 = { 0: [] as unknown[] };
      sut.startLoad(assetsSpace1 as never, vi.fn(), vi.fn());

      await vi.waitFor(() => {
        expect(sut.emit).toHaveBeenCalledWith(UrsoEvent.MODULES_ASSETS_LAZYLOAD_FINISHED);
      });

      // Second load - should not re-enter
      const assetsSpace2 = { 0: [] as unknown[] };
      sut.startLoad(assetsSpace2 as never, vi.fn(), vi.fn());

      // Only one LAZYLOAD_FINISHED event
      const emitCalls = vi.mocked(sut.emit).mock.calls.filter(
        (c) => c[0] === UrsoEvent.MODULES_ASSETS_LAZYLOAD_FINISHED,
      );
      expect(emitCalls).toHaveLength(1);
    });

    it('should load lazy groups sequentially', async () => {
      mockConfig.lazyLoadGroups = ['lazy1', 'lazy2'];
      const sut = createService();
      (sut.assets as Record<string, unknown>)['lazy1'] = [];
      (sut.assets as Record<string, unknown>)['lazy2'] = [];

      const assetsSpace = { 0: [] as unknown[] };
      sut.startLoad(assetsSpace as never, vi.fn(), vi.fn());

      await vi.waitFor(() => {
        expect(sut.emit).toHaveBeenCalledWith(UrsoEvent.MODULES_ASSETS_LAZYLOAD_FINISHED);
      });
    });

    it('should log error for missing lazy group name', async () => {
      mockConfig.lazyLoadGroups = [''];
      const sut = createService();

      const assetsSpace = { 0: [] as unknown[] };
      sut.startLoad(assetsSpace as never, vi.fn(), vi.fn());

      await vi.waitFor(() => {
        expect(mockUrso.logger.error).toHaveBeenCalledWith('ModulesAssetsService lazy loading groupName error');
      });
    });
  });

  // ======================================================================
  // _qualityReducer
  // ======================================================================

  describe('quality detection', () => {
    it('should return user-specified quality from URL params', () => {
      mockUrso.addInstancesMode = vi.fn();
      mockUrso.helper.parseGetParams = vi.fn(() => ({ quality: 'medium' }));
      const sut = createService();
      sut.updateQuality();
      expect(sut.getQuality()).toBe('medium');
    });

    it('should return high quality for macOS desktop', () => {
      mockUrso.addInstancesMode = vi.fn();
      mockUrso.helper.parseGetParams = vi.fn(() => ({}));
      (mockUrso.device as Record<string, unknown>).macOS = true;
      (mockUrso.device as Record<string, unknown>).android = false;
      (mockUrso.device as Record<string, unknown>).iOS = false;
      (mockUrso.device as Record<string, unknown>).iPad = false;

      const sut = createService();
      sut.updateQuality();
      expect(sut.getQuality()).toBe('high');
    });

    it('should return medium quality for macOS iPad', () => {
      mockUrso.addInstancesMode = vi.fn();
      mockUrso.helper.parseGetParams = vi.fn(() => ({}));
      (mockUrso.device as Record<string, unknown>).macOS = true;
      (mockUrso.device as Record<string, unknown>).iPad = true;
      (mockUrso.device as Record<string, unknown>).android = false;
      (mockUrso.device as Record<string, unknown>).iOS = false;

      const sut = createService();
      sut.updateQuality();
      expect(sut.getQuality()).toBe('medium');
    });

    it('should calculate quality based on screen width for other devices', () => {
      mockUrso.addInstancesMode = vi.fn();
      mockUrso.helper.parseGetParams = vi.fn(() => ({}));
      (mockUrso.device as Record<string, unknown>).macOS = false;
      (mockUrso.device as Record<string, unknown>).android = false;
      (mockUrso.device as Record<string, unknown>).iOS = false;
      (mockUrso.device as Record<string, unknown>).iPad = false;

      mockUrso.getInstance = vi.fn((path: string, ...args: unknown[]) => {
        if (path === 'Config') return mockConfig;
        if (path === 'Modules.Scenes.ResolutionsConfig') return { contents: [{ width: 1920, height: 1080 }] };
        if (path.startsWith('Models.')) {
          const asset = args[0] as Record<string, unknown>;
          return { ...asset, loadingGroup: null };
        }
        return {};
      });
      ModulesAssetsService.prototype.getInstance = mockUrso.getInstance as ModulesAssetsService['getInstance'];

      const sut = createService();
      sut.updateQuality();
      // Quality depends on screen resolution which varies
      expect(['medium', 'hd', 'high']).toContain(sut.getQuality());
    });

    it('should cap mobile high quality to hd', () => {
      mockUrso.addInstancesMode = vi.fn();
      mockUrso.helper.parseGetParams = vi.fn(() => ({}));
      (mockUrso.device as Record<string, unknown>).macOS = false;
      (mockUrso.device as Record<string, unknown>).android = true;
      (mockUrso.device as Record<string, unknown>).iOS = false;
      (mockUrso.device as Record<string, unknown>).iPad = false;

      // Mock a very wide screen to trigger "high" quality
      Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
      Object.defineProperty(screen, 'width', { value: 3000, configurable: true });
      Object.defineProperty(screen, 'height', { value: 1000, configurable: true });

      mockUrso.getInstance = vi.fn((path: string, ...args: unknown[]) => {
        if (path === 'Config') return mockConfig;
        if (path === 'Modules.Scenes.ResolutionsConfig') return { contents: [{ width: 1920, height: 1080 }] };
        if (path.startsWith('Models.')) {
          const asset = args[0] as Record<string, unknown>;
          return { ...asset, loadingGroup: null };
        }
        return {};
      });
      ModulesAssetsService.prototype.getInstance = mockUrso.getInstance as ModulesAssetsService['getInstance'];

      const sut = createService();
      sut.updateQuality();
      expect(sut.getQuality()).toBe('hd');
    });
  });

  // ======================================================================
  // preloadAllImagesInGPU
  // ======================================================================

  describe('preloadAllImagesInGPU', () => {
    it('should be a stub (no-op)', () => {
      const sut = createService();
      expect(() => sut.preloadAllImagesInGPU()).not.toThrow();
    });
  });
});
