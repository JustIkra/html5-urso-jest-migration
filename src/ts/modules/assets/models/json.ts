import ModulesAssetsBaseModel from '../baseModel';

class ModulesAssetsModelsJson extends ModulesAssetsBaseModel {
  constructor(params: Record<string, unknown>) {
    super(params);
    this.type = Urso.types.assets.JSON;
  }
}

export default ModulesAssetsModelsJson;
