import ModulesTemplateService from '../../../src/ts/modules/template/service';
import ModulesTemplateModel from '../../../src/ts/modules/template/model';

describe('ModulesTemplateService', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = {
      ...mockUrso,
      types: { assets: {}, objects: { GROUP: 13, COMPONENT: 7 } },
      getInstance: vi.fn(() => ({
        styles: {},
        assets: [],
        objects: [],
        components: [],
        _templatePath: null,
      })),
    };

    ModulesTemplateService.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Model') return new ModulesTemplateModel();
      if (path === 'Controller')
        return {
          group: vi.fn(() => ({
            styles: {},
            assets: [],
            objects: [],
            _templatePath: 'Templates.Groups.Test',
          })),
        };
      return {};
    }) as ModulesTemplateService['getInstance'];
  });

  afterEach(() => {
    delete (ModulesTemplateService.prototype as { getInstance?: unknown }).getInstance;
  });

  it('should be a singleton', () => {
    const sut = new ModulesTemplateService();
    expect(sut.singleton).toBe(true);
  });

  it('should initialize _currentTemplate and _actualFullTemplate', () => {
    const sut = new ModulesTemplateService();
    expect(sut._currentTemplate).toBeDefined();
    expect(sut._actualFullTemplate).toBeDefined();
  });

  describe('getTemplate', () => {
    it('should return the actual full template', () => {
      const sut = new ModulesTemplateService();
      expect(sut.getTemplate()).toBe(sut._actualFullTemplate);
    });
  });

  describe('getSceneOrGroup', () => {
    it('should capitalize name and build path', () => {
      // getSceneOrGroup uses the global Urso.getInstance
      const urso = (globalThis as Record<string, unknown>).Urso as typeof mockUrso;
      const globalGetInstance = urso.getInstance;

      const sut = new ModulesTemplateService();
      sut.getSceneOrGroup('main', 'Scenes');
      expect(mockUrso.helper.capitaliseFirstLetter).toHaveBeenCalledWith('main');
      expect(globalGetInstance).toHaveBeenCalledWith('Templates.Scenes.Main');
    });

    it('should set _templatePath on returned entity', () => {
      const mockEntity = { styles: {}, assets: [], objects: [], components: [], _templatePath: null as string | null };
      const urso = (globalThis as Record<string, unknown>).Urso as typeof mockUrso;
      urso.getInstance.mockReturnValue(mockEntity);

      const sut = new ModulesTemplateService();
      const result = sut.getSceneOrGroup('main', 'Scenes');
      expect(result._templatePath).toBe('Templates.Scenes.Main');
    });
  });

  describe('parse', () => {
    it('should merge template with model', () => {
      const sut = new ModulesTemplateService();
      const template = new ModulesTemplateModel();
      template.styles = { '.test': { x: 10 } };
      const result = sut.parse(template);
      expect(result).toBeDefined();
      expect(mockUrso.helper.mergeObjectsRecursive).toHaveBeenCalled();
    });

    it('should set _actualFullTemplate to current when not additional', () => {
      const sut = new ModulesTemplateService();
      const template = new ModulesTemplateModel();
      const result = sut.parse(template);
      expect(sut._actualFullTemplate).toBe(result);
    });

    it('should merge into _actualFullTemplate when additionalTemplateFlag is true', () => {
      const sut = new ModulesTemplateService();
      const template1 = new ModulesTemplateModel();
      sut.parse(template1);

      const template2 = new ModulesTemplateModel();
      template2.assets = [{ key: 'img1' }];
      sut.parse(template2, true);

      expect(mockUrso.helper.mergeArrays).toHaveBeenCalled();
    });
  });

  describe('_setTemplatePath', () => {
    it('should set _templatePath on target', () => {
      const sut = new ModulesTemplateService();
      const target = { _templatePath: null as string | null };
      sut._setTemplatePath(target, 'Templates.Scenes.Main');
      expect(target._templatePath).toBe('Templates.Scenes.Main');
    });
  });

  describe('_parseAssets', () => {
    it('should set _templatePath on each asset', () => {
      const sut = new ModulesTemplateService();
      const assets = [
        { type: 6, key: 'img1' },
        { type: 9, key: 'snd1' },
      ];
      sut._parseAssets(assets as unknown as Parameters<typeof sut._parseAssets>[0], 'Templates.Scenes.Main');
      expect((assets[0] as { _templatePath?: string })._templatePath).toBe('Templates.Scenes.Main');
      expect((assets[1] as { _templatePath?: string })._templatePath).toBe('Templates.Scenes.Main');
    });
  });

  describe('_parseObjects', () => {
    it('should mark objects as _parsed', () => {
      const sut = new ModulesTemplateService();
      const objects = [{ type: 8, name: 'container' }];
      sut._parseObjects(objects as unknown as Parameters<typeof sut._parseObjects>[0], null);
      expect((objects[0] as { _parsed?: boolean })._parsed).toBe(true);
    });

    it('should recursively parse contents', () => {
      const sut = new ModulesTemplateService();
      const child = { type: 15, name: 'image' };
      const objects = [{ type: 8, name: 'container', contents: [child] }];
      sut._parseObjects(objects as unknown as Parameters<typeof sut._parseObjects>[0], 'path');
      expect((child as { _parsed?: boolean })._parsed).toBe(true);
    });
  });

  describe('_mergeStylesAndAssets', () => {
    it('should merge styles into current template', () => {
      const sut = new ModulesTemplateService();
      // Initialize _currentTemplate
      sut.parse(new ModulesTemplateModel());
      mockUrso.helper.mergeObjectsRecursive.mockClear();
      sut._mergeStylesAndAssets({ styles: { '.test': { x: 5 } } });
      expect(mockUrso.helper.mergeObjectsRecursive).toHaveBeenCalled();
    });

    it('should merge assets into current template', () => {
      const sut = new ModulesTemplateService();
      sut.parse(new ModulesTemplateModel());
      mockUrso.helper.mergeArrays.mockClear();
      sut._mergeStylesAndAssets({ assets: [{ type: 6 }] });
      expect(mockUrso.helper.mergeArrays).toHaveBeenCalled();
    });

    it('should not merge if no styles or assets', () => {
      const sut = new ModulesTemplateService();
      sut.parse(new ModulesTemplateModel());
      mockUrso.helper.mergeObjectsRecursive.mockClear();
      mockUrso.helper.mergeArrays.mockClear();
      sut._mergeStylesAndAssets({});
      expect(mockUrso.helper.mergeObjectsRecursive).not.toHaveBeenCalled();
      expect(mockUrso.helper.mergeArrays).not.toHaveBeenCalled();
    });
  });
});
