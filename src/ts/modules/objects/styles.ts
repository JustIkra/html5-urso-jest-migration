import type { ObjectTypeId, StylesCache, StylesMap } from '../../types';
import type ModulesObjectsBaseModel from './baseModel';
import type ModulesObjectsSelector from './selector';

/**
 * Facade for the circular dependency on Controller.
 * The real controller is resolved at runtime via getInstance.
 */
interface ControllerFacade {
  getWorld: () => StyledObject;
  findAll: (selector: string) => StyledObject[];
}

/**
 * Facade for Urso.objects proxy methods used by styles.
 */
interface ObjectsProxyFacade {
  _safeSetValueToTarget: (target: unknown, key: string, value: unknown) => void;
}

/**
 * Facade for Urso.template.get() result.
 */
interface TemplateFacade {
  get: () => { styles: StylesMap };
}

/**
 * Internal view of object models as used by styles.
 * Extended with private fields that styles accesses.
 */
interface StyledObject {
  _uid: string | null;
  _styles: StylesMap;
  _originalModel: Record<string, unknown>;
  type: ObjectTypeId | null;
  /** Index signature required: styles reads/writes dynamic model properties by key */
  [key: string]: unknown;
}

interface StylesFacade {
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;
}

class ModulesObjectsStyles {
  public readonly singleton: boolean = true;
  public getInstance!: <T = unknown>(path: string, ...args: unknown[]) => T;

  private _cache: StylesCache;
  private _tempObject: StyledObject;
  private _tempTextObject: StyledObject;
  private _selector: ModulesObjectsSelector;

  constructor() {
    this._cache = {};
    this._tempObject = (this as unknown as StylesFacade).getInstance<StyledObject>('BaseModel', {});
    this._tempTextObject = (this as unknown as StylesFacade).getInstance<StyledObject>('Models.Text', {});
    this._selector = (this as unknown as StylesFacade).getInstance<ModulesObjectsSelector>('Selector');
  }

  public refresh(parent?: StyledObject): void {
    if (!parent) {
      parent = (this as unknown as StylesFacade).getInstance<ControllerFacade>('Controller').getWorld();
    }

    const template = (Urso.template as TemplateFacade).get();
    const styles = template.styles;

    this._removeInactualStylesAndAddNew(parent, styles);
  }

  public refreshByChangedClassName(className: string): void {
    const template = (Urso.template as TemplateFacade).get();
    const styles = template.styles;

    this._restoreDefaultsByCache(className);

    for (const [selector, style] of Object.entries(styles)) {
      if (selector.includes('.' + className)) {
        this._apply(selector, style);
      }
    }
  }

  public removeFromCache(object: StyledObject): void {
    for (const selector in this._cache) {
      if (this._cache[selector][object._uid!]) {
        this._deleteFromCacheBySelector(selector, object);
      }
    }
  }

  /** @deprecated Use _removeInactualStylesAndAddNew instead. */
  private _removeAllStylesAndReAdd(_parent: StyledObject, styles: StylesMap): void {
    this._globalResetStyles();

    for (const [selector, style] of Object.entries(styles)) {
      this._apply(selector, style);
    }
  }

  private _removeInactualStylesAndAddNew(_parent: StyledObject, styles: StylesMap): void {
    this._resetInactualStyles();

    for (const [selector, style] of Object.entries(styles)) {
      this._apply(selector, style);
    }
  }

  private _deleteFromCacheBySelector(selector: string, object: StyledObject): void {
    delete this._cache[selector][object._uid!];

    if (!Object.keys(this._cache[selector]).length) {
      delete this._cache[selector];
    }
  }

  private _apply(selector: string, style: Record<string, unknown>): void {
    const objectsArray = (this as unknown as StylesFacade).getInstance<ControllerFacade>('Controller').findAll(selector);
    const objectsProxy = Urso.objects as ObjectsProxyFacade;

    for (const object of objectsArray) {
      if (object._styles[selector]) {
        continue;
      }

      this._addObjectToCache(selector, object);
      object._styles[selector] = style as StylesMap[string];

      for (const [key, value] of Object.entries(style)) {
        if (typeof object._originalModel[key] === 'undefined') {
          objectsProxy._safeSetValueToTarget(object, key, value);
        }
      }
    }
  }

  private _addObjectToCache(selector: string, object: StyledObject): void {
    if (!this._cache[selector]) {
      this._cache[selector] = {};
    }

    this._cache[selector][object._uid!] = object as unknown as import('../../types').ObjectBaseModel;
  }

  /** @deprecated */
  private _globalResetStyles(): void {
    for (const [selector, selectorCache] of Object.entries(this._cache)) {
      for (const [_uid, object] of Object.entries(selectorCache)) {
        this._removeSelectorStyles(object as unknown as StyledObject, selector, true);
      }

      delete this._cache[selector];
    }
  }

  private _resetInactualStyles(): void {
    for (const [selector, selectorCache] of Object.entries(this._cache)) {
      for (const [_uid, object] of Object.entries(selectorCache)) {
        const styledObj = object as unknown as StyledObject;
        if (!this._selector.testObject(styledObj as unknown as Parameters<typeof this._selector.testObject>[0], selector)) {
          this._removeSelectorStyles(styledObj, selector);
          this._deleteFromCacheBySelector(selector, styledObj);
        }
      }
    }
  }

  private _restoreDefaultsByCache(className: string): void {
    for (const [selector, selectorCache] of Object.entries(this._cache)) {
      if (selector.includes('.' + className)) {
        for (const [_uid, object] of Object.entries(selectorCache)) {
          this._removeSelectorStyles(object as unknown as StyledObject, selector);
        }

        delete this._cache[selector];
      }
    }
  }

  private _removeSelectorStyles(object: StyledObject, selector: string, globalResetFlag?: boolean): void {
    delete object._styles[selector];
    const template = (Urso.template as TemplateFacade).get();
    const styles = template.styles[selector];

    if (!styles) {
      return;
    }

    for (const [key] of Object.entries(styles)) {
      this._restoreValueByKey(key, object, globalResetFlag);
    }
  }

  private _restoreValueByKey(key: string, object: StyledObject, globalResetFlag?: boolean): void {
    if (object._originalModel[key]) {
      return;
    }

    const objectTypes = Urso.types.objects;
    const tempObject = (object.type === objectTypes.TEXT) ? this._tempTextObject : this._tempObject;
    const objectsProxy = Urso.objects as ObjectsProxyFacade;

    objectsProxy._safeSetValueToTarget(object, key, tempObject[key]);

    if (!globalResetFlag) {
      for (const [_selector, style] of Object.entries(object._styles)) {
        if (typeof (style as Record<string, unknown>)[key] !== 'undefined') {
          objectsProxy._safeSetValueToTarget(object, key, (style as Record<string, unknown>)[key]);
        }
      }
    }
  }
}

export default ModulesObjectsStyles;
