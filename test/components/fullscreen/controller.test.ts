import ComponentsFullscreenController from '../../../src/ts/components/fullscreen/controller';

describe('ComponentsFullscreenController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockActivator: { init: ReturnType<typeof vi.fn>; isFullscreen: boolean };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockActivator = { init: vi.fn(), isFullscreen: false };

    mockUrso.getInstance.mockReturnValue({ contents: [], _orientations: [] });
    mockUrso.device.desktop = true;

    ComponentsFullscreenController.prototype.getInstance = vi.fn(() => mockActivator) as ComponentsFullscreenController['getInstance'];
    ComponentsFullscreenController.prototype.emit = vi.fn() as ComponentsFullscreenController['emit'];
    ComponentsFullscreenController.prototype.addListener = vi.fn() as ComponentsFullscreenController['addListener'];
  });

  afterEach(() => {
    delete (ComponentsFullscreenController.prototype as { getInstance?: unknown }).getInstance;
    delete (ComponentsFullscreenController.prototype as { emit?: unknown }).emit;
    delete (ComponentsFullscreenController.prototype as { addListener?: unknown }).addListener;
  });

  function createSut(): ComponentsFullscreenController {
    return new ComponentsFullscreenController();
  }

  describe('constructor', () => {
    it('should create an activator', () => {
      const sut = createSut();
      expect(sut.getInstance).toHaveBeenCalledWith('Desktop');
    });

    it('should call init on activator', () => {
      const sut = createSut();
      expect(mockActivator.init).toHaveBeenCalled();
    });
  });

  describe('createActivator', () => {
    it('should create iOS activator when on iOS', () => {
      mockUrso.device.desktop = false;
      mockUrso.device.iOS = true;
      const sut = createSut();
      expect(sut.getInstance).toHaveBeenCalledWith('Ios');
    });

    it('should create Android activator when on Android', () => {
      mockUrso.device.desktop = false;
      mockUrso.device.iOS = false;
      mockUrso.device.android = true;
      const sut = createSut();
      expect(sut.getInstance).toHaveBeenCalledWith('Android');
    });

    it('should skip when CriOS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 CriOS/100.0',
        configurable: true,
      });
      const sut = createSut();
      expect(sut.getInstance).not.toHaveBeenCalledWith('Desktop');
      Object.defineProperty(navigator, 'userAgent', {
        value: '',
        configurable: true,
      });
    });
  });

  describe('isFullscreen', () => {
    it('should return false when no activator', () => {
      ComponentsFullscreenController.prototype.getInstance = vi.fn(() => null) as ComponentsFullscreenController['getInstance'];
      mockUrso.device.desktop = false;
      mockUrso.device.iOS = false;
      mockUrso.device.android = false;
      const sut = createSut();
      expect(sut.isFullscreen).toBe(false);
    });

    it('should delegate to activator', () => {
      mockActivator.isFullscreen = true;
      const sut = createSut();
      expect(sut.isFullscreen).toBe(true);
    });
  });

  describe('_resizeHandler', () => {
    it('should emit fullscreen change event', () => {
      const sut = createSut();
      sut.lastResizeFullscreenResult = undefined;
      sut._resizeHandler();
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.COMPONENTS_FULLSCREEN_CHANGE,
        false,
      );
    });

    it('should not emit when result has not changed', () => {
      const sut = createSut();
      (sut.emit as ReturnType<typeof vi.fn>).mockClear();
      sut._resizeHandler(); // same as last time
      expect(sut.emit).not.toHaveBeenCalled();
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
