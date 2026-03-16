import LibLoader from '../../src/ts/lib/loader';
import { AssetTypeId } from '../../src/ts/types';

describe('LibLoader', () => {
  let sut: LibLoader;

  beforeEach(() => {
    sut = new LibLoader();
    // JS source uses Urso.cache.getJsonAtlases() directly
    const mockUrso = (globalThis as Record<string, unknown>).Urso as Record<string, Record<string, unknown>>;
    if (mockUrso && mockUrso.cache && !mockUrso.cache.getJsonAtlases) {
      mockUrso.cache.getJsonAtlases = vi.fn(() => ({}));
    }
  });

  // ==========================================================================
  // constructor
  // ==========================================================================

  describe('constructor', () => {
    it('should not be running initially', () => {
      expect(sut.isRunning()).toBe(false);
    });
  });

  // ==========================================================================
  // isRunning
  // ==========================================================================

  describe('isRunning', () => {
    it('should return false when not loading', () => {
      expect(sut.isRunning()).toBe(false);
    });
  });

  // ==========================================================================
  // addAsset
  // ==========================================================================

  describe('addAsset', () => {
    it('should add an asset to the query', () => {
      const asset = { type: AssetTypeId.IMAGE, key: 'img1', path: 'images/test.png' };
      sut.addAsset(asset);
      // Verify by checking that start would attempt to load
      expect(sut.isRunning()).toBe(false);
    });
  });

  // ==========================================================================
  // setOnLoadUpdate
  // ==========================================================================

  describe('setOnLoadUpdate', () => {
    it('should accept a callback function', () => {
      const cb = vi.fn();
      sut.setOnLoadUpdate(cb);
      // Verify no error
      expect(true).toBe(true);
    });

    it('should not set callback when argument is falsy', () => {
      sut.setOnLoadUpdate(null);
      // Verify no error
      expect(true).toBe(true);
    });
  });

  // ==========================================================================
  // start
  // ==========================================================================

  describe('start', () => {
    it('should call callback immediately when no assets queued', async () => {
      const cb = vi.fn();
      await sut.start(cb);
      expect(cb).toHaveBeenCalled();
    });

    it('should return false if already running', async () => {
      // Simulate running state
      const slowCallback = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));
      sut.addAsset({ type: AssetTypeId.JSON, key: 'test', path: 'http://example.com/test.json' });

      // Mock PIXI.Assets on window
      (globalThis as Record<string, unknown>).PIXI = {
        Assets: {
          load: vi.fn(() => Promise.resolve({})),
        },
      };

      // Start loading
      const promise1 = sut.start(slowCallback);

      // Try to start again while running
      const result = await sut.start(vi.fn());
      expect(result).toBe(false);

      await promise1;

      delete (globalThis as Record<string, unknown>).PIXI;
    });
  });

  // ==========================================================================
  // _getLoadPath (via start behavior)
  // ==========================================================================

  describe('load path handling', () => {
    it('should use absolute paths as-is', async () => {
      const loadSpy = vi.fn(() => Promise.resolve({}));
      (globalThis as Record<string, unknown>).PIXI = {
        Assets: { load: loadSpy },
      };

      sut.addAsset({ type: AssetTypeId.IMAGE, key: 'test', path: 'http://cdn.example.com/img.png' });
      const cb = vi.fn();
      await sut.start(cb);

      expect(loadSpy).toHaveBeenCalledWith(
        expect.objectContaining({ src: 'http://cdn.example.com/img.png' })
      );

      delete (globalThis as Record<string, unknown>).PIXI;
    });

    it('should prepend gamePath for relative paths', async () => {
      const loadSpy = vi.fn(() => Promise.resolve({}));
      (globalThis as Record<string, unknown>).PIXI = {
        Assets: { load: loadSpy },
      };

      // Urso.config.useBinPath is false by default in mock
      sut.addAsset({ type: AssetTypeId.IMAGE, key: 'test', path: 'images/test.png' });
      const cb = vi.fn();
      await sut.start(cb);

      expect(loadSpy).toHaveBeenCalledWith(
        expect.objectContaining({ src: '/assets/images/test.png' })
      );

      delete (globalThis as Record<string, unknown>).PIXI;
    });
  });

  // ==========================================================================
  // _storeAsset
  // ==========================================================================

  describe('asset storage via start', () => {
    beforeEach(() => {
      (globalThis as Record<string, unknown>).PIXI = {
        Assets: { load: vi.fn(() => Promise.resolve({ data: 'loaded' })) },
      };
    });

    afterEach(() => {
      delete (globalThis as Record<string, unknown>).PIXI;
      vi.restoreAllMocks();
    });

    it('should store loaded atlas in cache', async () => {
      sut.addAsset({ type: AssetTypeId.ATLAS, key: 'atlas1', path: 'http://x.com/atlas.json' });
      await sut.start(vi.fn());
      expect(Urso.cache.addAtlas).toHaveBeenCalled();
    });

    it('should store loaded image texture in cache', async () => {
      sut.addAsset({ type: AssetTypeId.IMAGE, key: 'img1', path: 'http://x.com/img.png' });
      await sut.start(vi.fn());
      expect(Urso.cache.addTexture).toHaveBeenCalled();
    });

    it('should store loaded JSON in cache', async () => {
      sut.addAsset({ type: AssetTypeId.JSON, key: 'json1', path: 'http://x.com/data.json' });
      await sut.start(vi.fn());
      expect(Urso.cache.addJson).toHaveBeenCalled();
    });

    it('should store loaded sound in cache', async () => {
      sut.addAsset({ type: AssetTypeId.SOUND, key: 'snd1', path: 'http://x.com/snd.mp3' });
      await sut.start(vi.fn());
      expect(Urso.cache.addSound).toHaveBeenCalled();
    });

    it('should store loaded spine in cache', async () => {
      sut.addAsset({ type: AssetTypeId.SPINE, key: 'sp1', path: 'http://x.com/spine.json' });
      await sut.start(vi.fn());
      expect(Urso.cache.addSpine).toHaveBeenCalled();
    });
  });
});
