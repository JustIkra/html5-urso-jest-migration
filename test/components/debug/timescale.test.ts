import ComponentsDebugTimescale from '../../../src/ts/components/debug/timescale';

describe('ComponentsDebugTimescale', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockTextObject: { text: string | number; visible: boolean };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    (mockUrso as unknown as Record<string, unknown>).scenes = {
      ...mockUrso.scenes,
      timeScale: 1,
    };

    mockTextObject = { text: '1', visible: false };
  });

  function createSut(): ComponentsDebugTimescale {
    const sut = new ComponentsDebugTimescale();
    sut.common = {
      find: null,
      findAll: null,
      findOne: vi.fn(() => mockTextObject) as unknown as typeof sut.common.findOne,
      object: null,
    };
    return sut;
  }

  it('should initialize with default values', () => {
    const sut = createSut();
    expect(sut.scaleStep).toBe(0.5);
    expect(sut.scaleInfoDuration).toBe(2000);
  });

  describe('create', () => {
    it('should add keydown listener', () => {
      const spy = vi.spyOn(document, 'addEventListener');
      const sut = createSut();
      sut.create();
      expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
      spy.mockRestore();
    });

    it('should find timescale text object', () => {
      const sut = createSut();
      sut.create();
      expect(sut.common.findOne).toHaveBeenCalledWith('^debugTimescaleValue');
    });

    it('should return true', () => {
      const sut = createSut();
      expect(sut.create()).toBe(true);
    });
  });

  describe('keyPressTest', () => {
    it('should ignore non-alt key presses', () => {
      const sut = createSut();
      sut.create();
      sut.keyPressTest({ altKey: false, keyCode: 107 } as KeyboardEvent);
      expect(mockTextObject.visible).toBe(false);
    });

    it('should increase timescale with alt+plus', () => {
      const scenes = (mockUrso as unknown as { scenes: { timeScale: number } }).scenes;
      scenes.timeScale = 1;
      const sut = createSut();
      sut.create();
      sut.keyPressTest({ altKey: true, keyCode: 107 } as KeyboardEvent);
      expect(mockUrso.math.roundToDigits).toHaveBeenCalledWith(1.5, 2);
    });

    it('should decrease timescale with alt+minus', () => {
      const scenes = (mockUrso as unknown as { scenes: { timeScale: number } }).scenes;
      scenes.timeScale = 1;
      const sut = createSut();
      sut.create();
      sut.keyPressTest({ altKey: true, keyCode: 109 } as KeyboardEvent);
      expect(mockUrso.math.roundToDigits).toHaveBeenCalledWith(0.5, 2);
    });

    it('should show timescale text and hide after timeout', () => {
      vi.useFakeTimers();
      const sut = createSut();
      sut.create();
      sut.keyPressTest({ altKey: true, keyCode: 107 } as KeyboardEvent);
      expect(mockTextObject.visible).toBe(true);
      vi.advanceTimersByTime(2000);
      expect(mockTextObject.visible).toBe(false);
      vi.useRealTimers();
    });

    it('should ignore unknown key codes', () => {
      const sut = createSut();
      sut.create();
      sut.keyPressTest({ altKey: true, keyCode: 65 } as KeyboardEvent);
      expect(mockTextObject.visible).toBe(false);
    });

    it('should clamp minimum timescale to 0.1', () => {
      const scenes = (mockUrso as unknown as { scenes: { timeScale: number } }).scenes;
      scenes.timeScale = 0.1;
      const sut = createSut();
      sut.create();
      sut.keyPressTest({ altKey: true, keyCode: 109 } as KeyboardEvent);
      expect(mockUrso.math.roundToDigits).toHaveBeenCalledWith(0.1, 2);
    });
  });
});
