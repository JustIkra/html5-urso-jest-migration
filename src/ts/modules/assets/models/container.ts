import ModulesAssetsBaseModel from '../baseModel';

class ModulesAssetsModelsContainer extends ModulesAssetsBaseModel {
  public contents!: Record<string, unknown>[];

  constructor(params: Record<string, unknown>) {
    super(params);
    this.type = Urso.types.assets.CONTAINER;
    this.key = null;
    this.path = null;
  }

  public setupParams(params: Record<string, unknown>): void {
    super.setupParams(params);
    this.contents = Urso.helper.recursiveGet('contents', params, []) as Record<string, unknown>[];
  }
}

export default ModulesAssetsModelsContainer;
