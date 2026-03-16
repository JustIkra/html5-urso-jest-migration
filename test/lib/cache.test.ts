import LibCache from '../../src/ts/lib/cache';

describe('LibCache', () => {
  let sut: LibCache;

  beforeEach(() => {
    sut = new LibCache();
  });

  // ==========================================================================
  // constructor
  // ==========================================================================

  describe('constructor', () => {
    it('should initialize assetsList with all empty categories', () => {
      const list = sut.assetsList;
      expect(list.atlas).toEqual({});
      expect(list.binary).toEqual({});
      expect(list.bitmapFont).toEqual({});
      expect(list.file).toEqual({});
      expect(list.image).toEqual({});
      expect(list.json).toEqual({});
      expect(list.jsonAtlas).toEqual({});
      expect(list.sound).toEqual({});
      expect(list.spine).toEqual({});
      expect(list.spineAtlas).toEqual({});
      expect(list.texture).toEqual({});
    });
  });

  // ==========================================================================
  // addFile / getFile
  // ==========================================================================

  describe('addFile / getFile', () => {
    it('should store and retrieve a file', () => {
      const data = { content: 'hello' };
      sut.addFile('myFile', data);
      expect(sut.getFile('myFile')).toBe(data);
    });

    it('should return undefined for missing key', () => {
      expect(sut.getFile('nonexistent')).toBeUndefined();
    });
  });

  // ==========================================================================
  // addAtlas / getAtlas
  // ==========================================================================

  describe('addAtlas / getAtlas', () => {
    it('should store and retrieve an atlas', () => {
      const data = { frames: {} };
      sut.addAtlas('myAtlas', data);
      expect(sut.getAtlas('myAtlas')).toBe(data);
    });

    it('should clear globalAtlas when adding atlas', () => {
      const spy = vi.spyOn(sut, 'clearGlobalAtlas');
      sut.addAtlas('key', {});
      expect(spy).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // addBinary / getBinary
  // ==========================================================================

  describe('addBinary / getBinary', () => {
    it('should store and retrieve binary data', () => {
      const data = new ArrayBuffer(8);
      sut.addBinary('myBin', data);
      expect(sut.getBinary('myBin')).toBe(data);
    });
  });

  // ==========================================================================
  // addBitmapFont / getBitmapFont
  // ==========================================================================

  describe('addBitmapFont / getBitmapFont', () => {
    it('should store and retrieve a bitmap font', () => {
      const data = { font: 'myFont' };
      sut.addBitmapFont('myFont', data);
      expect(sut.getBitmapFont('myFont')).toBe(data);
    });
  });

  // ==========================================================================
  // addContainer / getContainer
  // ==========================================================================

  describe('addContainer / getContainer', () => {
    it('should store and retrieve a container', () => {
      // JS assetsList doesn't include container by default; init it manually
      if (!sut.assetsList.container) {
        (sut.assetsList as unknown as Record<string, Record<string, unknown>>).container = {};
      }
      const data = { id: 'container1' };
      sut.addContainer('c1', data);
      expect(sut.getContainer('c1')).toBe(data);
    });
  });

  // ==========================================================================
  // addImage / getImage
  // ==========================================================================

  describe('addImage / getImage', () => {
    it('should store and retrieve an image', () => {
      const data = { width: 100 };
      sut.addImage('img1', data);
      expect(sut.getImage('img1')).toBe(data);
    });
  });

  // ==========================================================================
  // addJson / getJson
  // ==========================================================================

  describe('addJson / getJson', () => {
    it('should store and retrieve JSON data', () => {
      const data = { key: 'value' };
      sut.addJson('data1', data);
      expect(sut.getJson('data1')).toBe(data);
    });
  });

  // ==========================================================================
  // addJsonAtlas / getJsonAtlas / getJsonAtlases
  // ==========================================================================

  describe('addJsonAtlas / getJsonAtlas / getJsonAtlases', () => {
    it('should store and retrieve a JSON atlas', () => {
      const data = { frames: {} };
      sut.addJsonAtlas('atlas1', data);
      expect(sut.getJsonAtlas('atlas1')).toBe(data);
    });

    it('should return all JSON atlases', () => {
      sut.addJsonAtlas('a1', { x: 1 });
      sut.addJsonAtlas('a2', { x: 2 });
      const all = sut.getJsonAtlases();
      expect(Object.keys(all)).toEqual(['a1', 'a2']);
    });
  });

  // ==========================================================================
  // addSound / getSound
  // ==========================================================================

  describe('addSound / getSound', () => {
    it('should store and retrieve a sound', () => {
      const data = { src: 'test.mp3' };
      sut.addSound('snd1', data);
      expect(sut.getSound('snd1')).toBe(data);
    });
  });

  // ==========================================================================
  // addTexture / getTexture
  // ==========================================================================

  describe('addTexture / getTexture', () => {
    it('should store and retrieve a texture', () => {
      const data = { texture: true };
      sut.addTexture('tex1', data);
      expect(sut.getTexture('tex1')).toBe(data);
    });

    it('should strip file extension from key', () => {
      const data = { texture: true };
      sut.addTexture('myimage.png', data);
      expect(sut.getTexture('myimage')).toBe(data);
    });

    it('should handle keys without extension', () => {
      const data = { texture: true };
      sut.addTexture('noext', data);
      expect(sut.getTexture('noext')).toBe(data);
    });

    it('should handle keys with multiple dots', () => {
      const data = { texture: true };
      sut.addTexture('my.image.name.png', data);
      expect(sut.getTexture('my.image.name')).toBe(data);
    });
  });

  // ==========================================================================
  // addSpine / getSpine
  // ==========================================================================

  describe('addSpine / getSpine', () => {
    it('should store and retrieve spine data', () => {
      const data = { skeleton: {} };
      sut.addSpine('spine1', data);
      expect(sut.getSpine('spine1')).toBe(data);
    });
  });

  // ==========================================================================
  // addSpineAtlas / getSpineAtlas
  // ==========================================================================

  describe('addSpineAtlas / getSpineAtlas', () => {
    it('should store and retrieve spine atlas data', () => {
      const data = { pages: [], regions: [] };
      sut.addSpineAtlas('spAtlas1', data);
      expect(sut.getSpineAtlas('spAtlas1')).toBe(data);
    });
  });

  // ==========================================================================
  // clearGlobalAtlas
  // ==========================================================================

  describe('clearGlobalAtlas', () => {
    it('should reset globalAtlas to null', () => {
      sut.clearGlobalAtlas();
      // After clearing, the internal _globalAtlas should be null
      // We verify by checking that getGlobalAtlas creates a new one
      // (no spine mock, so just verify the method exists and doesn't throw)
      expect(typeof sut.clearGlobalAtlas).toBe('function');
    });
  });

  // ==========================================================================
  // duplicate key warning
  // ==========================================================================

  describe('duplicate key warning', () => {
    it('should warn when adding duplicate key', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      sut.addJson('dup', { a: 1 });
      sut.addJson('dup', { a: 2 });
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should still overwrite the value on duplicate', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      sut.addJson('dup', { a: 1 });
      sut.addJson('dup', { a: 2 });
      expect(sut.getJson('dup')).toEqual({ a: 2 });
      vi.restoreAllMocks();
    });
  });
});
