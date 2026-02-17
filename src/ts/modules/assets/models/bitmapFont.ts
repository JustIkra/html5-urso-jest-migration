import ModulesAssetsBaseModel from '../baseModel';

class ModulesAssetsModelsBitmapFont extends ModulesAssetsBaseModel {
  constructor(params: Record<string, unknown>) {
    super(params);
    this.type = Urso.types.assets.BITMAPFONT;
  }
}

export default ModulesAssetsModelsBitmapFont;
