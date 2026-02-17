import type { StateActionConfig } from '../../types';
import ModulesStatesManagerAction from './action';

interface HelperFacade {
  getActionByConfig: (config: StateActionConfig) => ModulesStatesManagerAction;
}

interface RaceHost {
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;
}

class ModulesStatesManagerRace extends ModulesStatesManagerAction {
  public params: StateActionConfig[];
  protected _actions: ModulesStatesManagerAction[];

  constructor(params: StateActionConfig[]) {
    super();

    this.name = 'Race';
    this._actions = [];
    this.params = params;

    for (const config of params) {
      this._actions.push((this as unknown as RaceHost).getInstance<HelperFacade>('Helper').getActionByConfig(config));
    }

    this._actionSuccessHandler = this._actionSuccessHandler.bind(this);
  }

  public guard(): boolean {
    for (const action of this._actions) {
      if (action.guard()) {
        return true;
      }
    }

    return false;
  }

  public run(onFinishCallback: () => void): void {
    log(`%c action run ---> ${this.name}`, 'color: orange', this.params);

    this.finished = false;
    this._startTime = Urso.time.get();
    this._onFinishCallback = onFinishCallback;

    for (const action of this._actions) {
      if (action.guard()) {
        action.run(this._actionSuccessHandler);
      } else {
        action.finished = true;
      }
    }
  }

  protected _actionSuccessHandler(): void {
    if (!this._checkFinish()) {
      this.terminate();
    }
  }

  protected _checkFinish(): boolean {
    for (const action of this._actions) {
      if (!action.finished) {
        return false;
      }
    }

    this._onFinish();

    return true;
  }

  public terminate(): void {
    if (this._terminating || this._forceDestroying) {
      return;
    }

    log(`%c action terminate X ${this.name}`, 'color: orange');

    this._terminating = true;

    for (const action of this._actions) {
      if (!action.finished) {
        action.terminate();
      }
    }
  }

  protected _onFinish(): void {
    if (this._forceDestroying) {
      return;
    }

    this.finished = true;
    const elapsedTime = Urso.time.get() - this._startTime;
    log(`%c action finish <--- ${this.name}  (${elapsedTime}ms)`, 'color: orange');
    this._onFinishCallback!();
  }

  public forceDestroy(): void {
    this._forceDestroying = true;

    for (const action of this._actions) {
      if (!action.finished) {
        action.forceDestroy();
      }
    }

    log(`%c action forceDestroyed <--- ${this.name}`, 'color: #F39986');
  }
}

export default ModulesStatesManagerRace;
