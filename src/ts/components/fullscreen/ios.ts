import type { UrsoInstance } from '../../types';

interface ResolutionConfig {
  orientation: string;
}

class ComponentsFullscreenIos {
  private _div: HTMLDivElement | null = null;
  private _orientation: string | null = null;
  private _scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  public addListener!: UrsoInstance['addListener'];

  init(): void {
    this._createDom();
    this._addListeners();
    this._updateResize();
  }

  _createDom(): void {
    this._div = document.createElement('div');
    this._div.className = 'fullscreen fullscreen-ios';
    document.body.prepend(this._div);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'fullscreen-info';
    this._div.appendChild(infoDiv);

    const image = document.createElement('img');
    image.src = `${Urso.config.gamePath}assets/images/fullscreen/scroll.png`;
    const span = document.createElement('span');
    span.innerText = 'Swipe up to enter fullscreen';

    infoDiv.appendChild(image);
    infoDiv.appendChild(span);
  }

  _addListeners(): void {
    window.addEventListener('touchmove', (e) => {
      this._updateResize();

      if (e.touches.length > 1) {
        e.preventDefault();
        return;
      }
    });
  }

  get isFullscreen(): boolean {
    return this._isFullscreen;
  }

  get _isFullscreen(): boolean {
    const minFactor = 0.51;
    const deviceFactor = screen.width / screen.height;
    const factor = this._isPortrait
      ? innerWidth / innerHeight
      : innerHeight / innerWidth;

    return !(
      this._isPortrait
        ? factor - deviceFactor < 0.1
        : factor > minFactor
    );
  }

  _updateOrientation(): void {
    this._orientation = innerWidth > innerHeight ? Urso.device.ScreenOrientation.LANDSCAPE : Urso.device.ScreenOrientation.PORTRAIT;
  }

  _updateResize(): void {
    this._updateOrientation();
    this.isVisible = this._needShowOnCurrentOrientation && this._isFullscreen;
  }

  get _orientationsConfig(): ResolutionConfig[] {
    return Urso.getInstance<{ contents: ResolutionConfig[] }>('Modules.Scenes.ResolutionsConfig').contents || [];
  }

  get _isPortrait(): boolean {
    return this._orientation === Urso.device.ScreenOrientation.PORTRAIT;
  }

  get _needShowOnCurrentOrientation(): boolean {
    return (this._isPortrait && !!this._showOnPortrait) || (!this._isPortrait && !!this._showOnLandscape);
  }

  get _showOnLandscape(): ResolutionConfig | undefined {
    return this._orientationsConfig.find(resolution => resolution.orientation === Urso.device.ScreenOrientation.LANDSCAPE);
  }

  get _showOnPortrait(): ResolutionConfig | undefined {
    return this._orientationsConfig.find(resolution => resolution.orientation === Urso.device.ScreenOrientation.PORTRAIT);
  }

  set isVisible(needShowDiv: boolean) {
    this._div!.style.zIndex = needShowDiv ? '1' : '-1';
    if (this._scrollTimeout) clearTimeout(this._scrollTimeout);
    this._scrollTimeout = setTimeout(() => {
      if (needShowDiv)
        window.scrollTo(0, 0);
    }, 200);
  }

  _resizeHandler(): void {
    this._updateResize();
  }

  _fullscreenSwitchHandler(needGoFullscreen: boolean | null = null): void {
    this._switchFullscreen(needGoFullscreen);
  }

  _switchFullscreen(_needGoFullscreen: boolean | null): void {
    // iOS doesn't support programmatic fullscreen
  }

  _subscribeOnce(): void {
    this.addListener(
      Urso.events.EXTRA_BROWSEREVENTS_WINDOW_RESIZE,
      this._resizeHandler.bind(this) as () => void,
    );
  }
}

export default ComponentsFullscreenIos;
