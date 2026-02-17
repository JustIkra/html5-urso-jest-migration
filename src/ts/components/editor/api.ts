declare const Urso: {
  types: {
    assets: Record<string, number>;
    objects: Record<string, number>;
  };
  template: {
    get: () => { styles: Record<string, unknown>; assets: unknown[]; objects: unknown[] };
  };
  assets: {
    preload: (models: unknown[], callback: () => void) => void;
  };
  objects: {
    create: (model: unknown, parent?: unknown) => void;
  };
  helper: {
    mergeArrays: <T>(a: T[], b: T[]) => T[];
  };
};

interface KeyDef {
  name: string;
  type: string;
  range?: [number, number];
}

class ComponentsEditorApi {
  _assetsKeys: Record<string, KeyDef[]> = {
    ATLAS: [{ name: 'key', type: 'text' }, { name: 'path', type: 'file' }],
    BITMAPFONT: [{ name: 'key', type: 'text' }, { name: 'path', type: 'file' }],
    CONTAINER: [{ name: 'key', type: 'text' }],
    FONT: [{ name: 'key', type: 'text' }, { name: 'path', type: 'file' }],
    IMAGE: [{ name: 'key', type: 'text' }, { name: 'path', type: 'file' }],
    JSON: [{ name: 'key', type: 'text' }, { name: 'path', type: 'file' }],
    SPINE: [{ name: 'key', type: 'text' }, { name: 'path', type: 'file' }],
  };

  _commonObjectsKeys: KeyDef[] = [
    { name: 'id', type: 'text' },
    { name: 'name', type: 'text' },
    { name: 'class', type: 'text' },
    { name: 'x', type: 'number' },
    { name: 'y', type: 'number' },
    { name: 'z', type: 'number' },
    { name: 'anchorX', type: 'number', range: [-1, 1] },
    { name: 'anchorY', type: 'number', range: [-1, 1] },
    { name: 'scaleX', type: 'number' },
    { name: 'scaleY', type: 'number' },
    { name: 'angle', type: 'number', range: [0, 360] },
    { name: 'alpha', type: 'number', range: [0, 1] },
    { name: 'visible', type: 'boolean' },
  ];

  _objectsKeys: Record<string, KeyDef[]>;

  constructor() {
    this._objectsKeys = {
      BITMAPTEXT: Urso.helper.mergeArrays(this._commonObjectsKeys, [{ name: 'text', type: 'text' }, { name: 'fontName', type: 'text' }, { name: 'fontSize', type: 'text' }]),
      COMPONENT: Urso.helper.mergeArrays(this._commonObjectsKeys, [{ name: 'componentName', type: 'text' }]),
      CONTAINER: this._commonObjectsKeys,
      GROUP: Urso.helper.mergeArrays(this._commonObjectsKeys, [{ name: 'groupName', type: 'text' }]),
      IMAGE: Urso.helper.mergeArrays(this._commonObjectsKeys, [{ name: 'assetKey', type: 'text' }]),
      TEXT: Urso.helper.mergeArrays(this._commonObjectsKeys, [
        { name: 'text', type: 'text' },
        { name: 'fontFamily', type: 'text' },
        { name: 'fontSize', type: 'text' },
        { name: 'fill', type: 'text' },
        { name: 'stroke', type: 'text' },
      ]),
    };
  }

  addStyle(): void {
    // TODO
  }

  getCurrentStyles(): Record<string, unknown> {
    const template = Urso.template.get();
    return template.styles;
  }

  getAssetTypes(): { types: Record<string, number>; keys: Record<string, KeyDef[]> } {
    const types = Urso.types.assets;
    return { types, keys: this._assetsKeys };
  }

  getCurrentAssets(): unknown[] {
    const template = Urso.template.get();
    return template.assets;
  }

  addAsset(assetModel: unknown, callback: () => void): void {
    Urso.assets.preload([assetModel], callback);
  }

  getCurrentObjects(): unknown[] {
    const template = Urso.template.get();
    return template.objects;
  }

  getObjectsTypes(): { types: Record<string, number>; keys: Record<string, KeyDef[]> } {
    const types = Urso.types.objects;
    return { types, keys: this._objectsKeys };
  }

  addObject(objectModel: unknown, parent?: unknown): void {
    Urso.objects.create(objectModel, parent);
  }

  editObject(_id: string, _key: string, _value: unknown): void {
    // TODO
  }
}

export default ComponentsEditorApi;
