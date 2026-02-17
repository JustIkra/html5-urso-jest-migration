import type { StateActionConfig } from '../../types';
import ModulesStatesManagerRace from './race';

class ModulesStatesManagerAll extends ModulesStatesManagerRace {
  constructor(params: StateActionConfig[]) {
    super(params);
    this.name = 'All';
  }

  public guard(): boolean {
    for (const action of this._actions) {
      if (action.guard()) {
        return true;
      }
    }

    return false;
  }

  protected _actionSuccessHandler(): void {
    this._checkFinish();
  }
}

export default ModulesStatesManagerAll;
