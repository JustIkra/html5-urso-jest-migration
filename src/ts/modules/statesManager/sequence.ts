import type { StateActionConfig } from '../../types';
import ModulesStatesManagerAll from './all';

class ModulesStatesManagerSequence extends ModulesStatesManagerAll {
  constructor(params: StateActionConfig[]) {
    super(params);
    this.name = 'Sequence';
  }

  public run(onFinishCallback: () => void): void {
    log(`%c action run ---> ${this.name}`, 'color: orange', this.params);

    this.finished = false;
    this._startTime = Urso.time.get();
    this._onFinishCallback = onFinishCallback;

    this._checkFinish();
  }

  protected _checkFinish(): boolean {
    if (!this._terminating) {
      for (const action of this._actions) {
        if (!action.finished) {
          if (action.guard()) {
            action.run(this._actionSuccessHandler);
            return false;
          } else {
            action.finished = true;
          }
        }
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
        return; // only one action is currently running
      }
    }
  }
}

export default ModulesStatesManagerSequence;
