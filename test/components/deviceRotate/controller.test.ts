import ComponentsDeviceRotateController from '../../../src/ts/components/deviceRotate/controller';

describe('ComponentsDeviceRotateController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    mockUrso.config.gamePath = '/game/';
    mockUrso.device.ScreenOrientation = { PORTRAIT: 'portrait', LANDSCAPE: 'landscape' };
    mockUrso.getInstance.mockReturnValue({ contents: [] });
  });

  function createSut(): ComponentsDeviceRotateController {
    const sut = new ComponentsDeviceRotateController();
    sut.addListener = vi.fn() as ComponentsDeviceRotateController['addListener'];
    sut.removeListener = vi.fn() as ComponentsDeviceRotateController['removeListener'];
    sut.emit = vi.fn() as ComponentsDeviceRotateController['emit'];
    return sut;
  }

  it('should start with null div and orientation', () => {
    const sut = createSut();
    expect(sut['_div']).toBeNull();
    expect(sut['_orientation']).toBeNull();
  });

  describe('create', () => {
    it('should skip on desktop', () => {
      mockUrso.device.desktop = true;
      const sut = createSut();
      sut.create();
      expect(sut['_div']).toBeNull();
      expect(sut['_created']).toBe(false);
    });

    it('should create DOM on mobile', () => {
      mockUrso.device.desktop = false;
      const sut = createSut();
      sut.create();
      expect(sut['_div']).not.toBeNull();
      expect(sut['_div']!.className).toBe('fullscreen device-rotate');
      expect(sut['_created']).toBe(true);
    });

    it('should fetch resolutions config', () => {
      mockUrso.device.desktop = false;
      mockUrso.getInstance.mockReturnValue({ contents: [{ orientation: 'portrait' }] });
      const sut = createSut();
      sut.create();
      expect(sut['_resolutionsConfig']).toEqual([{ orientation: 'portrait' }]);
    });
  });

  describe('_createDom', () => {
    it('should create div with correct structure', () => {
      mockUrso.device.desktop = false;
      const sut = createSut();
      sut.create();
      const div = sut['_div']!;
      expect(div.style.touchAction).toBe('none');
      expect(div.querySelector('.fullscreen-info')).not.toBeNull();
      expect(div.querySelector('img')).not.toBeNull();
      expect(div.querySelector('span')).not.toBeNull();
    });

    it('should set image src from gamePath', () => {
      mockUrso.device.desktop = false;
      const sut = createSut();
      sut.create();
      const img = sut['_div']!.querySelector('img')!;
      expect(img.src).toContain('/game/assets/images/fullscreen/rotate.png');
    });

    it('should set span text', () => {
      mockUrso.device.desktop = false;
      const sut = createSut();
      sut.create();
      const span = sut['_div']!.querySelector('span')!;
      expect(span.innerText).toBe('Please rotate device');
    });
  });

  describe('_isPortrait', () => {
    it('should return true when orientation is portrait', () => {
      const sut = createSut();
      sut['_orientation'] = 'portrait';
      expect(sut['_isPortrait']).toBe(true);
    });

    it('should return false when orientation is landscape', () => {
      const sut = createSut();
      sut['_orientation'] = 'landscape';
      expect(sut['_isPortrait']).toBe(false);
    });
  });

  describe('_showOnLandscape', () => {
    it('should return false when no resolutions config', () => {
      const sut = createSut();
      expect(sut['_showOnLandscape']).toBe(false);
    });

    it('should return true when landscape is NOT in config', () => {
      const sut = createSut();
      sut['_resolutionsConfig'] = [{ orientation: 'portrait' }];
      expect(sut['_showOnLandscape']).toBe(true);
    });

    it('should return false when landscape IS in config', () => {
      const sut = createSut();
      sut['_resolutionsConfig'] = [{ orientation: 'landscape' }];
      expect(sut['_showOnLandscape']).toBe(false);
    });
  });

  describe('_showOnPortrait', () => {
    it('should return false when no resolutions config', () => {
      const sut = createSut();
      expect(sut['_showOnPortrait']).toBe(false);
    });

    it('should return true when portrait is NOT in config', () => {
      const sut = createSut();
      sut['_resolutionsConfig'] = [{ orientation: 'landscape' }];
      expect(sut['_showOnPortrait']).toBe(true);
    });

    it('should return false when portrait IS in config', () => {
      const sut = createSut();
      sut['_resolutionsConfig'] = [{ orientation: 'portrait' }];
      expect(sut['_showOnPortrait']).toBe(false);
    });
  });

  describe('_needShow', () => {
    it('should return true when portrait and showOnPortrait', () => {
      const sut = createSut();
      sut['_orientation'] = 'portrait';
      sut['_resolutionsConfig'] = [{ orientation: 'landscape' }];
      expect(sut['_needShow']).toBe(true);
    });

    it('should return true when landscape and showOnLandscape', () => {
      const sut = createSut();
      sut['_orientation'] = 'landscape';
      sut['_resolutionsConfig'] = [{ orientation: 'portrait' }];
      expect(sut['_needShow']).toBe(true);
    });

    it('should return false when portrait and not showOnPortrait', () => {
      const sut = createSut();
      sut['_orientation'] = 'portrait';
      sut['_resolutionsConfig'] = [{ orientation: 'portrait' }];
      expect(sut['_needShow']).toBe(false);
    });
  });

  describe('_isVisible setter', () => {
    it('should set div visibility', () => {
      mockUrso.device.desktop = false;
      const sut = createSut();
      sut.create();
      sut['_isVisible'] = true;
      expect(sut['_div']!.style.visibility).toBe('visible');
      sut['_isVisible'] = false;
      expect(sut['_div']!.style.visibility).toBe('hidden');
    });
  });

  describe('_updateOrientation', () => {
    it('should detect landscape when width > height', () => {
      const sut = createSut();
      Object.defineProperty(globalThis, 'innerWidth', { value: 1024, configurable: true });
      Object.defineProperty(globalThis, 'innerHeight', { value: 768, configurable: true });
      sut['_updateOrientation']();
      expect(sut['_orientation']).toBe('landscape');
    });

    it('should detect portrait when height > width', () => {
      const sut = createSut();
      Object.defineProperty(globalThis, 'innerWidth', { value: 768, configurable: true });
      Object.defineProperty(globalThis, 'innerHeight', { value: 1024, configurable: true });
      sut['_updateOrientation']();
      expect(sut['_orientation']).toBe('portrait');
    });
  });

  describe('_resizeHandler', () => {
    it('should skip when not created', () => {
      const sut = createSut();
      expect(() => sut['_resizeHandler']()).not.toThrow();
    });

    it('should update orientation and visibility when created', () => {
      mockUrso.device.desktop = false;
      const sut = createSut();
      sut.create();
      const orientationSpy = vi.spyOn(sut as unknown as { _updateOrientation: () => void }, '_updateOrientation');
      const visibilitySpy = vi.spyOn(sut as unknown as { _updateVisibility: () => void }, '_updateVisibility');
      sut['_resizeHandler']();
      expect(orientationSpy).toHaveBeenCalled();
      expect(visibilitySpy).toHaveBeenCalled();
    });
  });

  describe('_subscribeOnce', () => {
    it('should skip on desktop', () => {
      mockUrso.device.desktop = true;
      const sut = createSut();
      sut._subscribeOnce();
      expect(sut.addListener).not.toHaveBeenCalled();
    });

    it('should add resize listener on mobile', () => {
      mockUrso.device.desktop = false;
      const sut = createSut();
      sut._subscribeOnce();
      expect(sut.addListener).toHaveBeenCalledWith(
        mockUrso.events.EXTRA_BROWSEREVENTS_WINDOW_RESIZE,
        expect.any(Function),
      );
    });
  });
});
