import ComponentsDebugFps from '../../../src/ts/components/debug/fps';

describe('ComponentsDebugFps', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockTextObject: { text: string };
  let currentTime: number;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    currentTime = 1000;
    mockUrso.time.get.mockImplementation(() => currentTime);
    (mockUrso as unknown as Record<string, unknown>).scenes = {
      ...mockUrso.scenes,
      getFpsData: vi.fn(() => ({ fps: 60, limit: 60 })),
    };

    mockTextObject = { text: '' };
  });

  function createSut(): ComponentsDebugFps {
    const sut = new ComponentsDebugFps();
    sut.common = {
      find: null,
      findAll: null,
      findOne: vi.fn(() => mockTextObject) as unknown as typeof sut.common.findOne,
      object: null,
    };
    return sut;
  }

  it('should bind create and update in constructor', () => {
    const sut = createSut();
    expect(typeof sut.create).toBe('function');
    expect(typeof sut.update).toBe('function');
  });

  it('should initialize frames and lastUpdateTime', () => {
    const sut = createSut();
    expect(sut.frames).toBe(0);
    expect(sut.lastUpdateTime).toBe(0);
  });

  describe('create', () => {
    it('should find debugFps text object', () => {
      const sut = createSut();
      sut.create();
      expect(sut.common.findOne).toHaveBeenCalledWith('^debugFps');
    });

    it('should return true', () => {
      const sut = createSut();
      expect(sut.create()).toBe(true);
    });
  });

  describe('update', () => {
    it('should not update text until 1000ms has passed', () => {
      const sut = createSut();
      sut.create();
      mockTextObject.text = '';
      currentTime = 1500;
      sut.update();
      expect(mockTextObject.text).toBe('');
    });

    it('should update text after 1000ms', () => {
      const sut = createSut();
      sut.create(); // first call sets lastUpdateTime=1000

      currentTime = 2001;
      sut.update();
      expect(mockTextObject.text).toContain('fps:');
      expect(mockTextObject.text).toContain('sceneFps: 60');
    });

    it('should reset frames counter after update', () => {
      const sut = createSut();
      sut.create();
      currentTime = 2001;
      sut.update();
      expect(sut.frames).toBe(0);
    });
  });
});
