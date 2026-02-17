import ModulesAssetsBaseModel from '../baseModel';

class ModulesAssetsModelsFont extends ModulesAssetsBaseModel {
  constructor(params: Record<string, unknown>) {
    super(params);
    this.type = Urso.types.assets.FONT;
  }
}

export default ModulesAssetsModelsFont;
