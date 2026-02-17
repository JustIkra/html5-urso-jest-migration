import { Sprite, Texture } from 'pixi.js';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface CacheFacade {
  getTexture: (key: string) => Texture | null;
}

class ModulesObjectsModelsImage extends ModulesObjectsBaseModel {
  public assetKey!: string | null;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.IMAGE;
    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.assetKey = Urso.helper.recursiveGet('assetKey', params, null) as string | null;
  }

  public changeTexture(assetKey: string): void {
    this.assetKey = assetKey;

    this._addBaseObject();
  }

  private _addBaseObject(): void {
    const texture = (Urso.cache as CacheFacade).getTexture(this.assetKey!);

    if (!texture) {
      Urso.logger.error('ModulesObjectsModelsImage assets error: no image with key: ' + this.assetKey);
    }

    if (!this._baseObject) {
      this._baseObject = new Sprite(texture!);
    } else {
      (this._baseObject as Sprite).texture = texture!;
    }
  }
}

export default ModulesObjectsModelsImage;
