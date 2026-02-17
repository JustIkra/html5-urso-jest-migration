import ComponentsEditorApi from '../../../src/ts/components/editor/api';

describe('ComponentsEditorApi', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  function createSut(): ComponentsEditorApi {
    return new ComponentsEditorApi();
  }

  describe('_assetsKeys', () => {
    it('should have predefined asset key definitions', () => {
      const sut = createSut();
      expect(sut._assetsKeys).toHaveProperty('ATLAS');
      expect(sut._assetsKeys).toHaveProperty('IMAGE');
      expect(sut._assetsKeys).toHaveProperty('SPINE');
      expect(sut._assetsKeys.ATLAS).toEqual([
        { name: 'key', type: 'text' },
        { name: 'path', type: 'file' },
      ]);
    });
  });

  describe('_commonObjectsKeys', () => {
    it('should contain standard object properties', () => {
      const sut = createSut();
      const names = sut._commonObjectsKeys.map(k => k.name);
      expect(names).toContain('id');
      expect(names).toContain('x');
      expect(names).toContain('visible');
      expect(names).toContain('alpha');
    });
  });

  describe('_objectsKeys', () => {
    it('should build object keys via mergeArrays', () => {
      const sut = createSut();
      expect(sut._objectsKeys).toHaveProperty('BITMAPTEXT');
      expect(sut._objectsKeys).toHaveProperty('TEXT');
      expect(sut._objectsKeys).toHaveProperty('IMAGE');
      expect(sut._objectsKeys).toHaveProperty('CONTAINER');
      expect(mockUrso.helper.mergeArrays).toHaveBeenCalled();
    });

    it('should have CONTAINER equal to commonObjectsKeys', () => {
      const sut = createSut();
      expect(sut._objectsKeys.CONTAINER).toBe(sut._commonObjectsKeys);
    });
  });

  describe('getCurrentStyles', () => {
    it('should return styles from template', () => {
      const mockTemplate = { styles: { '.test': {} }, assets: [], objects: [] };
      (mockUrso as unknown as Record<string, unknown>).template = { get: vi.fn(() => mockTemplate) };
      const sut = createSut();
      expect(sut.getCurrentStyles()).toBe(mockTemplate.styles);
    });
  });

  describe('getAssetTypes', () => {
    it('should return types and keys', () => {
      const sut = createSut();
      const result = sut.getAssetTypes();
      expect(result.types).toBe(mockUrso.types.assets);
      expect(result.keys).toBe(sut._assetsKeys);
    });
  });

  describe('getCurrentAssets', () => {
    it('should return assets from template', () => {
      const mockAssets = [{ type: 1 }];
      const mockTemplate = { styles: {}, assets: mockAssets, objects: [] };
      (mockUrso as unknown as Record<string, unknown>).template = { get: vi.fn(() => mockTemplate) };
      const sut = createSut();
      expect(sut.getCurrentAssets()).toBe(mockAssets);
    });
  });

  describe('addAsset', () => {
    it('should call assets.preload', () => {
      const preload = vi.fn();
      (mockUrso as unknown as Record<string, unknown>).assets = { preload };
      const sut = createSut();
      const cb = vi.fn();
      sut.addAsset({ key: 'test' }, cb);
      expect(preload).toHaveBeenCalledWith([{ key: 'test' }], cb);
    });
  });

  describe('getCurrentObjects', () => {
    it('should return objects from template', () => {
      const mockObjects = [{ type: 2 }];
      const mockTemplate = { styles: {}, assets: [], objects: mockObjects };
      (mockUrso as unknown as Record<string, unknown>).template = { get: vi.fn(() => mockTemplate) };
      const sut = createSut();
      expect(sut.getCurrentObjects()).toBe(mockObjects);
    });
  });

  describe('getObjectsTypes', () => {
    it('should return types and keys', () => {
      const sut = createSut();
      const result = sut.getObjectsTypes();
      expect(result.types).toBe(mockUrso.types.objects);
      expect(result.keys).toBe(sut._objectsKeys);
    });
  });

  describe('addObject', () => {
    it('should call objects.create', () => {
      const sut = createSut();
      const model = { type: 1 };
      const parent = {};
      sut.addObject(model, parent);
      expect(mockUrso.objects.create).toHaveBeenCalledWith(model, parent);
    });
  });

  describe('addStyle', () => {
    it('should not throw (TODO method)', () => {
      const sut = createSut();
      expect(() => sut.addStyle()).not.toThrow();
    });
  });

  describe('editObject', () => {
    it('should not throw (TODO method)', () => {
      const sut = createSut();
      expect(() => sut.editObject('id1', 'x', 10)).not.toThrow();
    });
  });
});
