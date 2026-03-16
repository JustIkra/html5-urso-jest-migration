import ComponentsBaseController from '../../../src/ts/components/base/controller';

describe('ComponentsBaseController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  function createSut(options?: Record<string, unknown>): ComponentsBaseController {
    const sut = new ComponentsBaseController(options);
    sut.getInstance = vi.fn(() => ({
      styles: { color: 'red' },
      assets: [{ type: 'image', path: 'test.png' }],
      objects: [{ type: 1, name: 'obj' }],
    })) as ComponentsBaseController['getInstance'];
    return sut;
  }

  describe('constructor', () => {
    it('should initialize common with null values', () => {
      const sut = createSut();
      expect(sut.common.find).toBeNull();
      expect(sut.common.findAll).toBeNull();
      expect(sut.common.findOne).toBeNull();
      expect(sut.common.object).toBeNull();
    });

    it('should store options', () => {
      const opts = { key: 'value' };
      const sut = createSut(opts);
      expect(sut.options).toBe(opts);
    });

    it('should default options to undefined when not provided', () => {
      const sut = createSut();
      expect(sut.options).toBeUndefined();
    });
  });

  describe('_inputValidation', () => {
    it('should log error when required option is missing', () => {
      class TestController extends ComponentsBaseController {
        _requiredOptionsModel() {
          return { name: 'string' };
        }
      }
      const sut = new TestController();
      expect(mockUrso.logger.error).toHaveBeenCalledWith('Component params model error', expect.any(TestController));
    });

    it('should not log error when required options are present', () => {
      class TestController extends ComponentsBaseController {
        _requiredOptionsModel() {
          return { name: 'string' };
        }
      }
      const sut = new TestController({ name: 'test' });
      expect(mockUrso.logger.error).not.toHaveBeenCalled();
    });
  });

  describe('_requiredOptionsModel', () => {
    it('should return undefined by default', () => {
      const sut = createSut();
      expect(sut._requiredOptionsModel()).toBeUndefined();
    });
  });

  describe('assetsMount', () => {
    it('should return styles and assets from template', () => {
      const sut = createSut();
      const result = sut.assetsMount();
      expect(result.styles).toEqual({ color: 'red' });
      expect(result.assets).toEqual([{ type: 'image', path: 'test.png' }]);
    });

    it('should call getInstance with template name', () => {
      const sut = createSut();
      sut.assetsMount();
      expect(sut.getInstance).toHaveBeenCalledWith('Template', undefined);
    });
  });

  describe('objectsMount', () => {
    it('should return objects from template', () => {
      const sut = createSut();
      const result = sut.objectsMount();
      expect(result).toEqual([{ type: 1, name: 'obj' }]);
    });
  });

  describe('lifecycle hooks', () => {
    it('should have loadUpdate as a no-op', () => {
      const sut = createSut();
      expect(() => sut.loadUpdate()).not.toThrow();
    });

    it('should have create as a no-op', () => {
      const sut = createSut();
      expect(() => sut.create()).not.toThrow();
    });

    it('should have update as a no-op', () => {
      const sut = createSut();
      expect(() => sut.update(16)).not.toThrow();
    });

    it('should have destroy as a no-op', () => {
      const sut = createSut();
      expect(() => sut.destroy()).not.toThrow();
    });

    it('should have _subscribeOnce as a no-op', () => {
      const sut = createSut();
      expect(() => sut._subscribeOnce()).not.toThrow();
    });
  });
});
