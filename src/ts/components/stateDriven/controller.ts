import ComponentsBaseController from '../base/controller';

declare const Urso: {
  events: Record<string, string>;
  logger: { error: (...args: unknown[]) => void };
  statesManager: {
    setStateGuard: (key: string, guard: () => boolean) => void;
    addActionRun: (key: string, run: (finish: () => void) => void) => void;
    addActionTerminate: (key: string, terminate: () => void) => void;
    addActionGuard: (key: string, guard: () => boolean) => void;
    removeStateGuard: (key: string, guard: () => boolean) => void;
    removeActionRun: (key: string, run: (finish: () => void) => void) => void;
    removeActionTerminate: (key: string, terminate: () => void) => void;
    removeActionGuard: (key: string, guard: () => boolean) => void;
  };
};

interface StateConfig {
  guard: () => boolean;
}

interface ActionConfig {
  run?: (finish: () => void) => void;
  terminate?: () => void;
  guard?: () => boolean;
}

type FinishCallback = () => void;

type RemoverFn = (key: string, fn: (...args: unknown[]) => unknown) => void;

class ComponentsStateDrivenController extends ComponentsBaseController {
  configStates: Record<string, StateConfig> = {};

  configActions: Record<string, ActionConfig> = {};

  _finishCallbacks: Record<string, FinishCallback> = {};

  _callbacksCache: {
    stateGuards: Record<string, () => boolean>;
    actionTerminates: Record<string, () => void>;
    actionGuards: Record<string, () => boolean>;
    actionRuns: Record<string, (finish: () => void) => void>;
  } = {
    stateGuards: {},
    actionTerminates: {},
    actionGuards: {},
    actionRuns: {},
  };

  callFinish(actionKey: string): void {
    if (!this._finishCallbacks[actionKey]) {
      Urso.logger.error('ComponentsStateDrivenController: no finish for actionKey', actionKey, this);
      return;
    }

    this._finishCallbacks[actionKey]();
    delete this._finishCallbacks[actionKey];
  }

  _processStates(): void {
    for (const stateKey in this.configStates) {
      this._callbacksCache.stateGuards[stateKey] = this.configStates[stateKey].guard.bind(this);
      Urso.statesManager.setStateGuard(stateKey, this._callbacksCache.stateGuards[stateKey]);
    }
  }

  _processActions(): void {
    for (const actionKey in this.configActions) {
      const actionCfg = this.configActions[actionKey];

      if (actionCfg.run) {
        this._callbacksCache.actionRuns[actionKey] = (finish: () => void) => {
          this._saveFinish(actionKey, finish);
          actionCfg.run!(() => this.callFinish(actionKey));
        };

        Urso.statesManager.addActionRun(actionKey, this._callbacksCache.actionRuns[actionKey]);
      } else {
        Urso.logger.error('ComponentsStateDrivenController: no run function in config', actionKey, this);
        continue;
      }

      if (actionCfg.terminate) {
        this._callbacksCache.actionTerminates[actionKey] = actionCfg.terminate.bind(this);
        Urso.statesManager.addActionTerminate(actionKey, this._callbacksCache.actionTerminates[actionKey]);
      }

      if (actionCfg.guard) {
        this._callbacksCache.actionGuards[actionKey] = actionCfg.guard.bind(this);
        Urso.statesManager.addActionGuard(actionKey, this._callbacksCache.actionGuards[actionKey]);
      }
    }
  }

  _saveFinish(actionKey: string, finish: FinishCallback): void {
    if (this._finishCallbacks[actionKey])
      Urso.logger.error('ComponentsStateDrivenController: actionKey alredy exists', actionKey, finish, this);

    this._finishCallbacks[actionKey] = finish;
  }

  _subscribeOnce(): void {
    this._processStates();
    this._processActions();
    this.addListener(Urso.events.MODULES_STATES_MANAGER_STOP, this._onStatesManagerStop.bind(this) as (params?: unknown) => void, true);
  }

  destroy(): void {
    this._removeCallback(Urso.statesManager.removeStateGuard as RemoverFn, this._callbacksCache.stateGuards);
    this._removeCallback(Urso.statesManager.removeActionGuard as RemoverFn, this._callbacksCache.actionGuards);
    this._removeCallback(Urso.statesManager.removeActionTerminate as RemoverFn, this._callbacksCache.actionTerminates);
    this._removeCallback(Urso.statesManager.removeActionRun as RemoverFn, this._callbacksCache.actionRuns);
  }

  _removeCallback(remover: RemoverFn, cacheObject: Record<string, ((...args: never[]) => unknown)>): void {
    for (const cacheKey in cacheObject) {
      remover(cacheKey, cacheObject[cacheKey] as (...args: unknown[]) => unknown);
    }
  }

  _onStatesManagerStop(): void {
    this._finishCallbacks = {};
  }
}

export default ComponentsStateDrivenController;
