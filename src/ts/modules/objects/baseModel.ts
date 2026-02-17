import type { Container, Texture } from 'pixi.js';
import { AlignX, AlignY } from '../../types';
import type {
  ObjectTypeId,
  StretchingType,
  ObjectModelParams,
  ObjectTransitions,
  ObserverCallback,
  Point,
  Size,
  StylesMap,
} from '../../types';

// Typed facade for Urso.objects methods used by baseModel.
// The full controller type doesn't exist yet (converted later in Block 3).
interface ObjectsFacade {
  destroy: (model: unknown, doNotRefreshStylesFlag?: boolean) => void;
  addChild: (parent: unknown, child: unknown, doNotRefreshStylesFlag?: boolean) => void;
  removeChild: (parent: unknown, child: unknown, doNotRefreshStylesFlag?: boolean) => void;
  getWorld: () => { x: number; y: number; _baseObject: { scale: { x: number; y: number }; toGlobal: (p: unknown) => { x: number; y: number }; toLocal: (p: unknown, from: unknown) => { x: number; y: number } } };
  refreshStyles: () => void;
  refreshByChangedClassName: (className: string) => void;
  addIdToCache: (id: string, obj: unknown) => void;
  removeIdFromCache: (id: string, obj: unknown) => void;
  addNameToCache: (name: string, obj: unknown) => void;
  removeNameFromCache: (name: string, obj: unknown) => void;
  addClassToCache: (className: string, obj: unknown) => void;
  removeClassFromCache: (className: string, obj: unknown) => void;
  _safeSetValueToTarget: (target: unknown, key: string, value: unknown) => void;
}

class ModulesObjectsBaseModel {
  public simpleClass: boolean = true;

  // Framework-injected methods (set by ModulesInstancesController at runtime)
  public addListener!: (event: string, callback: ObserverCallback, isGlobal?: boolean) => void;
  public removeListener!: (event: string, callback: ObserverCallback, isGlobal?: boolean) => void;
  public emit!: (event: string, params?: unknown, delay?: number) => void;

  // setupParams fields
  public type: ObjectTypeId | null = null;
  public id: string | null = null;
  public name: string | null = null;
  public class: string | null = null;
  public x: number | string = 0;
  public y: number | string = 0;
  public z: number = 0;
  public anchorX: number = 0;
  public anchorY: number = 0;
  public scaleX: number = 1;
  public scaleY: number = 1;
  public alignX: AlignX = AlignX.Left;
  public alignY: AlignY = AlignY.Top;
  public width: number | string | null = null;
  public height: number | string | null = null;
  public maxWidth: number | null = null;
  public maxHeight: number | null = null;
  public stretchingType: StretchingType | null = null;
  public angle: number = 0;
  public visible: boolean = true;
  public alpha: number = 1;
  public blendMode: number = 1;
  public ignoreParentMask: boolean = false;
  public transitionDelay: number | null = null;
  public transitionDuration: number | null = null;
  public transitionProperty: string | null = null;
  public append: boolean = true;
  public custom: Record<string, unknown> = {};

  // instance fields
  public parent: ModulesObjectsBaseModel | null = null;
  public proxyObject: Container | null = null;
  public destroyed: boolean = false;

  // system fields
  private _originalModel: Partial<ObjectModelParams>;
  private _classes: string[] = [];
  private _styles: StylesMap = {};
  /** @internal Accessed by proxy/service — not part of the public API. */
  public _baseObject: Container | null = null;
  /** @internal Accessed by proxy/service — not part of the public API. */
  public _uid: string | null = null;
  /** @internal Accessed by proxy/service — not part of the public API. */
  public _templatePath: string | null = null;
  private _parsed: boolean = false;
  private _transitions: ObjectTransitions = { tweens: {} };

  constructor(params: Partial<ObjectModelParams>) {
    this.setupParams(params);

    this.parent = null;
    this.proxyObject = null;
    this.destroyed = false;

    this._originalModel = params;
    this._classes = [];
    this._styles = {};
    this._baseObject = null;
    this._uid = Urso.helper.recursiveGet('_uid', params, null) as string | null;
    this._templatePath = null;
    this._parsed = false;
    this._transitions = { tweens: {} };
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    this.type = params.type ?? null;

    this.id = params.id ?? null;
    this.name = params.name ?? null;
    this['class'] = params['class'] ?? null;

    this.x = params.x ?? 0;
    this.y = params.y ?? 0;
    this.z = params.z ?? 0;
    this.anchorX = params.anchorX ?? 0;
    this.anchorY = params.anchorY ?? 0;
    this.scaleX = params.scaleX ?? 1;
    this.scaleY = params.scaleY ?? 1;
    this.alignX = params.alignX ?? AlignX.Left;
    this.alignY = params.alignY ?? AlignY.Top;
    this.width = params.width ?? null;
    this.height = params.height ?? null;
    this.maxWidth = params.maxWidth ?? null;
    this.maxHeight = params.maxHeight ?? null;
    this.stretchingType = params.stretchingType ?? null;
    this.angle = params.angle ?? 0;
    this.visible = params.visible ?? true;
    this.alpha = params.alpha ?? 1;
    this.blendMode = params.blendMode ?? 1;
    this.ignoreParentMask = params.ignoreParentMask ?? false;

    this.transitionDelay = params.transitionDelay ?? null;
    this.transitionDuration = params.transitionDuration ?? null;
    this.transitionProperty = params.transitionProperty ?? null;

    this.append = params.append ?? true;
    this.custom = params.custom ?? {};
  }

  // Typed accessors for global Urso singletons that are `unknown` in Phase 1
  private get _objects(): ObjectsFacade {
    return Urso.objects as ObjectsFacade;
  }

  public modifyValue(_key: string, val: unknown): unknown {
    return val;
  }

  public getAbsoluteSize(): Size {
    return { width: this._baseObject!.width, height: this._baseObject!.height };
  }

  public destroy(doNotRefreshStylesFlag?: boolean): void {
    this._objects.destroy(this, doNotRefreshStylesFlag);
  }

  protected _customDestroy(): void { }

  public addChild(childObject: ModulesObjectsBaseModel, doNotRefreshStylesFlag?: boolean): void {
    this._objects.addChild(this, childObject, doNotRefreshStylesFlag);
  }

  public get transform(): unknown {
    return (this._baseObject as unknown as Record<string, unknown>).transform;
  }

  public addChildAt(childObject: ModulesObjectsBaseModel, _zIndex: number, doNotRefreshStylesFlag?: boolean): void {
    this._objects.addChild(this, childObject, doNotRefreshStylesFlag);
  }

  public removeChild(childObject: ModulesObjectsBaseModel, doNotRefreshStylesFlag?: boolean): void {
    this._objects.removeChild(this, childObject, doNotRefreshStylesFlag);
  }

  public setId(id: string | null, doNotRefreshStylesFlag?: boolean): this {
    if (this.id) {
      this._objects.removeIdFromCache(this.id, this);
    }

    this._objects._safeSetValueToTarget(this, 'id', id);

    if (id) {
      this._objects.addIdToCache(id, this);
    }

    if (!doNotRefreshStylesFlag) {
      this._objects.refreshStyles();
    }

    return this;
  }

  public setName(name: string | null, doNotRefreshStylesFlag?: boolean): this {
    if (this.name) {
      this._objects.removeNameFromCache(this.name, this);
    }

    this._objects._safeSetValueToTarget(this, 'name', name);

    if (name) {
      this._objects.addNameToCache(name, this);
    }

    if (!doNotRefreshStylesFlag) {
      this._objects.refreshStyles();
    }

    return this;
  }

  public addClass(className: string, doNotRefreshStylesFlag?: boolean): this {
    const currentClass = this['class'];
    let newClassName: string;

    if (!currentClass) {
      newClassName = className;
    } else {
      if (currentClass.split(' ').includes(className)) {
        return this;
      }

      newClassName = this['class'] + ' ' + className;
    }

    this._objects._safeSetValueToTarget(this, 'class', newClassName);
    this._objects.addClassToCache(className, this);

    if (!doNotRefreshStylesFlag) {
      this._objects.refreshByChangedClassName(className);
    }

    return this;
  }

  public removeClass(className: string, doNotRefreshStylesFlag?: boolean): this {
    if (!this['class']) {
      return this;
    }

    const classArray = this['class'].split(' ');
    const classIndex = classArray.indexOf(className);

    if (classIndex === -1) {
      return this;
    }

    classArray.splice(classIndex, 1);
    this._objects._safeSetValueToTarget(this, 'class', classArray.join(' '));
    this._objects.removeClassFromCache(className, this);

    if (!doNotRefreshStylesFlag) {
      this._objects.refreshByChangedClassName(className);
    }

    return this;
  }

  public toGlobal(): Point {
    const world = this._objects.getWorld();
    const worldScale = world._baseObject.scale;
    const worldPoint = { x: world.x, y: world.y };
    const globalPoint = this._baseObject!.toGlobal(worldPoint);

    const x = Math.floor(globalPoint.x / worldScale.x);
    const y = Math.floor(globalPoint.y / worldScale.y);

    return { x, y };
  }

  public toLocal(from?: ModulesObjectsBaseModel): Point {
    const world = this._objects.getWorld();
    const worldPoint = { x: world.x, y: world.y };
    const parent = this.parent ? this.parent._baseObject : world._baseObject;
    const fromObj = from ? from._baseObject : parent;
    const localPoint = this._baseObject!.toLocal(worldPoint, (fromObj ?? undefined) as Container | undefined);

    const x = -~~localPoint.x;
    const y = -~~localPoint.y;

    return { x, y };
  }

  public generateTexture(key: string = ''): Texture {
    const newTexture = (Urso.scenes as { generateTexture: (obj: unknown) => Texture }).generateTexture(this._baseObject);

    if (key) {
      (Urso.cache as { addTexture: (key: string, tex: unknown) => void }).addTexture(key, newTexture);
    }

    return newTexture;
  }

  public sortChildren(): void {
    const base = this._baseObject as unknown as { children?: unknown[]; sortChildren?: () => void } | null;
    if (base && base.children && base.children.length > 0 && base.sortChildren) {
      base.sortChildren();
    }
  }
}

export default ModulesObjectsBaseModel;
