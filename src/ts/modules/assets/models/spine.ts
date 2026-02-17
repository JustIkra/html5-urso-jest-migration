import ModulesAssetsBaseModel from '../baseModel';

class ModulesAssetsModelsSpine extends ModulesAssetsBaseModel {
  public noAtlas!: boolean;

  constructor(params: Record<string, unknown>) {
    super(params);
    this.type = Urso.types.assets.SPINE;
  }

  public setupParams(params: Record<string, unknown>): void {
    super.setupParams(params);
    this.key = Urso.helper.recursiveGet('key', params, null) as string | null;
    this.noAtlas = Urso.helper.recursiveGet('noAtlas', params, false) as boolean;
  }
}

export default ModulesAssetsModelsSpine;
