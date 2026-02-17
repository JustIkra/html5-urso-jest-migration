import { Graphics } from 'pixi.js';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

class ModulesObjectsModelsMask extends ModulesObjectsBaseModel {
  public rectangle!: number[] | null;
  public rectangles!: number[][] | null;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.MASK;
    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.rectangle = Urso.helper.recursiveGet('rectangle', params, null) as number[] | null;
    this.rectangles = Urso.helper.recursiveGet('rectangles', params, null) as number[][] | null;
  }

  private _addBaseObject(): void {
    const mask = new Graphics();
    mask.lineStyle(0);
    mask.beginFill(0xffffff);

    if (this.rectangle) {
      this._drawRect(mask, this.rectangle);
    } else if (this.rectangles) {
      for (const rectangle of this.rectangles) {
        this._drawRect(mask, rectangle);
      }
    }

    mask.endFill();

    this._baseObject = mask;
  }

  private _drawRect(maskObject: Graphics, rectangle: number[]): void {
    maskObject.drawRect(rectangle[0], rectangle[1], rectangle[2], rectangle[3]);
  }
}

export default ModulesObjectsModelsMask;
