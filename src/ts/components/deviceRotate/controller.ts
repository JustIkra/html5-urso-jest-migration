import ComponentsBaseController from '../base/controller';
import type { UrsoInstance } from '../../types';

interface ResolutionConfig {
  orientation: string;
}

class ComponentsDeviceRotateController extends ComponentsBaseController {
  private _created = false;
  private _div: HTMLDivElement | null = null;
  private _orientation: string | null = null;
  private _resolutionsConfig: ResolutionConfig[] | null = null;

  constructor(params?: Record<string, unknown>) {
    super(params);
  }

  create(): void {
    if (Urso.device.desktop)
      return;

    this._resolutionsConfig = Urso.getInstance<{ contents: ResolutionConfig[] }>('Modules.Scenes.ResolutionsConfig').contents || [];

    this._createDom();
    this._updateOrientation();
    this._updateVisibility();
    this._created = true;
  }

  _createDom(): void {
    this._div = document.createElement('div');
    this._div.className = 'fullscreen device-rotate';
    this._div.style.touchAction = 'none';
    this._div.style.visibility = 'hidden';

    document.body.prepend(this._div);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'fullscreen-info';
    this._div.appendChild(infoDiv);
    const image = document.createElement('img');
    image.src = `${Urso.config.gamePath}assets/images/fullscreen/rotate.png`;
    const span = document.createElement('span');
    span.innerText = 'Please rotate device';

    infoDiv.appendChild(image);
    infoDiv.appendChild(span);
  }

  get _showOnLandscape(): boolean {
    if (!this._resolutionsConfig) return false;
    return !this._resolutionsConfig.find(resolution => resolution.orientation === Urso.device.ScreenOrientation.LANDSCAPE);
  }

  get _showOnPortrait(): boolean {
    if (!this._resolutionsConfig) return false;
    return !this._resolutionsConfig.find(resolution => resolution.orientation === Urso.device.ScreenOrientation.PORTRAIT);
  }

  get _isPortrait(): boolean {
    return this._orientation === Urso.device.ScreenOrientation.PORTRAIT;
  }

  get _needShow(): boolean {
    return (this._orientation === Urso.device.ScreenOrientation.PORTRAIT && this._showOnPortrait) ||
      (this._orientation !== Urso.device.ScreenOrientation.PORTRAIT && this._showOnLandscape);
  }

  set _isVisible(needShowDiv: boolean) {
    this._div!.style.visibility = needShowDiv ? 'visible' : 'hidden';
  }

  _updateOrientation(): void {
    this._orientation = innerWidth > innerHeight ? Urso.device.ScreenOrientation.LANDSCAPE : Urso.device.ScreenOrientation.PORTRAIT;
  }

  _updateVisibility(): void {
    this._isVisible = this._needShow;
  }

  _resizeHandler(): void {
    if (!this._created)
      return;

    this._updateOrientation();
    this._updateVisibility();
  }

  _subscribeOnce(): void {
    if (Urso.device.desktop)
      return;

    this.addListener(Urso.events.EXTRA_BROWSEREVENTS_WINDOW_RESIZE, this._resizeHandler.bind(this) as () => void);
  }
}

export default ComponentsDeviceRotateController;
