import LibLocalData from '../../src/ts/lib/localData';

describe('LibLocalData', () => {
  let sut: LibLocalData;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockUrso = createMockUrso();
    // Use real-like implementations for helper methods
    mockUrso.helper.recursiveGet = vi.fn((key: string, obj: unknown, defaultResult?: unknown) => {
      if (obj === undefined) return defaultResult;
      const keys = key.split('.');
      let current: unknown = obj;
      for (const k of keys) {
        if (current === null || current === undefined || typeof current !== 'object') return defaultResult;
        if (typeof (current as Record<string, unknown>)[k] === 'undefined') return defaultResult;
        current = (current as Record<string, unknown>)[k];
      }
      return current;
    });
    mockUrso.helper.recursiveSet = vi.fn((key: string, value: unknown, obj: Record<string, unknown>) => {
      const keys = key.split('.');
      let current = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      return true;
    });
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    sut = new LibLocalData();
  });

  describe('get', () => {
    it('should return undefined for non-existent key', () => {
      expect(sut.get('nonexistent')).toBeUndefined();
    });

    it('should return previously set value', () => {
      sut.set('myKey', 'myValue');
      expect(sut.get('myKey')).toBe('myValue');
    });

    it('should support dot-path keys', () => {
      sut.set('a.b.c', 42);
      expect(sut.get('a.b.c')).toBe(42);
    });
  });

  describe('set', () => {
    it('should return true', () => {
      expect(sut.set('key', 'value')).toBe(true);
    });

    it('should store the value', () => {
      sut.set('test', 123);
      expect(sut.get('test')).toBe(123);
    });

    it('should overwrite existing values', () => {
      sut.set('key', 'first');
      sut.set('key', 'second');
      expect(sut.get('key')).toBe('second');
    });
  });
});
