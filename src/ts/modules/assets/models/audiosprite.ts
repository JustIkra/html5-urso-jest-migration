import type { AssetTypeId } from '../../../types';
import ModulesAssetsBaseModel from '../baseModel';

interface HowlerFacade {
  Howler: {
    codecs: (codec: string) => boolean;
  };
}

class ModulesAssetsModelsAudiosprite extends ModulesAssetsBaseModel {
  public contents!: Record<string, unknown>[];
  public codecs: string[];

  constructor(params: Record<string, unknown>) {
    super(params);

    this.type = Urso.types.assets.AUDIOSPRITE;
    this.codecs = ['ogg', 'm4a', 'mp3', 'wav'];

    const codec = this.codecs.filter(
      (c) => ((globalThis as unknown as { UrsoUtils: HowlerFacade }).UrsoUtils).Howler.codecs(c),
    )[0];

    this.contents = Urso.helper.recursiveGet('contents', params, [
      { type: Urso.types.assets.JSON, key: `${this.key}_audiospriteJson`, path: `${this.path}.json` },
      { type: Urso.types.assets.SOUND, key: `${this.key}_audiospriteSound`, path: `${this.path}.${codec}` },
    ]) as Record<string, unknown>[];

    this.path = null;
    this.key = null;
  }

  public setupParams(params: Record<string, unknown>): void {
    super.setupParams(params);
    this.path = Urso.helper.recursiveGet('path', params, null) as string | null;
  }
}

export default ModulesAssetsModelsAudiosprite;
