import { vi } from 'vitest';
import { UrsoEvent, AssetTypeId, ObjectTypeId } from '../src/ts/types';

// ============================================================================
// Mock Observer
// ============================================================================

export interface MockObserver {
  add: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  fire: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
  setPrefix: ReturnType<typeof vi.fn>;
  clearAllLocal: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

function createMockObserver(): MockObserver {
  const fire = vi.fn();
  return {
    add: vi.fn(),
    remove: vi.fn(),
    fire,
    emit: fire,
    setPrefix: vi.fn(),
    clearAllLocal: vi.fn(),
    clear: vi.fn(() => true),
  };
}

// ============================================================================
// Mock Logger
// ============================================================================

export interface MockLogger {
  log: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
}

function createMockLogger(): MockLogger {
  return {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  };
}

// ============================================================================
// Mock Helper (vi.fn() stubs for Phase 0 -- real instance swapped in Block 1)
// ============================================================================

export interface MockHelper {
  recursiveGet: ReturnType<typeof vi.fn>;
  recursiveSet: ReturnType<typeof vi.fn>;
  recursiveDelete: ReturnType<typeof vi.fn>;
  mergeObjectsRecursive: ReturnType<typeof vi.fn>;
  objectClone: ReturnType<typeof vi.fn>;
  objectApply: ReturnType<typeof vi.fn>;
  objectFlip: ReturnType<typeof vi.fn>;
  getObjectSize: ReturnType<typeof vi.fn>;
  stringReplace: ReturnType<typeof vi.fn>;
  capitaliseFirstLetter: ReturnType<typeof vi.fn>;
  arraysGetUniqElements: ReturnType<typeof vi.fn>;
  mergeArrays: ReturnType<typeof vi.fn>;
  initial: ReturnType<typeof vi.fn>;
  parseGetParams: ReturnType<typeof vi.fn>;
  ldgZero: ReturnType<typeof vi.fn>;
  checkDeepEqual: ReturnType<typeof vi.fn>;
  checkEqual: ReturnType<typeof vi.fn>;
  checkArraysPartialEntry: ReturnType<typeof vi.fn>;
  mobileAndTabletCheck: ReturnType<typeof vi.fn>;
  isIpadOS: ReturnType<typeof vi.fn>;
  reactive: ReturnType<typeof vi.fn>;
  getLengthBy2Points: ReturnType<typeof vi.fn>;
  getAngleBy3Points: ReturnType<typeof vi.fn>;
  getRadian: ReturnType<typeof vi.fn>;
  getAngle: ReturnType<typeof vi.fn>;
  interpolate: ReturnType<typeof vi.fn>;
  getRGB: ReturnType<typeof vi.fn>;
  getColor32: ReturnType<typeof vi.fn>;
  interpolateColor32: ReturnType<typeof vi.fn>;
  interpolateColorRGB: ReturnType<typeof vi.fn>;
  rowsToCols: ReturnType<typeof vi.fn>;
  transpose: ReturnType<typeof vi.fn>;
  logicBlocksDo: ReturnType<typeof vi.fn>;
  renameObjectsKey: ReturnType<typeof vi.fn>;
  waitForDomElement: ReturnType<typeof vi.fn>;
}

function createMockHelper(): MockHelper {
  return {
    recursiveGet: vi.fn((_key: string, _obj: unknown, defaultValue?: unknown) => defaultValue),
    recursiveSet: vi.fn(() => true),
    recursiveDelete: vi.fn(() => true),
    mergeObjectsRecursive: vi.fn((obj1: Record<string, unknown>, obj2: Record<string, unknown>) => ({ ...obj1, ...obj2 })),
    objectClone: vi.fn((obj: unknown) => JSON.parse(JSON.stringify(obj))),
    objectApply: vi.fn(),
    objectFlip: vi.fn((obj: Record<string, unknown>) => {
      const result: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) result[String(v)] = k;
      return result;
    }),
    getObjectSize: vi.fn((obj: object) => Object.keys(obj).length),
    stringReplace: vi.fn((needle: string, replacement: string, haystack: string) => haystack.split(needle).join(replacement)),
    capitaliseFirstLetter: vi.fn((s: string) => s.charAt(0).toUpperCase() + s.slice(1)),
    arraysGetUniqElements: vi.fn(() => []),
    mergeArrays: vi.fn(<T>(a: T[], b: T[]) => [...a, ...b]),
    initial: vi.fn(<T>(arr: T[]) => arr.slice(0, -1)),
    parseGetParams: vi.fn(() => ({})),
    ldgZero: vi.fn((num: number, count: number) => String(num).padStart(count, '0')),
    checkDeepEqual: vi.fn(() => true),
    checkEqual: vi.fn(() => true),
    checkArraysPartialEntry: vi.fn(() => false),
    mobileAndTabletCheck: vi.fn(() => false),
    isIpadOS: vi.fn(() => false),
    reactive: vi.fn(() => true),
    getLengthBy2Points: vi.fn(() => 0),
    getAngleBy3Points: vi.fn(() => 0),
    getRadian: vi.fn((angle: number) => angle * (Math.PI / 180)),
    getAngle: vi.fn((radian: number) => radian * (180 / Math.PI)),
    interpolate: vi.fn((str: string) => str),
    getRGB: vi.fn(() => ({ red: 0, green: 0, blue: 0, alpha: 255 })),
    getColor32: vi.fn(() => 0),
    interpolateColor32: vi.fn(() => 0),
    interpolateColorRGB: vi.fn(() => 0),
    rowsToCols: vi.fn(<T>(m: T[][]) => m),
    transpose: vi.fn(<T>(m: T[][]) => m),
    logicBlocksDo: vi.fn(() => []),
    renameObjectsKey: vi.fn(),
    waitForDomElement: vi.fn(() => Promise.resolve(document.createElement('div'))),
  };
}

// ============================================================================
// Mock Math
// ============================================================================

export interface MockMath {
  intMakeBetween: ReturnType<typeof vi.fn>;
  getRandomInt: ReturnType<typeof vi.fn>;
  getRandomIntBetween: ReturnType<typeof vi.fn>;
  roundToDigits: ReturnType<typeof vi.fn>;
  isInt: ReturnType<typeof vi.fn>;
  isFloat: ReturnType<typeof vi.fn>;
  getDecimalsLength: ReturnType<typeof vi.fn>;
  multiplyFloats: ReturnType<typeof vi.fn>;
  addFloats: ReturnType<typeof vi.fn>;
  subtractFloats: ReturnType<typeof vi.fn>;
  getMaxDecimalsLength: ReturnType<typeof vi.fn>;
}

function createMockMath(): MockMath {
  return {
    intMakeBetween: vi.fn((num: number, min: number, max: number) => Math.min(Math.max(num, min), max)),
    getRandomInt: vi.fn((max: number) => Math.floor(Math.random() * (max + 1))),
    getRandomIntBetween: vi.fn((min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))),
    roundToDigits: vi.fn((num: number, digits: number) => {
      if (isNaN(num)) return false;
      const factor = Math.pow(10, digits);
      return Math.round(num * factor) / factor;
    }),
    isInt: vi.fn((n: unknown) => typeof n === 'number' && n % 1 === 0),
    isFloat: vi.fn((n: unknown) => typeof n === 'number' && n % 1 !== 0),
    getDecimalsLength: vi.fn((n: number) => {
      const s = String(n);
      const idx = s.indexOf('.');
      return idx === -1 ? 0 : s.length - idx - 1;
    }),
    multiplyFloats: vi.fn((nums: number[]) => nums.reduce((a, b) => a * b, 1)),
    addFloats: vi.fn((nums: number[]) => nums.reduce((a, b) => a + b, 0)),
    subtractFloats: vi.fn((nums: number[]) => nums.reduce((a, b) => a - b)),
    getMaxDecimalsLength: vi.fn(() => 0),
  };
}

// ============================================================================
// createMockUrso()
// ============================================================================

export interface MockUrsoResult {
  helper: MockHelper;
  math: MockMath;
  time: { get: ReturnType<typeof vi.fn>; getUnixtime: ReturnType<typeof vi.fn> };
  logger: MockLogger;
  observer: MockObserver;
  cache: Record<string, ReturnType<typeof vi.fn>>;
  config: Record<string, unknown>;
  objects: Record<string, ReturnType<typeof vi.fn>>;
  scenes: Record<string, unknown>;
  statesManager: Record<string, ReturnType<typeof vi.fn>>;
  localData: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };
  device: Record<string, unknown>;
  events: typeof UrsoEvent;
  types: { assets: typeof AssetTypeId; objects: typeof ObjectTypeId };
  i18n: { get: ReturnType<typeof vi.fn> };
  find: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
  findAll: ReturnType<typeof vi.fn>;
  getInstance: ReturnType<typeof vi.fn>;
  getByPath: ReturnType<typeof vi.fn>;
  getInstancesModes: ReturnType<typeof vi.fn>;
  addInstancesMode: ReturnType<typeof vi.fn>;
  removeInstancesMode: ReturnType<typeof vi.fn>;
}

export function createMockUrso(): MockUrsoResult {
  return {
    helper: createMockHelper(),
    math: createMockMath(),
    time: {
      get: vi.fn(() => Date.now()),
      getUnixtime: vi.fn(() => Math.floor(Date.now() / 1000)),
    },
    logger: createMockLogger(),
    observer: createMockObserver(),
    cache: {
      addTexture: vi.fn(),
      getTexture: vi.fn(),
      addJson: vi.fn(),
      getJson: vi.fn(),
      addAtlas: vi.fn(),
      getAtlas: vi.fn(),
      addAudioSprite: vi.fn(),
      getAudioSprite: vi.fn(),
      addFont: vi.fn(),
      getFont: vi.fn(),
      addBitmapFont: vi.fn(),
      getBitmapFont: vi.fn(),
      addSpine: vi.fn(),
      getSpine: vi.fn(),
      addSpineAtlas: vi.fn(),
      getSpineAtlas: vi.fn(),
      addImage: vi.fn(),
      getImage: vi.fn(),
      addSound: vi.fn(),
      getSound: vi.fn(),
      addHtml: vi.fn(),
      getHtml: vi.fn(),
      clearGlobalAtlas: vi.fn(),
      getGlobalAtlas: vi.fn(() => ({})),
      getFile: vi.fn(),
      addFile: vi.fn(),
      getJsonAtlases: vi.fn(() => ({})),
    },
    config: {
      defaultLogLevel: '0,1,2,3',
      gamePath: '/',
      useBinPath: false,
      appVersion: '1.0',
      mode: 'development',
    },
    objects: {
      destroy: vi.fn(),
      addChild: vi.fn(),
      removeChild: vi.fn(),
      getWorld: vi.fn(() => ({
        _baseObject: { scale: { x: 1, y: 1 } },
      })),
      refreshStyles: vi.fn(),
      create: vi.fn((_model: unknown, _parent?: unknown) => ({
        _baseObject: { width: 100, height: 50, scale: { x: 1, y: -1 }, mask: null, on: vi.fn().mockReturnThis() },
        anchorX: 0,
        anchorY: 0,
        text: '',
        x: 0,
        y: 0,
      })),
    },
    scenes: {
      generateTexture: vi.fn(),
      timeScale: 1,
      display: vi.fn(),
    },
    statesManager: {
      runAction: vi.fn(),
      terminateAction: vi.fn(),
    },
    localData: {
      get: vi.fn(),
      set: vi.fn(),
    },
    device: {
      iOS: false,
      android: false,
      desktop: true,
      chrome: true,
      chromeVersion: 100,
      firefox: false,
      safari: false,
      touch: false,
      webGL: true,
      canvas: true,
      webAudio: true,
      pixelRatio: 1,
    },
    events: UrsoEvent,
    types: {
      assets: AssetTypeId,
      objects: ObjectTypeId,
    },
    i18n: {
      get: vi.fn((localeId: string) => localeId),
    },
    find: vi.fn(() => []),
    findOne: vi.fn(() => null),
    findAll: vi.fn(() => []),
    getInstance: vi.fn(),
    getByPath: vi.fn(),
    getInstancesModes: vi.fn(() => []),
    addInstancesMode: vi.fn(),
    removeInstancesMode: vi.fn(),
  };
}

// ============================================================================
// Global setup: set window.Urso and window.log before each test
// ============================================================================

const mockUrso = createMockUrso();

// Assign to global window
(globalThis as Record<string, unknown>).Urso = mockUrso;
(globalThis as Record<string, unknown>).log = vi.fn();

// UrsoUtils global (used by audiosprite for Howler.codecs)
(globalThis as Record<string, unknown>).UrsoUtils = {
  Howler: {
    codecs: vi.fn((codec: string) => codec === 'ogg' || codec === 'mp3'),
  },
};

// Make createMockUrso available globally in tests
declare global {
  function createMockUrso(): MockUrsoResult;
}
(globalThis as Record<string, unknown>).createMockUrso = createMockUrso;

// ============================================================================
// PIXI Global (JS source uses window.PIXI)
// ============================================================================

import * as PIXI from './__mocks__/pixi';
(globalThis as Record<string, unknown>).PIXI = PIXI;

// ============================================================================
// Custom matcher: toBeNoValue() — accepts both null (TS) and false (JS)
// ============================================================================

interface ToBeNoValueResult {
  pass: boolean;
  message: () => string;
}

expect.extend({
  toBeNoValue(received: unknown): ToBeNoValueResult {
    const pass = received === null || received === false;
    return {
      pass,
      message: () =>
        `expected ${JSON.stringify(received)} ${pass ? 'not ' : ''}to be null or false (no-value)`,
    };
  },
});

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion {
    toBeNoValue(): void;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining {
    toBeNoValue(): void;
  }
}
