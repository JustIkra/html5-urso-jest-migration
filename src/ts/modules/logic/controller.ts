import type { UrsoInstance } from '../../types';

interface LogicBlockInstance {
  [methodName: string]: ((...args: unknown[]) => unknown) | unknown;
}

class ModulesLogicController {
  private _baseLogicBlocks: string[] = ['main', 'sounds'];
  public logicBlocks: string[];
  private _instances: Record<string, LogicBlockInstance> = {};

  public getInstance!: UrsoInstance['getInstance'];

  constructor() {
    const additionalLogicBlocks = this.getAdditionalLogicBlocks();
    this.logicBlocks = [...this._baseLogicBlocks, ...additionalLogicBlocks];

    this._init();
  }

  _init(): void {
    this._createLogicInstances();
  }

  getAdditionalLogicBlocks(): string[] {
    return [];
  }

  _createLogicInstances(): void {
    for (let i = 0; i < this.logicBlocks.length; i++) {
      const blockName = this.logicBlocks[i];
      const blockNameNormalized = Urso.helper.capitaliseFirstLetter(blockName);
      this._instances[blockName] = this.getInstance<LogicBlockInstance>(blockNameNormalized);
    }
  }

  do(...args: unknown[]): Record<string, unknown> {
    const results: Record<string, unknown> = {};
    const params = [...args];
    const functionName = params.shift() as string;

    for (const blockName in this._instances) {
      const instance = this._instances[blockName];

      if (instance && typeof instance[functionName] === 'function') {
        results[blockName] = (instance[functionName] as (...a: unknown[]) => unknown).apply(this, params);
      }
    }

    return results;
  }

  _subscribe(): void { }
}

export default ModulesLogicController;
