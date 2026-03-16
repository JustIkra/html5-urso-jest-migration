import type { ObserverCallback } from '../../types';

const MODES_NAMESPACE = 'modifications' as const;
const MIXINS_NAMESPACE = 'mixins' as const;

interface FindClassParams {
  path: string;
  callback: (classObj: unknown) => unknown;
  noModes?: boolean;
  modeName?: string;
}

/**
 * Shape of a resolved class instance. Dynamic property access is required
 * because the framework injects getInstance/addListener/removeListener/emit
 * onto prototypes at runtime, and game classes may have arbitrary fields.
 * The index signature is intentional for framework-level dynamic access.
 */
interface InstanceLike {
  singleton?: boolean;
  simpleClass?: boolean;
  _iuid?: string;
  _subscribe?: () => void;
  _subscribeOnce?: () => void;
  __subscribedOnce?: boolean;
  __entities?: InstanceLike[];
  __path?: string;
  common?: unknown;
  getInstance?: (layer: string, params?: unknown, noModes?: boolean, modeName?: string) => unknown;
  addListener?: (eventName: string, callback: ObserverCallback, global?: boolean) => void;
  removeListener?: (eventName: string, callback: ObserverCallback, global?: boolean) => void;
  emit?: (eventName: string, params?: unknown, delay?: number) => void;
}

/**
 * Shape of a class constructor resolved from the Urso.Game namespace.
 * Index signature is required because the namespace is traversed dynamically
 * at runtime and classes carry framework-injected static properties (_instance).
 */
interface ClassObjectLike {
  _instance?: InstanceLike;
  prototype: InstanceLike;
  __path?: string;
  common?: unknown;
  __entities?: InstanceLike[];
  new (params?: unknown): InstanceLike;
}

type MixinFn = (superclass: unknown) => unknown;

class ModulesInstancesController {
  private _modes: string[];
  private _cache: Record<string, unknown>;
  private _counter: number;

  constructor() {
    this._modes = [];
    this._cache = {};
    this._counter = 0;

    this.getInstance = this.getInstance.bind(this);
    this.getByPath = this.getByPath.bind(this);
    this._setCommonFunctions = this._setCommonFunctions.bind(this);

    this.getModes = this.getModes.bind(this);
    this.addMode = this.addMode.bind(this);
    this.removeMode = this.removeMode.bind(this);
  }

  public getByPath<T = unknown>(path: string, noModes?: boolean, modeName?: string): T | null {
    const callback = (a: unknown): unknown => {
      return a;
    };

    return this._findClass({ path, callback, noModes, modeName }) as T | null;
  }

  public getModes(): string[] {
    return this._modes;
  }

  public addMode(mode: string): boolean {
    if (this._modes.indexOf(mode) !== -1) {
      return false;
    }

    this._modes.push(mode);
    Urso.observer.fire(Urso.events.MODULES_INSTANCES_MODES_CHANGED);
    return true;
  }

  public removeMode(mode: string, passiveMode?: boolean): boolean {
    const index = this._modes.indexOf(mode);

    if (index === -1) {
      return false;
    }

    this._modes.splice(index, 1);

    if (!passiveMode) {
      Urso.observer.fire(Urso.events.MODULES_INSTANCES_MODES_CHANGED);
    }

    return true;
  }

  public getInstance<T = unknown>(path: string, params?: unknown, noModes?: boolean, modeName?: string): T | null {
    const callback = (classObject: unknown): unknown => {
      const cls = classObject as ClassObjectLike;

      if (typeof cls !== 'function') {
        Urso.logger.error('getInstance type error');
      }

      if (cls._instance && cls._instance.singleton) {
        return cls._instance;
      }

      this._setCommonFunctions(cls, path);

      const instance = new cls(params);

      if (instance.singleton) {
        cls._instance = instance;
      }

      instance._iuid = this._getUid();

      this._launchDefaultFunctions(instance);

      return instance;
    };

    return this._findClass({ path, callback, noModes, modeName }) as T | null;
  }

  private _getUid(): string {
    this._counter++;
    return 'instance' + this._counter;
  }

  private _setCommonFunctions(classObject: ClassObjectLike, path: string): void {
    classObject.prototype.getInstance = this._entityGetInstance(path);
    classObject.prototype.addListener = this._entityAddListener;
    classObject.prototype.removeListener = this._entityRemoveListener;
    classObject.prototype.emit = this._entityEmit;
  }

  private _setCommonEntityFunctions(classObject: InstanceLike, callerObject: InstanceLike): void {
    if (callerObject.common && !classObject.common) {
      classObject.common = callerObject.common;

      if (classObject.__entities) {
        classObject.__entities.forEach((entity) =>
          this._setCommonEntityFunctions(entity, classObject)
        );
      }
    }
  }

  private _launchDefaultFunctions(instance: InstanceLike): void {
    if (instance && instance._subscribe) {
      instance._subscribe();
    }

    if (instance && instance._subscribeOnce && !instance.__subscribedOnce) {
      instance.__subscribedOnce = true;
      instance._subscribeOnce();
    }
  }

  private _entityGetInstance(path: string): (layer: string, params?: unknown, noModes?: boolean, modeName?: string) => unknown {
    const entityPath = Urso.helper.initial(path.split('.')).join('.');
    const self = this;

    return function (this: InstanceLike, layer: string, params?: unknown, noModes?: boolean, modeName?: string): unknown {
      const instance = self.getInstance<InstanceLike>(
        entityPath + '.' + layer,
        params,
        noModes,
        modeName
      );

      if (instance && !instance.simpleClass) {
        self._addEntityToClass(instance, this);
        self._setCommonEntityFunctions(instance, this);
      }

      return instance;
    };
  }

  private _addEntityToClass(classObject: InstanceLike, callerObject: InstanceLike): void {
    if (!callerObject.__entities) {
      callerObject.__entities = [];
    }

    if (!callerObject.__entities.includes(classObject)) {
      callerObject.__entities.push(classObject);
    }
  }

  private _entityAddListener(this: void, eventName: string, callback: ObserverCallback, global?: boolean): void {
    Urso.observer.add(eventName, callback, global);
  }

  private _entityRemoveListener(this: void, eventName: string, callback: ObserverCallback, global?: boolean): void {
    Urso.observer.remove(eventName, callback, global);
  }

  private _entityEmit(this: void, ...args: unknown[]): void {
    Urso.observer.fire(...(args as [string, unknown?, number?]));
  }

  private _findClass(params: FindClassParams): unknown {
    const cacheKey = [
      params.path,
      params.modeName || 'none',
      params.noModes || 'false',
    ].join('_');

    if (cacheKey in this._cache) {
      return this._cache[cacheKey] ? params.callback(this._cache[cacheKey]) : null;
    }

    const classObject = this._getClassByPath(params.path, params.noModes);

    if (!classObject) {
      return null;
    }

    let finalPath = params.path;

    if (typeof classObject === 'function') {
      (classObject as ClassObjectLike).prototype.__path = finalPath;
    } else if (typeof classObject === 'object') {
      (classObject as InstanceLike).__path = finalPath;
    }

    this._cache[cacheKey] = classObject;

    return params.callback(this._cache[cacheKey]);
  }

  private _getClassByPath(path: string, noModes?: boolean): unknown {
    const pathArr = path.split('.');
    const entitiesArray = ['Urso', 'Game'].concat(pathArr);
    return this._checkPathExist(entitiesArray, noModes);
  }

  private _checkPathExist(entitiesArray: string[], noModes?: boolean): unknown {
    let currentTestObject: Record<string, unknown> = window as unknown as Record<string, unknown>;
    let testMode: unknown;
    let mixins: MixinFn[] = [];

    for (let entitiesIndex = 0; entitiesIndex < entitiesArray.length; entitiesIndex++) {
      const lastElementModesCondition =
        !noModes && this._modes && entitiesIndex === entitiesArray.length - 1;

      if (
        lastElementModesCondition &&
        currentTestObject[MODES_NAMESPACE]
      ) {
        testMode = this._checkPathWithModes(
          currentTestObject[MODES_NAMESPACE] as Record<string, unknown>,
          entitiesArray,
          entitiesIndex
        );
      }

      if (
        lastElementModesCondition &&
        currentTestObject[MIXINS_NAMESPACE]
      ) {
        mixins = this._getMixins(
          currentTestObject[MIXINS_NAMESPACE] as Record<string, unknown>,
          entitiesArray,
          entitiesIndex
        );
      }

      if (testMode) {
        currentTestObject = testMode as Record<string, unknown>;
      } else if (currentTestObject[entitiesArray[entitiesIndex]]) {
        currentTestObject = currentTestObject[entitiesArray[entitiesIndex]] as Record<string, unknown>;
      } else {
        return null;
      }
    }

    let result: unknown = currentTestObject;

    mixins.forEach((mixin) => {
      result = mixin(result);
    });

    return result;
  }

  private _checkPathWithModes(
    currentTestObject: Record<string, unknown>,
    entitiesArray: string[],
    entitiesIndex: number
  ): unknown {
    for (const mode of this._modes) {
      const capMode = Urso.helper.capitaliseFirstLetter(mode);

      if (currentTestObject[capMode]) {
        const checkResult = this._checkPathWithModes(
          currentTestObject[capMode] as Record<string, unknown>,
          entitiesArray,
          entitiesIndex
        );

        if (checkResult) {
          return checkResult;
        }
      }
    }

    if (currentTestObject[entitiesArray[entitiesIndex]]) {
      return currentTestObject[entitiesArray[entitiesIndex]];
    }

    return null;
  }

  private _getMixins(
    currentTestObject: Record<string, unknown>,
    entitiesArray: string[],
    entitiesIndex: number
  ): MixinFn[] {
    const mixins: MixinFn[] = [];

    for (const mode of this._modes) {
      const capMode = Urso.helper.capitaliseFirstLetter(mode);

      if (
        currentTestObject[capMode] &&
        (currentTestObject[capMode] as Record<string, unknown>)[entitiesArray[entitiesIndex]]
      ) {
        mixins.push(
          (currentTestObject[capMode] as Record<string, unknown>)[entitiesArray[entitiesIndex]] as MixinFn
        );
      }
    }

    return mixins;
  }
}

export default ModulesInstancesController;
