import ModulesObjectsService from '../../../src/ts/modules/objects/service';
import { ObjectTypeId } from '../../../src/ts/types';

interface MockServiceObj {
  _uid: string | null;
  _baseObject: MockPixiContainer | null;
  _originalModel: Record<string, unknown>;
  _styles: Record<string, unknown>;
  _templatePath: string | null;
  _controller?: { common: { object: unknown } } | null;
  _customDestroy: ReturnType<typeof vi.fn>;
  parent: MockServiceObj | null;
  proxyObject: unknown;
  destroyed: boolean;
  type: ObjectTypeId | null;
  id: string | null;
  name: string | null;
  class: string | null;
  contents?: MockServiceObj[];
  addClass: ReturnType<typeof vi.fn>;
  removeClass: ReturnType<typeof vi.fn>;
  [key: string]: unknown;
}

interface MockPixiContainer {
  addChild: ReturnType<typeof vi.fn>;
  removeChild: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  mask?: unknown;
}

function makePixi(): MockPixiContainer {
  return {
    addChild: vi.fn(),
    removeChild: vi.fn(),
    destroy: vi.fn(),
  };
}

function makeServiceObj(overrides: Partial<MockServiceObj> = {}): MockServiceObj {
  return {
    _uid: null,
    _baseObject: makePixi(),
    _originalModel: {},
    _styles: {},
    _templatePath: null,
    _customDestroy: vi.fn(),
    parent: null,
    proxyObject: null,
    destroyed: false,
    type: ObjectTypeId.IMAGE,
    id: null,
    name: null,
    class: null,
    contents: [],
    addClass: vi.fn(),
    removeClass: vi.fn(),
    ...overrides,
  };
}

describe('ModulesObjectsService', () => {
  let sut: ModulesObjectsService;
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockProxy: { get: ReturnType<typeof vi.fn> };
  let mockCache: {
    reset: ReturnType<typeof vi.fn>;
    addId: ReturnType<typeof vi.fn>;
    removeId: ReturnType<typeof vi.fn>;
    addName: ReturnType<typeof vi.fn>;
    removeName: ReturnType<typeof vi.fn>;
    addClass: ReturnType<typeof vi.fn>;
    removeClass: ReturnType<typeof vi.fn>;
  };
  let mockConfig: { objectsToCache: ObjectTypeId[] };
  let mockPool: { getElement: ReturnType<typeof vi.fn>; putElement: ReturnType<typeof vi.fn> };
  let mockStyles: { removeFromCache: ReturnType<typeof vi.fn> };
  let mockSafeSet: ReturnType<typeof vi.fn>;
  let mockRefreshStyles: ReturnType<typeof vi.fn>;
  let worldModel: MockServiceObj;

  beforeEach(() => {
    mockUrso = createMockUrso();

    worldModel = makeServiceObj({ type: ObjectTypeId.WORLD, name: 'WORLD', contents: [] });

    mockProxy = {
      get: vi.fn((model: MockServiceObj) => model),
    };

    mockCache = {
      reset: vi.fn(),
      addId: vi.fn(),
      removeId: vi.fn(),
      addName: vi.fn(),
      removeName: vi.fn(),
      addClass: vi.fn(),
      removeClass: vi.fn(),
    };

    mockConfig = { objectsToCache: [] };
    mockPool = { getElement: vi.fn(), putElement: vi.fn() };
    mockStyles = { removeFromCache: vi.fn() };

    mockSafeSet = vi.fn((target: MockServiceObj, key: string, value: unknown) => {
      target[key] = value;
    });

    mockRefreshStyles = vi.fn();

    mockUrso.objects._safeSetValueToTarget = mockSafeSet;
    mockUrso.objects.refreshStyles = mockRefreshStyles;

    (mockUrso as unknown as Record<string, unknown>).scenes = {
      getTemplateSize: vi.fn(() => ({ width: 1920, height: 1080 })),
    };

    (mockUrso as unknown as Record<string, unknown>).getInstancesModes = vi.fn(() => ['desktop']);

    (globalThis as Record<string, unknown>).Urso = mockUrso;

    const proto = ModulesObjectsService.prototype as unknown as Record<string, unknown>;
    proto.getInstance = vi.fn((path: string, ...args: unknown[]) => {
      if (path === 'Models.World') return worldModel;
      if (path === 'Proxy') return mockProxy;
      if (path === 'Cache') return mockCache;
      if (path === 'Config') return mockConfig;
      if (path === 'Pool') return mockPool;
      if (path === 'Styles') return mockStyles;
      // For model types, return a mock model
      if (path.startsWith('Models.')) {
        return makeServiceObj(args[0] as Partial<MockServiceObj>);
      }
      return null;
    });

    sut = new ModulesObjectsService();
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });

  // ========================================================================
  // getWorld / resetWorld
  // ========================================================================

  describe('getWorld', () => {
    it('should return null before resetWorld', () => {
      expect(sut.getWorld()).toBeNull();
    });

    it('should return world after resetWorld', () => {
      sut.resetWorld();
      expect(sut.getWorld()).toBe(worldModel);
    });

    it('should reset cache on resetWorld', () => {
      sut.resetWorld();
      expect(mockCache.reset).toHaveBeenCalled();
    });

    it('should proxy the world model', () => {
      sut.resetWorld();
      expect(mockProxy.get).toHaveBeenCalledWith(worldModel);
    });
  });

  // ========================================================================
  // updateWorldBounds
  // ========================================================================

  describe('updateWorldBounds', () => {
    it('should set width and height on world', () => {
      sut.resetWorld();
      mockSafeSet.mockClear();
      sut.updateWorldBounds({ template: { width: 800, height: 600 } });
      expect(mockSafeSet).toHaveBeenCalledWith(worldModel, 'width', 800);
      expect(mockSafeSet).toHaveBeenCalledWith(worldModel, 'height', 600);
    });

    it('should do nothing when world is null', () => {
      sut.updateWorldBounds({ template: { width: 800, height: 600 } });
      expect(mockSafeSet).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // applyClassesToWorld
  // ========================================================================

  describe('applyClassesToWorld', () => {
    it('should apply mode classes to world', () => {
      sut.resetWorld();
      worldModel.addClass.mockClear();
      sut.applyClassesToWorld();
      expect(worldModel.addClass).toHaveBeenCalledWith('desktop', true);
    });

    it('should do nothing when world is null', () => {
      sut.applyClassesToWorld();
      expect(worldModel.addClass).not.toHaveBeenCalled();
    });

    it('should remove old classes before applying new', () => {
      sut.resetWorld();
      worldModel['class'] = 'oldMode';
      worldModel.removeClass.mockClear();
      sut.applyClassesToWorld();
      expect(worldModel.removeClass).toHaveBeenCalledWith('oldMode', true);
    });
  });

  // ========================================================================
  // add
  // ========================================================================

  describe('add', () => {
    it('should create world if not exists', () => {
      const object = makeServiceObj({ type: ObjectTypeId.IMAGE });
      sut.add(
        object as unknown as Parameters<typeof sut.add>[0],
        null as unknown as Parameters<typeof sut.add>[1],
      );
      expect(sut.getWorld()).not.toBeNull();
    });

    it('should assign uid to object', () => {
      sut.resetWorld();
      const object = makeServiceObj({ type: ObjectTypeId.IMAGE });
      sut.add(object as unknown as Parameters<typeof sut.add>[0], null as unknown as Parameters<typeof sut.add>[1]);
      expect(object._uid).toMatch(/^object_\d+$/);
    });

    it('should proxy the model', () => {
      sut.resetWorld();
      mockProxy.get.mockClear();
      const object = makeServiceObj({ type: ObjectTypeId.IMAGE });
      sut.add(object as unknown as Parameters<typeof sut.add>[0], null as unknown as Parameters<typeof sut.add>[1]);
      expect(mockProxy.get).toHaveBeenCalled();
    });

    it('should delegate to pool when objectsToCache includes type', () => {
      sut.resetWorld();
      mockConfig.objectsToCache = [ObjectTypeId.SPINE];
      const object = makeServiceObj({ type: ObjectTypeId.SPINE });
      const parent = makeServiceObj();
      mockPool.getElement.mockReturnValue(object);

      sut.add(
        object as unknown as Parameters<typeof sut.add>[0],
        parent as unknown as Parameters<typeof sut.add>[1],
      );

      expect(mockPool.getElement).toHaveBeenCalled();
    });

    it('should add child to parent', () => {
      sut.resetWorld();
      const object = makeServiceObj({ type: ObjectTypeId.IMAGE });
      const parent = makeServiceObj({ contents: [] });
      sut.add(
        object as unknown as Parameters<typeof sut.add>[0],
        parent as unknown as Parameters<typeof sut.add>[1],
      );
      expect(parent.contents!.length).toBeGreaterThan(0);
      expect(parent._baseObject!.addChild).toHaveBeenCalled();
    });

    it('should handle COMPONENT type by linking controller', () => {
      sut.resetWorld();
      const controller = { common: { object: null } };
      const object = makeServiceObj({
        type: ObjectTypeId.COMPONENT,
        _controller: controller,
      });
      sut.add(object as unknown as Parameters<typeof sut.add>[0], null as unknown as Parameters<typeof sut.add>[1]);
      expect(controller.common.object).not.toBeNull();
    });

    it('should set mask on parent for MASK type', () => {
      sut.resetWorld();
      const maskModel = makeServiceObj({ type: ObjectTypeId.MASK });
      const parent = makeServiceObj({ contents: [] });
      sut.add(maskModel as unknown as Parameters<typeof sut.add>[0], parent as unknown as Parameters<typeof sut.add>[1]);
      expect(parent._baseObject!.mask).toBeDefined();
    });

    it('should recursively create contents', () => {
      sut.resetWorld();
      const child = makeServiceObj({ type: ObjectTypeId.TEXT });
      const object = makeServiceObj({
        type: ObjectTypeId.CONTAINER,
        contents: [child],
      });
      sut.add(object as unknown as Parameters<typeof sut.add>[0], null as unknown as Parameters<typeof sut.add>[1]);
      // child should have been processed (uid assigned)
      expect(child._uid).toMatch(/^object_\d+$/);
    });

    it('should add to cache', () => {
      sut.resetWorld();
      mockCache.addId.mockClear();
      const object = makeServiceObj({ type: ObjectTypeId.IMAGE, id: 'hero' });
      sut.add(object as unknown as Parameters<typeof sut.add>[0], null as unknown as Parameters<typeof sut.add>[1]);
      expect(mockCache.addId).toHaveBeenCalledWith('hero', expect.anything());
    });

    it('should handle camelCase model names (BitmapText)', () => {
      sut.resetWorld();
      const object = makeServiceObj({ type: ObjectTypeId.BITMAPTEXT });
      sut.add(object as unknown as Parameters<typeof sut.add>[0], null as unknown as Parameters<typeof sut.add>[1]);
      const getInstance = ModulesObjectsService.prototype.getInstance as ReturnType<typeof vi.fn>;
      expect(getInstance).toHaveBeenCalledWith('Models.BitmapText', expect.anything());
    });
  });

  // ========================================================================
  // addChild / removeChild
  // ========================================================================

  describe('addChild', () => {
    it('should add child to parent contents', () => {
      const parent = makeServiceObj({ contents: [] });
      const child = makeServiceObj();
      sut.addChild(
        parent as unknown as Parameters<typeof sut.addChild>[0],
        child as unknown as Parameters<typeof sut.addChild>[1],
        true,
      );
      expect(parent.contents).toContain(child);
    });

    it('should call pixi addChild', () => {
      const parent = makeServiceObj({ contents: [] });
      const child = makeServiceObj();
      sut.addChild(
        parent as unknown as Parameters<typeof sut.addChild>[0],
        child as unknown as Parameters<typeof sut.addChild>[1],
        true,
      );
      expect(parent._baseObject!.addChild).toHaveBeenCalledWith(child._baseObject);
    });

    it('should set child.parent', () => {
      const parent = makeServiceObj({ contents: [] });
      const child = makeServiceObj();
      sut.addChild(
        parent as unknown as Parameters<typeof sut.addChild>[0],
        child as unknown as Parameters<typeof sut.addChild>[1],
        true,
      );
      expect(child.parent).toBe(parent);
    });

    it('should remove from old parent first', () => {
      const oldParent = makeServiceObj({ contents: [] });
      const newParent = makeServiceObj({ contents: [] });
      const child = makeServiceObj({ parent: oldParent });
      oldParent.contents = [child];

      sut.addChild(
        newParent as unknown as Parameters<typeof sut.addChild>[0],
        child as unknown as Parameters<typeof sut.addChild>[1],
        true,
      );

      expect(oldParent.contents).not.toContain(child);
      expect(newParent.contents).toContain(child);
    });

    it('should refresh styles when flag is false', () => {
      const parent = makeServiceObj({ contents: [] });
      const child = makeServiceObj();
      mockRefreshStyles.mockClear();
      sut.addChild(
        parent as unknown as Parameters<typeof sut.addChild>[0],
        child as unknown as Parameters<typeof sut.addChild>[1],
      );
      expect(mockRefreshStyles).toHaveBeenCalled();
    });
  });

  describe('removeChild', () => {
    it('should remove child from parent contents', () => {
      const child = makeServiceObj();
      const parent = makeServiceObj({ contents: [child] });
      child.parent = parent;

      sut.removeChild(
        parent as unknown as Parameters<typeof sut.removeChild>[0],
        child as unknown as Parameters<typeof sut.removeChild>[1],
        true,
      );

      expect(parent.contents).not.toContain(child);
      expect(child.parent).toBeNull();
    });

    it('should call pixi removeChild', () => {
      const child = makeServiceObj();
      const parent = makeServiceObj({ contents: [child] });
      child.parent = parent;

      sut.removeChild(
        parent as unknown as Parameters<typeof sut.removeChild>[0],
        child as unknown as Parameters<typeof sut.removeChild>[1],
        true,
      );

      expect(parent._baseObject!.removeChild).toHaveBeenCalledWith(child._baseObject);
    });
  });

  // ========================================================================
  // destroy
  // ========================================================================

  describe('destroy', () => {
    it('should set destroyed to true', () => {
      const object = makeServiceObj({ contents: [] });
      sut.destroy(object as unknown as Parameters<typeof sut.destroy>[0], true);
      expect(object.destroyed).toBe(true);
    });

    it('should set proxyObject to null', () => {
      const object = makeServiceObj({ proxyObject: {}, contents: [] });
      sut.destroy(object as unknown as Parameters<typeof sut.destroy>[0], true);
      expect(object.proxyObject).toBeNull();
    });

    it('should call _customDestroy', () => {
      const object = makeServiceObj({ contents: [] });
      sut.destroy(object as unknown as Parameters<typeof sut.destroy>[0], true);
      expect(object._customDestroy).toHaveBeenCalled();
    });

    it('should destroy pixi baseObject', () => {
      const object = makeServiceObj({ contents: [] });
      sut.destroy(object as unknown as Parameters<typeof sut.destroy>[0], true);
      expect(object._baseObject!.destroy).toHaveBeenCalledWith({ children: true });
    });

    it('should remove from cache', () => {
      const object = makeServiceObj({ id: 'hero', contents: [] });
      mockCache.removeId.mockClear();
      sut.destroy(object as unknown as Parameters<typeof sut.destroy>[0], true);
      expect(mockCache.removeId).toHaveBeenCalledWith('hero', object);
    });

    it('should remove from styles cache', () => {
      const object = makeServiceObj({ contents: [] });
      sut.destroy(object as unknown as Parameters<typeof sut.destroy>[0], true);
      expect(mockStyles.removeFromCache).toHaveBeenCalledWith(object);
    });

    it('should delegate to pool when objectsToCache includes type', () => {
      mockConfig.objectsToCache = [ObjectTypeId.SPINE];
      const object = makeServiceObj({ type: ObjectTypeId.SPINE });
      sut.destroy(object as unknown as Parameters<typeof sut.destroy>[0], true);
      expect(mockPool.putElement).toHaveBeenCalledWith(object, true);
    });

    it('should destroy children recursively', () => {
      const child = makeServiceObj({ contents: [] });
      const parent = makeServiceObj({ contents: [child] });
      child.parent = parent;

      sut.destroy(parent as unknown as Parameters<typeof sut.destroy>[0], true);

      expect(child._customDestroy).toHaveBeenCalled();
      expect(parent.destroyed).toBe(true);
    });

    it('should clear _controller for COMPONENT type', () => {
      const controller = { common: { object: {} } };
      const object = makeServiceObj({
        type: ObjectTypeId.COMPONENT,
        _controller: controller,
        contents: [],
      });

      sut.destroy(object as unknown as Parameters<typeof sut.destroy>[0], true);

      expect(object._controller).toBeNull();
    });

    it('should refresh styles when doNotRefreshStylesFlag is false', () => {
      const object = makeServiceObj({ contents: [] });
      mockRefreshStyles.mockClear();
      sut.destroy(object as unknown as Parameters<typeof sut.destroy>[0]);
      expect(mockRefreshStyles).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // _updateCommonProperties
  // ========================================================================

  describe('_updateCommonProperties (via add)', () => {
    it('should apply _originalModel properties via safeSetValueToTarget', () => {
      sut.resetWorld();
      mockSafeSet.mockClear();
      const object = makeServiceObj({
        type: ObjectTypeId.IMAGE,
        _originalModel: { alpha: 0.5, visible: false },
      });
      sut.add(object as unknown as Parameters<typeof sut.add>[0], null as unknown as Parameters<typeof sut.add>[1]);
      expect(mockSafeSet).toHaveBeenCalledWith(expect.anything(), 'alpha', 0.5);
      expect(mockSafeSet).toHaveBeenCalledWith(expect.anything(), 'visible', false);
    });
  });
});
