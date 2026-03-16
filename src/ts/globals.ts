// =============================================================================
// globals.ts -- Typed window.Urso namespace
// =============================================================================

import type {
  UrsoEvent,
  ObserverCallback,
  TemplateTypesList,
  DeviceInstance,
  ObjectBaseModel,
  ConfigMainType,
  LibCacheFacade,
  LibLoaderFacade,
  LibTweenFacade,
  ObjectsControllerFacade,
  ScenesControllerFacade,
  TemplateControllerFacade,
  AssetsControllerFacade,
  StatesManagerControllerFacade,
  TransportControllerFacade,
  SoundManagerControllerFacade,
  I18nControllerFacade,
  LogicControllerFacade,
  BrowserEventsFacade,
  GsapTween,
  UrsoUtilsNamespace,
  PixiGlobal,
} from './types';

interface UrsoNamespace {
  events: typeof UrsoEvent;

  Game: Record<string, unknown>;

  Core: Record<string, unknown>;

  config: ConfigMainType;

  observer: {
    add: (eventName: string, callback: ObserverCallback, global?: boolean) => void;
    remove: (eventName: string, callback: ObserverCallback, global?: boolean) => void;
    fire: (eventName: string, params?: unknown, delay?: number) => void;
    setPrefix: (prefix: string) => void;
    clearAllLocal: () => void;
    clear: () => boolean;
  };

  helper: {
    recursiveGet: (key: string, object: unknown, defaultValue?: unknown) => unknown;
    recursiveSet: (key: string, value: unknown, object: object) => boolean;
    recursiveDelete: (key: string, object: object) => boolean;
    mergeObjectsRecursive: <T>(obj1: T, obj2: T, mergeInFirst?: boolean) => T;
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
    interpolate: (str: string, params: Record<string, unknown>) => string;
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

  logger: {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
  };

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

  cache: LibCacheFacade;

  time: {
    get: (date?: Date) => number;
    getUnixtime: (date?: Date) => number;
  };

  device: DeviceInstance;

  objects: ObjectsControllerFacade;

  scenes: ScenesControllerFacade;

  statesManager: StatesManagerControllerFacade;

  template: TemplateControllerFacade;

  localData: {
    get: (name: string) => unknown;
    set: (key: string, value: unknown) => boolean;
  };

  types: TemplateTypesList;

  browserEvents: BrowserEventsFacade;

  loader: LibLoaderFacade;

  assets: AssetsControllerFacade;

  i18n: I18nControllerFacade;

  transport: TransportControllerFacade;

  logic: LogicControllerFacade;

  soundManager: SoundManagerControllerFacade;

  tween: LibTweenFacade;

  setTimeout: (callback: () => void, delay: number) => GsapTween;

  clearTimeout: (ref: GsapTween) => void;

  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;

  getByPath: <T = unknown>(path: string) => T;

  getInstancesModes: () => string[];

  addInstancesMode: (mode: string) => void;

  removeInstancesMode: (mode: string, silent?: boolean) => void;

  runGame: (config: Record<string, unknown>) => void;

  find: (selector: string) => ObjectBaseModel[] | null;

  findOne: (selector: string) => ObjectBaseModel | null;

  findAll: (selector: string) => ObjectBaseModel[];
}

declare global {
  // eslint-disable-next-line no-var
  var Urso: UrsoNamespace;
  // eslint-disable-next-line no-var
  var UrsoUtils: UrsoUtilsNamespace;
  // eslint-disable-next-line no-var
  var PIXI: PixiGlobal;
  function log(...args: unknown[]): void;
}

export type { UrsoNamespace };
