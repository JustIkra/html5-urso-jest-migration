import ExtraBrowserEvents from '../../src/ts/extra/browserEvents';

describe('ExtraBrowserEvents', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  const proto = ExtraBrowserEvents.prototype;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = {
      ...mockUrso,
      setTimeout: vi.fn((_fn: () => void, _delay: number) => 123),
      clearTimeout: vi.fn(),
    };

    // emit is framework-injected
    proto.emit = vi.fn() as ExtraBrowserEvents['emit'];
  });

  afterEach(() => {
    delete (proto as { emit?: unknown }).emit;
  });

  function createSut(): ExtraBrowserEvents {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
    const docAddEventListenerSpy = vi.spyOn(document, 'addEventListener').mockImplementation(() => {});
    const sut = new ExtraBrowserEvents();
    addEventListenerSpy.mockRestore();
    docAddEventListenerSpy.mockRestore();
    return sut;
  }

  it('should set singleton to true', () => {
    const sut = createSut();
    expect(sut.singleton).toBe(true);
  });

  it('should set RESIZE_DELAY to 0', () => {
    const sut = createSut();
    expect(sut.RESIZE_DELAY).toBe(0);
  });

  describe('init', () => {
    it('should add window event listeners', () => {
      const addSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
      const docSpy = vi.spyOn(document, 'addEventListener').mockImplementation(() => {});
      new ExtraBrowserEvents();

      expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));

      addSpy.mockRestore();
      docSpy.mockRestore();
    });

    it('should add document event listeners', () => {
      const addSpy = vi.spyOn(window, 'addEventListener').mockImplementation(() => {});
      const docSpy = vi.spyOn(document, 'addEventListener').mockImplementation(() => {});
      new ExtraBrowserEvents();

      expect(docSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
      expect(docSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
      expect(docSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(docSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(docSpy).toHaveBeenCalledWith('wheel', expect.any(Function));

      addSpy.mockRestore();
      docSpy.mockRestore();
    });
  });

  describe('visibilitychangeHandler', () => {
    it('should emit visibility change event', () => {
      const sut = createSut();
      sut.visibilitychangeHandler();
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.EXTRA_BROWSEREVENTS_WINDOW_VISIBILITYCHANGE,
        expect.any(String),
      );
    });
  });

  describe('resizeHandler', () => {
    it('should emit pre-resize event', () => {
      const sut = createSut();
      sut.resizeHandler();
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.EXTRA_BROWSEREVENTS_WINDOW_PRE_RESIZE,
      );
    });

    it('should call setTimeout for delayed resize event', () => {
      const sut = createSut();
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, ReturnType<typeof vi.fn>>;
      sut.resizeHandler();
      expect(urso.setTimeout).toHaveBeenCalledWith(expect.any(Function), 0);
    });

    it('should clear previous timeout on repeated calls', () => {
      const sut = createSut();
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, ReturnType<typeof vi.fn>>;
      sut.resizeHandler();
      sut.resizeHandler();
      expect(urso.clearTimeout).toHaveBeenCalledWith(123);
    });
  });

  describe('_pointerEventsHandler', () => {
    it('should emit pointer event with event object', () => {
      const sut = createSut();
      const event = new MouseEvent('mousedown');
      sut._pointerEventsHandler(event);
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.EXTRA_BROWSEREVENTS_POINTER_EVENT,
        event,
      );
    });
  });

  describe('_keyPressHandler', () => {
    it('should emit keypress event with event object', () => {
      const sut = createSut();
      const event = new KeyboardEvent('keydown', { key: 'a' });
      sut._keyPressHandler(event);
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.EXTRA_BROWSEREVENTS_KEYPRESS_EVENT,
        event,
      );
    });
  });
});
