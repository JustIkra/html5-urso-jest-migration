import type ModulesObjectsBaseModel from '../baseModel';

interface CollectionArray extends Array<ModulesObjectsBaseModel> {
  setProperty: (prop: string, value: unknown) => boolean;
  addClass: (className: string) => void;
  removeClass: (className: string) => void;
}

class ModulesObjectsModelsCollection {
  private _children: ModulesObjectsBaseModel[];

  constructor(param?: ModulesObjectsBaseModel[]) {
    this._children = param || [];
    this._setProperty = this._setProperty.bind(this);

    const methods: Record<string, unknown> = {
      setProperty: this._setProperty,
      addClass: this._runFunc('addClass'),
      removeClass: this._runFunc('removeClass'),
    };

    for (const propName in methods) {
      this._defineProp(this._children as unknown as Record<string, unknown>, propName, methods[propName]);
    }

    return this._children as unknown as ModulesObjectsModelsCollection;
  }

  private _defineProp(obj: Record<string, unknown>, propName: string, propVal: unknown): void {
    Object.defineProperty(obj, propName, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: propVal,
    });
  }

  private _checkAllHasProperty(prop: string): boolean {
    return this._children.every((child) => Object.prototype.hasOwnProperty.call(child, prop));
  }

  private _setProperty(prop: string, value: unknown): boolean {
    const allHasProperty = this._checkAllHasProperty(prop);

    if (allHasProperty) {
      this._children.forEach((child) => {
        (child as unknown as Record<string, unknown>)[prop] = value;
      });
    }

    return allHasProperty;
  }

  private _runFunc(funcName: string): (param: unknown) => void {
    return (param: unknown) => {
      this._children.forEach((child) => {
        const fn = (child as unknown as Record<string, ((...args: unknown[]) => void) | undefined>)[funcName];
        if (fn) {
          fn(param);
        }
      });
    };
  }
}

export default ModulesObjectsModelsCollection;
export type { CollectionArray };
