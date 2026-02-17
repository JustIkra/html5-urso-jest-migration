// =============================================================================
// globals.ts -- Typed window.Urso namespace (Phase 1 only)
// Deleted entirely in Phase 2 when all references replaced with direct imports.
// =============================================================================

import type {
  UrsoEvent,
  ObserverCallback,
  TemplateTypesList,
  DeviceInstance,
} from './types';

// All controller/service types don't exist in TS yet -- typed as unknown for Phase 0.
// They will be replaced with real types as each module is converted.

interface UrsoNamespace {
  /** @deprecated Use direct import instead */
  events: typeof UrsoEvent;

  /** @deprecated Use direct import instead */
  Game: Record<string, unknown>;

  /** @deprecated Use direct import instead */
  Core: Record<string, unknown>;

  /** @deprecated Use direct import instead */
  config: Record<string, unknown>;

  /** @deprecated Use direct import instead */
  observer: {
    add: (eventName: string, callback: ObserverCallback, global?: boolean) => void;
    remove: (eventName: string, callback: ObserverCallback, global?: boolean) => void;
    fire: (eventName: string, params?: unknown, delay?: number) => void;
    setPrefix: (prefix: string) => void;
    clearAllLocal: () => void;
    clear: () => boolean;
  };

  /** @deprecated Use direct import instead */
  helper: {
    recursiveGet: (key: string, object: unknown, defaultValue?: unknown) => unknown;
    recursiveSet: (key: string, value: unknown, object: Record<string, unknown>) => boolean;
    recursiveDelete: (key: string, object: Record<string, unknown>) => boolean;
    mergeObjectsRecursive: (obj1: Record<string, unknown>, obj2: Record<string, unknown>, mergeInFirst?: boolean) => Record<string, unknown>;
    objectClone: (obj: unknown, recursiveCalls?: number) => unknown;
    objectApply: (from: Record<string, unknown>, to: Record<string, unknown>, recursiveCalls?: number) => void;
    objectFlip: (obj: Record<string, unknown>) => Record<string, unknown>;
    getObjectSize: (obj: object) => number;
    stringReplace: (needle: string, replacement: string, haystack: string) => string;
    capitaliseFirstLetter: (str: string) => string;
    arraysGetUniqElements: <T>(a: T[], b: T[]) => T[];
    mergeArrays: <T>(a: T[], b: T[]) => T[];
    initial: <T>(array: T[]) => T[];
    parseGetParams: (name?: string) => Record<string, string> | string | undefined;
    ldgZero: (num: number, count: number) => string;
    checkDeepEqual: (obj1: unknown, obj2: unknown) => boolean;
    checkEqual: (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => boolean;
    checkArraysPartialEntry: <T>(main: T[] | null, partial: T[] | null) => boolean;
    mobileAndTabletCheck: () => boolean;
    isIpadOS: () => boolean;
    reactive: <T>(target: object, key: string, callback: (value: T) => void) => boolean;
    getLengthBy2Points: (p1: { x: number; y: number }, p2: { x: number; y: number }) => number;
    getAngleBy3Points: (p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }) => number;
    getRadian: (angle: number) => number;
    getAngle: (radian: number) => number;
    interpolate: (str: string, params: Record<string, string>) => string;
    getRGB: (color: number) => { red: number; green: number; blue: number; alpha: number };
    getColor32: (a: number, r: number, g: number, b: number) => number;
    interpolateColor32: (start: number, target: number, step: number) => number;
    interpolateColorRGB: (start: number, target: number, step: number) => number;
    rowsToCols: <T>(matrix: T[][]) => T[][];
    transpose: <T>(matrix: T[][]) => T[][];
    logicBlocksDo: (entity: unknown, funcName: string, ...args: unknown[]) => unknown[];
    renameObjectsKey: (obj: Record<string, unknown>, oldKey: string, newKey: string) => void;
    waitForDomElement: (selector: string) => Promise<Element>;
  };

  /** @deprecated Use direct import instead */
  logger: {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
  };

  /** @deprecated Use direct import instead */
  math: {
    intMakeBetween: (num: number, min: number, max: number) => number;
    getRandomInt: (max: number) => number;
    getRandomIntBetween: (min: number, max: number) => number;
    roundToDigits: (num: number, digits: number) => number | false;
    isInt: (n: unknown) => boolean;
    isFloat: (n: unknown) => boolean;
    getDecimalsLength: (num: number) => number;
    multiplyFloats: (nums: number[]) => number;
    addFloats: (nums: number[]) => number;
    subtractFloats: (nums: number[]) => number;
    getMaxDecimalsLength: (nums: number[]) => number;
  };

  /** @deprecated Use direct import instead */
  cache: unknown;

  /** @deprecated Use direct import instead */
  time: {
    get: (date?: Date) => number;
    getUnixtime: (date?: Date) => number;
  };

  /** @deprecated Use direct import instead */
  device: DeviceInstance;

  /** @deprecated Use direct import instead */
  objects: unknown;

  /** @deprecated Use direct import instead */
  scenes: unknown;

  /** @deprecated Use direct import instead */
  statesManager: unknown;

  /** @deprecated Use direct import instead */
  template: unknown;

  /** @deprecated Use direct import instead */
  localData: {
    get: (name: string) => unknown;
    set: (key: string, value: unknown) => boolean;
  };

  /** @deprecated Use direct import instead */
  types: TemplateTypesList;

  /** @deprecated Use direct import instead */
  browserEvents: unknown;

  /** @deprecated Use direct import instead */
  loader: unknown;

  /** @deprecated Use direct import instead */
  assets: unknown;

  /** @deprecated Use direct import instead */
  i18n: unknown;

  /** @deprecated Use direct import instead */
  transport: unknown;

  /** @deprecated Use direct import instead */
  logic: unknown;

  /** @deprecated Use direct import instead */
  soundManager: unknown;

  /** @deprecated Use direct import instead */
  tween: unknown;

  /** @deprecated Use direct import instead */
  setTimeout: (callback: () => void, delay: number) => unknown;

  /** @deprecated Use direct import instead */
  clearTimeout: (ref: unknown) => void;

  /** @deprecated Use direct import instead */
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;

  /** @deprecated Use direct import instead */
  getByPath: <T = unknown>(path: string) => T;

  /** @deprecated Use direct import instead */
  getInstancesModes: () => string[];

  /** @deprecated Use direct import instead */
  addInstancesMode: (mode: string) => void;

  /** @deprecated Use direct import instead */
  removeInstancesMode: (mode: string) => void;

  /** @deprecated Use direct import instead */
  runGame: (config: Record<string, unknown>) => void;
}

declare global {
  // eslint-disable-next-line no-var
  var Urso: UrsoNamespace;
  function log(...args: unknown[]): void;
}

export type { UrsoNamespace };
