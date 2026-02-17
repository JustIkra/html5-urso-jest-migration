import { Container } from 'pixi.js';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

class ModulesObjectsModelsGroup extends ModulesObjectsBaseModel {
  public groupName!: string | null;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.GROUP;
    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.groupName = Urso.helper.recursiveGet('groupName', params, null) as string | null;
  }

  private _addBaseObject(): void {
    this._baseObject = new Container();
  }
}

export default ModulesObjectsModelsGroup;
