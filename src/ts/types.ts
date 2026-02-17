// =============================================================================
// types.ts -- All types, interfaces and enums for @urso/core
// =============================================================================

import type { Container, Texture } from 'pixi.js';

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
// URSO INSTANCE (base interface for all getInstance results)
// =============================================================================

export interface ComponentCommon {
  find: ((selector: string) => ObjectBaseModel[]) | null;
  findAll: ((selector: string) => ObjectBaseModel[]) | null;
  findOne: ((selector: string) => ObjectBaseModel | null) | null;
  object: Container | null;
}

export interface UrsoInstance {
  addListener: (event: string, callback: ObserverCallback, isGlobal?: boolean) => void;
  removeListener: (event: string, callback: ObserverCallback, isGlobal?: boolean) => void;
  emit: (event: string, params?: unknown, delay?: number) => void;
  common: ComponentCommon;
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;
  getByPath: <T = unknown>(path: string) => T;
}

// =============================================================================
// OBJECTS
// =============================================================================

/**
 * Parameters for object models.
 * Note: The `class` property is valid in interfaces but class bodies must use
 * bracket notation `this['class']` to access it since `class` is a reserved word.
 */
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
  tweens: Record<string, unknown>;
}

export type StylesMap = Record<string, Partial<ObjectModelParams>>;

// =============================================================================
// OBJECT BASE MODEL (forward reference for circular usage)
// =============================================================================

export interface ObjectBaseModel {
  simpleClass: boolean;
  parent: ObjectBaseModel | null;
  proxyObject: Container | null;
  destroyed: boolean;
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
  custom: Record<string, unknown>;
  _uid?: string | null;
  setupParams: (params: Partial<ObjectModelParams>) => void;
  destroy: (doNotRefreshStylesFlag?: boolean) => void;
  toGlobal: () => Point;
  toLocal: (from?: ObjectBaseModel) => Point;
  getAbsoluteSize: () => Size;
  generateTexture: (key?: string) => Texture;
}

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
