import type { StateActionConfig } from '../../types';
import type ModulesStatesManagerAction from './action';

interface HelperHost {
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;
}

class ModulesStatesManagerHelper {
  public readonly singleton = true;
  public getInstance!: <T = unknown>(path: string, ...args: unknown[]) => T;

  public getActionByConfig(config: StateActionConfig): ModulesStatesManagerAction {
    const actionType = Object.keys(config)[0];
    const actionParams = (config as unknown as Record<string, unknown>)[actionType];

    if (actionType === 'action') {
      const actionName = actionParams as string;

      const customActionInstance = (this as unknown as HelperHost).getInstance<ModulesStatesManagerAction | null>(
        'Actions.' + Urso.helper.capitaliseFirstLetter(actionName),
      );

      if (customActionInstance) {
        return customActionInstance;
      }
    }

    const className = Urso.helper.capitaliseFirstLetter(actionType);
    return (this as unknown as HelperHost).getInstance<ModulesStatesManagerAction>(className, actionParams);
  }
}

export default ModulesStatesManagerHelper;
