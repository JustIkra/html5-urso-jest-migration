import LibObjectPool from '../../src/ts/lib/objectPool';

describe('LibObjectPool', () => {
  let timeCounter: number;

  beforeEach(() => {
    vi.clearAllMocks();
    timeCounter = 1000;
    const mockUrso = createMockUrso();
    mockUrso.time.get = vi.fn(() => timeCounter++);
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  describe('constructor', () => {
    it('should create an empty pool', () => {
      const pool = new LibObjectPool(() => ({}));
      expect(pool).toBeDefined();
    });

    it('should pre-fill with initialSize elements', () => {
      let created = 0;
      const pool = new LibObjectPool(
        () => ({ id: ++created }),
        (obj) => obj,
        3
      );
      // After initial creation, all 3 elements should be free in pool
      const elem = pool.getElement();
      expect(elem.free).toBe(false);
      expect(elem.data).toBeDefined();
    });
  });

  describe('getElement', () => {
    it('should create new element when pool is empty', () => {
      const pool = new LibObjectPool(() => ({ value: 42 }));
      const elem = pool.getElement();
      expect(elem.free).toBe(false);
      expect(elem.data).toEqual({ value: 42 });
    });

    it('should reuse freed element', () => {
      const pool = new LibObjectPool(() => ({ value: 'new' }));
      const elem1 = pool.getElement();
      pool.putElement(elem1);
      const elem2 = pool.getElement();
      expect(elem2).toBe(elem1);
      expect(elem2.free).toBe(false);
    });

    it('should use key-based branches', () => {
      const pool = new LibObjectPool((key: string) => ({ type: key }));
      const a = pool.getElement('typeA');
      const b = pool.getElement('typeB');
      expect((a.data as Record<string, string>).type).toBe('typeA');
      expect((b.data as Record<string, string>).type).toBe('typeB');
    });

    it('should use default key when none specified', () => {
      const pool = new LibObjectPool((key: string) => ({ key }));
      const elem = pool.getElement();
      expect((elem.data as Record<string, string>).key).toBe('default');
    });
  });

  describe('putElement', () => {
    it('should mark element as free', () => {
      const pool = new LibObjectPool(() => ({}));
      const elem = pool.getElement();
      expect(elem.free).toBe(false);
      pool.putElement(elem);
      expect(elem.free).toBe(true);
    });

    it('should call resetFunction', () => {
      const resetFn = vi.fn((obj) => obj);
      const pool = new LibObjectPool(() => ({ val: 1 }), resetFn);
      const elem = pool.getElement();
      resetFn.mockClear();
      pool.putElement(elem);
      expect(resetFn).toHaveBeenCalledWith(elem.data);
    });
  });

  describe('maxSize enforcement', () => {
    it('should remove oldest inactive element when maxSize exceeded', () => {
      const removeFn = vi.fn((obj) => obj);
      const pool = new LibObjectPool(
        () => ({}),
        (obj) => obj,
        0,
        2,
        removeFn
      );

      const e1 = pool.getElement();
      const e2 = pool.getElement();
      const e3 = pool.getElement();

      pool.putElement(e1);
      pool.putElement(e2);
      // Pool has 3 elements, max is 2, so oldest (e1) should be removed
      pool.putElement(e3);

      expect(removeFn).toHaveBeenCalled();
    });
  });
});
