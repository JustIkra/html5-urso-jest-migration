import type { UrsoInstance } from '../../types';

declare const Urso: {
  events: Record<string, string>;
};

interface VendorDocument extends Document {
  webkitIsFullScreen?: boolean;
  mozFullScreen?: boolean;
  webkitCancelFullScreen?: () => void;
  mozCancelFullScreen?: () => void;
  cancelFullScreen?: () => void;
}

interface VendorBody extends HTMLElement {
  webkitRequestFullScreen?: () => void;
  mozRequestFullScreen?: () => void;
  requestFullScreen?: () => void;
}

class ComponentsFullscreenDesktop {
  public addListener!: UrsoInstance['addListener'];

  init(): void { }

  get isFullscreen(): boolean {
    const doc = document as VendorDocument;
    return !!(
      doc.webkitIsFullScreen ||
      doc.mozFullScreen ||
      doc.fullscreen
    );
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

  _cancelFullscreen(): void {
    const doc = document as VendorDocument;
    if (doc.webkitCancelFullScreen)
      doc.webkitCancelFullScreen();
    else if (doc.mozCancelFullScreen)
      doc.mozCancelFullScreen();
    else if (doc.cancelFullScreen)
      doc.cancelFullScreen();
  }

  _switchFullscreen(needGoFullscreen: boolean | null = null): void {
    if (needGoFullscreen === null)
      needGoFullscreen = !this.isFullscreen;

    if (needGoFullscreen)
      this._requestFullscreen();
    else
      this._cancelFullscreen();
  }

  _fullscreenSwitchHandler(needGoFullscreen: boolean | null = null): void {
    this._switchFullscreen(needGoFullscreen);
  }

  _subscribeOnce(): void {
    this.addListener(Urso.events.COMPONENTS_FULLSCREEN_SWITCH, this._fullscreenSwitchHandler.bind(this) as () => void);
  }
}

export default ComponentsFullscreenDesktop;
