describe('Index', () => {
  beforeEach(() => {
    const mockUrso = createMockUrso();
    const extendedMock = {
      ...mockUrso,
      Core: {
        Config: { Main: { title: 'TestGame', defaultScene: 'play' } },
        App: class {
          setup = vi.fn();
        },
      },
      config: {},
      runGame: undefined as unknown,
    };
    (globalThis as Record<string, unknown>).Urso = extendedMock;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should set Urso.config from Core.Config.Main', async () => {
    await import('../../src/ts/index');
    const urso = (globalThis as Record<string, unknown>).Urso as Record<string, unknown>;
    expect(urso.config).toEqual({ title: 'TestGame', defaultScene: 'play' });
  });

  it('should set Urso.runGame to App.setup', async () => {
    await import('../../src/ts/index');
    const urso = (globalThis as Record<string, unknown>).Urso as Record<string, unknown>;
    expect(typeof urso.runGame).toBe('function');
  });
});
