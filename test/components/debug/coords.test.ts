import ComponentsDebugCoords from '../../../src/ts/components/debug/coords';

describe('ComponentsDebugCoords', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockTextObject: { text: string };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    (mockUrso as unknown as Record<string, unknown>).scenes = {
      ...mockUrso.scenes,
      getMouseCoords: vi.fn(() => ({ x: 123.7, y: 456.3 })),
    };

    mockTextObject = { text: '' };
  });

  function createSut(): ComponentsDebugCoords {
    const sut = new ComponentsDebugCoords();
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

  describe('create', () => {
    it('should find debugCoords text object', () => {
      const sut = createSut();
      sut.create();
      expect(sut.common.findOne).toHaveBeenCalledWith('^debugCoords');
    });

    it('should return true', () => {
      const sut = createSut();
      expect(sut.create()).toBe(true);
    });

    it('should call update on create', () => {
      const sut = createSut();
      const spy = vi.spyOn(sut, 'update');
      sut.create();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update text with mouse coordinates', () => {
      const sut = createSut();
      sut.create();
      sut.update();
      expect(mockTextObject.text).toBe('x:123; y:456');
    });
  });
});
