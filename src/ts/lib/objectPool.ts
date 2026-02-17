class ObjectPoolMember<T = unknown> {
  public free: boolean = true;
  public putCacheTimeKey: number = 0;
  public key: string | null = null;
  public branchKey: number = 0;
  public data: T | null = null;

  constructor(data: T, key: string, branchKey: number) {
    this.data = data;
    this.key = key;
    this.branchKey = branchKey;
  }
}

class LibObjectPool<T = unknown> {
  private _pool: Record<string, Record<number, ObjectPoolMember<T>>> = {};
  public constructorFunction: (key: string, additionalArgs?: unknown) => T;
  public resetFunction: (obj: T) => T;
  public removeFunction: (obj: T) => T;
  private _maxSize: number;
  private _lastBranchKeys: Record<string, number> = {};
  private _putTimeCache: Record<number, ObjectPoolMember<T>> = {};

  constructor(
    constructorFunction: (key: string, additionalArgs?: unknown) => T,
    resetFunction: (obj: T) => T = (obj) => obj,
    initialSize: number = 0,
    maxSize: number = 0,
    removeFunction: (obj: T) => T = (obj) => obj
  ) {
    this.resetFunction = resetFunction;
    this.removeFunction = removeFunction;
    this.constructorFunction = constructorFunction;
    this._maxSize = maxSize;

    this._createInitial(initialSize);
  }

  public getElement(key: string = 'default', additionalCreateArguments?: unknown): ObjectPoolMember<T> {
    this._checkPoolKey(key);
    const poolBranch = this._pool[key];

    for (const poolObject of Object.values(poolBranch)) {
      if (poolObject.free) {
        poolObject.free = false;

        if (poolObject.putCacheTimeKey) {
          delete this._putTimeCache[poolObject.putCacheTimeKey];
          poolObject.putCacheTimeKey = 0;
        }

        return poolObject;
      }
    }

    const newObj = this._createElement(key, additionalCreateArguments);
    newObj.free = false;
    return newObj;
  }

  public putElement(element: ObjectPoolMember<T>): void {
    element.free = true;
    if (element.data !== null) {
      this.resetFunction(element.data);
    }

    if (this._maxSize) {
      const putCacheTimeKey = this._getElementBranchKey('_putTimeCache', this._putTimeCache as Record<number, unknown>);
      this._putTimeCache[putCacheTimeKey] = element;
      element.putCacheTimeKey = putCacheTimeKey;
    }

    this._checkMaxSize();
  }

  private _checkMaxSize(): void {
    if (!this._maxSize) return;

    const poolSize = this._getPoolSize();

    if (poolSize > this._maxSize) {
      this._removeOldestInactiveElement();
    }
  }

  private _removeOldestInactiveElement(): void {
    const keyToRemove = Number(Object.keys(this._putTimeCache)[0]);
    const element = this._putTimeCache[keyToRemove];

    if (element.key !== null) {
      delete this._pool[element.key][element.branchKey];
    }

    this.removeFunction(element.data as T);
    element.free = false;
    element.putCacheTimeKey = 0;
    element.key = null;
    element.branchKey = 0;
    element.data = null;

    delete this._putTimeCache[keyToRemove];
  }

  private _getPoolSize(): number {
    let size = 0;

    for (const branch of Object.values(this._pool)) {
      size += Object.keys(branch).length;
    }

    return size;
  }

  private _createElement(key: string, additionalCreateArguments: unknown = null): ObjectPoolMember<T> {
    const newObj = this.resetFunction(this.constructorFunction(key, additionalCreateArguments));
    const branchKey = this._getElementBranchKey(key, this._pool[key]);
    const poolMember = new ObjectPoolMember<T>(newObj, key, branchKey);
    this._pool[key][branchKey] = poolMember;
    return poolMember;
  }

  private _getElementBranchKey(key: string, poolBranch: Record<number, unknown>): number {
    let branchKey = Urso.time.get();

    if (poolBranch[branchKey]) {
      branchKey = this._lastBranchKeys[key] + 1;
    }

    this._lastBranchKeys[key] = branchKey;
    return branchKey;
  }

  private _createInitial(initialSize: number): void {
    if (!initialSize) return;

    const newObjectsArray: ObjectPoolMember<T>[] = [];

    for (let index = 0; index < initialSize; index++) {
      newObjectsArray.push(this.getElement());
    }

    newObjectsArray.forEach((newObject) => {
      this.putElement(newObject);
    });
  }

  private _checkPoolKey(key: string): void {
    if (!this._pool[key]) {
      this._pool[key] = {};
    }
  }

  private _debugGetPoolData(): Record<string, Record<number, ObjectPoolMember<T>>> {
    return this._pool;
  }
}

export default LibObjectPool;
export { ObjectPoolMember };
