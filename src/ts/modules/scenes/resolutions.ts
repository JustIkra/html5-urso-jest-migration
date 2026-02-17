import type { ResolutionConfig, UrsoInstance } from '../../types';

interface TemplateSize {
  orientation: string;
  width: number;
  height: number;
}

interface WindowSize {
  width: number;
  height: number;
}

interface CurrentResolution extends ResolutionConfig {
  base: ResolutionConfig;
}

declare const Urso: {
  device: {
    ScreenOrientation: { LANDSCAPE: 'landscape'; PORTRAIT: 'portrait' };
  };
  events: Record<string, string>;
  helper: {
    objectClone: <T>(obj: T) => T;
    mobileAndTabletCheck: () => boolean;
  };
  math: { intMakeBetween: (val: number, min: number, max: number) => number };
  addInstancesMode: (mode: string) => void;
  removeInstancesMode: (mode: string, silent?: boolean) => void;
};

class ModulesScenesResolutions {
  public readonly singleton = true;

  public _activeResolution: CurrentResolution | null = null;
  public _templateSize: TemplateSize = { orientation: '', width: 0, height: 0 };
  public _currentOrientation: string | null = null;

  public getInstance!: UrsoInstance['getInstance'];
  public emit!: UrsoInstance['emit'];
  public addListener!: UrsoInstance['addListener'];

  constructor() {
    this.refreshSceneSize = this.refreshSceneSize.bind(this);
    this.preResize = this.preResize.bind(this);
    this.refreshSceneSize();
  }

  _subscribeOnce(): void {
    this.addListener(Urso.events.EXTRA_BROWSEREVENTS_WINDOW_PRE_RESIZE, this.preResize, true);
    this.addListener(Urso.events.EXTRA_BROWSEREVENTS_WINDOW_RESIZE, this.refreshSceneSize as () => void, true);
    this.addListener(Urso.events.MODULES_SCENES_NEW_SCENE_INIT, this.refreshSceneSize as () => void, true);
  }

  getTemplateSize(): TemplateSize {
    return this._templateSize;
  }

  preResize(): void {
    if (Urso.helper.mobileAndTabletCheck())
      this.getInstance<{ hideCanvas: () => void }>('PixiWrapper').hideCanvas();
  }

  refreshSceneSize(): boolean {
    const windowSize = this._getWindowSize();
    const orientation = this._getOrientation(windowSize);
    const configResolution = this._getResolutionConfig(windowSize);

    const windowRatio = windowSize.width / windowSize.height;
    const optimalRatio = this._getOptimalRatio(configResolution, windowRatio, orientation);

    const currentResolution = Urso.helper.objectClone(configResolution) as unknown as CurrentResolution;
    currentResolution.name = 'currentResolution';
    currentResolution.base = configResolution;
    currentResolution.width =
      optimalRatio > windowRatio
        ? Math.floor(windowSize.width)
        : Math.floor(Math.floor(windowSize.height) * optimalRatio);
    currentResolution.height =
      optimalRatio > windowRatio
        ? Math.floor(Math.floor(windowSize.width) / optimalRatio)
        : Math.floor(windowSize.height);

    this._templateSize = this._calculateTemplateSize(currentResolution);
    this._applyResolutionToPixi(currentResolution);

    if (this._currentOrientation !== this._templateSize.orientation) {
      this._currentOrientation = this._templateSize.orientation;

      Object.values(Urso.device.ScreenOrientation).forEach((orientationValue) =>
        Urso.removeInstancesMode(orientationValue + 'Orientation', true),
      );
      Urso.addInstancesMode(this._templateSize.orientation + 'Orientation');

      this.emit(Urso.events.MODULES_SCENES_ORIENTATION_CHANGE, this._templateSize.orientation);
    }

    this.emit(Urso.events.MODULES_SCENES_NEW_RESOLUTION, {
      resolution: currentResolution,
      template: this._templateSize,
    });

    return true;
  }

  _getWindowSize(): WindowSize {
    const windowSize: WindowSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (window.devicePixelRatio && window.devicePixelRatio !== 1) {
      windowSize.width *= window.devicePixelRatio;
      windowSize.height *= window.devicePixelRatio;
    }

    return windowSize;
  }

  _getOrientation(windowSize: WindowSize): string {
    return windowSize.width > windowSize.height
      ? Urso.device.ScreenOrientation.LANDSCAPE
      : Urso.device.ScreenOrientation.PORTRAIT;
  }

  _getResolutionConfig(windowSize: WindowSize): ResolutionConfig {
    const orientation = this._getOrientation(windowSize);
    const mainDimension: 'width' | 'height' = windowSize.width > windowSize.height ? 'width' : 'height';
    const config = this.getInstance<{ get: () => ResolutionConfig[] }>('ResolutionsConfig').get();
    let currentResolution = config[0];

    for (const resolution of config) {
      if (resolution.orientation !== orientation) continue;

      if (
        currentResolution.orientation !== orientation ||
        (currentResolution[mainDimension] < resolution[mainDimension] &&
          resolution[mainDimension] < windowSize[mainDimension]) ||
        (windowSize[mainDimension] < currentResolution[mainDimension] &&
          resolution[mainDimension] < currentResolution[mainDimension])
      )
        currentResolution = resolution;
    }

    return currentResolution;
  }

  _getOptimalRatio(configResolution: ResolutionConfig, windowRatio: number, orientation: string): number {
    let optimalRatio = configResolution.width / configResolution.height;

    if (configResolution.adaptive) {
      const display = !Urso.helper.mobileAndTabletCheck() ? 'desktop' : 'mobile';
      const adaptiveParams = this.getInstance<{
        getAdaptive: () => Record<string, { supported: boolean; limits: Record<string, { min: number; max: number }> }>;
      }>('ResolutionsConfig').getAdaptive()[display];

      if (adaptiveParams.supported) {
        const limits = adaptiveParams.limits[orientation];
        optimalRatio = Urso.math.intMakeBetween(windowRatio, limits.min, limits.max);
      }
    }

    return optimalRatio;
  }

  _calculateTemplateSize(resolution: CurrentResolution): TemplateSize {
    this._templateSize.orientation = resolution.orientation;
    this._templateSize.width = resolution.base.width;
    this._templateSize.height = resolution.base.height;

    const dimensionsArray: ('width' | 'height')[] = ['width', 'height'];

    if (resolution.adaptive) {
      const dimensionsPassiveKey =
        resolution.width / resolution.height > resolution.base.width / resolution.base.height ? 0 : 1;
      const dimensionsMainKey = dimensionsPassiveKey === 1 ? 0 : 1;

      this._templateSize[dimensionsArray[dimensionsPassiveKey]] = ~~(
        resolution[dimensionsArray[dimensionsPassiveKey]] *
        (resolution.base[dimensionsArray[dimensionsMainKey]] / resolution[dimensionsArray[dimensionsMainKey]])
      );
    }

    return this._templateSize;
  }

  _applyResolutionToPixi(resolution: CurrentResolution): boolean {
    const maxResolutionFactor = Math.min(
      this.getInstance<{ maxSize: () => number }>('ResolutionsConfig').maxSize() /
        Math.max(resolution.width, resolution.height),
      1,
    );
    const dp = window.devicePixelRatio;
    const canvasSize = {
      width: ~~(resolution.width * maxResolutionFactor),
      height: ~~(resolution.height * maxResolutionFactor),
    };

    const pw = this.getInstance<{
      showCanvas: () => void;
      resize: (w: number, h: number) => void;
      setWorldScale: (x: number, y: number) => void;
      setCanvasWidth: (v: number) => void;
      setCanvasHeight: (v: number) => void;
    }>('PixiWrapper');
    pw.showCanvas();
    pw.resize(canvasSize.width, canvasSize.height);
    pw.setWorldScale(canvasSize.width / this._templateSize.width, canvasSize.height / this._templateSize.height);
    pw.setCanvasWidth(resolution.width / dp);
    pw.setCanvasHeight(resolution.height / dp);

    this._activeResolution = resolution;
    return true;
  }
}

export default ModulesScenesResolutions;
