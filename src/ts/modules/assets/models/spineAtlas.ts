import ModulesAssetsBaseModel from '../baseModel';

class ModulesAssetsModelsSpineAtlas extends ModulesAssetsBaseModel {
  constructor(params: Record<string, unknown>) {
    super(params);
    this.type = Urso.types.assets.SPINEATLAS;
  }
}

export default ModulesAssetsModelsSpineAtlas;
