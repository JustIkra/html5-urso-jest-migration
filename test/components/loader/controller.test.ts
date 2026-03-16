import ComponentsLoaderController from '../../../src/ts/components/loader/controller';

describe('ComponentsLoaderController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  function createSut(): ComponentsLoaderController {
    const sut = new ComponentsLoaderController();
    sut.getInstance = vi.fn() as ComponentsLoaderController['getInstance'];
    sut.addListener = vi.fn() as ComponentsLoaderController['addListener'];
    sut.removeListener = vi.fn() as ComponentsLoaderController['removeListener'];
    sut.emit = vi.fn() as ComponentsLoaderController['emit'];
    return sut;
  }

  function createMockSceneObject(overrides?: Record<string, unknown>) {
    return {
      text: '',
      _baseObject: {
        mask: null,
        scale: { x: 1 },
      },
      visible: true,
      ...overrides,
    };
  }

  describe('formatAmountText', () => {
    it('should format number as percentage string', () => {
      const sut = createSut();
      expect(sut.formatAmountText(50)).toBe('50%');
    });

    it('should handle zero', () => {
      const sut = createSut();
      expect(sut.formatAmountText(0)).toBe('0%');
    });

    it('should handle 100', () => {
      const sut = createSut();
      expect(sut.formatAmountText(100)).toBe('100%');
    });
  });

  describe('componentCreated', () => {
    it('should return false when no scene objects exist', () => {
      const sut = createSut();
      mockUrso.findOne.mockReturnValue(null);
      expect(sut.componentCreated).toBe(false);
    });

    it('should return true when all scene objects exist', () => {
      const sut = createSut();
      mockUrso.findOne.mockReturnValue(createMockSceneObject());
      expect(sut.componentCreated).toBe(true);
    });

    it('should return false when only some scene objects exist', () => {
      const sut = createSut();
      mockUrso.findOne.mockImplementation((selector: string) => {
        if (selector === '.loadAmountText') return createMockSceneObject();
        return null;
      });
      expect(sut.componentCreated).toBe(false);
    });
  });

  describe('loadAmountText', () => {
    it('should query Urso.findOne with .loadAmountText selector', () => {
      const sut = createSut();
      const mockObj = createMockSceneObject();
      mockUrso.findOne.mockReturnValue(mockObj);
      expect(sut.loadAmountText).toBe(mockObj);
      expect(mockUrso.findOne).toHaveBeenCalledWith('.loadAmountText');
    });
  });

  describe('loaderBg', () => {
    it('should query Urso.findOne with ^loaderBg selector', () => {
      const sut = createSut();
      const mockObj = createMockSceneObject();
      mockUrso.findOne.mockReturnValue(mockObj);
      expect(sut.loaderBg).toBe(mockObj);
      expect(mockUrso.findOne).toHaveBeenCalledWith('^loaderBg');
    });
  });

  describe('loaderBgMask', () => {
    it('should query Urso.findOne with ^loaderBgMask selector', () => {
      const sut = createSut();
      const mockObj = createMockSceneObject();
      mockUrso.findOne.mockReturnValue(mockObj);
      expect(sut.loaderBgMask).toBe(mockObj);
      expect(mockUrso.findOne).toHaveBeenCalledWith('^loaderBgMask');
    });
  });

  describe('setMask', () => {
    it('should set mask on loaderBg from loaderBgMask baseObject', () => {
      const sut = createSut();
      const bg = createMockSceneObject();
      const bgMask = createMockSceneObject();
      mockUrso.findOne.mockImplementation((selector: string) => {
        if (selector === '^loaderBg') return bg;
        if (selector === '^loaderBgMask') return bgMask;
        return null;
      });
      sut.setMask();
      expect(bg._baseObject.mask).toBe(bgMask._baseObject);
    });

    it('should not throw when loaderBg is null', () => {
      const sut = createSut();
      mockUrso.findOne.mockReturnValue(null);
      expect(() => sut.setMask()).not.toThrow();
    });
  });

  describe('create', () => {
    it('should call setMask', () => {
      const sut = createSut();
      const spy = vi.spyOn(sut, 'setMask');
      mockUrso.findOne.mockReturnValue(null);
      sut.create();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('setLoadProgress', () => {
    it('should update scale and text when component is created', () => {
      const sut = createSut();
      const bg = createMockSceneObject();
      const bgMask = createMockSceneObject();
      const text = createMockSceneObject();
      mockUrso.findOne.mockImplementation((selector: string) => {
        if (selector === '^loaderBg') return bg;
        if (selector === '^loaderBgMask') return bgMask;
        if (selector === '.loadAmountText') return text;
        return null;
      });

      sut.setLoadProgress(75);
      expect(bgMask._baseObject.scale.x).toBe(75);
      expect(text.text).toBe('75%');
    });

    it('should not update when component is not created', () => {
      const sut = createSut();
      mockUrso.findOne.mockReturnValue(null);
      expect(() => sut.setLoadProgress(0.5)).not.toThrow();
    });
  });

  describe('loadUpdate', () => {
    it('should call setLoadProgress when loadProgress is provided', () => {
      const sut = createSut();
      const spy = vi.spyOn(sut, 'setLoadProgress').mockImplementation(() => {});
      sut.loadUpdate(0.5);
      expect(spy).toHaveBeenCalledWith(0.5);
    });

    it('should call setLoadProgress even when loadProgress is undefined', () => {
      const sut = createSut();
      const spy = vi.spyOn(sut, 'setLoadProgress').mockImplementation(() => {});
      sut.loadUpdate();
      expect(spy).toHaveBeenCalledWith(undefined);
    });
  });
});
