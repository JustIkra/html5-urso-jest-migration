import ModulesAssetsBaseModel from '../baseModel';

class ModulesAssetsModelsSound extends ModulesAssetsBaseModel {
  public params: { loadType: number; xhrType: string };

  constructor(params: Record<string, unknown>) {
    super(params);
    this.type = Urso.types.assets.SOUND;
    this.params = {
      loadType: 1,
      xhrType: 'blob',
    };
  }
}

export default ModulesAssetsModelsSound;
