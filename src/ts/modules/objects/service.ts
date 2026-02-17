import type { ObjectTypeId } from '../../types';
import type ModulesObjectsBaseModel from './baseModel';

/**
 * Extended model shape as used by the service (includes private fields
 * accessed through proxy and parent/children relationships).
 */
interface ServiceObject {
  _uid: string | null;
  _baseObject: PixiContainer | null;
  _originalModel: Record<string, unknown>;
  _styles: Record<string, unknown>;
  _templatePath: string | null;
  _controller?: { common: { object: unknown }; [key: string]: unknown } | null;
  _poolCacheId?: number;
  _customDestroy: () => void;
  parent: ServiceObject | null;
  proxyObject: unknown;
  destroyed: boolean;
  type: ObjectTypeId | null;
  id: string | null;
  name: string | null;
  class: string | null;
  contents?: ServiceObject[];
  instance?: unknown;
  assetKey?: string;
  animation?: unknown;
  addClass: (className: string, doNotRefresh?: boolean) => void;
  removeClass: (className: string, doNotRefresh?: boolean) => void;
  /** Index signature required: service accesses dynamic model properties via proxy */
  [key: string]: unknown;
}

interface PixiContainer {
  addChild: (child: unknown) => void;
  removeChild: (child: unknown) => void;
  destroy: (opts: { children: boolean }) => void;
  mask?: unknown;
  /** Index signature required: pixi Container exposes dynamic properties (dirty, etc.) */
  [key: string]: unknown;
}

interface ProxyFacade {
  get: (model: unknown) => ServiceObject;
}

interface CacheFacade {
  reset: () => void;
  addId: (key: string, obj: unknown) => void;
  removeId: (key: string, obj: unknown) => void;
  addName: (key: string, obj: unknown) => void;
  removeName: (key: string, obj: unknown) => void;
  addClass: (key: string, obj: unknown) => void;
  removeClass: (key: string, obj: unknown) => void;
}

interface ConfigFacade {
  objectsToCache: ObjectTypeId[];
}

interface PoolFacade {
  getElement: (object: ServiceObject, parent: ServiceObject) => ServiceObject;
  putElement: (object: ServiceObject, doNotRefreshStylesFlag?: boolean) => void;
}

interface StylesFacade {
  removeFromCache: (object: unknown) => void;
}

interface ObjectsGlobalFacade {
  _safeSetValueToTarget: (target: unknown, key: string, value: unknown) => void;
  refreshStyles: () => void;
}

interface ScenesGlobalFacade {
  getTemplateSize: () => { width: number; height: number };
}

interface ServiceFacadeHost {
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;
}

class ModulesObjectsService {
  public readonly singleton: boolean = true;
  public getInstance!: <T = unknown>(path: string, ...args: unknown[]) => T;

  private _world: ServiceObject | null = null;
  private _counter: number = 0;
  private _objectsTypesFlipped: Record<string, string> | null = null;

  private get _facade(): ServiceFacadeHost {
    return this as unknown as ServiceFacadeHost;
  }

  private get _objectsGlobal(): ObjectsGlobalFacade {
    return Urso.objects as ObjectsGlobalFacade;
  }

  private _checkWorld(): ServiceObject {
    if (this._world) {
      return this._world;
    }

    this.resetWorld();

    return this._world!;
  }

  public resetWorld(): void {
    const model = this._facade.getInstance<ServiceObject>('Models.World', { name: 'WORLD' });
    const proxy = this._facade.getInstance<ProxyFacade>('Proxy').get(model);

    this._world = proxy;

    this.updateWorldBounds({ template: (Urso.scenes as ScenesGlobalFacade).getTemplateSize() });
    this._facade.getInstance<CacheFacade>('Cache').reset();
    this.applyClassesToWorld();
    this._addToCache(proxy);
  }

  public updateWorldBounds(params: { template: { width: number; height: number } }): void {
    if (!this._world) {
      return;
    }

    this._objectsGlobal._safeSetValueToTarget(this._world, 'width', params.template.width);
    this._objectsGlobal._safeSetValueToTarget(this._world, 'height', params.template.height);
  }

  public applyClassesToWorld(): void {
    if (!this._world) {
      return;
    }

    if (this._world['class']) {
      (this._world['class'] as string).split(' ').forEach((className) => this._world!.removeClass(className, true));
    }

    Urso.getInstancesModes().forEach((className) => this._world!.addClass(className, true));

    this._objectsGlobal.refreshStyles();
  }

  private _getUid(): string {
    this._counter++;
    return 'object_' + this._counter;
  }

  public getWorld(): ServiceObject | null {
    return this._world;
  }

  public add(object: ServiceObject, parent: ServiceObject | null, _ignorePool: boolean = false): ServiceObject {
    const { objectsToCache } = this._facade.getInstance<ConfigFacade>('Config');

    if (!_ignorePool && objectsToCache.includes(object.type!)) {
      return this._facade.getInstance<PoolFacade>('Pool').getElement(object, parent!);
    }

    const world = this._checkWorld();

    if (!parent) {
      parent = world;
    }

    let contents: ServiceObject[] | undefined;

    if (object.contents) {
      contents = object.contents;
      object.contents = [];
    }

    if (!this._objectsTypesFlipped) {
      this._objectsTypesFlipped = Urso.helper.objectFlip(Urso.types.objects as unknown as Record<string, unknown>) as Record<string, string>;
    }

    object._uid = this._getUid();

    let model: ServiceObject;

    // Explicit cases for types whose model class names don't match the simple
    // capitalised-lowercase pattern used by the default branch (e.g.
    // BITMAPTEXT -> "BitmapText", not "Bitmaptext").
    switch (object.type) {
      case Urso.types.objects.BITMAPTEXT:
        model = this._facade.getInstance<ServiceObject>('Models.BitmapText', object);
        break;
      case Urso.types.objects.DRAGCONTAINER:
        model = this._facade.getInstance<ServiceObject>('Models.DragContainer', object);
        break;
      case Urso.types.objects.EMITTERFX:
        model = this._facade.getInstance<ServiceObject>('Models.EmitterFx', object);
        break;
      case Urso.types.objects.HITAREA:
        model = this._facade.getInstance<ServiceObject>('Models.HitArea', object);
        break;
      case Urso.types.objects.IMAGESANIMATION:
        model = this._facade.getInstance<ServiceObject>('Models.ImagesAnimation', object);
        break;
      case Urso.types.objects.NINESLICEPLANE:
        model = this._facade.getInstance<ServiceObject>('Models.NineSlicePlane', object);
        break;
      case Urso.types.objects.TEXTINPUT:
        model = this._facade.getInstance<ServiceObject>('Models.TextInput', object);
        break;
      default: {
        const objectName = Urso.helper.capitaliseFirstLetter(
          this._objectsTypesFlipped[String(object.type)].toLowerCase(),
        );
        model = this._facade.getInstance<ServiceObject>(`Models.${objectName}`, object);
        break;
      }
    }

    if (!model) {
      Urso.logger.error('ModulesObjectsCreate model type error', object.type, object);
    }

    if (!model._baseObject) {
      Urso.logger.error('ModulesObjectsCreate baseObject error', model);
    }

    const proxy = this._facade.getInstance<ProxyFacade>('Proxy').get(model);

    if (object.type === Urso.types.objects.COMPONENT && object._controller) {
      object._controller.common.object = proxy;
    }

    this.addChild(parent, proxy, true);
    this._updateCommonProperties(proxy);

    if (model.type === Urso.types.objects.MASK && parent._baseObject) {
      parent._baseObject.mask = model._baseObject;
    }

    if (contents) {
      for (const child of contents) {
        this.add(child, proxy);
      }
    }

    this._addToCache(proxy);

    return proxy;
  }

  public addChild(newParent: ServiceObject, child: ServiceObject, doNotRefreshStylesFlag?: boolean): void {
    if (child.parent) {
      this.removeChild(child.parent, child, true);
    }

    if (child._baseObject) {
      if (!newParent.contents) {
        newParent.contents = [];
      }
      newParent.contents.push(child);
      newParent._baseObject!.addChild(child._baseObject);
      child.parent = newParent;

      if (!doNotRefreshStylesFlag) {
        this._objectsGlobal.refreshStyles();
      }
    } else {
      newParent._baseObject!.addChild(child);
    }
  }

  public removeChild(parent: ServiceObject, child: ServiceObject, doNotRefreshStylesFlag?: boolean): void {
    child.parent = null;

    if (parent.contents) {
      const childIndex = parent.contents.indexOf(child);
      if (childIndex !== -1) {
        parent.contents.splice(childIndex, 1);
      }
    }

    parent._baseObject!.removeChild(child._baseObject);

    if (!doNotRefreshStylesFlag) {
      this._objectsGlobal.refreshStyles();
    }
  }

  public destroy(object: ServiceObject, doNotRefreshStylesFlag?: boolean): void {
    const { objectsToCache } = this._facade.getInstance<ConfigFacade>('Config');

    if (objectsToCache.includes(object.type!)) {
      this._facade.getInstance<PoolFacade>('Pool').putElement(object, doNotRefreshStylesFlag);
      return;
    }

    if (object.parent) {
      this.removeChild(object.parent, object, true);
    }

    object.proxyObject = null;

    if (object.contents) {
      while (object.contents.length > 0) {
        this.destroy(object.contents[0], true);
      }
    }

    object._customDestroy();
    if (object._baseObject) {
      object._baseObject.destroy({ children: true });
    }
    this._removeFromCache(object);
    this._facade.getInstance<StylesFacade>('Styles').removeFromCache(object);

    if (object._controller) {
      if (object._controller.common.object) {
        object._controller.common.object = null;
      }

      object._controller = null;
      object.instance = null;
    }

    if (!doNotRefreshStylesFlag) {
      this._objectsGlobal.refreshStyles();
    }

    object.destroyed = true;
  }

  private _updateCommonProperties(proxy: ServiceObject): void {
    for (const key in proxy._originalModel) {
      if (Object.prototype.hasOwnProperty.call(proxy._originalModel, key)) {
        const value = proxy._originalModel[key];
        this._objectsGlobal._safeSetValueToTarget(proxy, key, value);
      }
    }
  }

  private _addToCache(proxy: ServiceObject): void {
    const cache = this._facade.getInstance<CacheFacade>('Cache');
    if (proxy.id) {
      cache.addId(proxy.id, proxy);
    }
    if (proxy.name) {
      cache.addName(proxy.name, proxy);
    }
    if (proxy['class']) {
      cache.addClass(proxy['class'] as string, proxy);
    }
  }

  private _removeFromCache(proxy: ServiceObject): void {
    const cache = this._facade.getInstance<CacheFacade>('Cache');
    if (proxy.id) {
      cache.removeId(proxy.id, proxy);
    }
    if (proxy.name) {
      cache.removeName(proxy.name, proxy);
    }
    if (proxy['class']) {
      cache.removeClass(proxy['class'] as string, proxy);
    }
  }
}

export default ModulesObjectsService;
