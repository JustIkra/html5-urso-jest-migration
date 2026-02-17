import type { RGBA, RGB } from '../types';

interface PointLike {
  x: number;
  y: number;
}

interface LogicBlockEntity {
  _logicBlocks?: Record<string, string>;
  _logicBlocksInstances?: Record<string, Record<string, (...args: unknown[]) => unknown>>;
  getInstance: (path: string) => Record<string, (...args: unknown[]) => unknown>;
}

class LibHelper {
  private readonly _arFactor: number;

  constructor() {
    this._arFactor = Math.PI / 180;
  }

  public parseGetParams(): Record<string, string>;
  public parseGetParams(name: string): string | undefined;
  public parseGetParams(name?: string): Record<string, string> | string | undefined {
    const $_GET: Record<string, string> = {};
    const _GET = window.location.href.substring(1).split('?');

    if (_GET[1]) {
      const __GET = _GET[1].split('&');

      for (let i = 0; i < __GET.length; i++) {
        const getVar = __GET[i].split('=');
        $_GET[getVar[0]] = typeof getVar[1] === 'undefined' ? '' : getVar[1];
      }
    }

    if (!name) return $_GET;

    return $_GET[name];
  }

  public waitForDomElement(selector: string): Promise<Element> {
    return new Promise((resolve) => {
      const existing = document.querySelector(selector);
      if (existing) {
        return resolve(existing);
      }

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          resolve(el);
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  public arraysGetUniqElements<T>(array1: T[], array2: T[]): T[] {
    const result: T[] = [];
    const tempObject: Record<string, { counter: number; value: T }> = {};

    const parseArray = (arrayObject: T[]): void => {
      for (const element of arrayObject) {
        const key = String(element);
        if (!tempObject[key]) {
          tempObject[key] = { counter: 1, value: element };
        } else {
          tempObject[key].counter++;
        }
      }
    };

    parseArray(array1);
    parseArray(array2);

    for (const key in tempObject) {
      if (tempObject[key].counter === 1) {
        result.push(tempObject[key].value);
      }
    }

    return result;
  }

  public stringReplace(needle: string, replacement: string, haystack: string): string {
    if (needle === '') {
      return replacement + haystack.split('').join(replacement) + replacement;
    }

    return haystack.split(needle).join(replacement);
  }

  public capitaliseFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  public initial<T>(array: T[]): T[] {
    array.pop();
    return array;
  }

  public ldgZero(num: number, count: number): string {
    let numZeropad = num + '';

    while (numZeropad.length < count) {
      numZeropad = '0' + numZeropad;
    }

    return numZeropad;
  }

  public mergeArrays<T>(a: T[], b: T[]): T[] {
    return a.concat(
      b.filter((item) => a.indexOf(item) < 0)
    );
  }

  public objectFlip(obj: Record<string, unknown>): Record<string, string> {
    const ret: Record<string, string> = {};

    Object.keys(obj).forEach((key) => {
      ret[String(obj[key])] = key;
    });

    return ret;
  }

  public recursiveSet(key: string | string[], value: unknown, object: Record<string, unknown>): boolean {
    const keys: string[] = typeof key === 'string' ? key.split('.') : key;

    const firstKey = keys.shift()!;

    if (keys.length > 0) {
      if (!object[firstKey]) {
        object[firstKey] = {};
      }

      this.recursiveSet(keys, value, object[firstKey] as Record<string, unknown>);
    } else {
      object[firstKey] = value;
    }

    return true;
  }

  public rowsToCols<T>(matrix: T[][]): T[][] {
    return Object.keys(matrix[0]).map((colNumber) =>
      matrix.map((rowNumber) => rowNumber[colNumber as unknown as number])
    );
  }

  public recursiveGet<T = unknown>(key: string | string[], object: unknown, defaultResult?: T): T {
    if (object === undefined) return defaultResult as T;

    const keys: string[] = typeof key === 'string' ? key.split('.') : key;

    if (keys.length === 1 && keys[0] === '') return object as T;

    let current: unknown = object;

    for (const k of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultResult as T;
      }

      if (typeof (current as Record<string, unknown>)[k] === 'undefined') {
        return defaultResult as T;
      }

      current = (current as Record<string, unknown>)[k];
    }

    return current as T;
  }

  public recursiveDelete(key: string | string[], obj: Record<string, unknown>): boolean {
    const keys: string[] = typeof key === 'string' ? key.split('.') : key;
    let current: Record<string, unknown> = obj;

    for (let k = 0; k < keys.length; k++) {
      const ok = keys[k];

      if (typeof current[ok] === 'undefined') return false;

      if (k === keys.length - 1) {
        delete current[ok];
      } else {
        current = current[ok] as Record<string, unknown>;
      }
    }

    return true;
  }

  public transpose<T>(matrix: T[][]): T[][] {
    return Object.keys(matrix[0]).map((colNumber) =>
      matrix.map((rowNumber) => rowNumber[colNumber as unknown as number])
    );
  }

  public mergeObjectsRecursive(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
    mergeInFirstFlag?: boolean
  ): Record<string, unknown> {
    const newObj: Record<string, unknown> = mergeInFirstFlag
      ? obj1
      : this.objectClone(obj1) as Record<string, unknown>;

    for (const k in obj2) {
      if (typeof obj2[k] === 'object' && typeof obj1[k] === 'object') {
        newObj[k] = this.mergeObjectsRecursive(
          obj1[k] as Record<string, unknown>,
          obj2[k] as Record<string, unknown>,
          mergeInFirstFlag
        );
      } else {
        newObj[k] = obj2[k];
      }
    }

    return newObj;
  }

  public renameObjectsKey(obj: Record<string, unknown>, oldKey: string, newKey: string): void {
    if (oldKey !== newKey) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, oldKey);
      if (descriptor) {
        Object.defineProperty(obj, newKey, descriptor);
      }

      delete obj[oldKey];
    }
  }

  public objectClone<T>(obj: T, recursiveCalls?: number): T {
    if (!obj || typeof obj !== 'object') return obj;

    if (typeof recursiveCalls === 'undefined') recursiveCalls = 999;

    const clone: Record<string, unknown> = Array.isArray(obj) ? [] as unknown as Record<string, unknown> : {};

    if ((obj as Record<string, unknown>).hasOwnProperty) {
      for (const prop in obj as Record<string, unknown>) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          const propValue = (obj as Record<string, unknown>)[prop];

          if (prop === 'imageSrc') {
            clone[prop] = propValue;
          } else if (propValue && typeof propValue === 'object') {
            clone[prop] = recursiveCalls
              ? this.objectClone(propValue, recursiveCalls - 1)
              : '[object Object]';
          } else {
            clone[prop] = propValue;
          }
        }
      }
    }

    return clone as unknown as T;
  }

  public getObjectSize(obj: object): number {
    return Object.keys(obj).length;
  }

  public objectApply(
    fromObj: Record<string, unknown>,
    toObj: Record<string, unknown>,
    recursiveCalls: number = 999
  ): Record<string, unknown> {
    if (!recursiveCalls) return fromObj;

    for (const k in toObj) {
      const paramTo = toObj[k];

      if (!fromObj[k]) {
        fromObj[k] = paramTo;
      } else if (typeof paramTo === 'object') {
        fromObj[k] = this.objectApply(
          fromObj[k] as Record<string, unknown>,
          toObj[k] as Record<string, unknown>,
          recursiveCalls - 1
        );
      } else {
        if (toObj[k] !== fromObj[k]) {
          fromObj[k] = paramTo;
        }
      }
    }

    return fromObj;
  }

  public checkDeepEqual(obj1: unknown, obj2: unknown): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  public checkEqual(obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean {
    const objSort = (o: Record<string, unknown>): Record<string, unknown> => {
      const sortedObj: Record<string, unknown> = {};
      const keys = Object.keys(o);
      keys.sort();

      for (const index in keys) {
        if (Object.prototype.hasOwnProperty.call(keys, index)) {
          const key = keys[index];
          let value = o[key];

          if (typeof o[key] === 'object') {
            value = objSort(value as Record<string, unknown>);
          }

          sortedObj[key] = value;
        }
      }

      return sortedObj;
    };

    const o1s = objSort(obj1);
    const o2s = objSort(obj2);

    return this.checkDeepEqual(o1s, o2s);
  }

  public checkArraysPartialEntry<T>(main: T[] | null, partial: T[] | null): boolean {
    if (!main || !partial) return false;

    main = [...main].sort() as T[];
    partial = [...partial].sort() as T[];

    let kPartial = partial.length - 1;

    for (let i = main.length - 1; i >= 0; i--) {
      if (JSON.stringify(main[i]) === JSON.stringify(partial[kPartial])) {
        kPartial--;
      }

      if (kPartial === -1) return true;
    }

    return false;
  }

  public mobileAndTabletCheck(): boolean {
    let check = false;
    ((a: string) => {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
          a.substr(0, 4)
        )
      ) {
        check = true;
      }
    })(navigator.userAgent || navigator.vendor || (window as unknown as Record<string, string>).opera || '');

    return check || this.isIpadOS();
  }

  public isIpadOS(): boolean {
    return (
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform)
    );
  }

  public reactive<T>(targetObject: object, key: string, callback: (value: T) => void): boolean {
    let descriptor = Object.getOwnPropertyDescriptor(targetObject, key);
    let targetObjectTemp: object = targetObject;

    while (!descriptor && Object.getPrototypeOf(targetObjectTemp)) {
      targetObjectTemp = Object.getPrototypeOf(targetObjectTemp) as object;
      const descriptorTemp = Object.getOwnPropertyDescriptor(targetObjectTemp, key);

      if (descriptorTemp && (descriptorTemp.value !== undefined || descriptorTemp.set || descriptorTemp.get)) {
        descriptor = descriptorTemp;
      }
    }

    if (!descriptor) return false;

    if (typeof descriptor.value !== 'undefined') {
      let value: T = descriptor.value as T;
      descriptor.get = function () {
        return value;
      };
      descriptor.set = function (v: T) {
        value = v;
      };

      delete descriptor.value;
      delete descriptor.writable;
    }

    const setter = descriptor.set as ((v: T) => void) | undefined;

    descriptor.set = function (v: T) {
      if (setter) setter.call(targetObject, v);
      callback.call(targetObject, v);
    };

    Object.defineProperty(targetObject, key, descriptor);

    return true;
  }

  public getLengthBy2Points(point1: PointLike, point2: PointLike): number {
    return Math.sqrt(
      (point2.x - point1.x) * (point2.x - point1.x) +
        (point2.y - point1.y) * (point2.y - point1.y)
    );
  }

  public getAngleBy3Points(point1: PointLike, point2: PointLike, point3: PointLike): number {
    let angle = 0;
    const c = this.getLengthBy2Points(point1, point3);
    const a = this.getLengthBy2Points(point1, point2);
    const b = this.getLengthBy2Points(point2, point3);

    if (a !== 0 && b !== 0) {
      const clamp = (num: number, min: number, max: number): number =>
        Math.min(Math.max(num, min), max);
      const cornerRcos = clamp((a * a + b * b - c * c) / (2 * a * b), -1, 1);
      angle = Math.acos(cornerRcos);
    }

    return angle;
  }

  public getRadian(angle: number): number {
    return angle * this._arFactor;
  }

  public getAngle(radian: number): number {
    return radian / this._arFactor;
  }

  public logicBlocksDo(entity: LogicBlockEntity, funcName: string, ...args: unknown[]): unknown[] {
    if (!entity._logicBlocksInstances) {
      entity._logicBlocksInstances = {};

      if (entity._logicBlocks) {
        for (const k in entity._logicBlocks) {
          const name = entity._logicBlocks[k];
          const nameCap = this.capitaliseFirstLetter(name);
          entity._logicBlocksInstances[name] = entity.getInstance(nameCap);
        }
      }
    }

    const results: unknown[] = [];

    for (const name in entity._logicBlocksInstances) {
      if (entity._logicBlocksInstances[name][funcName]) {
        const res = entity._logicBlocksInstances[name][funcName](...args);
        results.push(res);
      }
    }

    return results;
  }

  public interpolate(string: string, params: Record<string, string>): string {
    for (const [key, value] of Object.entries(params)) {
      string = this.stringReplace('${' + key + '}', value, string);
    }

    return string;
  }

  public getRGB(color: number): RGBA {
    return {
      alpha: 16777215 < color ? color >>> 24 : 255,
      red: (color >> 16) & 255,
      green: (color >> 8) & 255,
      blue: 255 & color,
    };
  }

  public getColor32(alpha: number, red: number, green: number, blue: number): number {
    return (alpha << 24) | (red << 16) | (green << 8) | blue;
  }

  public interpolateColor32(startColor: number, targetColor: number, step: number): number {
    if (startColor === targetColor) return startColor;

    const startColorRGB = this.getRGB(startColor);
    const targetColorRGB = this.getRGB(targetColor);
    const nextColorRGB = this.interpolateColorRGB(startColorRGB, targetColorRGB, step);
    const color32 = this.getColor32(255, nextColorRGB.red, nextColorRGB.green, nextColorRGB.blue);
    return 16777215 + color32;
  }

  public interpolateColorRGB(startColorRGB: RGB, targetColorRGB: RGB, step: number): RGB {
    const nextRGB = { red: 0, green: 0, blue: 0 };

    (['red', 'green', 'blue'] as const).forEach((color) => {
      nextRGB[color] =
        (targetColorRGB[color] - startColorRGB[color]) * step +
        startColorRGB[color];
    });

    return nextRGB;
  }
}

export default LibHelper;
