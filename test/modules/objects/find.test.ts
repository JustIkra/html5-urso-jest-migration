import ModulesObjectsFind from '../../../src/ts/modules/objects/find';

interface MockObj {
  parent: MockObj | null;
  id: string | null;
  name: string | null;
  class: string | null;
  _uid: string;
  [key: string]: unknown;
}

function makeObj(opts: Partial<MockObj> = {}): MockObj {
  return {
    parent: opts.parent ?? null,
    id: opts.id ?? null,
    name: opts.name ?? null,
    class: opts.class ?? null,
    _uid: opts._uid ?? 'uid-' + Math.random().toString(36).slice(2),
  };
}

describe('ModulesObjectsFind', () => {
  let sut: ModulesObjectsFind;
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockCache: {
    getId: ReturnType<typeof vi.fn>;
    getName: ReturnType<typeof vi.fn>;
    getClass: ReturnType<typeof vi.fn>;
  };
  let mockSelector: {
    parse: ReturnType<typeof vi.fn>;
    testObjectWithParsedSelector: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockCache = {
      getId: vi.fn(() => null),
      getName: vi.fn(() => null),
      getClass: vi.fn(() => null),
    };

    mockSelector = {
      parse: vi.fn(),
      testObjectWithParsedSelector: vi.fn(() => true),
    };

    // Inject getInstance on the prototype before construction
    const proto = ModulesObjectsFind.prototype as unknown as Record<string, unknown>;
    proto.getInstance = vi.fn((path: string) => {
      if (path === 'Selector') return mockSelector;
      if (path === 'Cache') return mockCache;
      return null;
    });

    sut = new ModulesObjectsFind();
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });

  // ========================================================================
  // do() - basic lookups
  // ========================================================================

  describe('do() with id selector', () => {
    it('should find by #id using cache.getId', () => {
      const obj = makeObj({ id: 'hero' });
      mockSelector.parse.mockReturnValue([[{ type: 'id', value: 'hero' }]]);
      mockCache.getId.mockReturnValue(obj);

      const result = sut.do('#hero');
      expect(mockCache.getId).toHaveBeenCalledWith('hero');
      expect(result).toEqual([obj]);
    });

    it('should return null when id not found', () => {
      mockSelector.parse.mockReturnValue([[{ type: 'id', value: 'missing' }]]);
      mockCache.getId.mockReturnValue(null);

      const result = sut.do('#missing');
      expect(result).toBeNull();
    });
  });

  describe('do() with name selector', () => {
    it('should find by ^name using cache.getName', () => {
      const obj = makeObj({ name: 'label' });
      mockSelector.parse.mockReturnValue([[{ type: 'name', value: 'label' }]]);
      mockCache.getName.mockReturnValue(obj);

      const result = sut.do('^label');
      expect(mockCache.getName).toHaveBeenCalledWith('label');
      expect(result).toEqual([obj]);
    });
  });

  describe('do() with class selector', () => {
    it('should find by .class using cache.getClass', () => {
      const obj1 = makeObj({ class: 'active' });
      const obj2 = makeObj({ class: 'active' });
      mockSelector.parse.mockReturnValue([[{ type: 'class', value: 'active' }]]);
      mockCache.getClass.mockReturnValue([obj1, obj2]);

      const result = sut.do('.active');
      expect(mockCache.getClass).toHaveBeenCalledWith('active');
      expect(result).toEqual([obj1, obj2]);
    });

    it('should return null when class has no matches', () => {
      mockSelector.parse.mockReturnValue([[{ type: 'class', value: 'missing' }]]);
      mockCache.getClass.mockReturnValue(null);

      const result = sut.do('.missing');
      expect(result).toBeNull();
    });

    it('should return empty array when class returns empty array', () => {
      mockSelector.parse.mockReturnValue([[{ type: 'class', value: 'empty' }]]);
      mockCache.getClass.mockReturnValue([]);

      const result = sut.do('.empty');
      expect(result).toBeNull();
    });
  });

  // ========================================================================
  // do() - findOneFlag
  // ========================================================================

  describe('do() with findOneFlag', () => {
    it('should return early for simple selector with findOneFlag', () => {
      const obj = makeObj({ id: 'hero' });
      mockSelector.parse.mockReturnValue([[{ type: 'id', value: 'hero' }]]);
      mockCache.getId.mockReturnValue(obj);

      const result = sut.do('#hero', true);
      expect(result).toEqual([obj]);
      // testObjectWithParsedSelector should NOT be called for simple selector + findOneFlag
      expect(mockSelector.testObjectWithParsedSelector).not.toHaveBeenCalled();
    });

    it('should stop after first match for compound selector with findOneFlag', () => {
      const obj1 = makeObj({ class: 'item' });
      const obj2 = makeObj({ class: 'item' });
      mockSelector.parse.mockReturnValue([
        [{ type: 'name', value: 'container' }],
        [{ type: 'class', value: 'item' }],
      ]);
      mockCache.getClass.mockReturnValue([obj1, obj2]);
      mockSelector.testObjectWithParsedSelector.mockReturnValue(true);

      const result = sut.do('^container .item', true);
      expect(result).toHaveLength(1);
      expect(result).toEqual([obj1]);
    });
  });

  // ========================================================================
  // do() - compound selectors
  // ========================================================================

  describe('do() with compound selectors', () => {
    it('should filter by testObjectWithParsedSelector', () => {
      const obj1 = makeObj({ class: 'item' });
      const obj2 = makeObj({ class: 'item' });
      mockSelector.parse.mockReturnValue([
        [{ type: 'name', value: 'container' }],
        [{ type: 'class', value: 'item' }],
      ]);
      mockCache.getClass.mockReturnValue([obj1, obj2]);
      mockSelector.testObjectWithParsedSelector
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const result = sut.do('^container .item');
      expect(result).toEqual([obj1]);
    });

    it('should return empty array when no objects pass test', () => {
      const obj = makeObj({ class: 'item' });
      mockSelector.parse.mockReturnValue([
        [{ type: 'name', value: 'container' }],
        [{ type: 'class', value: 'item' }],
      ]);
      mockCache.getClass.mockReturnValue([obj]);
      mockSelector.testObjectWithParsedSelector.mockReturnValue(false);

      const result = sut.do('^container .item');
      expect(result).toEqual([]);
    });
  });

  // ========================================================================
  // do() - id/name wrapping to array
  // ========================================================================

  describe('do() wraps id/name results in array', () => {
    it('should wrap single id result into array for compound selectors', () => {
      const obj = makeObj({ id: 'hero' });
      mockSelector.parse.mockReturnValue([
        [{ type: 'name', value: 'container' }],
        [{ type: 'id', value: 'hero' }],
      ]);
      mockCache.getId.mockReturnValue(obj);
      mockSelector.testObjectWithParsedSelector.mockReturnValue(true);

      const result = sut.do('^container #hero');
      expect(result).toEqual([obj]);
    });
  });
});
