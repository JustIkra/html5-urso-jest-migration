import ModulesTemplateController from '../../../src/ts/modules/template/controller';

describe('ModulesTemplateController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockService: {
    getTemplate: ReturnType<typeof vi.fn>;
    getSceneOrGroup: ReturnType<typeof vi.fn>;
    parse: ReturnType<typeof vi.fn>;
  };
  let mockTypes: { list: { assets: Record<string, number>; objects: Record<string, number> } };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockService = {
      getTemplate: vi.fn(() => ({ styles: {}, assets: [], objects: [], components: [] })),
      getSceneOrGroup: vi.fn((_name: string, _ns: string) => ({ styles: {}, assets: [], objects: [], components: [], _templatePath: null })),
      parse: vi.fn((tpl: unknown) => tpl),
    };

    mockTypes = {
      list: {
        assets: { IMAGE: 6, SOUND: 9 },
        objects: { CONTAINER: 8, TEXT: 22 },
      },
    };

    ModulesTemplateController.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Service') return mockService;
      if (path === 'Types') return mockTypes;
      return {};
    }) as ModulesTemplateController['getInstance'];
  });

  afterEach(() => {
    delete (ModulesTemplateController.prototype as { getInstance?: unknown }).getInstance;
  });

  it('should be a singleton', () => {
    const sut = new ModulesTemplateController();
    expect(sut.singleton).toBe(true);
  });

  it('should set Urso.types from Types.list in constructor', () => {
    const sut = new ModulesTemplateController();
    expect(mockUrso.types).toBe(mockTypes.list);
  });

  describe('get', () => {
    it('should return template from service', () => {
      const sut = new ModulesTemplateController();
      const result = sut.get();
      expect(mockService.getTemplate).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('scene', () => {
    it('should delegate to service with Scenes namespace', () => {
      const sut = new ModulesTemplateController();
      sut.scene('Main');
      expect(mockService.getSceneOrGroup).toHaveBeenCalledWith('Main', 'Scenes');
    });
  });

  describe('group', () => {
    it('should delegate to service with Groups namespace', () => {
      const sut = new ModulesTemplateController();
      sut.group('Header');
      expect(mockService.getSceneOrGroup).toHaveBeenCalledWith('Header', 'Groups');
    });
  });

  describe('parse', () => {
    it('should delegate to service', () => {
      const sut = new ModulesTemplateController();
      const template = { styles: {}, assets: [], objects: [], components: [], _templatePath: null };
      sut.parse(template);
      expect(mockService.parse).toHaveBeenCalledWith(template, undefined);
    });

    it('should pass additionalTemplateFlag', () => {
      const sut = new ModulesTemplateController();
      const template = { styles: {}, assets: [], objects: [], components: [], _templatePath: null };
      sut.parse(template, true);
      expect(mockService.parse).toHaveBeenCalledWith(template, true);
    });
  });
});
