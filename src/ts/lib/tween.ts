interface TweenPoint {
  propsTo: Record<string, number>;
  duration: number;
  easing: ((t: number) => number) | undefined;
  propsFrom: Record<string, number>;
  timeStart: number;
  startDelay: number;
}

interface TweenFunctions {
  onStart: (() => void)[];
  onStartOnce: (() => void)[];
  onUpdate: ((tween: TweenInstance, progress: number, data: TweenUpdateData) => void)[];
  onComplete: (() => void)[];
  onCompleteOnce: (() => void)[];
}

interface TweenUpdateData {
  percent: number;
  vEnd: Record<string, number>;
}

interface TweenInstance {
  id: string;
  isRunning: boolean;
  enableUpdate: boolean;
  target: Record<string, number>;
  to: (propsTo: Record<string, number>, duration: number, easing?: (t: number) => number, autostart?: boolean, startDelay?: number) => TweenInstance;
  start: () => TweenInstance;
  pause: () => TweenInstance;
  resume: () => TweenInstance;
  stop: () => TweenInstance;
  points: TweenPoint[];
  manager: LibTween;
  _timeScale: number;
  timeScale: number;
  _started: boolean;
  _paused: boolean;
  _pauseTime: number;
  _timeBonus: number;
  _complete: boolean;
  _bkp: {
    points: TweenPoint[];
    obj: unknown;
  };
  _functions: TweenFunctions;
  onComplete: {
    addOnce: (f: () => void) => TweenInstance;
    add: (f: () => void) => TweenInstance;
  };
  onStart: {
    addOnce: (f: () => void) => TweenInstance;
    add: (f: () => void) => TweenInstance;
  };
  onUpdateCallback: (f: (tween: TweenInstance, progress: number, data: TweenUpdateData) => void) => TweenInstance;
}

class LibTween {
  public readonly singleton: boolean = true;
  public tweens: Record<string, TweenInstance>;
  public gamePaused: boolean = false;

  private _tweens: Record<string, TweenInstance> = {};
  private _currentTime: number = 0;
  private _tweenIndex: number = 0;

  public get globalTimeScale(): number {
    return (Urso.scenes as Record<string, unknown>).timeScale as number;
  }

  constructor() {
    this.tweens = this._tweens;
    this._subscribe();
  }

  public update(): void {
    this._update();
  }

  public removeAll(): void {
    for (const k in this._tweens) {
      this._tweens[k].stop();
    }
  }

  public add(object: Record<string, number>): TweenInstance {
    const key = this._keyGenerate();
    const manager = this;

    const tween: TweenInstance = {
      id: key,
      isRunning: false,
      enableUpdate: false,
      target: object,
      to: tweenTo,
      start: tweenStart,
      pause: tweenPause,
      resume: tweenResume,
      stop: tweenStop,
      points: [],
      manager: manager,
      _timeScale: 1,
      get timeScale(): number {
        return this._timeScale;
      },
      set timeScale(a: number) {
        if (this._timeScale === a || !this.points[0]) {
          return;
        }

        const timeDiff = ~~(manager._currentTime - this.points[0].timeStart) * (manager.globalTimeScale * this._timeScale);

        if (this.points[0].duration - timeDiff <= 0) {
          return;
        }

        this.points[0].duration -= timeDiff;
        this.points[0].timeStart = manager._currentTime;

        for (const k in this.points[0].propsTo) {
          this.points[0].propsFrom[k] = this.target[k];
        }

        this._timeScale = a;
      },
      _started: false,
      _paused: false,
      _pauseTime: 0,
      _timeBonus: 0,
      _complete: false,
      _bkp: {
        points: [],
        obj: null,
      },
      _functions: {
        onStart: [],
        onStartOnce: [],
        onUpdate: [],
        onComplete: [],
        onCompleteOnce: [],
      },
      onComplete: null as unknown as TweenInstance['onComplete'],
      onStart: null as unknown as TweenInstance['onStart'],
      onUpdateCallback: null as unknown as TweenInstance['onUpdateCallback'],
    };

    tween.onComplete = {
      addOnce(f: () => void): TweenInstance {
        tween._functions.onCompleteOnce.push(f);
        return tween;
      },
      add(f: () => void): TweenInstance {
        tween._functions.onComplete.push(f);
        return tween;
      },
    };

    tween.onStart = {
      addOnce(f: () => void): TweenInstance {
        tween._functions.onStartOnce.push(f);
        return tween;
      },
      add(f: () => void): TweenInstance {
        tween._functions.onStart.push(f);
        return tween;
      },
    };

    tween.onUpdateCallback = function (f: (tween: TweenInstance, progress: number, data: TweenUpdateData) => void): TweenInstance {
      tween._functions.onUpdate.push(f);
      return tween;
    };

    this._tweens[key] = tween;
    return tween;
  }

  public _calcStep(tween: TweenInstance, onStartCall?: boolean): boolean {
    const point = tween.points[0];

    if (this._currentTime < point.timeStart) {
      return false;
    }

    const progress = this._applyDelta(tween, point, onStartCall);

    const tweenData: TweenUpdateData = {
      percent: +progress.toFixed(3),
      vEnd: point.propsTo,
    };

    for (let i = 0; i < tween._functions.onUpdate.length; i++) {
      tween._functions.onUpdate[i](tween, progress, tweenData);
    }

    if (progress === 1) {
      tween.points.shift();

      if (tween.points.length === 0) {
        tween._complete = true;
        tween.isRunning = false;
        const onComplete = tween._functions.onComplete;
        const onCompleteOnce = tween._functions.onCompleteOnce;

        tween._functions.onStartOnce = [];
        tween._functions.onCompleteOnce = [];

        if (!tween.enableUpdate) {
          tween._functions.onStart = [];
          tween._functions.onUpdate = [];
          tween._functions.onComplete = [];
        }

        for (let i = 0; i < onCompleteOnce.length; i++) {
          onCompleteOnce[i]();
        }

        for (let i = 0; i < onComplete.length; i++) {
          onComplete[i]();
        }
      } else {
        const { startDelay } = tween.points[0];
        tween.points[0].timeStart = this._currentTime + startDelay;

        for (const k in tween.points[0].propsTo) {
          tween.points[0].propsFrom[k] = tween.target[k];
        }

        if (startDelay) {
          setTimeout(() => {
            this._calcStep(tween);
          }, startDelay);
        } else {
          this._calcStep(tween);
        }
      }
    }

    return true;
  }

  public _keyGenerate(): string {
    this._tweenIndex++;
    return `${this._currentTime}_${this._tweenIndex}`;
  }

  private _update(): void {
    const curTime = new Date().getTime();

    if (this.gamePaused) {
      const delta = curTime - this._currentTime;

      for (const k in this._tweens) {
        if (this._tweens[k].points && this._tweens[k].points[0]) {
          this._tweens[k].points[0].timeStart += delta;
        }
      }

      return;
    }

    this._currentTime = curTime;

    for (const k in this._tweens) {
      if (this._tweens[k]._complete) {
        delete this._tweens[k];
        continue;
      } else if (this._tweens[k]._started && !this._tweens[k]._paused) {
        this._calcStep(this._tweens[k]);
      }
    }
  }

  private _applyDelta(tween: TweenInstance, point: TweenPoint, onStartCall?: boolean): number {
    if (tween._timeBonus > 0) {
      point.timeStart -= tween._timeBonus;
      tween._timeBonus = 0;
    }

    const time = this._currentTime;
    let progress = (time - point.timeStart) * tween.timeScale * (this.globalTimeScale / point.duration);

    if (progress >= 1 && onStartCall) {
      progress = 0.99;
    }

    if (progress > 1) {
      progress = 1;
      tween._timeBonus = ~~((time - point.timeStart) - point.duration / (tween.timeScale * this.globalTimeScale));
    }

    for (const k in point.propsTo) {
      tween.target[k] = point.propsFrom[k] + (point.propsTo[k] - point.propsFrom[k]) * progress;
    }

    return progress;
  }

  private _subscribe(): void {
    if (typeof Urso !== 'undefined' && Urso.observer) {
      Urso.observer.add(Urso.events.MODULES_SCENES_UPDATE, this._update.bind(this), true);
    }
  }
}

function tweenTo(this: TweenInstance, propsTo: Record<string, number>, duration: number, easing?: (t: number) => number, autostart?: boolean, startDelay?: number): TweenInstance {
  const propsFrom: Record<string, number> = {};

  for (const k in propsTo) {
    propsFrom[k] = this.target[k];
  }

  if (!startDelay) {
    startDelay = 0;
  }

  const timeStart = this.manager._keyGenerate() ? 0 : 0; // uses manager._currentTime indirectly
  const point: TweenPoint = {
    propsTo,
    duration,
    easing,
    propsFrom,
    timeStart: startDelay,
    startDelay,
  };

  this.points.push(point);
  this._complete = false;

  if (autostart) {
    this.start();
  }

  return this;
}

function tweenStart(this: TweenInstance): TweenInstance {
  if (this.isRunning || !this.points || (this.points.length === 0 && this._bkp.points.length === 0)) {
    return this;
  }

  if (this.points.length === 0 && this._bkp.points.length > 0) {
    this.points = this._bkp.points;
    const key = this.manager._keyGenerate();
    (this.manager as unknown as { _tweens: Record<string, TweenInstance> })._tweens[key] = this;
  }

  this.points[0].timeStart = 0 + this.points[0].startDelay;

  this._bkp = {
    points: Urso.helper.objectClone(this.points) as TweenPoint[],
    obj: null,
  };

  this._started = true;
  this.isRunning = true;
  this._complete = false;

  for (let i = 0; i < this._functions.onStartOnce.length; i++) {
    this._functions.onStartOnce[i]();
  }

  for (let i = 0; i < this._functions.onStart.length; i++) {
    this._functions.onStart[i]();
  }

  if (this._timeBonus > 0) {
    this.manager._calcStep(this, true);
  }

  return this;
}

function tweenPause(this: TweenInstance): TweenInstance {
  this._paused = true;
  this.isRunning = false;
  this._pauseTime = 0;
  return this;
}

function tweenResume(this: TweenInstance): TweenInstance {
  if (this.points && this.points[0]) {
    this.points[0].timeStart += 0;
  }

  this._paused = false;
  this.isRunning = true;
  this._pauseTime = 0;
  return this;
}

function tweenStop(this: TweenInstance): TweenInstance {
  this._complete = true;
  this.isRunning = false;
  delete (this.manager as unknown as { _tweens: Record<string, TweenInstance> })._tweens[this.id];
  return this;
}

export default LibTween;
