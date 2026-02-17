import gsap from 'gsap';
import type ModulesObjectsBaseModel from './baseModel';
import type ModulesObjectsPropertyAdapter from './propertyAdapter';

type AliasMap = Record<string, string>;

/**
 * Runtime shape of an object model as seen through the Proxy.
 * We cannot extend ModulesObjectsBaseModel directly because its private
 * fields (_originalModel, _transitions) are accessed through the proxy.
 * Using a standalone interface avoids the TS2430 "private in base" error.
 */
interface ProxyTarget {
  _baseObject: import('pixi.js').Container | null;
  _originalModel: Record<string, unknown>;
  _transitions: { tweens: Record<string, { kill: () => void } | null> };
  proxyObject: import('pixi.js').Container | null;
  maxWidth: number | null;
  maxHeight: number | null;
  transitionProperty: string | null;
  transitionDuration: number | null;
  transitionDelay: number | null;
  contents?: unknown[];
  modifyValue: (key: string, value: unknown) => unknown;
  /** Index signature required: Proxy handler reads/writes arbitrary model properties by name */
  [key: string]: unknown;
}

/** Structural subset of pixi display object used by _checkMaxSize. */
interface PixiDisplayObject {
  width: number;
  height: number;
  scale: { x: number; y: number };
  updateTransform: (opts: Record<string, unknown>) => void;
  updateText?: (flag: boolean) => void;
  _texture?: { orig: { width: number; height: number } };
}

interface ProxyFacade {
  getInstance: <T = unknown>(path: string) => T;
}

class ModulesObjectsProxy {
  public readonly singleton: boolean = true;
  public getInstance!: <T = unknown>(path: string) => T;
  private _safeFlag: boolean = false;
  private _propertyAdapter: ModulesObjectsPropertyAdapter;
  private _aliases: AliasMap | null = null;

  constructor() {
    this._customSetLogic = this._customSetLogic.bind(this);
    this._customGetLogic = this._customGetLogic.bind(this);

    this._propertyAdapter = (this as unknown as ProxyFacade).getInstance<ModulesObjectsPropertyAdapter>('PropertyAdapter');
  }

  public get(model: ModulesObjectsBaseModel): ModulesObjectsBaseModel {
    const _this = this;
    const target = model as unknown as ProxyTarget;

    const proxy = new Proxy(target, {
      get(proxyTarget: ProxyTarget, key: string | symbol, receiver: unknown): unknown {
        if (typeof key === 'symbol') {
          return Reflect.get(proxyTarget, key, receiver);
        }
        const rv = Reflect.get(proxyTarget, key, receiver);
        return _this._customGetLogic({ target: proxyTarget, proxy: receiver }, key, rv);
      },

      set(proxyTarget: ProxyTarget, key: string | symbol, value: unknown, receiver: unknown): boolean {
        if (typeof key === 'symbol') {
          return Reflect.set(proxyTarget, key, value, receiver);
        }
        const oldValue = (proxyTarget._baseObject as unknown as Record<string, unknown>)?.[key];
        const rv = Reflect.set(proxyTarget, key, value, receiver);
        _this._customSetLogic(proxyTarget, key, value, proxy as unknown as ProxyTarget, oldValue);
        return rv;
      },
    });

    model.proxyObject = proxy as unknown as import('pixi.js').Container;
    return proxy as unknown as ModulesObjectsBaseModel;
  }

  private _setProperty(target: ProxyTarget, propertyName: string, value: unknown, oldValue: unknown): void {
    const isAdaptiveProperty = this._propertyAdapter.isAdaptiveProperty(propertyName);

    if (isAdaptiveProperty) {
      this._propertyAdapter.propertyChangeHandler(target as unknown as Parameters<typeof this._propertyAdapter.propertyChangeHandler>[0], propertyName);
    } else {
      Urso.helper.recursiveSet(propertyName, value, target._baseObject as unknown as Record<string, unknown>);
    }

    this._checkNeedTransitions(target, propertyName, value, oldValue);
  }

  public safeSetValueToTarget(target: ProxyTarget, key: string, value: unknown): void {
    this._safeFlag = true;

    const originalValue = target._originalModel[key];

    target[key] = value;

    target._originalModel[key] = originalValue;

    this._safeFlag = false;
  }

  private _customGetLogic(object: { target: ProxyTarget; proxy: unknown }, key: string, reflectValue: unknown): unknown {
    const target = object.target;
    const wrapKey = this._getAliases()[key];

    const isReflectValueDefined = typeof reflectValue !== 'undefined';

    if ((isReflectValueDefined && (typeof wrapKey !== 'undefined')) || !wrapKey) {
      return reflectValue;
    }

    return Urso.helper.recursiveGet(wrapKey, target._baseObject, reflectValue);
  }

  private _customSetLogic(target: ProxyTarget, key: string, value: unknown, _proxy: ProxyTarget, oldValue: unknown): boolean {
    if (!this._getOriginalModelExceptions().includes(key)) {
      target._originalModel[key] = value;
    }

    const propertyName = this._getAliases()[key];

    if (!propertyName) {
      return false;
    }

    if (propertyName.startsWith('function.')) {
      this._runCustomFunction(propertyName, target);
      return true;
    }

    this._checkSelectorProperties(key);

    value = target.modifyValue(key, value);
    this._setProperty(target, propertyName, value, oldValue);

    this._checkMaxSize(target);

    if (typeof (target._baseObject as unknown as Record<string, unknown>).dirty !== 'undefined') {
      (target._baseObject as unknown as Record<string, unknown>).dirty = true;
    }

    return true;
  }

  private _checkMaxSize(target: ProxyTarget): void {
    if (!target.maxWidth && !target.maxHeight) {
      return;
    }

    let calculationNeed = false;

    const baseObjTyped = target._baseObject as unknown as PixiDisplayObject;

    baseObjTyped.updateTransform({});

    if (baseObjTyped._texture && (!baseObjTyped._texture.orig.width || !baseObjTyped._texture.orig.height)) {
      baseObjTyped.updateText?.(true);
    }

    const baseObjectWidth = baseObjTyped._texture
      ? Math.abs(baseObjTyped.scale.x) * baseObjTyped._texture.orig.width
      : baseObjTyped.width;
    const baseObjectHeight = baseObjTyped._texture
      ? Math.abs(baseObjTyped.scale.y) * baseObjTyped._texture.orig.height
      : baseObjTyped.height;

    if (
      target.maxWidth &&
      (
        target.maxWidth < baseObjectWidth ||
        (target.maxWidth > baseObjectWidth && baseObjTyped.scale.x < 1)
      )
    ) {
      calculationNeed = true;
    }

    if (
      target.maxHeight &&
      (
        target.maxHeight < baseObjectHeight ||
        (target.maxHeight > baseObjectHeight && baseObjTyped.scale.y < 1)
      )
    ) {
      calculationNeed = true;
    }

    if (!calculationNeed) {
      return;
    }

    let scaleNeed = 1;

    if (target.maxWidth) {
      scaleNeed = Math.abs((baseObjTyped.scale.x * target.maxWidth) / baseObjTyped.width);
    }

    if (target.maxHeight) {
      const scaleYNeed = Math.abs((baseObjTyped.scale.y * target.maxHeight) / baseObjTyped.height);

      if (scaleNeed > scaleYNeed) {
        scaleNeed = scaleYNeed;
      }
    }

    if (scaleNeed > 1) {
      scaleNeed = 1;
    }

    baseObjTyped.scale.x = scaleNeed * Math.sign(baseObjTyped.scale.x);
    baseObjTyped.scale.y = scaleNeed * Math.sign(baseObjTyped.scale.y);
  }

  private _runCustomFunction(property: string, target: ProxyTarget): void {
    const funcName = property.replace('function.', '');
    if (typeof target[funcName] === 'function') {
      (target[funcName] as () => void)();
    }
  }

  private _checkSelectorProperties(key: string): void {
    if (!this._safeFlag && this._getSelectorProperties().includes(key)) {
      Urso.logger.error('ModulesObjectsProxy error: you are trying to change selector property: ' + key);
      Urso.logger.error('Notice: use functions addClass, removeClass, setId, setName');
    }
  }

  private _checkNeedTransitions(target: ProxyTarget, propertyName: string, _value: unknown, oldValue: unknown): void {
    if (
      typeof oldValue === 'undefined' ||
      !target.transitionProperty ||
      !target.transitionDuration ||
      !target.transitionProperty.split(' ').includes(propertyName)
    ) {
      return;
    }

    const baseNewValue = (target._baseObject as unknown as Record<string, unknown>)[propertyName];

    const currentTween = target._transitions.tweens[propertyName];

    if (currentTween) {
      currentTween.kill();
    }

    (target._baseObject as unknown as Record<string, unknown>)[propertyName] = oldValue;

    const tweenParams: Record<string, unknown> = {
      duration: target.transitionDuration / 1000,
      ease: 'none',
    };
    tweenParams[propertyName] = baseNewValue;

    if (target.transitionDelay) {
      tweenParams.delay = target.transitionDelay / 1000;
    }

    const newTween = gsap.to(target._baseObject as unknown as gsap.TweenTarget, tweenParams as gsap.TweenVars);
    target._transitions.tweens[propertyName] = newTween as unknown as { kill: () => void };

    (newTween as unknown as { eventCallback: (event: string, cb: () => void) => void }).eventCallback('onComplete', () => {
      target._transitions.tweens[propertyName] = null;
    });
  }

  private _getSelectorProperties(): string[] {
    return ['id', 'name', 'class'];
  }

  private _getOriginalModelExceptions(): string[] {
    return ['parent', 'contents'];
  }

  private _getAliases(): AliasMap {
    if (this._aliases) return this._aliases;
    this._aliases = {
      'id': 'id',
      'name': 'name',
      'class': 'class',
      'x': 'x',
      'y': 'y',
      'z': 'zIndex',
      'angle': 'angle',
      'anchorX': 'anchor.x',
      'anchorY': 'anchor.y',
      'width': 'width',
      'height': 'height',
      'stretchingType': 'stretchingType',
      'scaleX': 'scale.x',
      'scaleY': 'scale.y',
      'alignX': 'alignX',
      'alignY': 'alignY',
      'parent': 'parent',
      'rightOffset': 'rightOffset',
      'bottomOffset': 'bottomOffset',
      'alpha': 'alpha',
      'visible': 'visible',
      'text': 'text',
      'frame': 'frame',
      'blendMode': 'blendMode',
      'tint': 'tint',
      'action': 'events.onInputUp._bindings.0._listener',
      'btnFrames.over': 'frames.over',
      'btnFrames.out': 'frames.out',
      'btnFrames.down': 'frames.down',
      'btnFrames.up': 'frames.up',
      'align': 'align',
      'filters': 'filters',
      'lineSpacing': 'lineSpacing',
      'maxWidth': 'maxWidth',
      'maxHeight': 'maxHeight',
      'lineHeight': 'style.lineHeight',
      'fontFamily': 'style.fontFamily',
      'fontSize': 'style.fontSize',
      'fontStyle': 'style.fontStyle',
      'fontWeight': 'style.fontWeight',
      'fill': 'style.fill',
      'fillCustomColors': 'fillCustomColors',
      'stroke': 'style.stroke.color',
      'strokeThickness': 'style.stroke.width',
      'dropShadow': 'style.dropShadow',
      'dropShadowColor': 'style.dropShadow.color',
      'dropShadowBlur': 'style.dropShadow.blur',
      'dropShadowAngle': 'style.dropShadow.angle',
      'dropShadowDistance': 'style.dropShadow.distance',
      'wordWrap': 'style.wordWrap',
      'wordWrapWidth': 'style.wordWrapWidth',
      'leading': 'style.leading',
      'letterSpacing': 'style.letterSpacing',
      'textAlign': 'style.align',
      'enabled': 'input.enabled',
      'cacheAsBitmap': 'cacheAsTexture',
      'ignoreParentMask': 'ignoreParentMask',
      'toGlobal': 'toGlobal',
    };
    return this._aliases;
  }
}

export default ModulesObjectsProxy;
