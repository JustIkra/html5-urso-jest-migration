import ModulesAssetsBaseModel from '../baseModel';

class ModulesAssetsModelsAtlas extends ModulesAssetsBaseModel {
  public cacheTextures!: boolean;

  constructor(params: Record<string, unknown>) {
    super(params);
    this.type = Urso.types.assets.ATLAS;
  }

  public setupParams(params: Record<string, unknown>): void {
    super.setupParams(params);
    this.cacheTextures = Urso.helper.recursiveGet('cacheTextures', params, false) as boolean;
  }
}

export default ModulesAssetsModelsAtlas;
