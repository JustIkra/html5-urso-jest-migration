import ComponentsBaseController from '../base/controller';
import type { UrsoInstance } from '../../types';

interface ResolutionConfig {
  orientation: string;
}

interface FullscreenActivator {
  init: () => void;
  isFullscreen: boolean;
}

class ComponentsFullscreenController extends ComponentsBaseController {
  private _fullscreenActivator: FullscreenActivator | null = null;
  private _resolutionsConfig: ResolutionConfig[] | null = null;
  public lastResizeFullscreenResult: boolean | undefined;

  constructor(params?: Record<string, unknown>) {
    super(params);

    this.createActivator();
    this._resizeHandler();
  }

  createActivator(): void {
    if (this._isCriOS)
      return;

    this._resolutionsConfig = Urso.getInstance<{ contents: ResolutionConfig[] }>('Modules.Scenes.ResolutionsConfig').contents || [];

    if (Urso.device.desktop)
      this._fullscreenActivator = this.getInstance<FullscreenActivator>('Desktop');
    else if (Urso.device.iOS)
      this._fullscreenActivator = this.getInstance<FullscreenActivator>('Ios');
    else if (Urso.device.android)
      this._fullscreenActivator = this.getInstance<FullscreenActivator>('Android');

    if (this._fullscreenActivator)
      this._fullscreenActivator.init();
  }

  get _isCriOS(): boolean {
    return navigator.userAgent.includes('CriOS');
  }

  get _orientationsConfig(): ResolutionConfig[] {
    return Urso.getInstance<{ _orientations: ResolutionConfig[] }>('Modules.Scenes.ResolutionsConfig')._orientations || [];
  }

  get _showOnLandscape(): ResolutionConfig | undefined {
    return this._resolutionsConfig?.find(resolution => resolution.orientation === Urso.device.ScreenOrientation.LANDSCAPE);
  }

  get _showOnPortrait(): ResolutionConfig | undefined {
    return this._resolutionsConfig?.find(resolution => resolution.orientation === Urso.device.ScreenOrientation.PORTRAIT);
  }

  get _isPortrait(): string {
    return innerWidth > innerHeight ? Urso.device.ScreenOrientation.PORTRAIT : Urso.device.ScreenOrientation.LANDSCAPE;
  }

  get isFullscreen(): boolean {
    if (!this._fullscreenActivator)
      return false;

    return this._fullscreenActivator.isFullscreen;
  }

  _resizeHandler(): void {
    const isFullscreen = this.isFullscreen;

    if (this.lastResizeFullscreenResult === isFullscreen)
      return;

    this.lastResizeFullscreenResult = isFullscreen;
    Urso.localData.set('fullscreen.isFullscreen', isFullscreen);
    this.emit(Urso.events.COMPONENTS_FULLSCREEN_CHANGE, isFullscreen);
  }

  _subscribeOnce(): void {
    this.addListener(Urso.events.EXTRA_BROWSEREVENTS_WINDOW_RESIZE, this._resizeHandler.bind(this) as () => void);
  }
}

export default ComponentsFullscreenController;
