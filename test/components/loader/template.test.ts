import ComponentsLoaderTemplate from '../../../src/ts/components/loader/template';

describe('ComponentsLoaderTemplate', () => {
  it('should initialize styles with loadingTextStyle', () => {
    const template = new ComponentsLoaderTemplate();
    expect(template.styles).toHaveProperty('.loadingTextStyle');
    expect(template.styles['.loadingTextStyle']).toEqual({
      fill: 0xFFFFFF,
      fontSize: 32,
      fontWeight: 'bold',
      fontStyle: 'italic',
    });
  });

  it('should initialize empty assets array', () => {
    const template = new ComponentsLoaderTemplate();
    expect(template.assets).toEqual([]);
  });

  it('should initialize empty objects array', () => {
    const template = new ComponentsLoaderTemplate();
    expect(template.objects).toEqual([]);
  });
});
