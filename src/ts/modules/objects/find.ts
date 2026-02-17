import type ModulesObjectsBaseModel from './baseModel';
import type ModulesObjectsSelector from './selector';
import type ModulesObjectsCache from './cache';

interface FindFacade {
  getInstance: <T = unknown>(path: string) => T;
}

class ModulesObjectsFind {
  public readonly singleton: boolean = true;
  public getInstance!: <T = unknown>(path: string) => T;
  private _selector: ModulesObjectsSelector;

  constructor() {
    this._selector = (this as unknown as FindFacade).getInstance<ModulesObjectsSelector>('Selector');
  }

  public do(selector: string, findOneFlag?: boolean): ModulesObjectsBaseModel[] | null {
    const result: ModulesObjectsBaseModel[] = [];
    const selectorsPartsParsed = this._selector.parse(selector);
    const lastRule = selectorsPartsParsed[selectorsPartsParsed.length - 1][0];

    const cache = (this as unknown as FindFacade).getInstance<ModulesObjectsCache>('Cache');
    const getMethodName = ('get' + Urso.helper.capitaliseFirstLetter(lastRule.type)) as keyof Pick<ModulesObjectsCache, 'getId' | 'getName' | 'getClass'>;
    const cacheResult = cache[getMethodName](lastRule.value);

    let testObjects: ModulesObjectsBaseModel[] | null;

    if (lastRule.type !== 'class' && cacheResult) {
      testObjects = [cacheResult as ModulesObjectsBaseModel];
    } else {
      testObjects = cacheResult as ModulesObjectsBaseModel[] | null;
    }

    if (!testObjects || testObjects.length === 0) {
      return null;
    }

    if (
      findOneFlag &&
      selectorsPartsParsed.length === 1 &&
      selectorsPartsParsed[0].length === 1
    ) {
      return testObjects;
    }

    for (const testObject of testObjects) {
      const testResult = this._selector.testObjectWithParsedSelector(
        testObject as unknown as Parameters<typeof this._selector.testObjectWithParsedSelector>[0],
        selectorsPartsParsed,
      );

      if (testResult) {
        result.push(testObject);
      }

      if (testResult && findOneFlag) {
        return result;
      }
    }

    return result;
  }
}

export default ModulesObjectsFind;
