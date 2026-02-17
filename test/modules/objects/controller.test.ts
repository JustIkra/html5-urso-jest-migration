import ModulesObjectsController from '../../../src/ts/modules/objects/controller';
import { UrsoEvent } from '../../../src/ts/types';

describe('ModulesObjectsController', () => {
  let sut: ModulesObjectsController;
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockService: Record<string, ReturnType<typeof vi.fn>>;
  let mockFind: { do: ReturnType<typeof vi.fn> };
  let mockCache: Record<string, ReturnType<typeof vi.fn>>;
  let mockStyles: Record<string, ReturnType<typeof vi.fn>>;
  let mockProxy: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockService = {
      add: vi.fn((obj: unknown) => obj),
      addChild: vi.fn(),
      removeChild: vi.fn(),
      destroy: vi.fn(),
      getWorld: vi.fn(() => ({ name: 'WORLD' })),
      resetWorld: vi.fn(),
      updateWorldBounds: vi.fn(),
      applyClassesToWorld: vi.fn(),
      _updateCommonProperties: vi.fn(),
    };

    mockFind = {
      do: vi.fn(() => null),
    };

    mockCache = {
      addId: vi.fn(),
      removeId: vi.fn(),
      addName: vi.fn(),
      removeName: vi.fn(),
      addClass: vi.fn(),
      removeClass: vi.fn(),
    };

    mockStyles = {
      refresh: vi.fn(),
      refreshByChangedClassName: vi.fn(),
    };

    mockProxy = {
      safeSetValueToTarget: vi.fn(),
    };

    (mockUrso as unknown as Record<string, unknown>).scenes = {
      addObject: vi.fn((obj: unknown) => obj),
    };

    const proto = ModulesObjectsController.prototype as unknown as Record<string, unknown>;
    proto.getInstance = vi.fn((path: string) => {
      if (path === 'Service') return mockService;
      if (path === 'Find') return mockFind;
      if (path === 'Cache') return mockCache;
      if (path === 'Styles') return mockStyles;
      if (path === 'Proxy') return mockProxy;
      return null;
    });
    proto.addListener = vi.fn();

    sut = new ModulesObjectsController();
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });

  it('should bind find/findOne/findAll to Urso global', () => {
    expect((Urso as unknown as Record<string, unknown>).find).toBeDefined();
    expect((Urso as unknown as Record<string, unknown>).findOne).toBeDefined();
    expect((Urso as unknown as Record<string, unknown>).findAll).toBeDefined();
  });

  // ========================================================================
  // create
  // ========================================================================

  describe('create', () => {
    it('should create single object', () => {
      const object = { _parsed: true, type: 15 };
      sut.create(object);
      expect(mockService.add).toHaveBeenCalledWith(object, undefined);
    });

    it('should create array of objects', () => {
      const objects = [
        { _parsed: true, type: 15 },
        { _parsed: true, type: 22 },
      ];
      const result = sut.create(objects);
      expect(Array.isArray(result)).toBe(true);
      expect(mockService.add).toHaveBeenCalledTimes(2);
    });

    it('should refresh styles after create unless flag set', () => {
      const object = { _parsed: true, type: 15 };
      sut.create(object);
      expect(mockStyles.refresh).toHaveBeenCalled();
    });

    it('should not refresh styles when doNotRefreshStylesFlag is true', () => {
      const object = { _parsed: true, type: 15 };
      sut.create(object, undefined, true);
      expect(mockStyles.refresh).not.toHaveBeenCalled();
    });

    it('should use scenes.addObject for unparsed objects', () => {
      const object = { type: 15 }; // _parsed is undefined
      sut.create(object);
      expect((mockUrso as unknown as Record<string, { addObject: ReturnType<typeof vi.fn> }>).scenes.addObject).toHaveBeenCalled();
    });

    it('should use Service.add for parsed objects', () => {
      const object = { _parsed: true, type: 15 };
      sut.create(object);
      expect(mockService.add).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // find / findOne / findAll
  // ========================================================================

  describe('find', () => {
    it('should delegate to Find.do', () => {
      const objs = [{ id: 'hero' }];
      mockFind.do.mockReturnValue(objs);
      const result = sut.find('#hero');
      expect(result).toBe(objs);
      expect(mockFind.do).toHaveBeenCalledWith('#hero');
    });

    it('should return null when no matches', () => {
      mockFind.do.mockReturnValue(null);
      expect(sut.find('#missing')).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return first element', () => {
      const obj = { id: 'hero' };
      mockFind.do.mockReturnValue([obj]);
      const result = sut.findOne('#hero');
      expect(result).toBe(obj);
    });

    it('should return null (not false) when no matches', () => {
      mockFind.do.mockReturnValue(null);
      const result = sut.findOne('#missing');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return array of matches', () => {
      const objs = [{ class: 'item' }, { class: 'item' }];
      mockFind.do.mockReturnValue(objs);
      expect(sut.findAll('.item')).toBe(objs);
    });

    it('should return empty array when no matches', () => {
      mockFind.do.mockReturnValue(null);
      expect(sut.findAll('.missing')).toEqual([]);
    });
  });

  // ========================================================================
  // cache delegation
  // ========================================================================

  describe('cache delegation', () => {
    it('should delegate addIdToCache', () => {
      sut.addIdToCache('hero', {});
      expect(mockCache.addId).toHaveBeenCalledWith('hero', {});
    });

    it('should delegate removeIdFromCache', () => {
      sut.removeIdFromCache('hero', {});
      expect(mockCache.removeId).toHaveBeenCalledWith('hero', {});
    });

    it('should delegate addNameToCache', () => {
      sut.addNameToCache('label', {});
      expect(mockCache.addName).toHaveBeenCalledWith('label', {});
    });

    it('should delegate removeNameFromCache', () => {
      sut.removeNameFromCache('label', {});
      expect(mockCache.removeName).toHaveBeenCalledWith('label', {});
    });

    it('should delegate addClassToCache', () => {
      sut.addClassToCache('active', {});
      expect(mockCache.addClass).toHaveBeenCalledWith('active', {});
    });

    it('should delegate removeClassFromCache', () => {
      sut.removeClassFromCache('active', {});
      expect(mockCache.removeClass).toHaveBeenCalledWith('active', {});
    });
  });

  // ========================================================================
  // styles delegation
  // ========================================================================

  describe('styles delegation', () => {
    it('should delegate refreshStyles', () => {
      sut.refreshStyles();
      expect(mockStyles.refresh).toHaveBeenCalled();
    });

    it('should delegate refreshByChangedClassName', () => {
      sut.refreshByChangedClassName('active');
      expect(mockStyles.refreshByChangedClassName).toHaveBeenCalledWith('active');
    });
  });

  // ========================================================================
  // service delegation
  // ========================================================================

  describe('service delegation', () => {
    it('should delegate getWorld', () => {
      expect(sut.getWorld()).toEqual({ name: 'WORLD' });
    });

    it('should delegate addChild', () => {
      sut.addChild({}, {}, true);
      expect(mockService.addChild).toHaveBeenCalledWith({}, {}, true);
    });

    it('should delegate removeChild', () => {
      sut.removeChild({}, {}, true);
      expect(mockService.removeChild).toHaveBeenCalledWith({}, {}, true);
    });

    it('should delegate destroy', () => {
      sut.destroy({}, true);
      expect(mockService.destroy).toHaveBeenCalledWith({}, true);
    });
  });

  // ========================================================================
  // _safeSetValueToTarget
  // ========================================================================

  describe('_safeSetValueToTarget', () => {
    it('should delegate to Proxy.safeSetValueToTarget', () => {
      sut._safeSetValueToTarget({}, 'alpha', 0.5);
      expect(mockProxy.safeSetValueToTarget).toHaveBeenCalledWith({}, 'alpha', 0.5);
    });
  });

  // ========================================================================
  // _subscribeOnce
  // ========================================================================

  describe('_subscribeOnce', () => {
    it('should register 3 global event listeners', () => {
      sut._subscribeOnce();
      const addListener = ModulesObjectsController.prototype.addListener as ReturnType<typeof vi.fn>;
      expect(addListener).toHaveBeenCalledTimes(3);
    });

    it('should listen for MODULES_SCENES_NEW_RESOLUTION', () => {
      sut._subscribeOnce();
      const addListener = ModulesObjectsController.prototype.addListener as ReturnType<typeof vi.fn>;
      expect(addListener).toHaveBeenCalledWith(
        UrsoEvent.MODULES_SCENES_NEW_RESOLUTION,
        expect.any(Function),
        true,
      );
    });

    it('should listen for MODULES_SCENES_NEW_SCENE_INIT', () => {
      sut._subscribeOnce();
      const addListener = ModulesObjectsController.prototype.addListener as ReturnType<typeof vi.fn>;
      expect(addListener).toHaveBeenCalledWith(
        UrsoEvent.MODULES_SCENES_NEW_SCENE_INIT,
        expect.any(Function),
        true,
      );
    });

    it('should listen for MODULES_INSTANCES_MODES_CHANGED', () => {
      sut._subscribeOnce();
      const addListener = ModulesObjectsController.prototype.addListener as ReturnType<typeof vi.fn>;
      expect(addListener).toHaveBeenCalledWith(
        UrsoEvent.MODULES_INSTANCES_MODES_CHANGED,
        expect.any(Function),
        true,
      );
    });
  });
});
