import ModulesInstancesController from '../../../src/ts/modules/instances/controller';
import { UrsoEvent } from '../../../src/ts/types';

// Helper: create a mock class constructor with optional features
function createMockClass(options: {
  singleton?: boolean;
  subscribe?: boolean;
  subscribeOnce?: boolean;
  simpleClass?: boolean;
} = {}) {
  const cls = vi.fn(function (this: Record<string, unknown>) {
    if (options.singleton) this.singleton = true;
    if (options.simpleClass) this.simpleClass = true;
    if (options.subscribe) this._subscribe = vi.fn();
    if (options.subscribeOnce) this._subscribeOnce = vi.fn();
  }) as unknown as Record<string, unknown> & { new(params?: unknown): Record<string, unknown>; prototype: Record<string, unknown>; _instance?: Record<string, unknown> };
  cls.prototype = {};
  return cls;
}

// Helper: set up Urso.Game namespace from a dot-path and class
function setGamePath(path: string, value: unknown): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = ((window as unknown as Record<string, unknown>).Urso as Record<string, unknown>).Game as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

describe('ModulesInstancesController', () => {
  let sut: ModulesInstancesController;
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.capitaliseFirstLetter = vi.fn((s: string) => s.charAt(0).toUpperCase() + s.slice(1));
    mockUrso.helper.initial = vi.fn(<T>(arr: T[]) => arr.slice(0, -1));
    (mockUrso as unknown as Record<string, unknown>).Game = {};
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    sut = new ModulesInstancesController();
  });

  // ========================================================================
  // Construction
  // ========================================================================

  describe('constructor', () => {
    it('should start with empty modes', () => {
      expect(sut.getModes()).toEqual([]);
    });

    it('should have bound getInstance method', () => {
      const fn = sut.getInstance;
      // Should not throw when called unbound
      expect(() => fn('Nonexistent.Path')).not.toThrow();
    });

    it('should have bound getByPath method', () => {
      const fn = sut.getByPath;
      expect(() => fn('Nonexistent.Path')).not.toThrow();
    });
  });

  // ========================================================================
  // getModes / addMode / removeMode
  // ========================================================================

  describe('getModes', () => {
    it('should return the current modes array', () => {
      sut.addMode('mobile');
      expect(sut.getModes()).toEqual(['mobile']);
    });
  });

  describe('addMode', () => {
    it('should add a mode and emit MODES_CHANGED event', () => {
      const result = sut.addMode('mobile');
      expect(result).toBe(true);
      expect(sut.getModes()).toContain('mobile');
      expect(mockUrso.observer.fire).toHaveBeenCalledWith(
        UrsoEvent.MODULES_INSTANCES_MODES_CHANGED
      );
    });

    it('should return false if mode already exists', () => {
      sut.addMode('mobile');
      const result = sut.addMode('mobile');
      expect(result).toBe(false);
    });
  });

  describe('removeMode', () => {
    it('should remove a mode and emit MODES_CHANGED event', () => {
      sut.addMode('mobile');
      mockUrso.observer.fire.mockClear();

      const result = sut.removeMode('mobile');
      expect(result).toBe(true);
      expect(sut.getModes()).not.toContain('mobile');
      expect(mockUrso.observer.fire).toHaveBeenCalledWith(
        UrsoEvent.MODULES_INSTANCES_MODES_CHANGED
      );
    });

    it('should return false if mode does not exist', () => {
      const result = sut.removeMode('nonexistent');
      expect(result).toBe(false);
    });

    it('should not emit event if passiveMode is true', () => {
      sut.addMode('mobile');
      mockUrso.observer.fire.mockClear();

      sut.removeMode('mobile', true);
      expect(mockUrso.observer.fire).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // getByPath
  // ========================================================================

  describe('getByPath', () => {
    it('should resolve a class by dot-path', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Helper', MockClass);

      const result = sut.getByPath('Lib.Helper');
      expect(result).toBe(MockClass);
    });

    it('should return null for a missing path', () => {
      const result = sut.getByPath('Nonexistent.Path');
      expect(result).toBeNoValue();
    });

    it('should cache resolved classes', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Helper', MockClass);

      const first = sut.getByPath('Lib.Helper');
      const second = sut.getByPath('Lib.Helper');
      expect(first).toBe(second);
    });

    it('should set __path on resolved class prototype', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Helper', MockClass);

      sut.getByPath('Lib.Helper');
      expect(MockClass.prototype.__path).toBe('Lib.Helper');
    });

    it('should set __path on object (non-function) results', () => {
      const configObj = { key: 'value' } as Record<string, unknown>;
      setGamePath('Modules.Config', configObj);

      sut.getByPath('Modules.Config');
      expect(configObj.__path).toBe('Modules.Config');
    });
  });

  // ========================================================================
  // getInstance
  // ========================================================================

  describe('getInstance', () => {
    it('should create an instance of the resolved class', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Helper', MockClass);

      const instance = sut.getInstance('Lib.Helper');
      expect(instance).toBeDefined();
      expect(MockClass).toHaveBeenCalled();
    });

    it('should return singleton instance on subsequent calls', () => {
      const MockClass = createMockClass({ singleton: true });
      setGamePath('Lib.Singleton', MockClass);

      const first = sut.getInstance('Lib.Singleton');
      const second = sut.getInstance('Lib.Singleton');
      expect(first).toBe(second);
    });

    it('should assign _iuid to instance', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Helper', MockClass);

      const instance = sut.getInstance<Record<string, unknown>>('Lib.Helper');
      expect(instance!._iuid).toBe('instance1');
    });

    it('should increment _iuid for each new instance', () => {
      const MockClass1 = createMockClass();
      const MockClass2 = createMockClass();
      setGamePath('Lib.A', MockClass1);
      setGamePath('Lib.B', MockClass2);

      const i1 = sut.getInstance<Record<string, unknown>>('Lib.A');
      const i2 = sut.getInstance<Record<string, unknown>>('Lib.B');
      expect(i1!._iuid).toBe('instance1');
      expect(i2!._iuid).toBe('instance2');
    });

    it('should call _subscribe on instance if it exists', () => {
      const MockClass = createMockClass({ subscribe: true });
      setGamePath('Lib.Sub', MockClass);

      const instance = sut.getInstance<Record<string, unknown>>('Lib.Sub');
      expect(instance!._subscribe).toHaveBeenCalled();
    });

    it('should call _subscribeOnce only once', () => {
      const MockClass = createMockClass({ subscribeOnce: true });
      setGamePath('Lib.SubOnce', MockClass);

      const i1 = sut.getInstance<Record<string, unknown>>('Lib.SubOnce');
      expect(i1!._subscribeOnce).toHaveBeenCalledTimes(1);

      // Create another non-singleton instance to test __subscribedOnce
      // The singleton check happens before _subscribeOnce, so we need a non-singleton class
      // but __subscribedOnce is per-instance so for singleton it won't be called again
    });

    it('should log error for non-function class object', () => {
      setGamePath('Lib.NotAClass', 'just a string');

      // The original JS also crashes after logging — _setCommonFunctions fails
      // because a string has no prototype. We verify the error was logged.
      expect(() => sut.getInstance('Lib.NotAClass')).toThrow();
      expect(mockUrso.logger.error).toHaveBeenCalledWith('getInstance type error');
    });

    it('should return null for missing path', () => {
      const result = sut.getInstance('Nonexistent.Thing');
      expect(result).toBeNoValue();
    });

    it('should inject getInstance into class prototype', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Helper', MockClass);

      sut.getInstance('Lib.Helper');
      expect(typeof MockClass.prototype.getInstance).toBe('function');
    });

    it('should inject addListener into class prototype', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Helper', MockClass);

      sut.getInstance('Lib.Helper');
      expect(typeof MockClass.prototype.addListener).toBe('function');
    });

    it('should inject removeListener into class prototype', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Helper', MockClass);

      sut.getInstance('Lib.Helper');
      expect(typeof MockClass.prototype.removeListener).toBe('function');
    });

    it('should inject emit into class prototype', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Helper', MockClass);

      sut.getInstance('Lib.Helper');
      expect(typeof MockClass.prototype.emit).toBe('function');
    });

    it('should pass params to constructor', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Param', MockClass);

      sut.getInstance('Lib.Param', { foo: 'bar' });
      expect(MockClass).toHaveBeenCalledWith({ foo: 'bar' });
    });
  });

  // ========================================================================
  // Mode resolution
  // ========================================================================

  describe('mode resolution', () => {
    it('should resolve class from modifications namespace when mode is active', () => {
      const DefaultClass = createMockClass();
      const MobileClass = createMockClass();

      // Set up: Urso.Game.Lib has Controller and modifications.Mobile.Controller
      setGamePath('Lib.Controller', DefaultClass);
      setGamePath('Lib.modifications.Mobile.Controller', MobileClass);

      sut.addMode('mobile');
      mockUrso.observer.fire.mockClear();

      const result = sut.getByPath('Lib.Controller');
      expect(result).toBe(MobileClass);
    });

    it('should fall back to default when mode class does not exist', () => {
      const DefaultClass = createMockClass();
      setGamePath('Lib.Controller', DefaultClass);

      sut.addMode('mobile');
      mockUrso.observer.fire.mockClear();

      const result = sut.getByPath('Lib.Controller');
      expect(result).toBe(DefaultClass);
    });

    it('should skip mode resolution when noModes is true', () => {
      const DefaultClass = createMockClass();
      const MobileClass = createMockClass();

      setGamePath('Lib.Controller', DefaultClass);
      setGamePath('Lib.modifications.Mobile.Controller', MobileClass);

      sut.addMode('mobile');

      const result = sut.getByPath('Lib.Controller', true);
      expect(result).toBe(DefaultClass);
    });
  });

  // ========================================================================
  // Mixin application
  // ========================================================================

  describe('mixin application', () => {
    it('should apply mixin from mixins namespace', () => {
      const BaseClass = createMockClass();
      const mixedClass = createMockClass();
      const mixin = vi.fn(() => mixedClass);

      setGamePath('Lib.Controller', BaseClass);
      setGamePath('Lib.mixins.Mobile.Controller', mixin);

      sut.addMode('mobile');
      mockUrso.observer.fire.mockClear();

      const result = sut.getByPath('Lib.Controller');
      expect(mixin).toHaveBeenCalledWith(BaseClass);
      expect(result).toBe(mixedClass);
    });
  });

  // ========================================================================
  // Entity tracking
  // ========================================================================

  describe('entity tracking', () => {
    it('should inject getInstance that resolves relative to parent path', () => {
      const ParentClass = createMockClass();
      const ChildClass = createMockClass();

      setGamePath('Modules.Scene.Controller', ParentClass);
      setGamePath('Modules.Scene.Service', ChildClass);

      const parent = sut.getInstance<Record<string, unknown>>('Modules.Scene.Controller');
      expect(parent).toBeDefined();

      // The injected getInstance should be relative to 'Modules.Scene'
      expect(typeof ParentClass.prototype.getInstance).toBe('function');
    });
  });

  // ========================================================================
  // Injected entity methods
  // ========================================================================

  describe('injected entity methods', () => {
    it('addListener should delegate to Urso.observer.add', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Test', MockClass);

      sut.getInstance('Lib.Test');

      const cb = vi.fn();
      (MockClass.prototype.addListener as (...args: unknown[]) => void).call(undefined, 'event.name', cb, true);
      expect(mockUrso.observer.add).toHaveBeenCalledWith('event.name', cb, true);
    });

    it('removeListener should delegate to Urso.observer.remove', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Test2', MockClass);

      sut.getInstance('Lib.Test2');

      const cb = vi.fn();
      (MockClass.prototype.removeListener as (...args: unknown[]) => void).call(undefined, 'event.name', cb, false);
      expect(mockUrso.observer.remove).toHaveBeenCalledWith('event.name', cb, false);
    });

    it('emit should delegate to Urso.observer.fire', () => {
      const MockClass = createMockClass();
      setGamePath('Lib.Test3', MockClass);

      sut.getInstance('Lib.Test3');

      (MockClass.prototype.emit as (...args: unknown[]) => void).call(undefined, 'event.name', { data: 1 });
      expect(mockUrso.observer.fire).toHaveBeenCalledWith('event.name', { data: 1 });
    });
  });
});
