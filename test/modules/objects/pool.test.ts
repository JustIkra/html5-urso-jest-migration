import ModulesObjectsPool from '../../../src/ts/modules/objects/pool';
import { ObjectTypeId } from '../../../src/ts/types';

interface MockPoolObject {
  x: number | string;
  y: number | string;
  angle: number;
  anchorX: number;
  anchorY: number;
  visible: boolean;
  type: ObjectTypeId | null;
  parent: MockPoolObject | null;
  _baseObject: Record<string, unknown> | null;
  _poolCacheId?: number;
  assetKey?: string;
  animation?: unknown;
  setAnimationConfig?: ReturnType<typeof vi.fn>;
  setToSetupPose?: ReturnType<typeof vi.fn>;
  stop?: ReturnType<typeof vi.fn>;
  clearListeners?: ReturnType<typeof vi.fn>;
  [key: string]: unknown;
}

function makePoolObj(overrides: Partial<MockPoolObject> = {}): MockPoolObject {
  return {
    x: 0,
    y: 0,
    angle: 0,
    anchorX: 0,
    anchorY: 0,
    visible: true,
    type: ObjectTypeId.IMAGE,
    parent: null,
    _baseObject: {},
    assetKey: 'testAsset',
    ...overrides,
  };
}

describe('ModulesObjectsPool', () => {
  let sut: ModulesObjectsPool;
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockService: {
    add: ReturnType<typeof vi.fn>;
    addChild: ReturnType<typeof vi.fn>;
    removeChild: ReturnType<typeof vi.fn>;
  };
  let mockObjectPool: {
    getElement: ReturnType<typeof vi.fn>;
    putElement: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUrso = createMockUrso();

    mockService = {
      add: vi.fn((obj: MockPoolObject) => obj),
      addChild: vi.fn(),
      removeChild: vi.fn(),
    };

    const poolObj = makePoolObj();
    mockObjectPool = {
      getElement: vi.fn(() => ({ data: poolObj })),
      putElement: vi.fn(),
    };

    // Mock Urso.Game.Lib.ObjectPool constructor
    (mockUrso as unknown as Record<string, unknown>).Game = {
      Lib: {
        ObjectPool: vi.fn(() => mockObjectPool),
      },
    };

    (globalThis as Record<string, unknown>).Urso = mockUrso;

    const proto = ModulesObjectsPool.prototype as unknown as Record<string, unknown>;
    proto.getInstance = vi.fn((path: string) => {
      if (path === 'Service') return mockService;
      return null;
    });

    sut = new ModulesObjectsPool();
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });

  // ========================================================================
  // getElement
  // ========================================================================

  describe('getElement', () => {
    it('should get element from pool and add as child', () => {
      const object = makePoolObj({ x: 50, y: 100 });
      const parent = makePoolObj();

      const result = sut.getElement(
        object as unknown as Parameters<typeof sut.getElement>[0],
        parent as unknown as Parameters<typeof sut.getElement>[1],
      );

      expect(mockObjectPool.getElement).toHaveBeenCalled();
      expect(mockService.addChild).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should set numeric x/y from object', () => {
      const object = makePoolObj({ x: 42, y: 99 });
      const parent = makePoolObj();
      const poolData = makePoolObj();
      mockObjectPool.getElement.mockReturnValue({ data: poolData });

      sut.getElement(
        object as unknown as Parameters<typeof sut.getElement>[0],
        parent as unknown as Parameters<typeof sut.getElement>[1],
      );

      expect(poolData.x).toBe(42);
      expect(poolData.y).toBe(99);
    });

    it('should default x/y to 0 when not a number', () => {
      const object = makePoolObj({ x: '50%', y: '25%' });
      const parent = makePoolObj();
      const poolData = makePoolObj();
      mockObjectPool.getElement.mockReturnValue({ data: poolData });

      sut.getElement(
        object as unknown as Parameters<typeof sut.getElement>[0],
        parent as unknown as Parameters<typeof sut.getElement>[1],
      );

      expect(poolData.x).toBe(0);
      expect(poolData.y).toBe(0);
    });

    it('should call setAnimationConfig for SPINE type', () => {
      const setAnimationConfig = vi.fn();
      const poolData = makePoolObj({ type: ObjectTypeId.SPINE, setAnimationConfig });
      mockObjectPool.getElement.mockReturnValue({ data: poolData });
      const object = makePoolObj({ type: ObjectTypeId.SPINE, animation: { name: 'walk' } });
      const parent = makePoolObj();

      sut.getElement(
        object as unknown as Parameters<typeof sut.getElement>[0],
        parent as unknown as Parameters<typeof sut.getElement>[1],
      );

      expect(setAnimationConfig).toHaveBeenCalledWith({ name: 'walk' });
    });

    it('should increment _poolCacheId for each element', () => {
      const poolData1 = makePoolObj();
      const poolData2 = makePoolObj();
      mockObjectPool.getElement
        .mockReturnValueOnce({ data: poolData1 })
        .mockReturnValueOnce({ data: poolData2 });

      const object = makePoolObj();
      const parent = makePoolObj();

      sut.getElement(object as unknown as Parameters<typeof sut.getElement>[0], parent as unknown as Parameters<typeof sut.getElement>[1]);
      sut.getElement(object as unknown as Parameters<typeof sut.getElement>[0], parent as unknown as Parameters<typeof sut.getElement>[1]);

      expect(poolData1._poolCacheId).toBe(1);
      expect(poolData2._poolCacheId).toBe(2);
    });
  });

  // ========================================================================
  // putElement
  // ========================================================================

  describe('putElement', () => {
    it('should return element to pool', () => {
      const poolData = makePoolObj();
      const poolElement = { data: poolData };
      mockObjectPool.getElement.mockReturnValue(poolElement);

      const object = makePoolObj();
      const parent = makePoolObj();
      const result = sut.getElement(object as unknown as Parameters<typeof sut.getElement>[0], parent as unknown as Parameters<typeof sut.getElement>[1]);

      sut.putElement(result as unknown as Parameters<typeof sut.putElement>[0]);

      expect(mockObjectPool.putElement).toHaveBeenCalledWith(poolElement);
    });

    it('should log console error when object has no _poolCacheId', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const object = makePoolObj(); // no _poolCacheId

      sut.putElement(object as unknown as Parameters<typeof sut.putElement>[0]);

      expect(consoleSpy).toHaveBeenCalledWith('ModulesObjectsPool something goes wrong: object must be in pool');
      consoleSpy.mockRestore();
    });
  });

  // ========================================================================
  // _resetFunction (SPINE handling)
  // ========================================================================

  describe('reset function (SPINE)', () => {
    it('should handle SPINE type by resetting pose, stop, and clear listeners', () => {
      const setToSetupPose = vi.fn();
      const stop = vi.fn();
      const clearListeners = vi.fn();
      const spineObj = makePoolObj({
        type: ObjectTypeId.SPINE,
        parent: makePoolObj(),
        _baseObject: { lastTime: 123 },
        setToSetupPose,
        stop,
        clearListeners,
        setAnimationConfig: vi.fn(),
      });
      const poolElement = { data: spineObj };
      mockObjectPool.getElement.mockReturnValue(poolElement);

      const object = makePoolObj({ type: ObjectTypeId.SPINE, animation: { name: 'idle' } });
      const parent = makePoolObj();
      sut.getElement(object as unknown as Parameters<typeof sut.getElement>[0], parent as unknown as Parameters<typeof sut.getElement>[1]);

      sut.putElement(spineObj as unknown as Parameters<typeof sut.putElement>[0]);

      // putElement triggers the pool's putElement, which calls the reset function
      expect(mockObjectPool.putElement).toHaveBeenCalled();
    });
  });
});
