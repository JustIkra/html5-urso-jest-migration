import type { ObserverCallback, StateActionConfig, StateIterator, StatesConfig } from '../../types';
import type ModulesStatesManagerAction from './action';
import type ModulesStatesManagerFunctionsStorage from './functionsStorage';
import type { GuidFunction } from './functionsStorage';

interface HelperFacade {
  getActionByConfig: (config: StateActionConfig) => ModulesStatesManagerAction;
}

interface ConfigStatesFacade {
  get: () => StatesConfig;
}

interface ControllerHost {
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;
  emit: (event: string, params?: unknown, delay?: number) => void;
}

class ModulesStatesManagerController {
  public readonly singleton = true;
  public getInstance!: <T = unknown>(path: string, ...args: unknown[]) => T;
  public emit!: (event: string, params?: unknown, delay?: number) => void;

  public statesGuards: ModulesStatesManagerFunctionsStorage;
  public actionsGuards: ModulesStatesManagerFunctionsStorage;
  public actionsRuns: ModulesStatesManagerFunctionsStorage;
  public actionsTerminations: ModulesStatesManagerFunctionsStorage;

  private _configStates: StatesConfig | null = null;
  private _currentState: string | null = null;
  private _currentAction: ModulesStatesManagerAction | null = null;
  private _forceNextStateKey: string | null = null;
  private _started: boolean = false;
  private _paused: boolean = false;
  private _pauseNeedResume: boolean = false;
  private _iterator: StateIterator | null = null;
  private _statesCallStatistic: Record<string, number> = {};

  constructor() {
    this.statesGuards = (this as unknown as ControllerHost).getInstance<ModulesStatesManagerFunctionsStorage>('FunctionsStorage');
    this.actionsGuards = (this as unknown as ControllerHost).getInstance<ModulesStatesManagerFunctionsStorage>('FunctionsStorage');
    this.actionsRuns = (this as unknown as ControllerHost).getInstance<ModulesStatesManagerFunctionsStorage>('FunctionsStorage');
    this.actionsTerminations = (this as unknown as ControllerHost).getInstance<ModulesStatesManagerFunctionsStorage>('FunctionsStorage');

    this._nextState = this._nextState.bind(this);
    this._statesCallStatistic = {};
  }

  public start(): void {
    if (this._started) {
      return;
    }

    this._currentState = null;
    this._iterator = this._iteratorConstructor();
    this._started = true;
    this._configStates = (this as unknown as ControllerHost).getInstance<ConfigStatesFacade>('ConfigStates').get();
    this._nextState();
  }

  public restart(): void {
    this.stop();

    this._started = false;
    this._paused = false;

    this.start();
  }

  public stop(): void {
    if (this._currentAction) {
      this._currentAction.forceDestroy();
    }
    this._currentAction = null;
    (this as unknown as ControllerHost).emit(Urso.events.MODULES_STATES_MANAGER_STOP as string);
  }

  public pause(): void {
    this._paused = true;
  }

  public resume(): void {
    this._paused = false;

    if (this._pauseNeedResume) {
      this._pauseNeedResume = false;
      this._nextState();
    }
  }

  public setForceNextState(stateKey: string): void {
    if (!this._configStates![stateKey]) {
      Urso.logger.error('ModulesStatesManagerController: setForceNextState name error', stateKey);
    }

    this._forceNextStateKey = stateKey;
  }

  private _iteratorConstructor(): StateIterator {
    let nextIndex = 0;

    const getNextStateByOrder = (): string => {
      const statesArray = Object.keys(this._configStates!);

      if (nextIndex === statesArray.length) {
        nextIndex = 0;
      }

      return statesArray[nextIndex++];
    };

    return {
      next: (): string => {
        const statesArray = Object.keys(this._configStates!);

        // force next state
        if (this._forceNextStateKey) {
          const forceNextStateKey = this._forceNextStateKey;
          this._forceNextStateKey = null;
          nextIndex = statesArray.indexOf(forceNextStateKey) + 1;
          return forceNextStateKey;
        }

        // nextState
        if (this._currentState) {
          const currentState = this._configStates![this._currentState];

          if (currentState.nextState) {
            for (const stateKey of currentState.nextState) {
              if (this.checkStateGuard(stateKey)) {
                nextIndex = statesArray.indexOf(stateKey) + 1;

                if (nextIndex === -1) {
                  Urso.logger.error('ModulesStatesManagerController: nextState name error', stateKey);
                  continue;
                }

                return stateKey;
              }
            }
          }
        }

        // go next state by order
        let stateName: string;

        do {
          stateName = getNextStateByOrder();
        } while (!this.checkStateGuard(stateName));

        return stateName;
      },
    };
  }

  private _nextState(): void {
    if (this._paused) {
      this._pauseNeedResume = true;
      return;
    }

    this._currentState = this._iterator!.next();

    // fill states call statistic
    if (!this._statesCallStatistic[this._currentState]) {
      this._statesCallStatistic[this._currentState] = 0;
    }
    this._statesCallStatistic[this._currentState]++;

    (this as unknown as ControllerHost).emit(Urso.events.MODULES_STATES_MANAGER_STATE_CHANGE as string, this._currentState);

    log('%c State ' + this._currentState, 'background: #bada55; color: #000');

    const config = this._configStates![this._currentState];
    const classInstance = (this as unknown as ControllerHost).getInstance<HelperFacade>('Helper').getActionByConfig(config);

    // actions instances guard
    if (!classInstance.guard()) {
      return this._nextState();
    }

    this._currentAction = classInstance;
    classInstance.run(this._nextState);
  }

  // actions guards
  public addActionGuard = (key: string, guard: GuidFunction): void => {
    this.actionsGuards.add(key, guard, true);
  };

  public checkActionGuard = (key: string): boolean => {
    return this.actionsGuards.checkGuard(key);
  };

  public removeActionGuard = (key: string, guard: GuidFunction): void => {
    this.actionsGuards.remove(key, guard);
  };

  // actions runs
  public addActionRun = (key: string, runFunction: GuidFunction): void => {
    this.actionsRuns.add(key, runFunction);
  };

  public runAction = (key: string, onFinishCallback: () => void): void => {
    this.actionsRuns.runAndCallbackOnFinish(key, onFinishCallback);
  };

  public removeActionRun = (key: string, runFunction: GuidFunction): void => {
    this.actionsRuns.remove(key, runFunction);
  };

  // actions terminations
  public addActionTerminate = (key: string, terminateFunction: GuidFunction): void => {
    this.actionsTerminations.add(key, terminateFunction);
  };

  public terminateAction = (key: string): void => {
    this.actionsTerminations.run(key);
  };

  public removeActionTerminate = (key: string, terminateFunction: GuidFunction): void => {
    this.actionsTerminations.remove(key, terminateFunction);
  };

  // states guards
  public setStateGuard = (key: string, guard: GuidFunction): void => {
    this.statesGuards.add(key, guard, true);
  };

  public checkStateGuard = (key: string): boolean => {
    // auto guard will check callLimit and return false, if limit is reached
    const callLimit = this._configStates![key].callLimit;

    if (
      callLimit &&
      callLimit <= (this._statesCallStatistic[key] || 0)
    ) {
      return false;
    }

    const guardResult = this.statesGuards.checkGuard(key);
    log('%c State guard ' + key + ' is ' + guardResult, 'background: #DA55C4; color: #000');
    return guardResult;
  };

  public removeStateGuard = (key: string, guard: GuidFunction): void => {
    this.statesGuards.remove(key, guard);
  };
}

export default ModulesStatesManagerController;
