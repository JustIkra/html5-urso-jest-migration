import type { ObjectTypeId } from '../../types';

interface PoolableObject {
  x: number | string;
  y: number | string;
  angle: number;
  anchorX: number;
  anchorY: number;
  visible: boolean;
  type: ObjectTypeId | null;
  parent: PoolableObject | null;
  _baseObject: { lastTime?: unknown; [key: string]: unknown } | null;
  _poolCacheId?: number;
  assetKey?: string;
  animation?: unknown;
  setAnimationConfig?: (animation: unknown) => void;
  setToSetupPose?: () => void;
  stop?: () => void;
  clearListeners?: () => void;
  /** Index signature required: pool resets dynamic model properties (x, y, angle, etc.) */
  [key: string]: unknown;
}

interface PoolElement {
  data: PoolableObject;
}

interface ObjectPoolInstance {
  getElement: (key: string | undefined, params: { object: PoolableObject; parent: PoolableObject }) => PoolElement;
  putElement: (element: PoolElement) => void;
}

interface ServiceFacade {
  add: (object: PoolableObject, parent: PoolableObject, ignorePool?: boolean) => PoolableObject;
  addChild: (parent: PoolableObject, child: PoolableObject, doNotRefreshStylesFlag?: boolean) => void;
  removeChild: (parent: PoolableObject, child: PoolableObject, doNotRefreshStylesFlag?: boolean) => void;
}

interface PoolFacade {
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;
}

class ModulesObjectsPool {
  public readonly singleton: boolean = true;
  public getInstance!: <T = unknown>(path: string, ...args: unknown[]) => T;

  private _objectsCache: Record<number, PoolElement> = {};
  private _objectsCounter: number = 0;
  private _objectsPool: ObjectPoolInstance;

  constructor() {
    const ObjectPool = (Urso as unknown as { Game: { Lib: { ObjectPool: new (c: unknown, r: unknown) => ObjectPoolInstance } } }).Game.Lib.ObjectPool;
    this._objectsPool = new ObjectPool(
      this._constructorFunction.bind(this),
      this._resetFunction.bind(this),
    );
  }

  public getElement(object: PoolableObject, parent: PoolableObject): PoolableObject {
    const poolElement = this._objectsPool.getElement(object.assetKey, { object, parent });
    this._objectsCounter++;
    this._objectsCache[this._objectsCounter] = poolElement;

    const newObject = poolElement.data;
    newObject._poolCacheId = this._objectsCounter;

    newObject.x = typeof object.x === 'number' ? object.x : 0;
    newObject.y = typeof object.y === 'number' ? object.y : 0;
    newObject.angle = typeof object.angle === 'number' ? object.angle : 0;
    newObject.anchorX = typeof object.anchorX === 'number' ? object.anchorX : 0;
    newObject.anchorY = typeof object.anchorY === 'number' ? object.anchorY : 0;
    newObject.visible = typeof object.visible === 'boolean' ? object.visible : true;

    if (object.type === Urso.types.objects.SPINE && newObject.setAnimationConfig) {
      newObject.setAnimationConfig(object.animation);
    }

    (this as unknown as PoolFacade).getInstance<ServiceFacade>('Service').addChild(parent, newObject, true);
    return newObject;
  }

  public putElement(object: PoolableObject, _doNotRefreshStylesFlag?: boolean): void {
    if (object._poolCacheId) {
      this._objectsPool.putElement(this._objectsCache[object._poolCacheId]);
      delete this._objectsCache[object._poolCacheId];
      return;
    }

    // eslint-disable-next-line no-console
    console.error('ModulesObjectsPool something goes wrong: object must be in pool');
  }

  private _constructorFunction(_key: unknown, params: { object: PoolableObject; parent: PoolableObject }): PoolableObject {
    return (this as unknown as PoolFacade).getInstance<ServiceFacade>('Service').add(params.object, params.parent, true);
  }

  private _resetFunction(object: PoolableObject): PoolableObject {
    if (object.parent) {
      (this as unknown as PoolFacade).getInstance<ServiceFacade>('Service').removeChild(object.parent, object, true);
    }

    if (object.type === Urso.types.objects.SPINE) {
      object.setToSetupPose?.();
      object.stop?.();
      object.clearListeners?.();
      if (object._baseObject) {
        object._baseObject.lastTime = null;
      }
    }

    return object;
  }
}

export default ModulesObjectsPool;
