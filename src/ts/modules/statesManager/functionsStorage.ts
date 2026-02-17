type GuidFunction = ((...args: unknown[]) => unknown) & { _guid?: string };

interface FunctionsMap {
  [key: string]: Record<string, GuidFunction>;
}

class ModulesStatesManagerFunctionsStorage {
  private _functionsCounter: number = 0;
  private _functions: FunctionsMap = {};

  public add(key: string, guard: GuidFunction, onlyOneFlag: boolean = false): void {
    this._addToStorage(key, guard, onlyOneFlag);
  }

  public run(key: string): void {
    if (this._functions[key]) {
      const functionsArray = Object.values(this._functions[key]);

      for (const func of functionsArray) {
        func();
      }
    }
  }

  public runAndCallbackOnFinish(key: string, onFinishCallback: () => void): void {
    if (this._functions[key]) {
      const functionsArray = Object.values(this._functions[key]);

      const promises: Promise<unknown>[] = [];

      for (const func of functionsArray) {
        promises.push(new Promise((resolve) => { func(resolve); }));
      }

      Promise.all(promises).then(onFinishCallback);
    } else {
      onFinishCallback();
    }
  }

  public checkGuard(key: string): boolean {
    if (this._functions[key]) {
      const guardsArray = Object.values(this._functions[key]);

      for (const guard of guardsArray) {
        if (!guard()) {
          return false;
        }
      }
    }

    return true;
  }

  public remove(key: string, guard: GuidFunction): void {
    this._removeFromStorage(key, guard);
  }

  private _addToStorage(key: string, func: GuidFunction, onlyOneFlag: boolean): void {
    if (!this._functions[key]) {
      this._functions[key] = {};
    } else if (onlyOneFlag) {
      Urso.logger.error('ModulesStatesManagerFunctionsStorage: action or state can have only one guard', key, func);
      return;
    }

    const guid = this._getGuardsUid();
    func._guid = guid;
    this._functions[key][guid] = func;
  }

  private _removeFromStorage(key: string, func: GuidFunction): void {
    const guid = func._guid!;
    delete this._functions[key][guid];

    if (Urso.helper.getObjectSize(this._functions[key]) === 0) {
      delete this._functions[key];
    }
  }

  private _getGuardsUid(): string {
    this._functionsCounter++;
    return 'guard_' + this._functionsCounter;
  }
}

export default ModulesStatesManagerFunctionsStorage;
export type { GuidFunction };
