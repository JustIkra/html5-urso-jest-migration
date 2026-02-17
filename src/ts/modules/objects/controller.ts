import type { ObserverCallback } from '../../types';
import type ModulesObjectsBaseModel from './baseModel';

interface ServiceFacade {
  add: (object: unknown, parent: unknown) => unknown;
  addChild: (parent: unknown, child: unknown, doNotRefreshStylesFlag?: boolean) => void;
  removeChild: (parent: unknown, child: unknown, doNotRefreshStylesFlag?: boolean) => void;
  destroy: (object: unknown, doNotRefreshStylesFlag?: boolean) => void;
  getWorld: () => unknown;
  resetWorld: () => void;
  updateWorldBounds: (params: { template: { width: number; height: number } }) => void;
  applyClassesToWorld: () => void;
  _updateCommonProperties: (object: unknown) => void;
}

interface FindFacade {
  do: (selector: string, findOneFlag?: boolean) => ModulesObjectsBaseModel[] | null;
}

interface CacheFacade {
  addId: (key: string, obj: unknown) => void;
  removeId: (key: string, obj: unknown) => void;
  addName: (key: string, obj: unknown) => void;
  removeName: (key: string, obj: unknown) => void;
  addClass: (key: string, obj: unknown) => void;
  removeClass: (key: string, obj: unknown) => void;
}

interface StylesFacade {
  refresh: (parent?: unknown) => void;
  refreshByChangedClassName: (className: string) => void;
}

interface ProxyFacade {
  safeSetValueToTarget: (target: unknown, key: string, value: unknown) => void;
}

interface ScenesAddObjectFacade {
  addObject: (object: unknown, parent: unknown, doNotRefreshStylesFlag?: boolean) => unknown;
}

interface ParseableObject {
  _parsed?: boolean;
  /** Index signature required: template parser sets dynamic properties on objects */
  [key: string]: unknown;
}

interface ControllerHost {
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;
  addListener: (event: string, callback: ObserverCallback, isGlobal?: boolean) => void;
}

class ModulesObjectsController {
  public readonly singleton: boolean = true;
  public getInstance!: <T = unknown>(path: string, ...args: unknown[]) => T;
  public addListener!: (event: string, callback: ObserverCallback, isGlobal?: boolean) => void;

  private _newResolutionHandler: (params: { template: { width: number; height: number } }) => void;
  private _resetWorld: () => void;
  private _applyClassesToWorld: () => void;

  constructor() {
    (Urso as unknown as Record<string, unknown>).find = this.find.bind(this);
    (Urso as unknown as Record<string, unknown>).findOne = this.findOne.bind(this);
    (Urso as unknown as Record<string, unknown>).findAll = this.findAll.bind(this);

    this._newResolutionHandler = this._onNewResolution.bind(this);
    this._resetWorld = this._onResetWorld.bind(this);
    this._applyClassesToWorld = this._onApplyClassesToWorld.bind(this);
  }

  public create(
    objects: ParseableObject | ParseableObject[],
    parent?: unknown,
    doNotRefreshStylesFlag?: boolean,
    _system: boolean = false,
  ): unknown {
    let result: unknown;

    if (Array.isArray(objects)) {
      const results: unknown[] = [];
      for (const object of objects) {
        results.push(this._createSingleObject(object, parent, doNotRefreshStylesFlag, _system));
      }
      result = results;
    } else {
      result = this._createSingleObject(objects, parent, doNotRefreshStylesFlag, _system);
    }

    if (!doNotRefreshStylesFlag) {
      this.refreshStyles(parent);
    }

    return result;
  }

  private _createSingleObject(
    object: ParseableObject,
    parent: unknown,
    _doNotRefreshStylesFlag?: boolean,
    _system: boolean = false,
  ): unknown {
    if (!object._parsed && !_system) {
      return (Urso.scenes as ScenesAddObjectFacade).addObject(object, parent, _doNotRefreshStylesFlag);
    }

    return (this as unknown as ControllerHost).getInstance<ServiceFacade>('Service').add(object, parent);
  }

  public find(selector: string): ModulesObjectsBaseModel[] | null {
    return (this as unknown as ControllerHost).getInstance<FindFacade>('Find').do(selector);
  }

  public findOne(selector: string): ModulesObjectsBaseModel | null {
    const result = (this as unknown as ControllerHost).getInstance<FindFacade>('Find').do(selector, true);
    return result ? result[0] : null;
  }

  public findAll(selector: string): ModulesObjectsBaseModel[] {
    const result = (this as unknown as ControllerHost).getInstance<FindFacade>('Find').do(selector);
    return result ? result : [];
  }

  public addIdToCache(id: string, object: unknown): void {
    (this as unknown as ControllerHost).getInstance<CacheFacade>('Cache').addId(id, object);
  }

  public removeIdFromCache(id: string, object: unknown): void {
    (this as unknown as ControllerHost).getInstance<CacheFacade>('Cache').removeId(id, object);
  }

  public addNameToCache(name: string, object: unknown): void {
    (this as unknown as ControllerHost).getInstance<CacheFacade>('Cache').addName(name, object);
  }

  public removeNameFromCache(name: string, object: unknown): void {
    (this as unknown as ControllerHost).getInstance<CacheFacade>('Cache').removeName(name, object);
  }

  public addClassToCache(className: string, object: unknown): void {
    (this as unknown as ControllerHost).getInstance<CacheFacade>('Cache').addClass(className, object);
  }

  public removeClassFromCache(className: string, object: unknown): void {
    (this as unknown as ControllerHost).getInstance<CacheFacade>('Cache').removeClass(className, object);
  }

  public refreshStyles(parent?: unknown): void {
    (this as unknown as ControllerHost).getInstance<StylesFacade>('Styles').refresh(parent);
  }

  public refreshByChangedClassName(className: string): void {
    (this as unknown as ControllerHost).getInstance<StylesFacade>('Styles').refreshByChangedClassName(className);
  }

  public getWorld(): unknown {
    return (this as unknown as ControllerHost).getInstance<ServiceFacade>('Service').getWorld();
  }

  public addChild(parent: unknown, child: unknown, doNotRefreshStylesFlag?: boolean): void {
    (this as unknown as ControllerHost).getInstance<ServiceFacade>('Service').addChild(parent, child, doNotRefreshStylesFlag);
  }

  public removeChild(parent: unknown, child: unknown, doNotRefreshStylesFlag?: boolean): void {
    (this as unknown as ControllerHost).getInstance<ServiceFacade>('Service').removeChild(parent, child, doNotRefreshStylesFlag);
  }

  public destroy(object: unknown, doNotRefreshStylesFlag?: boolean): void {
    (this as unknown as ControllerHost).getInstance<ServiceFacade>('Service').destroy(object, doNotRefreshStylesFlag);
  }

  /** @internal Called by baseModel — not part of the public controller API. */
  public _safeSetValueToTarget(target: unknown, key: string, value: unknown): void {
    (this as unknown as ControllerHost).getInstance<ProxyFacade>('Proxy').safeSetValueToTarget(target, key, value);
  }

  /** @internal Called by service — not part of the public controller API. */
  public _updateCommonProperties(object: unknown): void {
    (this as unknown as ControllerHost).getInstance<ServiceFacade>('Service')._updateCommonProperties(object);
  }

  private _onNewResolution(params: { template: { width: number; height: number } }): void {
    (this as unknown as ControllerHost).getInstance<ServiceFacade>('Service').updateWorldBounds(params);
  }

  private _onResetWorld(): void {
    (this as unknown as ControllerHost).getInstance<ServiceFacade>('Service').resetWorld();
  }

  private _onApplyClassesToWorld(): void {
    (this as unknown as ControllerHost).getInstance<ServiceFacade>('Service').applyClassesToWorld();
  }

  public _subscribeOnce(): void {
    (this as unknown as ControllerHost).addListener(Urso.events.MODULES_SCENES_NEW_RESOLUTION, this._newResolutionHandler as ObserverCallback, true);
    (this as unknown as ControllerHost).addListener(Urso.events.MODULES_SCENES_NEW_SCENE_INIT, this._resetWorld as ObserverCallback, true);
    (this as unknown as ControllerHost).addListener(Urso.events.MODULES_INSTANCES_MODES_CHANGED, this._applyClassesToWorld as ObserverCallback, true);
  }
}

export default ModulesObjectsController;
