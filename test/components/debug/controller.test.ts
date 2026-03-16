import ComponentsDebugController from '../../../src/ts/components/debug/controller';

describe('ComponentsDebugController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockContainer: { visible: boolean };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockContainer = { visible: false };
  });

  function createSut(): ComponentsDebugController {
    const sut = new ComponentsDebugController();
    sut.getInstance = vi.fn(() => ({
      styles: {},
      assets: [],
      objects: [],
    })) as ComponentsDebugController['getInstance'];
    sut.common = {
      find: null,
      findAll: null,
      findOne: vi.fn(() => mockContainer) as unknown as typeof sut.common.findOne,
      object: null,
    };
    return sut;
  }

  describe('constructor', () => {
    it('should extend ComponentsBaseController', () => {
      const sut = createSut();
      expect(sut.common).toBeDefined();
      // options is undefined when no args passed (matches JS behavior)
      expect(sut).toHaveProperty('options');
    });
  });

  describe('create', () => {
    it('should find debugContainer', () => {
      const sut = createSut();
      sut.create();
      expect(sut.common.findOne).toHaveBeenCalledWith('^debugContainer');
    });

    it('should set container visible', () => {
      const sut = createSut();
      sut.create();
      expect(mockContainer.visible).toBe(true);
    });

    it('should call logicBlocksDo with create', () => {
      const sut = createSut();
      sut.create();
      expect(mockUrso.helper.logicBlocksDo).toHaveBeenCalledWith(sut, 'create');
    });
  });

  describe('update', () => {
    it('should not update before create', () => {
      const sut = createSut();
      sut.update();
      expect(mockUrso.helper.logicBlocksDo).not.toHaveBeenCalledWith(sut, 'update');
    });

    it('should call logicBlocksDo with update after create', () => {
      const sut = createSut();
      sut.create();
      sut.update();
      expect(mockUrso.helper.logicBlocksDo).toHaveBeenCalledWith(sut, 'update');
    });
  });

  describe('_show', () => {
    it('should toggle visibility', () => {
      const sut = createSut();
      sut.create();
      sut._show(false);
      expect(mockContainer.visible).toBe(false);
    });

    it('should toggle when called without argument', () => {
      const sut = createSut();
      sut.create(); // visible = true
      sut._show(); // toggle to false
      expect(mockContainer.visible).toBe(false);
      sut._show(); // toggle to true
      expect(mockContainer.visible).toBe(true);
    });
  });
});
