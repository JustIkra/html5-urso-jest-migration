import ComponentsFullscreenIos from '../../../src/ts/components/fullscreen/ios';

describe('ComponentsFullscreenIos', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    mockUrso.config.gamePath = '/game/';
    mockUrso.device.ScreenOrientation = { PORTRAIT: 'portrait', LANDSCAPE: 'landscape' };
    mockUrso.getInstance.mockReturnValue({ contents: [] });
  });

  function createSut(): ComponentsFullscreenIos {
    const sut = new ComponentsFullscreenIos();
    sut.addListener = vi.fn() as ComponentsFullscreenIos['addListener'];
    return sut;
  }

  it('should start with null div and orientation', () => {
    const sut = createSut();
    expect(sut['_div']).toBeNull();
    expect(sut['_orientation']).toBeNull();
  });

  describe('init', () => {
    it('should create DOM elements', () => {
      const sut = createSut();
      sut.init();
      expect(sut['_div']).not.toBeNull();
      expect(sut['_div']!.className).toBe('fullscreen fullscreen-ios');
    });
  });

  describe('isFullscreen', () => {
    it('should return a boolean', () => {
      const sut = createSut();
      expect(typeof sut.isFullscreen).toBe('boolean');
    });
  });

  describe('_isPortrait', () => {
    it('should check against orientation', () => {
      const sut = createSut();
      sut['_orientation'] = 'portrait';
      mockUrso.device.ScreenOrientation = { PORTRAIT: 'portrait', LANDSCAPE: 'landscape' };
      expect(sut._isPortrait).toBe(true);
    });
  });

  describe('isVisible setter', () => {
    it('should set div zIndex', () => {
      vi.useFakeTimers();
      const sut = createSut();
      sut.init();
      sut.isVisible = true;
      expect(sut['_div']!.style.zIndex).toBe('1');
      sut.isVisible = false;
      expect(sut['_div']!.style.zIndex).toBe('-1');
      vi.useRealTimers();
    });
  });

  describe('_subscribeOnce', () => {
    it('should add resize listener', () => {
      const sut = createSut();
      sut._subscribeOnce();
      expect(sut.addListener).toHaveBeenCalledWith(
        mockUrso.events.EXTRA_BROWSEREVENTS_WINDOW_RESIZE,
        expect.any(Function),
      );
    });
  });
});
