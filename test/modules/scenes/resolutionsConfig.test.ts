import ModulesScenesResolutionsConfig from '../../../src/ts/modules/scenes/resolutionsConfig';

describe('ModulesScenesResolutionsConfig', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = {
      ...mockUrso,
      device: {
        ...mockUrso.device,
        ScreenOrientation: { LANDSCAPE: 'landscape', PORTRAIT: 'portrait' },
      },
    };
  });

  it('should be a singleton', () => {
    const sut = new ModulesScenesResolutionsConfig();
    expect(sut.singleton).toBe(true);
  });

  it('should have _orientations with landscape and portrait', () => {
    const sut = new ModulesScenesResolutionsConfig();
    expect(sut._orientations).toContain('landscape');
    expect(sut._orientations).toContain('portrait');
  });

  it('should have default resolution in contents', () => {
    const sut = new ModulesScenesResolutionsConfig();
    expect(sut.contents).toHaveLength(1);
    expect(sut.contents[0].name).toBe('default');
    expect(sut.contents[0].width).toBe(1920);
    expect(sut.contents[0].height).toBe(1080);
    expect(sut.contents[0].orientation).toBe('landscape');
    expect(sut.contents[0].adaptive).toBe(true);
  });

  it('should return contents via get()', () => {
    const sut = new ModulesScenesResolutionsConfig();
    expect(sut.get()).toBe(sut.contents);
  });

  it('should return adaptiveConfig via getAdaptive()', () => {
    const sut = new ModulesScenesResolutionsConfig();
    expect(sut.getAdaptive()).toBe(sut.adaptiveConfig);
  });

  it('should have adaptive config for desktop and mobile', () => {
    const sut = new ModulesScenesResolutionsConfig();
    const adaptive = sut.getAdaptive();
    expect(adaptive.desktop.supported).toBe(true);
    expect(adaptive.mobile.supported).toBe(true);
    expect(adaptive.desktop.limits.landscape).toEqual({ min: 1, max: 2 });
    expect(adaptive.desktop.limits.portrait).toEqual({ min: 0.5, max: 1 });
  });

  describe('maxDimension methods', () => {
    it('maxWidth should return max width from contents', () => {
      const sut = new ModulesScenesResolutionsConfig();
      expect(sut.maxWidth()).toBe(1920);
    });

    it('maxHeight should return max height from contents', () => {
      const sut = new ModulesScenesResolutionsConfig();
      expect(sut.maxHeight()).toBe(1080);
    });

    it('maxSize should return max of maxWidth and maxHeight', () => {
      const sut = new ModulesScenesResolutionsConfig();
      expect(sut.maxSize()).toBe(1920);
    });

    it('should compute correctly with multiple resolutions', () => {
      const sut = new ModulesScenesResolutionsConfig();
      sut.contents.push({
        name: 'portrait',
        width: 1080,
        height: 1920,
        orientation: 'portrait' as ModulesScenesResolutionsConfig['contents'][0]['orientation'],
        adaptive: false,
      });
      expect(sut.maxWidth()).toBe(1920);
      expect(sut.maxHeight()).toBe(1920);
      expect(sut.maxSize()).toBe(1920);
    });

    it('should return 0 for empty contents', () => {
      const sut = new ModulesScenesResolutionsConfig();
      sut.contents = [];
      expect(sut.maxWidth()).toBe(0);
      expect(sut.maxHeight()).toBe(0);
      expect(sut.maxSize()).toBe(0);
    });
  });
});
