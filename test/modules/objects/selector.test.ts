import ModulesObjectsSelector from '../../../src/ts/modules/objects/selector';

interface MockObj {
  parent: MockObj | null;
  id: string | null;
  name: string | null;
  class: string | null;
  [key: string]: unknown;
}

function makeObj(opts: Partial<MockObj> & { parent?: MockObj | null } = {}): MockObj {
  return {
    parent: opts.parent ?? null,
    id: opts.id ?? null,
    name: opts.name ?? null,
    class: opts.class ?? null,
  };
}

describe('ModulesObjectsSelector', () => {
  let sut: ModulesObjectsSelector;
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    sut = new ModulesObjectsSelector();
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });

  // ========================================================================
  // parse
  // ========================================================================

  describe('parse', () => {
    it('should parse #id selector', () => {
      const result = sut.parse('#myId');
      expect(result).toEqual([[{ type: 'id', value: 'myId' }]]);
    });

    it('should parse ^name selector', () => {
      const result = sut.parse('^myName');
      expect(result).toEqual([[{ type: 'name', value: 'myName' }]]);
    });

    it('should parse .class selector', () => {
      const result = sut.parse('.myClass');
      expect(result).toEqual([[{ type: 'class', value: 'myClass' }]]);
    });

    it('should parse compound selector (.class#id)', () => {
      const result = sut.parse('.myClass#myId');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });

    it('should parse space-separated combinator selectors', () => {
      const result = sut.parse('^container .textClass');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([{ type: 'name', value: 'container' }]);
      expect(result[1]).toEqual([{ type: 'class', value: 'textClass' }]);
    });

    it('should log error for unparseable selector part', () => {
      sut.parse('!!!invalid');
      expect(mockUrso.logger.error).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // testObject
  // ========================================================================

  describe('testObject', () => {
    it('should match by #id', () => {
      const obj = makeObj({ id: 'myId' });
      expect(sut.testObject(obj, '#myId')).toBe(true);
    });

    it('should not match wrong #id', () => {
      const obj = makeObj({ id: 'otherId' });
      expect(sut.testObject(obj, '#myId')).toBe(false);
    });

    it('should match by ^name', () => {
      const obj = makeObj({ name: 'myName' });
      expect(sut.testObject(obj, '^myName')).toBe(true);
    });

    it('should match by .class', () => {
      const obj = makeObj({ class: 'myClass' });
      expect(sut.testObject(obj, '.myClass')).toBe(true);
    });

    it('should match .class when object has multiple classes', () => {
      const obj = makeObj({ class: 'first myClass last' });
      expect(sut.testObject(obj, '.myClass')).toBe(true);
    });

    it('should not match .class when class is missing', () => {
      const obj = makeObj({ class: null });
      expect(sut.testObject(obj, '.myClass')).toBe(false);
    });
  });

  // ========================================================================
  // testObjectWithParsedSelector (combinator)
  // ========================================================================

  describe('testObjectWithParsedSelector (combinator)', () => {
    it('should match child with parent selector', () => {
      const parent = makeObj({ name: 'container' });
      const child = makeObj({ class: 'item', parent });

      const parsed = sut.parse('^container .item');
      expect(sut.testObjectWithParsedSelector(child, parsed)).toBe(true);
    });

    it('should match grandchild through ancestor', () => {
      const grandparent = makeObj({ name: 'root' });
      const parent = makeObj({ parent: grandparent });
      const child = makeObj({ class: 'item', parent });

      const parsed = sut.parse('^root .item');
      expect(sut.testObjectWithParsedSelector(child, parsed)).toBe(true);
    });

    it('should return false when parent chain does not match', () => {
      const parent = makeObj({ name: 'other' });
      const child = makeObj({ class: 'item', parent });

      const parsed = sut.parse('^container .item');
      expect(sut.testObjectWithParsedSelector(child, parsed)).toBe(false);
    });

    it('should return false when object itself does not match', () => {
      const parent = makeObj({ name: 'container' });
      const child = makeObj({ class: 'wrong', parent });

      const parsed = sut.parse('^container .item');
      expect(sut.testObjectWithParsedSelector(child, parsed)).toBe(false);
    });

    it('should explicitly return false (not undefined) for non-matching', () => {
      const obj = makeObj({ id: 'wrong' });
      const parsed = sut.parse('#right');
      const result = sut.testObjectWithParsedSelector(obj, parsed);
      expect(result).toBe(false);
    });
  });
});
