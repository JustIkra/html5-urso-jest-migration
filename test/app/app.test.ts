import App from '../../src/ts/app';

describe('App', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();

    // Extend mock with App-specific properties
    const extendedMock = {
      ...mockUrso,
      Core: {
        Lib: { Helper: vi.fn() },
        Modules: { Instances: { Controller: vi.fn(() => ({
          getInstance: vi.fn(),
          getByPath: vi.fn(),
          getModes: vi.fn(() => []),
          addMode: vi.fn(),
          removeMode: vi.fn(),
        })) } },
      },
      Game: {},
      config: {
        ...mockUrso.config,
        title: 'TestGame',
        defaultScene: 'play',
        extendingChain: ['Urso.Core'],
      },
      setTimeout: vi.fn((_cb: () => void, _delay: number) => ({ kill: vi.fn() })),
      clearTimeout: vi.fn(),
    };

    (globalThis as Record<string, unknown>).Urso = extendedMock;
    (globalThis as Record<string, unknown>).gsap = {
      delayedCall: vi.fn((_delay: number, callback: () => void) => {
        callback();
        return { kill: vi.fn() };
      }),
    };
  });

  it('should have version property', () => {
    const app = new App();
    expect(app.version).toBe('APP_VERSION');
  });

  it('should bind setup to this', () => {
    const app = new App();
    expect(typeof app.setup).toBe('function');
  });

  describe('sayHello', () => {
    it('should log greeting to console', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const app = new App();
      app.sayHello();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Urso'),
        expect.any(String),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('run', () => {
    it('should call logic.do with run', () => {
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, Record<string, ReturnType<typeof vi.fn>>>;
      urso.logic = { do: vi.fn() };
      urso.scenes = { display: vi.fn(), init: vi.fn() };
      const app = new App();
      app.run();
      expect(urso.logic.do).toHaveBeenCalledWith('run');
    });

    it('should display default scene', () => {
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, Record<string, ReturnType<typeof vi.fn>> | Record<string, unknown>>;
      urso.logic = { do: vi.fn() };
      urso.scenes = { display: vi.fn(), init: vi.fn() };
      (urso.config as Record<string, unknown>).defaultScene = 'play';
      const app = new App();
      app.run();
      expect((urso.scenes as Record<string, ReturnType<typeof vi.fn>>).display).toHaveBeenCalledWith('play');
    });
  });

  describe('_addTimeouts', () => {
    it('should set Urso.setTimeout', () => {
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, unknown>;
      const app = new App();
      app._addTimeouts();
      expect(typeof urso.setTimeout).toBe('function');
    });

    it('should set Urso.clearTimeout', () => {
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, unknown>;
      const app = new App();
      app._addTimeouts();
      expect(typeof urso.clearTimeout).toBe('function');
    });

    it('should use gsap.delayedCall for setTimeout', () => {
      const gsapMock = (globalThis as Record<string, unknown>).gsap as Record<string, ReturnType<typeof vi.fn>>;
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, (...args: unknown[]) => unknown>;
      const app = new App();
      app._addTimeouts();
      const cb = vi.fn();
      urso.setTimeout(cb, 1000);
      expect(gsapMock.delayedCall).toHaveBeenCalledWith(1, cb);
    });

    it('should call tween.kill for clearTimeout', () => {
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, (...args: unknown[]) => unknown>;
      const app = new App();
      app._addTimeouts();
      const tween = { kill: vi.fn() };
      urso.clearTimeout(tween);
      expect(tween.kill).toHaveBeenCalled();
    });
  });
});
