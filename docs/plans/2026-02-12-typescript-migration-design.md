# @urso/core TypeScript Migration Design

## Decisions

| Decision | Choice |
|----------|--------|
| Test framework | Vitest (Vite-native, Jest-compatible API) |
| TS output directory | `src/ts/` (JS remains in `src/js/` as reference) |
| Test directory | `test/` (mirrors `src/ts/` structure) |
| TypeScript strictness | `strict: true` |
| Phasing | Phase 1: TS + types + typed `window.Urso`. Phase 2: refactor to direct imports |
| Test coverage | Full (121 test files, one per source file) |
| Types location | Single file `src/ts/types.ts` |
| No separate `.d.ts` files | All types inline in `.ts` files + `types.ts` |
| `null` over `false` | Use `null` for "no value" (not `false`) |
| No `any` | Zero `any` in codebase. `unknown` or generics where type is open |
| PIXI types | Use concrete types from `pixi.js` package |

---

## Project Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src/ts/**/*", "test/**/*"]
}
```

### vite.config.ts

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/ts/index.ts'),
      formats: ['es'],
      fileName: () => 'js/index.js',
    },
    outDir: 'build',
    minify: false,
    sourcemap: true,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    alias: {
      'pixi.js': resolve(__dirname, 'test/__mocks__/pixi.ts'),
      'gsap': resolve(__dirname, 'test/__mocks__/gsap.ts'),
      'howler': resolve(__dirname, 'test/__mocks__/howler.ts'),
    },
    coverage: {
      provider: 'v8',
      include: ['src/ts/**/*.ts'],
      exclude: ['src/ts/types.ts', 'src/ts/globals.ts'],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

### package.json additions

```json
{
  "devDependencies": {
    "typescript": "^5.x",
    "vitest": "^3.x",
    "@vitest/coverage-v8": "^3.x",
    "jsdom": "^25.x"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## Directory Structure

```
src/ts/
  types.ts
  globals.ts          (Phase 1 only - typed window.Urso)
  index.ts
  app.ts
  config/
    load.ts
    main.ts
  lib/
    helper.ts
    math.ts
    cache.ts
    composition.ts
    device.ts
    loader.ts
    localData.ts
    logger.ts
    objectPool.ts
    time.ts
    tween.ts
  modules/
    observer/
      controller.ts
      events.ts
    objects/
      baseModel.ts
      controller.ts
      service.ts
      cache.ts
      config.ts
      find.ts
      pool.ts
      proxy.ts
      propertyAdapter.ts
      selector.ts
      styles.ts
      models/
        bitmapText.ts
        button.ts
        buttonComposite.ts
        checkbox.ts
        collection.ts
        component.ts
        container.ts
        emitterFx.ts
        graphics.ts
        group.ts
        hitArea.ts
        image.ts
        imagesAnimation.ts
        mask.ts
        nineSlicePlane.ts
        slider.ts
        spine.ts
        text.ts
        toggle.ts
        world.ts
    assets/
      baseModel.ts
      controller.ts
      service.ts
      config.ts
      models/
        atlas.ts
        audiosprite.ts
        bitmapFont.ts
        container.ts
        font.ts
        html.ts
        image.ts
        json.ts
        jsonAtlas.ts
        sound.ts
        spine.ts
        spineAtlas.ts
    statesManager/
      controller.ts
      action.ts
      all.ts
      race.ts
      sequence.ts
      configStates.ts
      helper.ts
      functionsStorage.ts
    scenes/
      controller.ts
      service.ts
      model.ts
      pixiWrapper.ts
      resolutions.ts
      resolutionsConfig.ts
    template/
      controller.ts
      service.ts
      model.ts
      types.ts
    transport/
      controller.ts
      service.ts
      baseConnectionType.ts
      config.ts
      decorator.ts
      connectionTypes/
        websocket.ts
        xhr.ts
    soundManager/
      controller.ts
      soundSprite.ts
    i18n/
      config.ts
      controller.ts
    instances/
      controller.ts
    logic/
      main.ts
      controller.ts
      sounds.ts
      config/
        sounds.ts
  components/
    base/
      controller.ts
    debug/
      controller.ts
      coords.ts
      fps.ts
      template.ts
      timescale.ts
    deviceRotate/
      controller.ts
    editor/
      controller.ts
      api.ts
    fullscreen/
      controller.ts
      android.ts
      desktop.ts
      ios.ts
    layersSwitcher/
      controller.ts
      config.ts
    loader/
      controller.ts
      template.ts
    soundInitialPopup/
      controller.ts
      template.ts
    stateDriven/
      controller.ts
  extra/
    main.ts
    browserEvents.ts
    pixiPatch.ts

test/
  setup.ts
  __mocks__/
    pixi.ts
    gsap.ts
    howler.ts
  lib/
    helper.test.ts
    math.test.ts
    cache.test.ts
    composition.test.ts
    device.test.ts
    loader.test.ts
    localData.test.ts
    logger.test.ts
    objectPool.test.ts
    time.test.ts
    tween.test.ts
  modules/
    observer/
      controller.test.ts
      events.test.ts
    objects/
      baseModel.test.ts
      controller.test.ts
      service.test.ts
      cache.test.ts
      config.test.ts
      find.test.ts
      pool.test.ts
      proxy.test.ts
      propertyAdapter.test.ts
      selector.test.ts
      styles.test.ts
      models/
        (20 test files, one per model)
    assets/
      baseModel.test.ts
      controller.test.ts
      service.test.ts
      config.test.ts
      models/
        (12 test files, one per model)
    statesManager/
      controller.test.ts
      action.test.ts
      all.test.ts
      race.test.ts
      sequence.test.ts
      configStates.test.ts
      helper.test.ts
      functionsStorage.test.ts
    scenes/
      controller.test.ts
      service.test.ts
      model.test.ts
      pixiWrapper.test.ts
      resolutions.test.ts
      resolutionsConfig.test.ts
    template/
      controller.test.ts
      service.test.ts
      model.test.ts
      types.test.ts
    transport/
      controller.test.ts
      service.test.ts
      baseConnectionType.test.ts
      config.test.ts
      decorator.test.ts
      connectionTypes/
        websocket.test.ts
        xhr.test.ts
    soundManager/
      controller.test.ts
      soundSprite.test.ts
    i18n/
      config.test.ts
      controller.test.ts
    instances/
      controller.test.ts
    logic/
      main.test.ts
      controller.test.ts
      sounds.test.ts
      config/
        sounds.test.ts
  components/
    base/
      controller.test.ts
    debug/
      controller.test.ts
      coords.test.ts
      fps.test.ts
      template.test.ts
      timescale.test.ts
    deviceRotate/
      controller.test.ts
    editor/
      controller.test.ts
      api.test.ts
    fullscreen/
      controller.test.ts
      android.test.ts
      desktop.test.ts
      ios.test.ts
    layersSwitcher/
      controller.test.ts
      config.test.ts
    loader/
      controller.test.ts
      template.test.ts
    soundInitialPopup/
      controller.test.ts
      template.test.ts
    stateDriven/
      controller.test.ts
  config/
    load.test.ts
    main.test.ts
  extra/
    main.test.ts
    browserEvents.test.ts
    pixiPatch.test.ts
  app.test.ts
  index.test.ts
```

---

## types.ts

```ts
// =============================================================================
// types.ts — All types, interfaces and enums for @urso/core
// =============================================================================

import type { Container, Texture, Transform } from 'pixi.js';
import type { Tween } from 'gsap';

// =============================================================================
// ENUMS
// =============================================================================

export enum AssetTypeId {
  ATLAS = 1,
  AUDIOSPRITE = 2,
  BITMAPFONT = 3,
  CONTAINER = 4,
  FONT = 5,
  IMAGE = 6,
  JSON = 7,
  JSONATLAS = 8,
  SOUND = 9,
  SPINE = 10,
  SPINEATLAS = 11,
  HTML = 100,
}

export enum ObjectTypeId {
  BITMAPTEXT = 2,
  BUTTON = 3,
  BUTTONCOMPOSITE = 4,
  CHECKBOX = 5,
  COLLECTION = 6,
  COMPONENT = 7,
  CONTAINER = 8,
  DRAGCONTAINER = 9,
  EMITTER = 10,
  EMITTERFX = 11,
  GRAPHICS = 12,
  GROUP = 13,
  HITAREA = 14,
  IMAGE = 15,
  IMAGESANIMATION = 16,
  MASK = 17,
  NINESLICEPLANE = 18,
  SCROLLBOX = 19,
  SLIDER = 20,
  SPINE = 21,
  TEXT = 22,
  TEXTINPUT = 23,
  TOGGLE = 24,
  WORLD = 25,
}

export enum AlignX {
  Left = 'left',
  Right = 'right',
  Center = 'center',
}

export enum AlignY {
  Top = 'top',
  Bottom = 'bottom',
  Center = 'center',
}

export enum StretchingType {
  Inscribed = 'inscribed',
  Circumscribed = 'circumscribed',
}

export enum SelectorPropertyType {
  Id = 'id',
  Name = 'name',
  Class = 'class',
}

export enum ScreenOrientation {
  Landscape = 'landscape',
  Portrait = 'portrait',
}

export enum TransportConnectionType {
  Websocket = 'websocket',
  Xhr = 'xhr',
}

export enum SoundAction {
  Play = 'play',
  Stop = 'stop',
  Pause = 'pause',
  Resume = 'resume',
  Mute = 'mute',
  Unmute = 'unmute',
}

export type AudioCodec = 'ogg' | 'm4a' | 'mp3' | 'wav';

export enum UrsoEvent {
  COMPONENTS_FULLSCREEN_CHANGE = 'components.fullscreen.change',
  COMPONENTS_FULLSCREEN_SWITCH = 'components.fullscreen.switch',
  COMPONENTS_LAYERS_SWITCHER_SWITCH = 'components.layersSwitcher.switch',
  EXTRA_BROWSEREVENTS_KEYPRESS_EVENT = 'extra.browserEvents.window.keypress.event',
  EXTRA_BROWSEREVENTS_POINTER_EVENT = 'extra.browserEvents.window.pointer.event',
  EXTRA_BROWSEREVENTS_WINDOW_PRE_RESIZE = 'extra.browserEvents.window.pre.resize',
  EXTRA_BROWSEREVENTS_WINDOW_RESIZE = 'extra.browserEvents.window.resize',
  EXTRA_BROWSEREVENTS_WINDOW_VISIBILITYCHANGE = 'extra.browserEvents.window.visibilitychange',
  MODULES_ASSETS_GROUP_LOADED = 'modules.assets.group.loaded',
  MODULES_ASSETS_LOAD_PROGRESS = 'modules.assets.load.progress',
  MODULES_ASSETS_LAZYLOAD_FINISHED = 'modules.assets.lazyLoad.finished',
  MODULES_I18N_NEW_LOCALE_WAS_SET = 'modules.i18n.new.locale.was.set',
  MODULES_INSTANCES_MODES_CHANGED = 'modules.instances.modes.changed',
  MODULES_OBJECTS_BUTTON_PRESS = 'modules.objects.button.press',
  MODULES_OBJECTS_HIT_AREA_PRESS = 'modules.objects.hitArea.press',
  MODULES_OBJECTS_SLIDER_HANDLE_MOVE = 'modules.objects.slider.handleMove',
  MODULES_OBJECTS_SLIDER_HANDLE_DROP = 'modules.objects.slider.handleDrop',
  MODULES_OBJECTS_SPINE_EVENT = 'modules.objects.spine.event',
  MODULES_OBJECTS_TOGGLE_PRESS = 'modules.objects.toggle.press',
  MODULES_OBJECTS_TEXTINPUT_BLUR = 'modules.objects.textinput.blur',
  MODULES_OBJECTS_TEXTINPUT_INPUT = 'modules.objects.textinput.input',
  MODULES_OBJECTS_CHECKBOX_PRESS = 'modules.objects.checkbox.press',
  MODULES_LOGIC_SOUNDS_DO = 'modules.soundManager.do',
  MODULES_SOUND_MANAGER_CONTEXT_UNLOCKED = 'modules.soundManager.contextUnlocked',
  MODULES_SOUND_MANAGER_UPDATE_CFG = 'modules.soundManager.updateCfg',
  MODULES_SOUND_MANAGER_SET_GLOBAL_VOLUME = 'modules.soundManager.setGlobalVolume',
  MODULES_STATES_MANAGER_STATE_CHANGE = 'modules.statesManager.stateChange',
  MODULES_STATES_MANAGER_ACTION_START = 'modules.statesManager.actionStart',
  MODULES_STATES_MANAGER_ACTION_FINISH = 'modules.statesManager.actionFinish',
  MODULES_STATES_MANAGER_STOP = 'modules.statesManager.stop',
  MODULES_SCENES_ORIENTATION_CHANGE = 'modules.scenes.orientation.change',
  MODULES_SCENES_NEW_RESOLUTION = 'modules.scenes.newResolution',
  MODULES_SCENES_NEW_SCENE_INIT = 'modules.scenes.newSceneInit',
  MODULES_SCENES_DISPLAY_START = 'modules.scenes.display.start',
  MODULES_SCENES_DISPLAY_FINISHED = 'modules.scenes.display.finished',
  MODULES_SCENES_MOUSE_NEW_POSITION = 'modules.scenes.mouse.newPosition',
  MODULES_SCENES_PAUSE = 'modules.scenes.pause',
  MODULES_SCENES_RESUME = 'modules.scenes.resume',
  MODULES_SCENES_UPDATE = 'modules.scenes.update',
}

// =============================================================================
// GEOMETRY & COLOR
// =============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface RGBA {
  alpha: number;
  red: number;
  green: number;
  blue: number;
}

export interface RGB {
  red: number;
  green: number;
  blue: number;
}

// =============================================================================
// OBSERVER
// =============================================================================

export type ObserverCallback = ((params?: unknown) => void) & {
  _ouid?: string;
};

export interface ObserverMap {
  [eventName: string]: {
    [uid: string]: ObserverCallback;
  };
}

// =============================================================================
// OBJECTS
// =============================================================================

export interface ObjectModelParams<TCustom = Record<string, unknown>> {
  type: ObjectTypeId | null;
  id: string | null;
  name: string | null;
  class: string | null;
  x: number | string;
  y: number | string;
  z: number;
  anchorX: number;
  anchorY: number;
  scaleX: number;
  scaleY: number;
  alignX: AlignX;
  alignY: AlignY;
  width: number | string | null;
  height: number | string | null;
  maxWidth: number | null;
  maxHeight: number | null;
  stretchingType: StretchingType | null;
  angle: number;
  visible: boolean;
  alpha: number;
  blendMode: number;
  ignoreParentMask: boolean;
  transitionDelay: number | null;
  transitionDuration: number | null;
  transitionProperty: string | null;
  append: boolean;
  custom: TCustom;
  _uid?: string | null;
}

export interface ObjectTransitions {
  tweens: Record<string, Tween>;
}

export type StylesMap = Record<string, Partial<ObjectModelParams>>;

// =============================================================================
// SELECTOR
// =============================================================================

export interface SelectorProperty {
  type: SelectorPropertyType;
  value: string;
}

export type ParsedSelector = SelectorProperty[][];

// =============================================================================
// ASSETS
// =============================================================================

export interface AssetModelParams {
  id: string | null;
  type: AssetTypeId | null;
  key: string | null;
  path: string | null;
  useBinPath: boolean;
  loadingGroup: string | null;
  placeHolder: AssetModelParams | null;
}

// =============================================================================
// STATES MANAGER
// =============================================================================

export interface SingleActionConfig {
  action: string;
}

export interface AllActionConfig {
  all: StateActionConfig[];
}

export interface RaceActionConfig {
  race: StateActionConfig[];
}

export interface SequenceActionConfig {
  sequence: StateActionConfig[];
}

export type StateActionConfig =
  | SingleActionConfig
  | AllActionConfig
  | RaceActionConfig
  | SequenceActionConfig;

export interface StateDefinition {
  nextState?: string[];
  callLimit?: number;
}

export type StatesConfig = Record<string, StateActionConfig & StateDefinition>;

export type GuardFunction = () => boolean;
export type RunFunction = (onFinish: () => void) => void;
export type TerminateFunction = () => void;

export interface StateIterator {
  next: () => string;
}

// =============================================================================
// COMPONENT SYSTEM
// =============================================================================

export type ObjectBaseModel = import('./modules/objects/baseModel').default;

export interface ComponentCommon {
  find: ((selector: string) => ObjectBaseModel[]) | null;
  findAll: ((selector: string) => ObjectBaseModel[]) | null;
  findOne: ((selector: string) => ObjectBaseModel | null) | null;
  object: Container | null;
}

export interface ComponentTemplate {
  styles: StylesMap;
  assets: Partial<AssetModelParams>[];
  objects: Partial<ObjectModelParams>[];
}

export type OptionsModel = Record<string, 'number' | 'string' | 'boolean' | 'object'>;

// =============================================================================
// TEMPLATE
// =============================================================================

export interface TemplateModel {
  styles: StylesMap;
  assets: Partial<AssetModelParams>[];
  objects: Partial<ObjectModelParams>[];
  components: string[];
  _templatePath: string | null;
}

export interface TemplateTypesList {
  assets: Record<string, AssetTypeId>;
  objects: Record<string, ObjectTypeId>;
}

// =============================================================================
// TRANSPORT
// =============================================================================

export interface TransportConfig {
  autoReconnect: boolean;
  reconnectTimeout: number;
  type: TransportConnectionType;
  host: string | null;
}

export interface TransportMessage<T = Record<string, unknown>> {
  action: string;
  data: T;
}

export type TransportCallback<T = unknown> = (response: T) => void;

export interface TransportCallbackMap {
  [event: string]: TransportCallback;
}

export interface TransportConnectionParams {
  callbacks: TransportCallbackMap;
  host: string | null;
}

// =============================================================================
// SCENES
// =============================================================================

export interface ResolutionConfig {
  name: string;
  width: number;
  height: number;
  orientation: ScreenOrientation;
  adaptive: boolean;
}

export interface AdaptiveLimits {
  min: number;
  max: number;
}

export interface AdaptiveDeviceConfig {
  supported: boolean;
  limits: {
    landscape: AdaptiveLimits;
    portrait: AdaptiveLimits;
  };
}

export interface AdaptiveConfig {
  desktop: AdaptiveDeviceConfig;
  mobile: AdaptiveDeviceConfig;
}

// =============================================================================
// SOUND MANAGER
// =============================================================================

export interface SoundSpriteRange {
  [spriteName: string]: [number, number];
}

export interface SoundSpriteParams {
  sprite: SoundSpriteRange;
  name: string;
  audiosprite: string;
  codec: AudioCodec | null;
}

export interface SoundDoCommand {
  action: SoundAction;
  name: string;
  behavior: string | undefined;
}

export interface SoundsCfgData {
  eventsCfg: Record<string, Record<string, string>>;
  sounds: Record<string, {
    audiosprite: string;
    json: { sprite: SoundSpriteRange };
  }>;
}

// =============================================================================
// I18N
// =============================================================================

export type I18nLocalesMap = Record<string, string>;

// =============================================================================
// DEVICE
// =============================================================================

export interface DeviceCapabilities {
  deviceReadyAt: number;
  initialized: boolean;
  desktop: boolean;
  iOS: boolean;
  android: boolean;
  chromeOS: boolean;
  linux: boolean;
  macOS: boolean;
  windows: boolean;
  windowsPhone: boolean;
  cocoonJS: boolean;
  cocoonJSApp: boolean;
  cordova: boolean;
  node: boolean;
  nodeWebkit: boolean;
  electron: boolean;
  ejecta: boolean;
  crosswalk: boolean;
  vita?: boolean;
  kindle?: boolean;
  canvas: boolean;
  canvasBitBltShift: boolean | null;
  webGL: boolean;
  file: boolean;
  fileSystem: boolean;
  localStorage: boolean;
  worker: boolean;
  css3D: boolean;
  pointerLock: boolean;
  typedArray: boolean;
  vibration: boolean;
  getUserMedia: boolean;
  quirksMode: boolean;
  webP: boolean;
  touch: boolean;
  mspointer: boolean;
  wheelEvent: 'wheel' | 'mousewheel' | 'DOMMouseScroll' | null;
  arora: boolean;
  chrome: boolean;
  chromeVersion: number;
  epiphany: boolean;
  firefox: boolean;
  firefoxVersion: number;
  ie: boolean;
  ieVersion: number;
  trident: boolean;
  tridentVersion: number;
  mobileSafari: boolean;
  midori: boolean;
  opera: boolean;
  safari: boolean;
  webApp: boolean;
  silk: boolean;
  audioData: boolean;
  webAudio: boolean;
  ogg: boolean;
  opus: boolean;
  mp3: boolean;
  wav: boolean;
  m4a: boolean;
  webm: boolean;
  oggVideo: boolean;
  h264Video: boolean;
  mp4Video: boolean;
  webmVideo: boolean;
  vp9Video: boolean;
  hlsVideo: boolean;
  iPhone: boolean;
  iPhone4: boolean;
  iPhone5: boolean;
  iPad: boolean;
  pixelRatio: number;
  littleEndian: boolean;
  LITTLE_ENDIAN: boolean;
  support32bit: boolean;
  fullscreen: boolean;
  requestFullscreen: string;
  cancelFullscreen: string;
  fullscreenKeyboard: boolean;
  ScreenOrientation: {
    LANDSCAPE: 'landscape';
    PORTRAIT: 'portrait';
  };
}

export interface DeviceInstance extends DeviceCapabilities {
  whenReady(callback: (device: DeviceInstance) => void, context?: object, nonPrimer?: boolean): void;
  canPlayAudio(type: 'mp3' | 'ogg' | 'm4a' | 'opus' | 'wav' | 'webm'): boolean;
  canPlayVideo(type: 'mp4' | 'ogg' | 'ogv' | 'webm' | 'mpeg'): boolean;
  isConsoleOpen(): boolean;
  isAndroidStockBrowser(): boolean;
}

// =============================================================================
// HELPER
// =============================================================================

export type DotPath = string;

export interface PropertyDescriptorReactive<T> {
  get?: () => T;
  set?: (v: T) => void;
  configurable?: boolean;
  enumerable?: boolean;
}

export type RecursiveGetResult<TDefault> = TDefault extends undefined
  ? unknown
  : TDefault;

// =============================================================================
// STYLES CACHE
// =============================================================================

export interface StylesCacheEntry {
  [uid: string]: ObjectBaseModel;
}

export type StylesCache = Record<string, StylesCacheEntry>;
```

---

## Module Conversion Patterns

### Pattern: Controller with typed private/public

```ts
import { ObserverCallback, ObserverMap } from '../types';

class ModulesObserverController {
    private _observers: ObserverMap = {};
    private _prefix: string = '';
    private readonly _prefixDelimiter: string = '_@';
    private _counter: number = 0;

    public fire(eventName: string, params?: unknown, delay?: number): void { ... }
    public add(eventName: string, callback: ObserverCallback, global?: boolean): void { ... }
    public remove(eventName: string, callback: ObserverCallback, global?: boolean): void { ... }
    public setPrefix(p: string): void { ... }
    public clearAllLocal(): void { ... }
    public clear(): boolean { ... }

    private _getUid(callback: ObserverCallback): string { ... }
    private _addLocal(name: string, callback: ObserverCallback): void { ... }
    private _removeLocal(name: string, callback: ObserverCallback): void { ... }
    private _fireLocal(name: string, params?: unknown): boolean { ... }
    private _getLocalSuffix(): string { ... }
}
```

### Pattern: BaseModel with PIXI types

```ts
import type { Container, Texture, Transform } from 'pixi.js';
import { ObjectModelParams, ObjectTypeId, AlignX, AlignY, Point, Size } from '../types';

export default class ModulesObjectsBaseModel {
    public simpleClass: boolean = true;
    public parent: ModulesObjectsBaseModel | null = null;
    public proxyObject: Container | null = null;
    public destroyed: boolean = false;

    public type: ObjectTypeId | null = null;
    public id: string | null = null;
    public name: string | null = null;
    public class: string | null = null;
    public x: number | string = 0;
    public y: number | string = 0;
    // ... all properties typed

    private _originalModel: Partial<ObjectModelParams>;
    private _classes: string[] = [];
    private _styles: Record<string, Partial<ObjectModelParams>> = {};
    private _baseObject: Container | null = null;
    private _uid: string | null = null;

    constructor(params: Partial<ObjectModelParams>) { ... }
    public setupParams(params: Partial<ObjectModelParams>): void { ... }
    public destroy(doNotRefreshStylesFlag?: boolean): void { ... }
    public toGlobal(): Point { ... }
    public toLocal(from?: ModulesObjectsBaseModel): Point { ... }
    public getAbsoluteSize(): Size { ... }
    public generateTexture(key?: string): Texture { ... }
}
```

### Pattern: StatesManager Action hierarchy

```ts
class ModulesStatesManagerAction {
    public name: string;
    public finished: boolean = false;
    protected _running: boolean = false;
    protected _terminating: boolean = false;
    protected _forceDestroying: boolean = false;
    protected _onFinishCallback: (() => void) | null = null;
    protected _startTime: number = 0;

    constructor(name: string) { ... }
    public guard(): boolean { ... }
    public run(onFinishCallback: () => void): void { ... }
    public terminate(): void { ... }
    public forceDestroy(): void { ... }
    protected _onFinish(): void { ... }
}

// race.ts extends Action, adds _actions: ModulesStatesManagerAction[]
// all.ts extends Race, overrides guard() and _actionSuccessHandler()
// sequence.ts extends All, overrides run() and _checkFinish()
```

### Conversion rules

1. All `_` prefixed methods -> `private` or `protected` (protected if overridden in subclass)
2. All public methods -> explicit `public`
3. `singleton = true` -> `public readonly singleton: boolean = true`
4. `getInstance`/`getByPath` calls typed via generic: `this.getInstance<SomeType>('Path')`
5. `Urso.helper.recursiveGet` typed with overloads
6. All `false` as "no value" -> `null`
7. PIXI objects -> concrete `Container`, `Texture`, `Sprite` etc
8. GSAP tweens -> `Tween` from gsap
9. Zero `any` in entire codebase

---

## globals.ts (Phase 1 only)

Temporary file to type `window.Urso` while modules still reference it.
Deleted entirely in Phase 2 when all references replaced with direct imports.

```ts
import type { UrsoEvent } from './types';
// import all controller/service types...

interface UrsoNamespace {
  events: typeof UrsoEvent;
  config: Record<string, unknown>;
  observer: ModulesObserverController;
  helper: LibHelper;
  logger: LibLogger;
  math: LibMath;
  cache: LibCache;
  time: LibTime;
  device: DeviceInstance;
  objects: ModulesObjectsController;
  scenes: ModulesScenesController;
  statesManager: ModulesStatesManagerController;
  template: ModulesTemplateController;
  localData: LibLocalData;
  types: TemplateTypesList;

  getInstance<T = unknown>(path: string, ...args: unknown[]): T;
  getByPath<T = unknown>(path: string): T;
  runGame(config: Record<string, unknown>): void;
}

declare global {
  var Urso: UrsoNamespace;
  function log(...args: unknown[]): void;
}
```

---

## Testing Strategy

### Test categories

| Category | Modules | Mocking |
|----------|---------|---------|
| Pure logic | helper, math, selector, objectPool, time, functionsStorage, resolutionsConfig | None |
| Observer-dependent | Controllers that subscribe to events | Mock observer |
| PIXI-dependent | Object models, scenes, pixiWrapper | Mock pixi.js |
| DOM-dependent | device, fullscreen, browserEvents | jsdom |
| External libs | soundManager, tween | Mock Howler, GSAP |

### Mock files

**test/__mocks__/pixi.ts** — Container, Sprite, Text, Graphics, Application, Texture with vi.fn()

**test/__mocks__/gsap.ts** — gsap.to/from/fromTo/killTweensOf returning mock Tween

**test/__mocks__/howler.ts** — Howl class with play/stop/pause/volume, Howler.codecs

### test/setup.ts

Global setup creating `createMockUrso()` function providing:
- Typed mock observer (add/remove/fire with callback tracking)
- Real LibHelper instance (pure logic, no mocking needed)
- Mock logger (vi.fn() for error/warn/log)
- Mock cache, config, and other subsystems

### Coverage target

- Statements: 80%
- Branches: 70%
- Functions: 80%
- Lines: 80%

---

## Implementation Plan

### Phase 0: Infrastructure

| Step | File | Action |
|------|------|--------|
| 0.1 | `tsconfig.json` | Create TypeScript config |
| 0.2 | `vite.config.ts` | Rename .js to .ts, add test section |
| 0.3 | `package.json` | Install typescript, vitest, @vitest/coverage-v8, jsdom. Add scripts |
| 0.4 | `src/ts/types.ts` | All enums, interfaces, types |
| 0.5 | `src/ts/globals.ts` | Temporary typed window.Urso |
| 0.6 | `test/setup.ts` | Global setup with createMockUrso() |
| 0.7 | `test/__mocks__/pixi.ts` | PIXI mocks |
| 0.8 | `test/__mocks__/gsap.ts` | GSAP mocks |
| 0.9 | `test/__mocks__/howler.ts` | Howler mocks |
| 0.10 | Verify | `npm run typecheck` + `npm run test` both green |

### Phase 1: Convert + Test (bottom-up by dependency)

#### Block 1: Utilities (no dependencies)

| Step | Source | Test |
|------|--------|------|
| 1.1 | `lib/helper.ts` | `test/lib/helper.test.ts` |
| 1.2 | `lib/math.ts` | `test/lib/math.test.ts` |
| 1.3 | `lib/time.ts` | `test/lib/time.test.ts` |
| 1.4 | `lib/logger.ts` | `test/lib/logger.test.ts` |
| 1.5 | `lib/cache.ts` | `test/lib/cache.test.ts` |
| 1.6 | `lib/objectPool.ts` | `test/lib/objectPool.test.ts` |
| 1.7 | `lib/localData.ts` | `test/lib/localData.test.ts` |
| 1.8 | `lib/composition.ts` | `test/lib/composition.test.ts` |
| 1.9 | `lib/tween.ts` | `test/lib/tween.test.ts` |
| 1.10 | `lib/device.ts` | `test/lib/device.test.ts` |
| 1.11 | `lib/loader.ts` | `test/lib/loader.test.ts` |

Checkpoint: typecheck + test green (11 files)

#### Block 2: Observer + Template Types (core dependencies)

| Step | Source | Test |
|------|--------|------|
| 2.1 | `modules/observer/events.ts` | `test/modules/observer/events.test.ts` |
| 2.2 | `modules/observer/controller.ts` | `test/modules/observer/controller.test.ts` |
| 2.3 | `modules/template/types.ts` | `test/modules/template/types.test.ts` |
| 2.4 | `modules/instances/controller.ts` | `test/modules/instances/controller.test.ts` |

Checkpoint: event bus and instance resolver working

#### Block 3: Objects core (11 files)

| Step | Source |
|------|--------|
| 3.1 | `modules/objects/baseModel.ts` + test |
| 3.2 | `modules/objects/selector.ts` + test |
| 3.3 | `modules/objects/cache.ts` + test |
| 3.4 | `modules/objects/find.ts` + test |
| 3.5 | `modules/objects/pool.ts` + test |
| 3.6 | `modules/objects/proxy.ts` + test |
| 3.7 | `modules/objects/propertyAdapter.ts` + test |
| 3.8 | `modules/objects/styles.ts` + test |
| 3.9 | `modules/objects/config.ts` + test |
| 3.10 | `modules/objects/service.ts` + test |
| 3.11 | `modules/objects/controller.ts` + test |

#### Block 4: Object models (20 files)

container, image, text, bitmapText, button, buttonComposite, checkbox, toggle, slider, spine, graphics, hitArea, mask, nineSlicePlane, imagesAnimation, emitterFx, collection, component, group, world — each converted + tested.

Checkpoint: entire object system converted and tested

#### Block 5: Assets (17 files)

| Step | Source |
|------|--------|
| 5.1 | `modules/assets/baseModel.ts` + test |
| 5.2 | 12 asset models + tests |
| 5.3 | `modules/assets/config.ts` + test |
| 5.4 | `modules/assets/service.ts` + test |
| 5.5 | `modules/assets/controller.ts` + test |

#### Block 6: States Manager (8 files)

| Step | Source |
|------|--------|
| 6.1 | `statesManager/functionsStorage.ts` + test |
| 6.2 | `statesManager/action.ts` + test |
| 6.3 | `statesManager/race.ts` + test |
| 6.4 | `statesManager/all.ts` + test |
| 6.5 | `statesManager/sequence.ts` + test |
| 6.6 | `statesManager/helper.ts` + test |
| 6.7 | `statesManager/configStates.ts` + test |
| 6.8 | `statesManager/controller.ts` + test |

#### Block 7: Scenes, Template, I18n (11 files)

scenes (6), template (3), i18n (2) — each converted + tested

#### Block 8: Transport, Sound, Logic (13 files)

transport (7), soundManager (2), logic (4) — each converted + tested

#### Block 9: Components (18 files)

base (1), debug (5), fullscreen (4), loader (2), editor (2), layersSwitcher (2), soundInitialPopup (2), deviceRotate (1), stateDriven (1) — each converted + tested

#### Block 10: Init and build (7 files + verification)

| Step | Action |
|------|--------|
| 10.1 | `extra/browserEvents.ts` + test |
| 10.2 | `extra/pixiPatch.ts` + test |
| 10.3 | `extra/main.ts` + test |
| 10.4 | `config/main.ts` + test |
| 10.5 | `config/load.ts` + test |
| 10.6 | `app.ts` + test |
| 10.7 | `index.ts` + test |
| 10.8 | Update vite.config.ts entry to `src/ts/index.ts` |
| 10.9 | `npm run build:prod` — verify build |
| 10.10 | `npm run test:coverage` — verify coverage >= 80% |

---

## Totals

| Metric | Value |
|--------|-------|
| TS source files | 123 (121 + types.ts + globals.ts) |
| Test files | 125 (121 + setup.ts + 3 mocks) |
| Work blocks | 10 |
| Checkpoints | After each block |
