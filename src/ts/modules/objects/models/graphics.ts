import { Graphics } from 'pixi.js';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

class ModulesObjectsModelsGraphics extends ModulesObjectsBaseModel {
  public polygon!: number[];
  public rectangle!: number[];
  public fillColor!: number;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.GRAPHICS;
    this._addBaseObject();
    this._drawPolygon();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.polygon = Urso.helper.recursiveGet('figure.polygon', params, []) as number[];
    this.rectangle = Urso.helper.recursiveGet('figure.rectangle', params, []) as number[];
    this.fillColor = Urso.helper.recursiveGet('figure.fillColor', params, 0x000000) as number;
  }

  private _drawPolygon(): void {
    if (!this.polygon.length && !this.rectangle.length) {
      return;
    }

    const gfx = this._baseObject as Graphics;

    gfx.beginFill(this.fillColor);

    if (this.polygon.length) {
      gfx.drawPolygon(this.polygon);
    } else if (this.rectangle.length) {
      gfx.drawRect(this.rectangle[0], this.rectangle[1], this.rectangle[2], this.rectangle[3]);
    }

    gfx.endFill();
  }

  private _addBaseObject(): void {
    this._baseObject = new Graphics();
  }
}

export default ModulesObjectsModelsGraphics;
