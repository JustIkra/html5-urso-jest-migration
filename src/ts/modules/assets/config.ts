class ModulesAssetsConfig {
  public singleton: boolean = true;

  public defaultQualityFactor: number = 1;
  public addFolderPathInAtlasTextureKey: boolean = true;

  public qualityFactors: Record<string, number> = {
    medium: 0.5,
    hd: 0.75,
    high: 1,
  };

  public loadingGroups: Record<string, string | number> = {
    initial: 0,
  };

  public lazyLoadGroups: string[] = [];
}

export default ModulesAssetsConfig;
