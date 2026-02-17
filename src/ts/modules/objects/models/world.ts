import type { Container } from 'pixi.js';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface ScenesFacade {
  getPixiWorld: () => Container;
}

class ModulesObjectsModelsWorld extends ModulesObjectsBaseModel {
  public contents!: ModulesObjectsBaseModel[];

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.WORLD;
    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.contents = Urso.helper.recursiveGet('contents', params, []) as ModulesObjectsBaseModel[];
  }

  private _addBaseObject(): void {
    this._baseObject = (Urso.scenes as ScenesFacade).getPixiWorld();
  }
}

export default ModulesObjectsModelsWorld;
