import { Container } from 'pixi.js';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsModelsToggle from './toggle';

interface ObjectsFacade {
  create: (model: Record<string, unknown>, parent: unknown) => CheckboxChild;
}

interface CheckboxChild {
  _baseObject: {
    interactive: boolean;
    buttonMode: boolean;
    on: (event: string, handler: (...args: unknown[]) => void) => CheckboxChild['_baseObject'];
    clear: () => void;
    beginFill: (color: number) => void;
    drawPolygon: (points: number[]) => void;
    drawRect: (...args: number[]) => void;
    endFill: () => void;
    /** Index signature required: pixi display object exposes dynamic properties */
    [key: string]: unknown;
  };
  changeTexture: (assetKey: string) => void;
  /** Index signature required: checkbox child has dynamic model properties */
  [key: string]: unknown;
}

interface GraphicsFigure {
  polygon?: number[];
  rectangle?: number[];
  fillColor?: number;
}

class ModulesObjectsModelsCheckbox extends ModulesObjectsModelsToggle {
  public lable!: Record<string, unknown> | null;
  public defaultStatus!: 'pressed' | 'unpressed';
  public contents!: unknown[];

  private _lable: CheckboxChild | null = null;
  private _checkbox: CheckboxChild | null = null;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this._isDisabled = false;
    this._lable = null;
    this._checkbox = null;

    this.type = Urso.types.objects.CHECKBOX;

    this._createCheckbox();

    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.contents = [];

    this.action = Urso.helper.recursiveGet('action', params, () => {
      this.emit(Urso.events.MODULES_OBJECTS_CHECKBOX_PRESS, {
        name: this.name,
        status: this.status,
        class: this['class'],
      });
    }) as () => void;

    this.lable = Urso.helper.recursiveGet('lable', params, null) as Record<string, unknown> | null;
    this.defaultStatus = Urso.helper.recursiveGet('defaultStatus', params, 'unpressed') as 'pressed' | 'unpressed';
    this.handlePointerUpOutside = Urso.helper.recursiveGet('handlePointerUpOutside', params, true) as boolean;
  }

  private _createCheckbox(): void {
    this.status = this.defaultStatus;
    this._checkbox = this._createObject(this.buttonFrames[`${this.defaultStatus}Out`] as Record<string, unknown>);

    if (this.lable) {
      this._lable = this._createObject(this.lable);
    }
  }

  private _createObject(model: Record<string, unknown>): CheckboxChild {
    model = Urso.helper.objectClone(model) as Record<string, unknown>;
    const object = (Urso.objects as ObjectsFacade).create(model, this);

    object._baseObject.interactive = true;
    object._baseObject.buttonMode = true;

    object._baseObject
      .on('pointerdown', this._onButtonDown.bind(this) as (...a: unknown[]) => void)
      .on('pointerup', this._onButtonUp.bind(this) as (...a: unknown[]) => void)
      .on('pointerover', this._onButtonOver.bind(this) as (...a: unknown[]) => void)
      .on('pointerout', this._onButtonOut.bind(this) as (...a: unknown[]) => void);

    if (this.handlePointerUpOutside) {
      (this._baseObject as unknown as { on: (e: string, h: (...a: unknown[]) => void) => unknown })
        .on('pointerupoutside', this._onButtonUp.bind(this) as (...a: unknown[]) => void);
    }

    return object;
  }

  protected _addBaseObject(): void {
    this._baseObject = new Container();
  }

  private _drawGraphics({ polygon, rectangle, fillColor }: GraphicsFigure): void {
    if (!polygon && !rectangle) return;

    this._checkbox!._baseObject.clear();
    this._checkbox!._baseObject.beginFill(fillColor!);

    if (polygon && polygon.length) {
      this._checkbox!._baseObject.drawPolygon(polygon);
    } else if (rectangle && rectangle.length) {
      this._checkbox!._baseObject.drawRect(...rectangle as [number, number, number, number]);
    }

    this._checkbox!._baseObject.endFill();
  }

  protected _changeTexture(key: string): boolean {
    if (!this.buttonFrames[key]) {
      if (key === `${this.status}Out`) {
        Urso.logger.error('ModulesObjectsModelsButton assets error: no out image ' + this.buttonFrames.out);
        return false;
      }

      this._changeTexture(`${this.status}Out`);
      return false;
    }

    const frame = this.buttonFrames[key] as Record<string, unknown>;

    if (frame.type === Urso.types.objects.GRAPHICS) {
      this._drawGraphics(frame.figure as GraphicsFigure);
    } else {
      this._checkbox!.changeTexture(frame.assetKey as string);
    }

    return true;
  }
}

export default ModulesObjectsModelsCheckbox;
