import ComponentsFullscreenAndroid from '../../../src/ts/components/fullscreen/android';

describe('ComponentsFullscreenAndroid', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    mockUrso.config.gamePath = '/game/';
    mockUrso.device.ScreenOrientation = { PORTRAIT: 'portrait', LANDSCAPE: 'landscape' };
    mockUrso.getInstance.mockReturnValue({ contents: [] });
  });

  function createSut(): ComponentsFullscreenAndroid {
    const sut = new ComponentsFullscreenAndroid();
    sut.addListener = vi.fn() as ComponentsFullscreenAndroid['addListener'];
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
      expect(sut['_div']!.className).toBe('fullscreen fullscreen-android');
    });

    it('should update orientation on init', () => {
      const sut = createSut();
      sut.init();
      expect(sut['_orientation']).not.toBeNull();
    });
  });

  describe('isFullscreen', () => {
    it('should return falsy by default', () => {
      const sut = createSut();
      expect(sut.isFullscreen).toBeFalsy();
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
    it('should set div visibility', () => {
      const sut = createSut();
      sut.init();
      sut.isVisible = true;
      expect(sut['_div']!.style.visibility).toBe('visible');
      sut.isVisible = false;
      expect(sut['_div']!.style.visibility).toBe('hidden');
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
