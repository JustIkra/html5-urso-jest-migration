import type { ObserverCallback, ObserverMap } from '../../types';

class ModulesObserverController {
  private _observers: ObserverMap;
  private _prefix: string;
  private readonly _prefixDelimiter: string;
  private _counter: number;

  public getInstance!: <T = unknown>(path: string, ...args: unknown[]) => T;

  constructor() {
    // getInstance is injected by the framework onto the prototype before construction.
    // In tests it must be provided via the prototype or mock.
    if (!this.getInstance) {
      throw new Error('ModulesObserverController: getInstance must be injected before construction');
    }

    Urso.events = this.getInstance<{ list: typeof Urso.events }>('Events').list;

    this._observers = {};
    this._prefix = '';
    this._prefixDelimiter = '_@';
    this._counter = 0;

    this._getUid = this._getUid.bind(this);
  }

  public fire(eventName: string, params?: unknown, delay?: number): void {
    if (!eventName) {
      Urso.logger.error('ModulesObserverController fire error:', eventName);
      return;
    }

    if (delay) {
      setTimeout(() => {
        this.fire(eventName, params);
      }, delay);
      return;
    }

    this._fireLocal(eventName, params);
    this._fireLocal(eventName + this._getLocalSuffix(), params);
  }

  /**
   * Register a listener for an event.
   * @param eventName - Dot-delimited event name (e.g. `modules.scenes.update`).
   * @param callback  - Function invoked when the event fires.
   * @param global    - When `true` the listener is scene-independent (survives
   *                    prefix/scene changes). When `false` or omitted the listener
   *                    is scoped to the current prefix and removed by `clearAllLocal()`.
   */
  public add(eventName: string, callback: ObserverCallback, global?: boolean): void {
    if (!eventName || !callback) {
      Urso.logger.error('ModulesObserverController add error:', eventName, callback);
      return;
    }

    if (global) {
      this._addLocal(eventName, callback);
    } else {
      this._addLocal(eventName + this._getLocalSuffix(), callback);
    }
  }

  public remove(eventName: string, callback: ObserverCallback, global?: boolean): void {
    if (global) {
      this._removeLocal(eventName, callback);
    } else {
      this._removeLocal(eventName + this._getLocalSuffix(), callback);
    }
  }

  public setPrefix(p: string): void {
    this._prefix = p;
  }

  public clearAllLocal(): void {
    for (const name in this._observers) {
      if (name.endsWith(this._getLocalSuffix())) {
        delete this._observers[name];
      }
    }
  }

  public clear(): boolean {
    this._observers = {};
    return true;
  }

  private _getUid(callback: ObserverCallback): string {
    if (callback._ouid) {
      return callback._ouid;
    }

    this._counter++;
    return 'observer_' + this._counter;
  }

  private _addLocal(name: string, callback: ObserverCallback): void {
    if (!this._observers[name]) {
      this._observers[name] = {};
    }

    const uid = this._getUid(callback);

    if (!callback._ouid) {
      callback._ouid = uid;
    }

    this._observers[name][uid] = callback;
  }

  private _removeLocal(name: string, callback: ObserverCallback): void {
    if (!this._observers[name] || !callback._ouid) {
      Urso.logger.error('ModulesObserverController remove error, no observer with', name, callback);
      return;
    }

    const uid = callback._ouid;
    delete this._observers[name][uid];

    if (Urso.helper.getObjectSize(this._observers[name]) === 0) {
      delete this._observers[name];
    }
  }

  private _fireLocal(name: string, params?: unknown): boolean {
    if (!this._observers[name]) {
      return false;
    }

    for (const [, callback] of Object.entries(this._observers[name])) {
      callback(params);
    }

    return true;
  }

  private _getLocalSuffix(): string {
    return this._prefixDelimiter + this._prefix;
  }
}

export default ModulesObserverController;
