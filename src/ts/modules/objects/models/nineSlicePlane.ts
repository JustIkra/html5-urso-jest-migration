import { NineSliceSprite, Texture } from 'pixi.js';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface CacheFacade {
  getTexture: (key: string) => Texture | null;
}

class ModulesObjectsModelsNineSlicePlane extends ModulesObjectsBaseModel {
  public assetKey!: string | null;
  public leftWidth!: number | null;
  public topHeight!: number | null;
  public rightWidth!: number | null;
  public bottomHeight!: number | null;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.NINESLICEPLANE;
    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.assetKey = Urso.helper.recursiveGet('assetKey', params, null) as string | null;
    this.leftWidth = Urso.helper.recursiveGet('leftWidth', params, null) as number | null;
    this.topHeight = Urso.helper.recursiveGet('topHeight', params, null) as number | null;
    this.rightWidth = Urso.helper.recursiveGet('rightWidth', params, null) as number | null;
    this.bottomHeight = Urso.helper.recursiveGet('bottomHeight', params, null) as number | null;
  }

  private _addBaseObject(): void {
    const texture = (Urso.cache as CacheFacade).getTexture(this.assetKey!);

    if (!texture) {
      Urso.logger.error('ModulesObjectsModelsImage assets error: no image with key: ' + this.assetKey);
    }

    this._baseObject = new NineSliceSprite({
      texture: texture!,
      leftWidth: this.leftWidth ?? undefined,
      topHeight: this.topHeight ?? undefined,
      rightWidth: this.rightWidth ?? undefined,
      bottomHeight: this.bottomHeight ?? undefined,
    });
  }
}

export default ModulesObjectsModelsNineSlicePlane;
