import { AssetTypeId } from '../types';

interface LoaderAsset {
  type: AssetTypeId;
  key: string;
  path: string;
  params?: Record<string, unknown>;
}

interface PixiAssets {
  load: (opts: { alias: string; src: string }) => Promise<unknown>;
  reset?: () => void;
}

interface CacheLike {
  addAtlas(key: string, data: unknown): void;
  addBitmapFont(key: string, data: unknown): void;
  addContainer(key: string, data: unknown): void;
  addFile(key: string, data: unknown): void;
  addImage(key: string, data: unknown): void;
  addJson(key: string, data: unknown): void;
  addJsonAtlas(key: string, data: unknown): void;
  addSound(key: string, data: unknown): void;
  addSpine(key: string, data: unknown): void;
  addSpineAtlas(key: string, data: unknown): void;
  addTexture(key: string, data: unknown): void;
  getJsonAtlases(): Record<string, { data: Record<string, unknown> }>;
}

function cache(): CacheLike {
  return Urso.cache as unknown as CacheLike;
}

class LibLoader {
  public readonly RELOAD_DELAY: number = 250;
  private _isRunning: boolean = false;
  private _iterationNumber: number = 0;
  private _assetsQuery: LoaderAsset[] = [];
  private _onLoadUpdate: (progress: { progress: number }) => void = () => {};
  private _loader: PixiAssets | null = null;
  private _completeCallback: () => void | Promise<void> = () => {};
  private _lastLoadFailed: boolean = false;

  constructor() {
    this._onError = this._onError.bind(this);
  }

  public isRunning(): boolean {
    return this._isRunning;
  }

  public addAsset(asset: LoaderAsset): void {
    this._assetsQuery.push(asset);
  }

  public setOnLoadUpdate(onLoadUpdate: ((progress: { progress: number }) => void) | null): void {
    if (onLoadUpdate) {
      this._onLoadUpdate = onLoadUpdate;
    }
  }

  public async start(callback: () => void | Promise<void>): Promise<false | void> {
    if (this._isRunning) return false;

    if (this._assetsQuery.length === 0) {
      return await callback();
    }

    this._isRunning = true;
    this._lastLoadFailed = false;
    this._iterationNumber++;
    this._completeCallback = callback;
    this._loader = (globalThis as Record<string, unknown>).PIXI
      ? ((globalThis as Record<string, unknown>).PIXI as Record<string, unknown>).Assets as PixiAssets
      : null;

    const assetsLoading = this._assetsQuery.map(async (asset) => {
      if (asset.type === AssetTypeId.JSON || asset.type === AssetTypeId.ATLAS) {
        const jsonData = this._getJsonDataFromJsonAtlases(asset.key);

        if (jsonData) {
          switch (asset.type) {
            case AssetTypeId.JSON:
              cache().addJson(asset.key, { data: jsonData });
              break;
            case AssetTypeId.ATLAS:
              break;
          }
          return;
        }
      }

      const loadPath = this._getLoadPath(asset);

      if (this._loader) {
        const resource = await this._loader.load({ alias: asset.key, src: loadPath });
        this._storeAsset(asset, resource);
      }
    });

    await Promise.all(assetsLoading);
    await callback();
  }

  private _getLoadPath(asset: LoaderAsset): string {
    const { path } = asset;

    if (path.indexOf('http') === 0) {
      return path;
    }

    if (!Urso.config.useBinPath) {
      return `${Urso.config.gamePath}assets/${path}`;
    }

    const quality = Urso.getInstance<{ getQuality: () => string }>('Modules.Assets.Service').getQuality();
    const splitted = path.split('/');

    if (splitted[0] === 'images') {
      splitted.splice(1, 0, quality);
    }

    return `${Urso.config.gamePath}/bin/${splitted.join('/')}`;
  }

  private _storeAsset(asset: LoaderAsset, resource: unknown): void {
    if (resource && typeof resource === 'object' && 'error' in resource && (resource as Record<string, unknown>).error) {
      Urso.logger.warn('LibLoader error: ', (resource as Record<string, unknown>).error, asset);
      return;
    }

    switch (asset.type) {
      case AssetTypeId.ATLAS:
        cache().addAtlas(asset.key, resource);
        break;
      case AssetTypeId.BITMAPFONT:
        cache().addBitmapFont(asset.key, resource);
        break;
      case AssetTypeId.CONTAINER:
        cache().addContainer(asset.key, resource);
        break;
      case AssetTypeId.FONT:
      case AssetTypeId.HTML:
        cache().addFile(asset.key, resource);
        break;
      case AssetTypeId.IMAGE:
        cache().addTexture(asset.key, resource);
        break;
      case AssetTypeId.JSON:
        cache().addJson(asset.key, resource);
        break;
      case AssetTypeId.JSONATLAS:
        cache().addJsonAtlas(asset.key, resource);
        break;
      case AssetTypeId.SOUND:
        cache().addSound(asset.key, resource);
        break;
      case AssetTypeId.SPINE:
        cache().addSpine(asset.key, resource);
        break;
      case AssetTypeId.SPINEATLAS:
        cache().addSpineAtlas(asset.key, resource);
        break;
      default:
        break;
    }
  }

  private _getJsonDataFromJsonAtlases(key: string): unknown {
    const c = cache();
    const jsonAtlases = typeof c.getJsonAtlases === 'function'
      ? c.getJsonAtlases()
      : {};

    for (const jsonAtlasKey in jsonAtlases) {
      if (Object.prototype.hasOwnProperty.call(jsonAtlases[jsonAtlasKey].data, key)) {
        return jsonAtlases[jsonAtlasKey].data[key];
      }
    }

    return null;
  }

  private _onError(error: unknown): void {
    Urso.logger.warn('LibLoader file load error: ', error);

    if (this._loader && this._loader.reset) {
      this._loader.reset();
    }

    this._isRunning = false;
    this._lastLoadFailed = true;

    Urso.logger.warn('LibLoader all assets RELOAD...');
    Urso.setTimeout(() => this.start(this._completeCallback), this.RELOAD_DELAY);
  }
}

export default LibLoader;
