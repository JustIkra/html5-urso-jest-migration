interface AssetsList {
  atlas: Record<string, unknown>;
  binary: Record<string, unknown>;
  bitmapFont: Record<string, unknown>;
  container: Record<string, unknown>;
  file: Record<string, unknown>;
  image: Record<string, unknown>;
  json: Record<string, unknown>;
  jsonAtlas: Record<string, unknown>;
  sound: Record<string, unknown>;
  spine: Record<string, unknown>;
  spineAtlas: Record<string, unknown>;
  texture: Record<string, unknown>;
}

class LibCache {
  public assetsList: AssetsList;
  private _globalAtlas: unknown = null;

  constructor() {
    this.assetsList = {
      atlas: {},
      binary: {},
      bitmapFont: {},
      container: {},
      file: {},
      image: {},
      json: {},
      jsonAtlas: {},
      sound: {},
      spine: {},
      spineAtlas: {},
      texture: {},
    };
  }

  public clearGlobalAtlas(): void {
    this._globalAtlas = null;
  }

  public get globalAtlas(): unknown {
    if (!this._globalAtlas) {
      this._globalAtlas = this._createGlobalAtlas();
    }

    return this._globalAtlas;
  }

  public getGlobalAtlas(): unknown {
    return this.globalAtlas;
  }

  private _createGlobalAtlas(): unknown {
    // Spine-dependent logic is deferred to Phase 2 when spine types are available.
    // During Phase 0/1 the globalAtlas is not used by tests.
    return null;
  }

  private _setDataToAssetsList(assetType: keyof AssetsList, key: string, data: unknown): void {
    if (this.assetsList[assetType][key]) {
      console.warn(`LibCache ${assetType}: key already exists: `, key, data);
    }

    this.assetsList[assetType][key] = data;
  }

  public addFile(key: string, data: unknown): void {
    this._setDataToAssetsList('file', key, data);
  }

  public addAtlas(key: string, data: unknown): void {
    this._setDataToAssetsList('atlas', key, data);
    this.clearGlobalAtlas();
  }

  public addBinary(key: string, data: unknown): void {
    this._setDataToAssetsList('binary', key, data);
  }

  public addBitmapFont(key: string, data: unknown): void {
    this._setDataToAssetsList('bitmapFont', key, data);
  }

  public addContainer(key: string, data: unknown): void {
    this._setDataToAssetsList('container', key, data);
  }

  public addImage(key: string, data: unknown): void {
    this._setDataToAssetsList('image', key, data);
  }

  public addJson(key: string, data: unknown): void {
    this._setDataToAssetsList('json', key, data);
  }

  public addJsonAtlas(key: string, data: unknown): void {
    this._setDataToAssetsList('jsonAtlas', key, data);
  }

  public addSound(key: string, data: unknown): void {
    this._setDataToAssetsList('sound', key, data);
  }

  public addTexture(key: string, data: unknown): void {
    if (key.includes('.')) {
      const keySplit = key.split('.');
      key = keySplit.splice(0, keySplit.length - 1).join('.');
    }

    this._setDataToAssetsList('texture', key, data);
  }

  public addSpine(key: string, data: unknown): void {
    this._setDataToAssetsList('spine', key, data);
  }

  public addSpineAtlas(key: string, data: unknown): void {
    this._setDataToAssetsList('spineAtlas', key, data);
  }

  public getFile(key: string): unknown {
    return this.assetsList.file[key];
  }

  public getAtlas(key: string): unknown {
    return this.assetsList.atlas[key];
  }

  public getBinary(key: string): unknown {
    return this.assetsList.binary[key];
  }

  public getBitmapFont(key: string): unknown {
    return this.assetsList.bitmapFont[key];
  }

  public getContainer(key: string): unknown {
    return this.assetsList.container[key];
  }

  public getImage(key: string): unknown {
    return this.assetsList.image[key];
  }

  public getJson(key: string): unknown {
    return this.assetsList.json[key];
  }

  public getJsonAtlas(key: string): unknown {
    return this.assetsList.jsonAtlas[key];
  }

  public getJsonAtlases(): Record<string, unknown> {
    return this.assetsList.jsonAtlas;
  }

  public getSound(key: string): unknown {
    return this.assetsList.sound[key];
  }

  public getSpine(key: string): unknown {
    return this.assetsList.spine[key];
  }

  public getSpineAtlas(key: string): unknown {
    return this.assetsList.spineAtlas[key];
  }

  public getTexture(key: string): unknown {
    return this.assetsList.texture[key];
  }
}

export default LibCache;
