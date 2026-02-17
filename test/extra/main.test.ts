describe('ExtraMain', () => {
  beforeEach(() => {
    (globalThis as Record<string, unknown>).PIXI = {
      ExtensionType: { LoadParser: 'load-parser' },
      extensions: { add: vi.fn() },
    };
    (globalThis as Record<string, unknown>).gsap = { to: vi.fn() };
    (globalThis as Record<string, unknown>).Howler = {};
    (globalThis as Record<string, unknown>).Howl = vi.fn();
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).PIXI;
    delete (globalThis as Record<string, unknown>).gsap;
    delete (globalThis as Record<string, unknown>).Howler;
    delete (globalThis as Record<string, unknown>).Howl;
    vi.resetModules();
  });

  it('should register SoundAsset extension', async () => {
    await import('../../src/ts/extra/main');
    const pixi = (globalThis as Record<string, unknown>).PIXI as { extensions: { add: ReturnType<typeof vi.fn> } };
    expect(pixi.extensions.add).toHaveBeenCalledWith(
      expect.objectContaining({
        extension: expect.objectContaining({
          type: 'load-parser',
          name: 'sound-asset-loader',
          priority: 100,
        }),
      }),
    );
  });

  it('should set window.UrsoUtils', async () => {
    await import('../../src/ts/extra/main');
    const ursoUtils = (window as unknown as Record<string, unknown>).UrsoUtils as Record<string, unknown>;
    expect(ursoUtils).toBeDefined();
    expect(ursoUtils).toHaveProperty('Howler');
    expect(ursoUtils).toHaveProperty('Howl');
    expect(ursoUtils).toHaveProperty('gsap');
    expect(ursoUtils).toHaveProperty('PIXI');
  });

  describe('SoundAsset.test', () => {
    it('should match audio file extensions', async () => {
      await import('../../src/ts/extra/main');
      const pixi = (globalThis as Record<string, unknown>).PIXI as { extensions: { add: ReturnType<typeof vi.fn> } };
      const soundAsset = pixi.extensions.add.mock.calls[0][0] as { test: (url: string) => boolean };
      expect(soundAsset.test('audio.mp3')).toBe(true);
      expect(soundAsset.test('audio.ogg')).toBe(true);
      expect(soundAsset.test('audio.wav')).toBe(true);
      expect(soundAsset.test('image.png')).toBe(false);
    });
  });

  describe('SoundAsset.load', () => {
    it('should fetch and return array buffer', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        arrayBuffer: vi.fn(() => Promise.resolve(mockArrayBuffer)),
      } as unknown as Response);

      await import('../../src/ts/extra/main');
      const pixi = (globalThis as Record<string, unknown>).PIXI as { extensions: { add: ReturnType<typeof vi.fn> } };
      const soundAsset = pixi.extensions.add.mock.calls[0][0] as { load: (url: string) => Promise<ArrayBuffer> };
      const result = await soundAsset.load('test.mp3');
      expect(result).toBe(mockArrayBuffer);

      fetchSpy.mockRestore();
    });

    it('should throw on HTTP error', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
      } as unknown as Response);

      await import('../../src/ts/extra/main');
      const pixi = (globalThis as Record<string, unknown>).PIXI as { extensions: { add: ReturnType<typeof vi.fn> } };
      const soundAsset = pixi.extensions.add.mock.calls[0][0] as { load: (url: string) => Promise<ArrayBuffer> };
      await expect(soundAsset.load('missing.mp3')).rejects.toThrow('HTTP error');

      fetchSpy.mockRestore();
    });
  });
});
