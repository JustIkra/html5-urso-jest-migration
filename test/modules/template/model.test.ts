import ModulesTemplateModel from '../../../src/ts/modules/template/model';

describe('ModulesTemplateModel', () => {
  it('should initialize with empty styles', () => {
    const sut = new ModulesTemplateModel();
    expect(sut.styles).toEqual({});
  });

  it('should initialize with empty assets array', () => {
    const sut = new ModulesTemplateModel();
    expect(sut.assets).toEqual([]);
  });

  it('should initialize with empty objects array', () => {
    const sut = new ModulesTemplateModel();
    expect(sut.objects).toEqual([]);
  });

  it('should initialize with empty components array', () => {
    const sut = new ModulesTemplateModel();
    expect(sut.components).toEqual([]);
  });

  it('should initialize _templatePath as null', () => {
    const sut = new ModulesTemplateModel();
    expect(sut._templatePath).toBeNull();
  });

  it('should allow setting styles', () => {
    const sut = new ModulesTemplateModel();
    sut.styles = { '.myClass': { x: 10, y: 20 } };
    expect(sut.styles['.myClass']).toEqual({ x: 10, y: 20 });
  });

  it('should allow setting _templatePath', () => {
    const sut = new ModulesTemplateModel();
    sut._templatePath = 'Templates.Scenes.Main';
    expect(sut._templatePath).toBe('Templates.Scenes.Main');
  });
});
