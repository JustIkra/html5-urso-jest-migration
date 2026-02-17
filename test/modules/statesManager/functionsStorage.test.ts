import ModulesStatesManagerFunctionsStorage from '../../../src/ts/modules/statesManager/functionsStorage';

type GuidFunction = ((...args: unknown[]) => unknown) & { _guid?: string };

describe('ModulesStatesManagerFunctionsStorage', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should be instantiable (not a singleton)', () => {
    const sut = new ModulesStatesManagerFunctionsStorage();
    expect(sut).toBeDefined();
  });

  describe('add + run', () => {
    it('should store a function and run it by key', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      const fn = vi.fn();
      sut.add('myKey', fn);
      sut.run('myKey');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should assign _guid to the added function', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      const fn = vi.fn() as GuidFunction;
      sut.add('myKey', fn);
      expect(fn._guid).toBeDefined();
      expect(fn._guid).toMatch(/^guard_\d+$/);
    });

    it('should run multiple functions for the same key', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      sut.add('myKey', fn1);
      sut.add('myKey', fn2);
      sut.run('myKey');
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if key has no functions', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      expect(() => sut.run('nonexistent')).not.toThrow();
    });

    it('should log error when onlyOneFlag is true and key already has a function', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      sut.add('myKey', fn1, true);
      sut.add('myKey', fn2, true);
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesStatesManagerFunctionsStorage: action or state can have only one guard',
        'myKey',
        fn2,
      );
    });
  });

  describe('runAndCallbackOnFinish', () => {
    it('should call onFinishCallback after all promises resolve', async () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      const fn: GuidFunction = vi.fn((resolve: unknown) => { (resolve as () => void)(); });
      sut.add('myKey', fn);
      const callback = vi.fn();
      sut.runAndCallbackOnFinish('myKey', callback);
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onFinishCallback immediately if key has no functions', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      const callback = vi.fn();
      sut.runAndCallbackOnFinish('nonexistent', callback);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should wait for all functions to resolve before calling callback', async () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      let resolveFirst: (() => void) | undefined;
      const fn1: GuidFunction = vi.fn((resolve: unknown) => { resolveFirst = resolve as () => void; });
      const fn2: GuidFunction = vi.fn((resolve: unknown) => { (resolve as () => void)(); });
      sut.add('myKey', fn1);
      sut.add('myKey', fn2);
      const callback = vi.fn();
      sut.runAndCallbackOnFinish('myKey', callback);

      // fn2 resolved but fn1 hasn't yet
      await Promise.resolve();
      expect(callback).not.toHaveBeenCalled();

      // resolve fn1
      resolveFirst!();
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('checkGuard', () => {
    it('should return true if no guards for key', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      expect(sut.checkGuard('nonexistent')).toBe(true);
    });

    it('should return true if all guards return truthy', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      sut.add('myKey', vi.fn(() => true));
      sut.add('myKey', vi.fn(() => 1));
      expect(sut.checkGuard('myKey')).toBe(true);
    });

    it('should return false if any guard returns falsy', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      sut.add('myKey', vi.fn(() => true));
      sut.add('myKey', vi.fn(() => false));
      expect(sut.checkGuard('myKey')).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove a function by key and guid', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      const fn = vi.fn() as GuidFunction;
      sut.add('myKey', fn);
      sut.remove('myKey', fn);
      sut.run('myKey');
      expect(fn).not.toHaveBeenCalled();
    });

    it('should clean up the key entry when last function is removed', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      mockUrso.helper.getObjectSize.mockReturnValue(0);
      const fn = vi.fn() as GuidFunction;
      sut.add('myKey', fn);
      sut.remove('myKey', fn);
      // After removal, running should not throw
      expect(() => sut.run('myKey')).not.toThrow();
    });
  });

  describe('_guid uniqueness', () => {
    it('should assign unique guids to different functions', () => {
      const sut = new ModulesStatesManagerFunctionsStorage();
      const fn1 = vi.fn() as GuidFunction;
      const fn2 = vi.fn() as GuidFunction;
      sut.add('key1', fn1);
      sut.add('key2', fn2);
      expect(fn1._guid).not.toBe(fn2._guid);
    });
  });
});
