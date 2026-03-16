import type { AssetTypeId } from '../../types';

interface AssetModel {
  type: AssetTypeId;
  key: string | null;
  path: string | null;
  loadingGroup: string | number | null;
  contents?: AssetModel[];
  cacheTextures?: boolean;
  noAtlas?: boolean;
  preloadGPU?: boolean;
}

interface AssetsSpace {
  [group: string]: AssetModel[];
}

interface AssetsConfig {
  loadingGroups: Record<string, string | number>;
  lazyLoadGroups: string[];
  qualityFactors: Record<string, number>;
  defaultQualityFactor: number;
  addFolderPathInAtlasTextureKey: boolean;
}

interface LoaderInstance {
  addAsset: (assetModel: AssetModel) => void;
  start: (callback: () => void) => void;
  setOnLoadUpdate: (callback: (params: { progress: number }) => void) => void;
}

interface SpineAtlasRegion {
  name: string;
  texture: { texture: unknown };
}

interface SpineAtlasData {
  regions: SpineAtlasRegion[];
}

interface AtlasImageData {
  textures: Record<string, unknown>;
}

interface ResolutionConfig {
  contents: Array<{ width: number; height: number }>;
}

interface CacheFacade {
  getAtlas: (key: string | null) => AtlasImageData | null;
  addTexture: (key: string, texture: unknown) => void;
  getSpineAtlas: (key: string | null) => SpineAtlasData | null;
  getFile: (path: string | null) => unknown;
}

class ModulesAssetsService {
  public singleton: boolean = true;
  public assets: Record<string | number, AssetsSpace | AssetModel[]> = {};
  public lazyLoadProcessStarted: boolean = false;

  public getInstance!: <T = unknown>(path: string, ...args: unknown[]) => T;
  public emit!: (event: string, params?: unknown, delay?: number) => void;

  private _loadCounter: number = 0;
  private _currentQuality: string = 'auto';
  private _addedAssetsCache: string[] = [];

  checkWebPSupport(): void {
    if ((Urso.device as unknown as Record<string, unknown>).webP) {
      (Urso as unknown as Record<string, (...args: unknown[]) => void>).addInstancesMode('webP');
    }
  }

  getQuality(): string {
    return this._currentQuality;
  }

  updateQuality(): void {
    this._currentQuality = this._detectQuality();
    (Urso as unknown as Record<string, (...args: unknown[]) => void>).addInstancesMode(this._currentQuality + 'Quality');
  }

  sortAssets(assets: AssetModel | AssetModel[]): AssetsSpace {
    const assetsSpace = this._createNewAssetsSpace();
    assetsSpace[this.getInstance<AssetsConfig>('Config').loadingGroups.initial] = [];

    if (Array.isArray(assets)) {
      for (const asset of assets) {
        this._addAsset(assetsSpace, asset);
      }
    } else {
      this._addAsset(assetsSpace, assets);
    }

    return assetsSpace;
  }

  startLoad(assetsSpace: AssetsSpace, callback: () => void, updateCallback: (progress: number) => void): void {
    this.loadGroup(
      assetsSpace,
      this.getInstance<AssetsConfig>('Config').loadingGroups.initial,
      (() => { callback(); this._startLazyLoad(); }).bind(this),
      updateCallback,
    );
  }

  loadGroup(
    assetsSpace: AssetsSpace | null,
    group: string | number,
    callback: () => void = () => {},
    updateCallback: (progress: number) => void = () => {},
  ): void {
    if (!assetsSpace) {
      assetsSpace = this.assets as AssetsSpace;
    }

    if (!assetsSpace[group]) {
      Urso.logger.error('ModulesAssetsService group error, no assets:' + group + ' Check ModulesAssetsConfig please');
      return;
    }

    const loadRestAssetsCallback = () => {
      this._loadGroupRestAssets(assetsSpace as AssetsSpace, group, callback, updateCallback);
    };

    const loadAtlasesCallback = () => {
      this._loadGroupAtlases(assetsSpace as AssetsSpace, group, loadRestAssetsCallback, Urso.types.assets.ATLAS);
    };

    this._loadGroupAtlases(assetsSpace, group, loadAtlasesCallback, Urso.types.assets.JSONATLAS);
  }

  preloadAllImagesInGPU(): void {
    // FIXME: stub for GPU preloading
  }

  getCurrentResolution(): number {
    const { qualityFactors, defaultQualityFactor } = this.getInstance<AssetsConfig>('Config');
    return qualityFactors[this._currentQuality] || defaultQualityFactor || 1;
  }

  private _createNewAssetsSpace(): AssetsSpace {
    this._loadCounter++;
    (this.assets as Record<number, AssetsSpace>)[this._loadCounter] = {} as AssetsSpace;
    return (this.assets as Record<number, AssetsSpace>)[this._loadCounter];
  }

  private _loadGroupAtlases(
    assetsSpace: AssetsSpace,
    group: string | number,
    callback: () => void,
    atlasType: AssetTypeId,
  ): void {
    const atlases = assetsSpace[group].filter((assetModel) => assetModel.type === atlasType);

    if (!atlases.length) {
      callback();
      return;
    }

    const loader = Urso.getInstance('Lib.Loader') as LoaderInstance;

    for (const assetModel of atlases) {
      this._addAssetToLoader(assetModel, loader);
    }

    loader.start(() => {
      if (atlasType === Urso.types.assets.ATLAS) {
        this._processLoadedAtlases(assetsSpace, group);
      }

      callback();
    });
  }

  private _loadGroupRestAssets(
    assetsSpace: AssetsSpace,
    group: string | number,
    callback: () => void,
    updateCallback: (progress: number) => void,
  ): void {
    const loader = Urso.getInstance('Lib.Loader') as LoaderInstance;
    loader.setOnLoadUpdate((params: { progress: number }) => {
      updateCallback(Math.floor(params.progress));
    });
    const noAtlasSpines: AssetModel[] = [];

    for (const assetModel of assetsSpace[group]) {
      if (assetModel.type !== Urso.types.assets.ATLAS && assetModel.type !== Urso.types.assets.JSONATLAS) {
        if (!(Urso.cache as CacheFacade).getFile(assetModel.path)) {
          // FIXME remove noAtlasSpine
          if (assetModel.type === Urso.types.assets.SPINE && assetModel.noAtlas) {
            noAtlasSpines.push(assetModel);
          } else {
            this._addAssetToLoader(assetModel, loader);
          }
        }
      }
    }

    loader.start(
      async () => {
        await this._processLoadedAssets(assetsSpace, group);
        this._loadNoAtlasSpines(noAtlasSpines, () => {
          this.emit(Urso.events.MODULES_ASSETS_GROUP_LOADED, group);
          callback();
        });
      },
    );
  }

  private _loadNoAtlasSpines(noAtlasSpines: AssetModel[], callback: () => void): void {
    if (!noAtlasSpines.length) {
      callback();
      return;
    }

    const loader = Urso.getInstance('Lib.Loader') as LoaderInstance;

    for (const assetModel of noAtlasSpines) {
      this._addAssetToLoader(assetModel, loader);
    }

    loader.start(callback);
  }

  private _processLoadedAtlases(assetsSpace: AssetsSpace, group: string | number): void {
    const atlases = assetsSpace[group].filter((assetModel) => assetModel.type === Urso.types.assets.ATLAS);

    for (const assetModel of atlases) {
      const assetKey = assetModel.key;
      const cache = Urso.cache as CacheFacade;
      const imageData = cache.getAtlas(assetKey);
      // FIXME
      if (!assetModel.cacheTextures) return;

      for (const [key, val] of Object.entries(imageData!.textures)) {
        cache.addTexture(key, val);
      }
    }
  }

  private async _processLoadedAssets(assetsSpace: AssetsSpace, group: string | number): Promise<void> {
    // FIXME
    for (const assetModel of assetsSpace[group]) {
      // FIXME: _processLoadedImage, _processLoadedBitmapFont, _processLoadedFont commented out

      if (assetModel.type === Urso.types.assets.SPINEATLAS) {
        this._processLoadedSpineAtlas(assetModel);
      }
    }

    delete assetsSpace[group];
  }

  private _processLoadedSpineAtlas(assetModel: AssetModel): void {
    const cache = Urso.cache as CacheFacade;
    const spineAtlas = cache.getSpineAtlas(assetModel.key);

    if (!spineAtlas) {
      Urso.logger.error('ModulesAssetsService process Loaded Spine Atlas error: no image ', assetModel);
      return;
    }

    spineAtlas.regions.forEach(({ name, texture: { texture } }) => {
      cache.addTexture(name, texture);
    });
  }

  // FIXME: commented-out methods from original
  // async _processLoadedFont(source: AssetModel): Promise<void> { ... }
  // _processLoadedBitmapFont(assetModel: AssetModel): void { ... }
  // _updateFontKey(fontName: string): void { ... }
  // _processLoadedImage(assetModel: AssetModel): void { ... }

  private _addAsset(assetsSpace: AssetsSpace, asset: AssetModel, loadingGroup?: string | number | null): void {
    if (asset.type !== Urso.types.assets.CONTAINER) {
      const addedAssetKey = `${asset.type}_${asset.key}`;

      if (this._addedAssetsCache.includes(addedAssetKey)) {
        return;
      }

      this._addedAssetsCache.push(addedAssetKey);
    }

    let model: AssetModel | undefined;

    switch (asset.type) {
      case Urso.types.assets.ATLAS:
        model = this.getInstance<AssetModel>('Models.Atlas', asset);
        break;
      case Urso.types.assets.AUDIOSPRITE:
        model = this.getInstance<AssetModel>('Models.Audiosprite', asset);
        break;
      case Urso.types.assets.BITMAPFONT:
        model = this.getInstance<AssetModel>('Models.BitmapFont', asset);
        break;
      case Urso.types.assets.CONTAINER:
        model = this.getInstance<AssetModel>('Models.Container', asset);
        break;
      case Urso.types.assets.FONT:
        model = this.getInstance<AssetModel>('Models.Font', asset);
        break;
      case Urso.types.assets.HTML:
        model = this.getInstance<AssetModel>('Models.Html', asset);
        break;
      case Urso.types.assets.IMAGE:
        model = this.getInstance<AssetModel>('Models.Image', asset);
        break;
      case Urso.types.assets.JSON:
        model = this.getInstance<AssetModel>('Models.Json', asset);
        break;
      case Urso.types.assets.JSONATLAS:
        model = this.getInstance<AssetModel>('Models.JsonAtlas', asset);
        break;
      case Urso.types.assets.SOUND:
        model = this.getInstance<AssetModel>('Models.Sound', asset);
        break;
      case Urso.types.assets.SPINE:
        model = this.getInstance<AssetModel>('Models.Spine', asset);
        break;
      case Urso.types.assets.SPINEATLAS:
        model = this.getInstance<AssetModel>('Models.SpineAtlas', asset);
        break;
      default:
        Urso.logger.error('ModulesAssetsService asset type error', asset);
        break;
    }

    if (!model) return;

    model.loadingGroup = loadingGroup ?? model.loadingGroup ?? this.getInstance<AssetsConfig>('Config').loadingGroups.initial;

    if (model.contents) {
      for (const content of model.contents) {
        this._addAsset(assetsSpace, content, model.loadingGroup);
      }
      return;
    }

    if (model.loadingGroup === this.getInstance<AssetsConfig>('Config').loadingGroups.initial) {
      assetsSpace[model.loadingGroup].push(model);
    } else {
      if (!(this.assets as Record<string | number, AssetModel[]>)[model.loadingGroup]) {
        (this.assets as Record<string | number, AssetModel[]>)[model.loadingGroup] = [];
      }

      (this.assets as Record<string | number, AssetModel[]>)[model.loadingGroup].push(model);
    }
  }

  private _startLazyLoad(): void {
    if (this.lazyLoadProcessStarted) {
      return;
    }

    this.lazyLoadProcessStarted = true;
    this._continueLazyLoad();
  }

  private _continueLazyLoad(step?: number): void {
    if (!step) {
      step = 0;
    }

    const lazyLoadGroups = this.getInstance<AssetsConfig>('Config').lazyLoadGroups;

    if (step >= lazyLoadGroups.length) {
      this.emit(Urso.events.MODULES_ASSETS_LAZYLOAD_FINISHED);
      return;
    }

    const groupName = lazyLoadGroups[step];

    if (!groupName) {
      Urso.logger.error('ModulesAssetsService lazy loading groupName error');
    }

    this.loadGroup(null, groupName, () => { this._continueLazyLoad(step! + 1); });
  }

  private _qualityReducer(
    qualityFactors: Record<string, number>,
    widthFactor: number,
  ): [(acc: string | null, val: string) => string, null] {
    return [(acc: string | null, val: string): string => {
      if (acc === null) {
        return val;
      }

      const currentQuality = qualityFactors[acc];
      const qualityFactor = qualityFactors[val];

      const nextQuality = (currentQuality > qualityFactor && qualityFactor >= widthFactor)
        || (qualityFactor >= widthFactor && widthFactor > currentQuality)
        || (widthFactor >= qualityFactor && qualityFactor > currentQuality);

      return nextQuality ? val : acc;
    }, null];
  }

  private _detectQuality(): string {
    const { qualityFactors } = this.getInstance<AssetsConfig>('Config');
    const getParams = Urso.helper.parseGetParams();
    const userQuality = (typeof getParams === 'object' && getParams !== null)
      ? (getParams as Record<string, string>)['quality']
      : undefined;

    if (userQuality && qualityFactors[userQuality]) {
      return userQuality;
    }

    return this._calculateQuality(qualityFactors);
  }

  private _calculateQuality(qualityFactors: Record<string, number>): string {
    const device = Urso.device as unknown as Record<string, boolean>;
    const { android, iOS, iPad, macOS } = device;
    const isMobile = android || iOS || iPad;

    if (macOS && !isMobile) {
      return 'high';
    }

    if (macOS && iPad) {
      return 'medium';
    }

    const resCfg = Urso.getInstance<ResolutionConfig>('Modules.Scenes.ResolutionsConfig');
    const contents0 = resCfg.contents[0];

    const { devicePixelRatio } = window;
    let { width, height } = screen;

    if (isMobile) {
      width = (width > height) ? width : height;
    }

    if (iOS) {
      width *= devicePixelRatio;
    }

    const widthFactor = width / contents0.width;

    const quality = Object
      .keys(qualityFactors)
      .reduce(...this._qualityReducer(qualityFactors, widthFactor)) as string;

    if (isMobile && quality === 'high') {
      return 'hd';
    }

    return quality;
  }

  private _addAssetToLoader(assetModel: AssetModel, loader: LoaderInstance): void {
    if (assetModel.path) {
      loader.addAsset(assetModel);
    } else if (assetModel.contents) {
      // do nothing, its a container
    } else {
      Urso.logger.error('ModulesAssetsService model error', assetModel);
    }
  }
}

export default ModulesAssetsService;
