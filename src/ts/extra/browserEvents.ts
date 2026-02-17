declare const Urso: {
  events: Record<string, string>;
  setTimeout: (fn: () => void, delay: number) => number;
  clearTimeout: (id: number) => void;
};

class ExtraBrowserEvents {
  public singleton = true;
  public RESIZE_DELAY = 0;
  public emit!: (event: string, params?: unknown) => void;

  private _resizeTimeoutId: number | undefined;

  constructor() {
    this._keyPressHandler = this._keyPressHandler.bind(this);
    this.resizeHandler = this.resizeHandler.bind(this);
    this.visibilitychangeHandler = this.visibilitychangeHandler.bind(this);
    this._pointerEventsHandler = this._pointerEventsHandler.bind(this);

    this.init();
  }

  init(): void {
    window.addEventListener('keydown', this._keyPressHandler);
    document.addEventListener('visibilitychange', this.visibilitychangeHandler);

    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('orientationchange', this.resizeHandler);
    document.addEventListener('fullscreenchange', this.resizeHandler);
    document.addEventListener('webkitfullscreenchange', this.resizeHandler);
    document.addEventListener('mozfullscreenchange', this.resizeHandler);

    document.addEventListener('mousedown', this._pointerEventsHandler);
    document.addEventListener('mousemove', this._pointerEventsHandler);
    document.addEventListener('mouseup', this._pointerEventsHandler);
    document.addEventListener('touchstart', this._pointerEventsHandler);
    document.addEventListener('touchmove', this._pointerEventsHandler);
    document.addEventListener('touchend', this._pointerEventsHandler);
    document.addEventListener('wheel', this._pointerEventsHandler);
  }

  visibilitychangeHandler(): void {
    this.emit(Urso.events.EXTRA_BROWSEREVENTS_WINDOW_VISIBILITYCHANGE, document.visibilityState);
  }

  resizeHandler(): void {
    if (this._resizeTimeoutId)
      Urso.clearTimeout(this._resizeTimeoutId);

    this.emit(Urso.events.EXTRA_BROWSEREVENTS_WINDOW_PRE_RESIZE);
    this._resizeTimeoutId = Urso.setTimeout(() =>
      this.emit(Urso.events.EXTRA_BROWSEREVENTS_WINDOW_RESIZE),
      this.RESIZE_DELAY,
    );
  }

  _pointerEventsHandler(event: Event): void {
    this.emit(Urso.events.EXTRA_BROWSEREVENTS_POINTER_EVENT, event);
  }

  _keyPressHandler(event: KeyboardEvent): void {
    this.emit(Urso.events.EXTRA_BROWSEREVENTS_KEYPRESS_EVENT, event);
  }
}

export default ExtraBrowserEvents;
