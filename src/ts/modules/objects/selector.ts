import type { SelectorProperty, ParsedSelector, SelectorPropertyType } from '../../types';

interface SelectorTestObject {
  parent: SelectorTestObject | null;
  id: string | null;
  name: string | null;
  class: string | null;
  /** Index signature required: selector tests access properties by dynamic type key (id/name/class) */
  [key: string]: unknown;
}

class ModulesObjectsSelector {
  public readonly singleton: boolean = true;

  public testObject(testObject: SelectorTestObject, selector: string): boolean {
    const selectorsPartsParsed = this.parse(selector);
    return this.testObjectWithParsedSelector(testObject, selectorsPartsParsed);
  }

  public testObjectWithParsedSelector(testObject: SelectorTestObject, selectorsPartsParsed: ParsedSelector): boolean {
    const properties = selectorsPartsParsed[selectorsPartsParsed.length - 1];

    if (!this._testObjectsProperties(testObject, properties)) {
      return false;
    }

    if (selectorsPartsParsed.length === 1) {
      return true;
    }

    let parent: SelectorTestObject | null = testObject.parent;

    for (let i = selectorsPartsParsed.length - 2; i >= 0; i--) {
      const parentProperties = selectorsPartsParsed[i];
      let expectedParentFoundFlag = 0;

      while (expectedParentFoundFlag !== 1 && parent) {
        if (this._testObjectsProperties(parent, parentProperties)) {
          expectedParentFoundFlag = 1;
        }

        parent = parent.parent;
      }

      if (expectedParentFoundFlag === 1 && i === 0) {
        return true;
      }

      if (expectedParentFoundFlag === 0) {
        return false;
      }
    }

    return false;
  }

  public parse(selector: string): ParsedSelector {
    const selectorsParts = selector.split(' ');
    const selectorsPartsParsed: ParsedSelector = [];

    for (const selectorsPart of selectorsParts) {
      const selectorPartParsed = this._parseSelectorPart(selectorsPart);

      if (!selectorPartParsed) {
        Urso.logger.error('ModulesObjectsService error, cannot parse selector part: ' + selectorsPart);
      }

      selectorsPartsParsed.push(selectorPartParsed!);
    }

    return selectorsPartsParsed;
  }

  private _testObjectsProperties(object: SelectorTestObject, properties: SelectorProperty[]): boolean {
    for (const property of properties) {
      if (property.type === 'class') {
        const classValue = object[property.type] as string | null;
        if (!classValue || !classValue.split(' ').includes(property.value)) {
          return false;
        }
      } else if (object[property.type] !== property.value) {
        return false;
      }
    }

    return true;
  }

  private _parseSelectorPart(selectorPart: string): SelectorProperty[] | null {
    const characterEncoding = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+';
    const matchExpr: Record<string, RegExp> = {
      id: new RegExp('^#(' + characterEncoding + ')'),
      name: new RegExp('^\\^(' + characterEncoding + ')'),
      class: new RegExp('^\\.(' + characterEncoding + ')'),
    };

    const result: SelectorProperty[] = [];

    for (const type in matchExpr) {
      const foundItem = matchExpr[type].exec(selectorPart);

      if (foundItem) {
        result.push({ type: type as SelectorPropertyType, value: foundItem[1] });

        const restSelectorPart = Urso.helper.stringReplace(foundItem[0], '', selectorPart);
        const restItems = this._parseSelectorPart(restSelectorPart);

        if (restItems) {
          return Urso.helper.mergeArrays(result, restItems);
        }
      }
    }

    return result.length > 0 ? result : null;
  }
}

export default ModulesObjectsSelector;
