import ModulesAssetsBaseModel from '../baseModel';

class ModulesAssetsModelsHtml extends ModulesAssetsBaseModel {
  constructor(params: Record<string, unknown>) {
    super(params);
    this.type = Urso.types.assets.HTML;
  }
}

export default ModulesAssetsModelsHtml;
