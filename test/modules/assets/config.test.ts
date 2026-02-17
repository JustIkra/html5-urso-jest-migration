import ModulesAssetsConfig from '../../../src/ts/modules/assets/config';

describe('ModulesAssetsConfig', () => {
  it('should be a singleton', () => {
    const sut = new ModulesAssetsConfig();
    expect(sut.singleton).toBe(true);
  });

  it('should have defaultQualityFactor of 1', () => {
    const sut = new ModulesAssetsConfig();
    expect(sut.defaultQualityFactor).toBe(1);
  });

  it('should have addFolderPathInAtlasTextureKey true by default', () => {
    const sut = new ModulesAssetsConfig();
    expect(sut.addFolderPathInAtlasTextureKey).toBe(true);
  });

  it('should have qualityFactors with medium, hd, high', () => {
    const sut = new ModulesAssetsConfig();
    expect(sut.qualityFactors).toEqual({
      medium: 0.5,
      hd: 0.75,
      high: 1,
    });
  });

  it('should have loadingGroups with initial at 0', () => {
    const sut = new ModulesAssetsConfig();
    expect(sut.loadingGroups).toEqual({ initial: 0 });
  });

  it('should have empty lazyLoadGroups by default', () => {
    const sut = new ModulesAssetsConfig();
    expect(sut.lazyLoadGroups).toEqual([]);
  });
});
