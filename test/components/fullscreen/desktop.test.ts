import ComponentsFullscreenDesktop from '../../../src/ts/components/fullscreen/desktop';

describe('ComponentsFullscreenDesktop', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  function createSut(): ComponentsFullscreenDesktop {
    const sut = new ComponentsFullscreenDesktop();
    sut.addListener = vi.fn() as ComponentsFullscreenDesktop['addListener'];
    return sut;
  }

  it('should have init method', () => {
    const sut = createSut();
    expect(() => sut.init()).not.toThrow();
  });

  describe('isFullscreen', () => {
    it('should return false by default', () => {
      const sut = createSut();
      expect(sut.isFullscreen).toBe(false);
    });
  });

  describe('_switchFullscreen', () => {
    it('should request fullscreen when needGoFullscreen is true', () => {
      const sut = createSut();
      const spy = vi.spyOn(sut, '_requestFullscreen').mockImplementation(() => {});
      sut._switchFullscreen(true);
      expect(spy).toHaveBeenCalled();
    });

    it('should cancel fullscreen when needGoFullscreen is false', () => {
      const sut = createSut();
      const spy = vi.spyOn(sut, '_cancelFullscreen').mockImplementation(() => {});
      sut._switchFullscreen(false);
      expect(spy).toHaveBeenCalled();
    });

    it('should toggle when null', () => {
      const sut = createSut();
      const spy = vi.spyOn(sut, '_requestFullscreen').mockImplementation(() => {});
      sut._switchFullscreen(null); // not fullscreen, so should request
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('_subscribeOnce', () => {
    it('should add fullscreen switch listener', () => {
      const sut = createSut();
      sut._subscribeOnce();
      expect(sut.addListener).toHaveBeenCalledWith(
        mockUrso.events.COMPONENTS_FULLSCREEN_SWITCH,
        expect.any(Function),
      );
    });
  });
});
