import type ModulesObjectsBaseModel from './baseModel';

interface ObjectsCacheData {
  ids: Record<string, ModulesObjectsBaseModel>;
  names: Record<string, ModulesObjectsBaseModel>;
  classes: Record<string, Record<string, ModulesObjectsBaseModel>>;
}

class ModulesObjectsCache {
  public readonly singleton: boolean = true;
  private _data: ObjectsCacheData;

  constructor() {
    this._data = this._emptyData();
  }

  public reset(): void {
    this._data = this._emptyData();
  }

  public addId(key: string, object: ModulesObjectsBaseModel): void {
    if (this._data.ids[key]) {
      Urso.logger.error('ModulesObjectsCache error: id will be uniq ' + key);
    }

    this._data.ids[key] = object;
  }

  public removeId(key: string, object: ModulesObjectsBaseModel): void {
    if (!this._data.ids[key]) {
      Urso.logger.error('ModulesObjectsCache error: no id to remove ' + key);
      return;
    }

    if (this._data.ids[key]._uid !== object._uid) {
      Urso.logger.error('ModulesObjectsCache error: invalid object with id ' + key);
    }

    delete this._data.ids[key];
  }

  public addName(key: string, object: ModulesObjectsBaseModel): void {
    if (this._data.names[key]) {
      Urso.logger.error('ModulesObjectsCache error: name will be uniq ' + key);
    }

    this._data.names[key] = object;
  }

  public removeName(key: string, object: ModulesObjectsBaseModel): void {
    if (!this._data.names[key]) {
      Urso.logger.error('ModulesObjectsCache error: no name to remove ' + key);
      return;
    }

    if (this._data.names[key]._uid !== object._uid) {
      Urso.logger.error('ModulesObjectsCache error: invalid object with name ' + key);
    }

    delete this._data.names[key];
  }

  public addClass(key: string, object: ModulesObjectsBaseModel): void {
    const classNamesArray = key.split(' ');

    for (const className of classNamesArray) {
      this._addClass(className, object);
    }
  }

  public removeClass(key: string, object: ModulesObjectsBaseModel): void {
    const classNamesArray = key.split(' ');

    for (const className of classNamesArray) {
      this._removeClass(className, object);
    }
  }

  public getId(key: string): ModulesObjectsBaseModel | null {
    return this._data.ids[key] || null;
  }

  public getName(key: string): ModulesObjectsBaseModel | null {
    return this._data.names[key] || null;
  }

  public getClass(key: string): ModulesObjectsBaseModel[] | null {
    if (this._data.classes[key]) {
      return Object.values(this._data.classes[key]);
    }

    return null;
  }

  private _addClass(key: string, object: ModulesObjectsBaseModel): void {
    if (!this._data.classes[key]) {
      this._data.classes[key] = {};
    }

    if (!this._data.classes[key][object._uid!]) {
      this._data.classes[key][object._uid!] = object;
    }
  }

  private _removeClass(key: string, object: ModulesObjectsBaseModel): void {
    if (!this._data.classes[key]) {
      return;
    }

    if (this._data.classes[key][object._uid!]) {
      delete this._data.classes[key][object._uid!];
    }

    if (!Object.keys(this._data.classes[key]).length) {
      delete this._data.classes[key];
    }
  }

  private _emptyData(): ObjectsCacheData {
    return {
      ids: {},
      names: {},
      classes: {},
    };
  }
}

export default ModulesObjectsCache;
