import type { UrsoInstance } from '../../types';

interface ResolutionConfig {
  orientation: string;
}

interface VendorDocument extends Document {
  webkitIsFullScreen?: boolean;
  mozFullScreen?: boolean;
}

interface VendorBody extends HTMLElement {
  webkitRequestFullScreen?: () => void;
  mozRequestFullScreen?: () => void;
  requestFullScreen?: () => void;
}

class ComponentsFullscreenAndroid {
  private _div: HTMLDivElement | null = null;
  private _orientation: string | null = null;

  public addListener!: UrsoInstance['addListener'];

  init(): void {
    this._createDom();
    this._addListeners();

    this._updateOrientation();
    this._updateResize();
  }

  _createDom(): void {
    this._div = document.createElement('div');
    this._div.className = 'fullscreen fullscreen-android';
    document.body.prepend(this._div);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'fullscreen-info';
    this._div.appendChild(infoDiv);

    const image = document.createElement('img');
    image.src = `${Urso.config.gamePath}assets/images/fullscreen/hand.png`;
    const span = document.createElement('span');
    span.innerText = 'Tap to enter fullscreen';

    infoDiv.appendChild(image);
    infoDiv.appendChild(span);
  }

  _updateOrientation(): void {
    this._orientation = innerWidth > innerHeight ? Urso.device.ScreenOrientation.LANDSCAPE : Urso.device.ScreenOrientation.PORTRAIT;
  }

  get isFullscreen(): boolean {
    const doc = document as VendorDocument;
    return !!(
      doc.webkitIsFullScreen ||
      doc.mozFullScreen ||
      doc.fullscreen
    );
  }

  get _orientationsConfig(): ResolutionConfig[] {
    return Urso.getInstance<{ contents: ResolutionConfig[] }>('Modules.Scenes.ResolutionsConfig').contents || [];
  }

  get _isPortrait(): boolean {
    return this._orientation === Urso.device.ScreenOrientation.PORTRAIT;
  }

  get _needShowOnCurrentOrientation(): boolean {
    return (this._isPortrait && !!this._showOnPortrait) ||
      (!this._isPortrait && !!this._showOnLandscape);
  }

  get _showOnLandscape(): ResolutionConfig | undefined {
    return this._orientationsConfig.find(resolution => resolution.orientation === Urso.device.ScreenOrientation.LANDSCAPE);
  }

  get _showOnPortrait(): ResolutionConfig | undefined {
    return this._orientationsConfig.find(resolution => resolution.orientation === Urso.device.ScreenOrientation.PORTRAIT);
  }

  set isVisible(needShowDiv: boolean) {
    this._div!.style.visibility = needShowDiv ? 'visible' : 'hidden';
  }

  _requestFullscreen(): void {
    const body = document.body as VendorBody;
    if (body.webkitRequestFullScreen)
      body.webkitRequestFullScreen();
    else if (body.mozRequestFullScreen)
      body.mozRequestFullScreen();
    else if (body.requestFullScreen)
      body.requestFullScreen();
  }

  _updateResize(): void {
    this.isVisible = this._needShowOnCurrentOrientation && !this.isFullscreen;
  }

  _resizeHandler(): void {
    this._updateOrientation();
    this._updateResize();
  }

  _addListeners(): void {
    window.addEventListener('touchend', () => {
      if (!this.isFullscreen)
        this._requestFullscreen();

      this._updateResize();
    });
  }

  _subscribeOnce(): void {
    this.addListener(Urso.events.EXTRA_BROWSEREVENTS_WINDOW_RESIZE, this._resizeHandler.bind(this) as () => void);
  }
}

export default ComponentsFullscreenAndroid;
