import ModulesAssetsBaseModel from '../baseModel';

class ModulesAssetsModelsImage extends ModulesAssetsBaseModel {
  public preloadGPU!: boolean;

  constructor(params: Record<string, unknown>) {
    super(params);
    this.type = Urso.types.assets.IMAGE;
  }

  public setupParams(params: Record<string, unknown>): void {
    super.setupParams(params);
    this.preloadGPU = Urso.helper.recursiveGet('preloadGPU', params, false) as boolean;
  }
}

export default ModulesAssetsModelsImage;
