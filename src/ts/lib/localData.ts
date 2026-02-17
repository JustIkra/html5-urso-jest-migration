class LibLocalData {
  private _data: Record<string, unknown> = {};

  public get(name: string): unknown {
    return Urso.helper.recursiveGet(name, this._data);
  }

  public set(key: string, value: unknown): boolean {
    Urso.helper.recursiveSet(key, value, this._data);
    return true;
  }
}

export default LibLocalData;
