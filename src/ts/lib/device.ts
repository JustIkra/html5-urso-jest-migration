import type { DeviceCapabilities } from '../types';

type AudioType = 'mp3' | 'ogg' | 'm4a' | 'opus' | 'wav' | 'webm';
type VideoType = 'mp4' | 'ogg' | 'ogv' | 'webm' | 'mpeg';

// Helper to access arbitrary properties on browser globals (window, navigator, etc.)
// without double-cast noise on every line
function prop(obj: unknown): Record<string, unknown> {
  return obj as Record<string, unknown>;
}

interface ReadyQueueItem {
  0: (device: LibDeviceInstance) => void;
  1: object | undefined;
}

interface ReadyCheck {
  (this: LibDeviceInstance): void;
  _monitor?: () => void;
  _queue?: ReadyQueueItem[];
}

interface LibDeviceInstance extends DeviceCapabilities {
  _webPTestComplete: boolean;
  _readyCheck: ReadyCheck | null;
  _initialize: (() => void) | null;
  whenReady(callback: (device: LibDeviceInstance) => void, context?: object, nonPrimer?: boolean): void;
  canPlayAudio(type: AudioType): boolean;
  canPlayVideo(type: VideoType): boolean;
  isConsoleOpen(): boolean;
  isAndroidStockBrowser(): boolean;
}

function createDevice(): LibDeviceInstance {
  const device: LibDeviceInstance = {
    deviceReadyAt: 0,
    initialized: false,
    desktop: false,
    iOS: false,
    android: false,
    chromeOS: false,
    linux: false,
    macOS: false,
    windows: false,
    windowsPhone: false,
    cocoonJS: false,
    cocoonJSApp: false,
    cordova: false,
    node: false,
    nodeWebkit: false,
    electron: false,
    ejecta: false,
    crosswalk: false,
    canvas: false,
    canvasBitBltShift: null,
    webGL: false,
    file: false,
    fileSystem: false,
    localStorage: false,
    worker: false,
    css3D: false,
    pointerLock: false,
    typedArray: false,
    vibration: false,
    getUserMedia: true,
    quirksMode: false,
    webP: false,
    touch: false,
    mspointer: false,
    wheelEvent: null,
    arora: false,
    chrome: false,
    chromeVersion: 0,
    epiphany: false,
    firefox: false,
    firefoxVersion: 0,
    ie: false,
    ieVersion: 0,
    trident: false,
    tridentVersion: 0,
    mobileSafari: false,
    midori: false,
    opera: false,
    safari: false,
    webApp: false,
    silk: false,
    audioData: false,
    webAudio: false,
    ogg: false,
    opus: false,
    mp3: false,
    wav: false,
    m4a: false,
    webm: false,
    oggVideo: false,
    h264Video: false,
    mp4Video: false,
    webmVideo: false,
    vp9Video: false,
    hlsVideo: false,
    iPhone: false,
    iPhone4: false,
    iPhone5: false,
    iPad: false,
    pixelRatio: 0,
    littleEndian: false,
    LITTLE_ENDIAN: false,
    support32bit: false,
    fullscreen: false,
    requestFullscreen: '',
    cancelFullscreen: '',
    fullscreenKeyboard: false,
    ScreenOrientation: {
      LANDSCAPE: 'landscape',
      PORTRAIT: 'portrait',
    },

    _webPTestComplete: false,
    _readyCheck: null,
    _initialize: null,

    whenReady(_callback: (device: LibDeviceInstance) => void, _context?: object, _nonPrimer?: boolean): void {
      // implemented below
    },

    canPlayAudio(_type: AudioType): boolean {
      return false;
    },

    canPlayVideo(_type: VideoType): boolean {
      return false;
    },

    isConsoleOpen(): boolean {
      return false;
    },

    isAndroidStockBrowser(): boolean {
      return false;
    },
  };

  // whenReady
  device.whenReady = function (
    this: LibDeviceInstance,
    callback: (device: LibDeviceInstance) => void,
    context?: object,
    nonPrimer?: boolean,
  ): void {
    const readyCheck = this._readyCheck;

    if (this.deviceReadyAt || !readyCheck) {
      callback.call(context, this);
    } else if (readyCheck._monitor || nonPrimer) {
      readyCheck._queue = readyCheck._queue || [];
      readyCheck._queue.push([callback, context]);
    } else {
      readyCheck._monitor = readyCheck.bind(this);
      readyCheck._queue = readyCheck._queue || [];
      readyCheck._queue.push([callback, context]);

      const cordova = typeof prop(window).cordova !== 'undefined';
      const cocoonJS = prop(navigator)['isCocoonJS'];

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        window.setTimeout(readyCheck._monitor, 0);
      } else if (cordova && !cocoonJS) {
        document.addEventListener('deviceready', readyCheck._monitor, false);
      } else {
        document.addEventListener('DOMContentLoaded', readyCheck._monitor, false);
        window.addEventListener('load', readyCheck._monitor, false);
      }
    }
  };

  // _readyCheck
  device._readyCheck = function (this: LibDeviceInstance): void {
    const readyCheck = this._readyCheck;

    if (!readyCheck) return;

    if (!document.body || !this._webPTestComplete) {
      if (readyCheck._monitor) {
        window.setTimeout(readyCheck._monitor, 20);
      }
    } else if (!this.deviceReadyAt) {
      this.deviceReadyAt = Date.now();

      if (readyCheck._monitor) {
        document.removeEventListener('deviceready', readyCheck._monitor);
        document.removeEventListener('DOMContentLoaded', readyCheck._monitor);
        window.removeEventListener('load', readyCheck._monitor);
      }

      if (this._initialize) {
        this._initialize();
      }
      this.initialized = true;

      let item: ReadyQueueItem | undefined;
      while (readyCheck._queue && (item = readyCheck._queue.shift())) {
        const callback = item[0];
        const context = item[1];
        callback.call(context, this);
      }

      this._readyCheck = null;
      this._initialize = null;
    }
  } as ReadyCheck;

  // _initialize
  device._initialize = function (this: LibDeviceInstance): void {
    const dev = this;

    function _checkOS(): void {
      const ua = navigator.userAgent;

      if (/Playstation Vita/.test(ua)) {
        dev.vita = true;
      } else if (/Kindle/.test(ua) || /\bKF[A-Z][A-Z]+/.test(ua) || /Silk.*Mobile Safari/.test(ua)) {
        dev.kindle = true;
      } else if (/Android/.test(ua)) {
        dev.android = true;
      } else if (/CrOS/.test(ua)) {
        dev.chromeOS = true;
      } else if (/iP[ao]d|iPhone/i.test(ua)) {
        dev.iOS = true;
      } else if (/Linux/.test(ua)) {
        dev.linux = true;
      } else if (/Mac OS/.test(ua)) {
        dev.macOS = true;
      } else if (/Windows/.test(ua)) {
        dev.windows = true;
      }

      if (/Windows Phone/i.test(ua) || /IEMobile/i.test(ua)) {
        dev.android = false;
        dev.iOS = false;
        dev.macOS = false;
        dev.windows = true;
        dev.windowsPhone = true;
      }

      const silk = /Silk/.test(ua);

      if (dev.windows || dev.macOS || (dev.linux && !silk) || dev.chromeOS) {
        dev.desktop = true;
      }

      if (dev.windowsPhone || (/Windows NT/i.test(ua) && /Touch/i.test(ua))) {
        dev.desktop = false;
      }
    }

    function _checkFeatures(): void {
      dev.canvas = !!prop(window)['CanvasRenderingContext2D'] || dev.cocoonJS;

      try {
        dev.localStorage = !!localStorage.getItem;
      } catch {
        dev.localStorage = false;
      }

      dev.file = !!prop(window)['File'] && !!prop(window)['FileReader'] && !!prop(window)['FileList'] && !!prop(window)['Blob'];
      dev.fileSystem = !!prop(window)['requestFileSystem'];

      dev.webGL = ((): boolean => {
        try {
          const canvas = document.createElement('canvas');
          prop(canvas).screencanvas = false;
          return !!window.WebGLRenderingContext && !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
          return false;
        }
      })();

      dev.worker = !!prop(window)['Worker'];
      dev.pointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
      dev.quirksMode = document.compatMode !== 'CSS1Compat';

      dev.getUserMedia = dev.getUserMedia && !!prop(navigator).getUserMedia && !!window.URL;

      if (dev.firefox && dev.firefoxVersion < 21) {
        dev.getUserMedia = false;
      }

      if (!dev.iOS && (dev.ie || dev.firefox || dev.chrome)) {
        dev.canvasBitBltShift = true;
      }

      if (dev.safari || dev.mobileSafari) {
        dev.canvasBitBltShift = false;
      }
    }

    function _checkInput(): void {
      if ('ontouchstart' in document.documentElement || (window.navigator.maxTouchPoints && window.navigator.maxTouchPoints >= 1)) {
        dev.touch = true;
      }

      if (prop(navigator).msPointerEnabled || prop(navigator).pointerEnabled) {
        dev.mspointer = true;
      }

      if (!dev.cocoonJS) {
        if ('onwheel' in window || (dev.ie && 'WheelEvent' in window)) {
          dev.wheelEvent = 'wheel';
        } else if ('onmousewheel' in window) {
          dev.wheelEvent = 'mousewheel';
        } else if (dev.firefox && 'MouseScrollEvent' in window) {
          dev.wheelEvent = 'DOMMouseScroll';
        }
      }
    }

    function _checkFullScreenSupport(): void {
      const fs = [
        'requestFullscreen', 'requestFullScreen',
        'webkitRequestFullscreen', 'webkitRequestFullScreen',
        'msRequestFullscreen', 'msRequestFullScreen',
        'mozRequestFullScreen', 'mozRequestFullscreen',
      ];

      const element = document.createElement('div') as unknown as Record<string, unknown>;

      for (let i = 0; i < fs.length; i++) {
        if (element[fs[i]]) {
          dev.fullscreen = true;
          dev.requestFullscreen = fs[i];
          break;
        }
      }

      const cfs = [
        'cancelFullScreen', 'exitFullscreen',
        'webkitCancelFullScreen', 'webkitExitFullscreen',
        'msCancelFullScreen', 'msExitFullscreen',
        'mozCancelFullScreen', 'mozExitFullscreen',
      ];

      if (dev.fullscreen) {
        for (let i = 0; i < cfs.length; i++) {
          if (prop(document)[cfs[i]]) {
            dev.cancelFullscreen = cfs[i];
            break;
          }
        }
      }

      if (prop(window)['Element'] && prop(Element)['ALLOW_KEYBOARD_INPUT']) {
        dev.fullscreenKeyboard = true;
      }
    }

    function _checkBrowser(): void {
      const ua = navigator.userAgent;

      if (/Arora/.test(ua)) {
        dev.arora = true;
      } else if (/Chrome\/(\d+)/.test(ua) && !dev.windowsPhone) {
        dev.chrome = true;
        dev.chromeVersion = parseInt(RegExp.$1, 10);
      } else if (/Epiphany/.test(ua)) {
        dev.epiphany = true;
      } else if (/Firefox\D+(\d+)/.test(ua)) {
        dev.firefox = true;
        dev.firefoxVersion = parseInt(RegExp.$1, 10);
      } else if (/AppleWebKit/.test(ua) && dev.iOS) {
        dev.mobileSafari = true;
      } else if (/MSIE (\d+\.\d+);/.test(ua)) {
        dev.ie = true;
        dev.ieVersion = parseInt(RegExp.$1, 10);
      } else if (/Midori/.test(ua)) {
        dev.midori = true;
      } else if (/Opera/.test(ua)) {
        dev.opera = true;
      } else if (/Safari/.test(ua) && !dev.windowsPhone) {
        dev.safari = true;
      } else if (/Trident\/(\d+\.\d+)(.*)rv:(\d+\.\d+)/.test(ua)) {
        dev.ie = true;
        dev.trident = true;
        dev.tridentVersion = parseInt(RegExp.$1, 10);
        dev.ieVersion = parseInt(RegExp.$3, 10);
      }

      if (/Silk/.test(ua)) {
        dev.silk = true;
      }

      if (prop(navigator)['standalone']) {
        dev.webApp = true;
      }

      if (typeof prop(window).cordova !== 'undefined') {
        dev.cordova = true;
      }

      if (typeof prop(globalThis).process !== 'undefined' && typeof prop(globalThis).require !== 'undefined') {
        dev.node = true;
      }

      if (dev.node && typeof (prop(globalThis).process as Record<string, unknown>).versions === 'object') {
        const versions = (prop(globalThis).process as Record<string, unknown>).versions as Record<string, unknown>;
        dev.nodeWebkit = !!versions['node-webkit'];
        dev.electron = !!versions['electron'];
      }

      if (prop(navigator)['isCocoonJS']) {
        dev.cocoonJS = true;
      }

      if (dev.cocoonJS) {
        try {
          dev.cocoonJSApp = typeof prop(globalThis).CocoonJS !== 'undefined';
        } catch {
          dev.cocoonJSApp = false;
        }
      }

      if (typeof prop(window).ejecta !== 'undefined') {
        dev.ejecta = true;
      }

      if (/Crosswalk/.test(ua)) {
        dev.crosswalk = true;
      }
    }

    function _checkVideo(): void {
      const videoElement = document.createElement('video');

      try {
        if (videoElement.canPlayType) {
          if (videoElement.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '')) {
            dev.oggVideo = true;
          }
          if (videoElement.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '')) {
            dev.h264Video = true;
            dev.mp4Video = true;
          }
          if (videoElement.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '')) {
            dev.webmVideo = true;
          }
          if (videoElement.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, '')) {
            dev.vp9Video = true;
          }
          if (videoElement.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, '')) {
            dev.hlsVideo = true;
          }
        }
      } catch {
        // ignore
      }
    }

    function _checkAudio(): void {
      dev.audioData = !!prop(window)['Audio'];
      dev.webAudio = !!prop(window)['AudioContext'] || !!prop(window)['webkitAudioContext'];
      const audioElement = document.createElement('audio');

      try {
        if (audioElement.canPlayType) {
          if (audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')) {
            dev.ogg = true;
          }
          if (audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '') || audioElement.canPlayType('audio/opus;').replace(/^no$/, '')) {
            dev.opus = true;
          }
          if (audioElement.canPlayType('audio/mpeg;').replace(/^no$/, '')) {
            dev.mp3 = true;
          }
          if (audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')) {
            dev.wav = true;
          }
          if (audioElement.canPlayType('audio/x-m4a;') || audioElement.canPlayType('audio/aac;').replace(/^no$/, '')) {
            dev.m4a = true;
          }
          if (audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')) {
            dev.webm = true;
          }
        }
      } catch {
        // ignore
      }
    }

    function _checkDevice(): void {
      dev.pixelRatio = prop(window)['devicePixelRatio'] as number || 1;
      dev.iPhone = navigator.userAgent.toLowerCase().indexOf('iphone') !== -1;
      dev.iPhone4 = dev.pixelRatio === 2 && dev.iPhone;
      dev.iPhone5 = dev.pixelRatio === 2 && dev.iPhone &&
        ((screen.availWidth === 320 && screen.availHeight === 568) || (screen.availWidth === 568 && screen.availHeight === 320));
      dev.iPad = navigator.userAgent.toLowerCase().indexOf('ipad') !== -1;

      if (typeof Int8Array !== 'undefined') {
        dev.typedArray = true;
      } else {
        dev.typedArray = false;
      }

      if (typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined' && typeof Uint32Array !== 'undefined') {
        dev.littleEndian = _checkIsLittleEndian();
        dev.LITTLE_ENDIAN = dev.littleEndian;
      }

      dev.support32bit = typeof ArrayBuffer !== 'undefined' && typeof Uint8ClampedArray !== 'undefined' && typeof Int32Array !== 'undefined' && dev.littleEndian !== null && _checkIsUint8ClampedImageData();

      const nav = prop(navigator);
      nav.vibrate = nav.vibrate || nav.webkitVibrate || nav.mozVibrate || nav.msVibrate;

      if (nav.vibrate) {
        dev.vibration = true;
      }
    }

    function _checkIsLittleEndian(): boolean {
      const a = new ArrayBuffer(4);
      const b = new Uint8Array(a);
      const c = new Uint32Array(a);

      b[0] = 0xa1;
      b[1] = 0xb2;
      b[2] = 0xc3;
      b[3] = 0xd4;

      if (c[0] === 0xd4c3b2a1) {
        return true;
      }

      return c[0] !== 0xa1b2c3d4;
    }

    function _checkIsUint8ClampedImageData(): boolean {
      if (typeof Uint8ClampedArray === 'undefined') {
        return false;
      }

      const elem = document.createElement('canvas');
      const ctx = elem.getContext('2d');

      if (!ctx) {
        return false;
      }

      const image = ctx.createImageData(1, 1);
      return image.data instanceof Uint8ClampedArray;
    }

    function _checkCSS3D(): void {
      const el = document.createElement('p');
      let has3d: string | undefined;
      const transforms: Record<string, string> = {
        'webkitTransform': '-webkit-transform',
        'OTransform': '-o-transform',
        'msTransform': '-ms-transform',
        'MozTransform': '-moz-transform',
        'transform': 'transform',
      };

      document.body.insertBefore(el, null);

      for (const t in transforms) {
        if (prop(el.style)[t] !== undefined) {
          prop(el.style)[t] = 'translate3d(1px,1px,1px)';
          has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
        }
      }

      document.body.removeChild(el);
      dev.css3D = has3d !== undefined && has3d.length > 0 && has3d !== 'none';
    }

    _checkOS();
    _checkAudio();
    _checkVideo();
    _checkBrowser();
    _checkCSS3D();
    _checkDevice();
    _checkFeatures();
    _checkFullScreenSupport();
    _checkInput();
  };

  // canPlayAudio
  device.canPlayAudio = function (this: LibDeviceInstance, type: AudioType): boolean {
    if (type === 'mp3' && this.mp3) return true;
    if (type === 'ogg' && (this.ogg || this.opus)) return true;
    if (type === 'm4a' && this.m4a) return true;
    if (type === 'opus' && this.opus) return true;
    if (type === 'wav' && this.wav) return true;
    if (type === 'webm' && this.webm) return true;
    return false;
  };

  // canPlayVideo
  device.canPlayVideo = function (this: LibDeviceInstance, type: VideoType): boolean {
    if (type === 'webm' && (this.webmVideo || this.vp9Video)) return true;
    if (type === 'mp4' && (this.mp4Video || this.h264Video)) return true;
    if ((type === 'ogg' || type === 'ogv') && this.oggVideo) return true;
    if (type === 'mpeg' && this.hlsVideo) return true;
    return false;
  };

  // isConsoleOpen
  device.isConsoleOpen = function (): boolean {
    if (window.console && prop(window.console)['firebug']) {
      return true;
    }

    if (window.console) {
      if (typeof prop(console).profile === 'function') {
        (prop(console).profile as () => void)();
        (prop(console).profileEnd as () => void)();
      }

      if (console.clear) {
        console.clear();
      }

      if (prop(console)['profiles']) {
        return (prop(console)['profiles'] as unknown[]).length > 0;
      }
    }

    return false;
  };

  // isAndroidStockBrowser
  device.isAndroidStockBrowser = function (): boolean {
    const matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
    return !!(matches && Number(matches[1]) < 537);
  };

  return device;
}

const LibDevice = createDevice();

// webP check
(function (): void {
  if (typeof Image !== 'undefined') {
    const webP = new Image();
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    webP.onload = webP.onerror = function () {
      LibDevice.webP = webP.height === 2;
      LibDevice._webPTestComplete = true;
    };
  } else {
    LibDevice._webPTestComplete = true;
  }
})();

export default LibDevice;
