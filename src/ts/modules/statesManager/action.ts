import type { ObserverCallback } from '../../types';

interface StatesManagerFacade {
  runAction: (name: string, onFinish: () => void) => void;
  terminateAction: (name: string) => void;
}

interface ActionHost {
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;
  emit: (event: string, params?: unknown, delay?: number) => void;
}

interface ControllerFacade {
  checkActionGuard: (name: string) => boolean;
}

class ModulesStatesManagerAction {
  public name: string;
  public finished: boolean = false;
  public getInstance!: <T = unknown>(path: string, ...args: unknown[]) => T;
  public emit!: (event: string, params?: unknown, delay?: number) => void;

  protected _running: boolean = false;
  protected _terminating: boolean = false;
  protected _onFinishCallback: (() => void) | null = null;
  protected _startTime: number = 0;
  protected _forceDestroying: boolean = false;

  constructor(name?: string) {
    this.name = name ?? '';
    this._onFinish = this._onFinish.bind(this);
  }

  public guard(): boolean {
    return !this._running && (this as unknown as ActionHost).getInstance<ControllerFacade>('Controller').checkActionGuard(this.name);
  }

  public run(onFinishCallback: () => void): void {
    this._preRunUpdateAction(onFinishCallback);
    (Urso.statesManager as StatesManagerFacade).runAction(this.name, this._onFinish);
  }

  protected _preRunUpdateAction(onFinishCallback: () => void): void {
    this._running = true;
    this._startTime = Urso.time.get();
    log(`%c action run ---> ${this.name}`, 'color: blue');

    (this as unknown as ActionHost).emit(Urso.events.MODULES_STATES_MANAGER_ACTION_START as string, this.name);

    this.finished = false;
    this._onFinishCallback = onFinishCallback;
  }

  public terminate(): void {
    if (this._forceDestroying) {
      return;
    }

    if (!this._running) {
      Urso.logger.warn('ModulesStatesManagerAction: action run from terminating', this.name);
      this.run(() => { });
    }

    if (this._terminating) {
      Urso.logger.error('ModulesStatesManagerAction: action already terminating', this.name);
      return;
    }

    log(`%c action terminate X ${this.name}`, 'color: blue');
    this._terminating = true;
    (Urso.statesManager as StatesManagerFacade).terminateAction(this.name);
  }

  protected _onFinish(): void {
    if (this._forceDestroying) {
      return;
    }

    if (this.finished) {
      Urso.logger.error('ModulesStatesManagerAction: action already finished', this.name);
      return;
    }

    this._running = false;
    this._terminating = false;
    this.finished = true;
    const elapsedTime = Urso.time.get() - this._startTime;

    (this as unknown as ActionHost).emit(Urso.events.MODULES_STATES_MANAGER_ACTION_FINISH as string, this.name);

    log(`%c action finish <--- ${this.name} (${elapsedTime}ms)`, 'color: blue');
    this._onFinishCallback!();
  }

  public forceDestroy(): void {
    if (this._forceDestroying || !this._running) {
      return;
    }

    this._forceDestroying = true;
    log(`%c action forceDestroyed <--- ${this.name}`, 'color: #F39986');
  }
}

export default ModulesStatesManagerAction;
