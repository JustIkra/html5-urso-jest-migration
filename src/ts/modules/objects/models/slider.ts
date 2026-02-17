import { Container } from 'pixi.js';
import type { ObjectModelParams, ObserverCallback } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface ObjectsFacade {
  create: (model: Record<string, unknown>, parent: unknown) => SliderChild;
  getWorld: () => { _baseObject: { scale: { x: number; y: number } } };
  removeChild: (parent: unknown, child: unknown, flag: boolean) => void;
}

interface SliderChild {
  _baseObject: {
    width: number;
    height: number;
    scale: { x: number; y: number };
    mask: unknown;
    on: (event: string, handler: (...args: unknown[]) => void) => SliderChild['_baseObject'];
    interactive?: boolean;
    buttonMode?: boolean;
    /** Index signature required: pixi display object exposes dynamic properties */
    [key: string]: unknown;
  };
  anchorX: number;
  anchorY: number;
  text?: string | number;
  x: number;
  y: number;
  /** Index signature required: slider reads dynamic position/size properties by key */
  [key: string]: unknown;
}

interface PointerEvent {
  target: unknown;
  data: {
    global: { x: number; y: number };
    getLocalPosition: (target: unknown) => { x: number; y: number };
  };
}

class ModulesObjectsModelsSlider extends ModulesObjectsBaseModel {
  public points!: number[];
  public defaultValue!: number | null;
  public bgTexture!: Record<string, unknown> | null;
  public fillTexture!: Record<string, unknown> | null;
  public handleTexture!: Record<string, unknown> | null;
  public minValueTextModel!: Record<string, unknown> | null;
  public maxValueTextModel!: Record<string, unknown> | null;
  public currentValueTextModel!: Record<string, unknown> | null;
  public isVertical!: boolean;
  public handlePointerUpOutside!: boolean;
  public contents!: unknown[];

  public positionKey!: string;
  public sizeKey!: string;

  public minValueText: SliderChild | null = null;
  public maxValueText: SliderChild | null = null;
  public currentValueText: SliderChild | null = null;

  private _sliderBg: SliderChild | null = null;
  private _sliderHandle: SliderChild | null = null;
  private _fillTexture: SliderChild | null = null;
  private _fillMask: SliderChild | null = null;
  private _handleIsDragging: boolean = false;
  private _points: number[] = [];

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.SLIDER;
    this._sliderBg = null;
    this._sliderHandle = null;
    this._handleIsDragging = false;
    this._points = [];
    this._addBaseObject();
  }

  public get sliderSize(): number {
    const anchorType = this.sizeKey === 'width' ? 'anchorX' : 'anchorY';
    const anchor = this._sliderHandle![anchorType] as number;
    const handleSize = this._sliderHandle![this.sizeKey] as number;
    return this._sliderBg!._baseObject[this.sizeKey] as number - handleSize + handleSize * anchor * 2;
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);
    this.contents = [];
    this.points = Urso.helper.recursiveGet('points', params, [0, 1]) as number[];
    this.defaultValue = Urso.helper.recursiveGet('defaultValue', params, null) as number | null;
    this.bgTexture = Urso.helper.recursiveGet('bgTexture', params, null) as Record<string, unknown> | null;
    this.fillTexture = Urso.helper.recursiveGet('fillTexture', params, null) as Record<string, unknown> | null;
    this.handleTexture = Urso.helper.recursiveGet('handleTexture', params, null) as Record<string, unknown> | null;
    this.minValueTextModel = Urso.helper.recursiveGet('minValueTextModel', params, null) as Record<string, unknown> | null;
    this.maxValueTextModel = Urso.helper.recursiveGet('maxValueTextModel', params, null) as Record<string, unknown> | null;
    this.currentValueTextModel = Urso.helper.recursiveGet('currentValueTextModel', params, null) as Record<string, unknown> | null;
    this.isVertical = Urso.helper.recursiveGet('isVertical', params, false) as boolean;
    this.handlePointerUpOutside = Urso.helper.recursiveGet('handlePointerUpOutside', params, true) as boolean;
  }

  public setHandlePosition(coefficient: number): void {
    const position: Record<string, number> = {};
    const targetPosition = this.sliderSize * coefficient;
    position[this.positionKey] = targetPosition;

    const { coord, value } = this._calculateClosestPoint(position);
    this._setNewValue(coord!, value!);
  }

  private _setVariables(): void {
    if (this.isVertical) {
      this.positionKey = 'y';
      this.sizeKey = 'height';
    } else {
      this.positionKey = 'x';
      this.sizeKey = 'width';
    }
  }

  private _createSliderTextures(): void {
    this._sliderBg = this._createTexture(this.bgTexture!);

    if (this.fillTexture) {
      this._fillTexture = this._createFillTexture(this.fillTexture);
    }

    this._sliderHandle = this._createTexture(this.handleTexture!);

    this._setEvents(this._sliderBg!._baseObject);
    this._setEvents(this._sliderHandle!._baseObject);
  }

  private _createFillTexture(model: Record<string, unknown>): SliderChild | null {
    const fillTexture = this._createTexture(model);
    if (!fillTexture) return null;

    const { width, height } = fillTexture._baseObject;

    this._fillMask = (Urso.objects as ObjectsFacade).create({
      type: Urso.types.objects.GRAPHICS,
      figure: {
        rectangle: [0, 0, width, height],
      },
      x: -width * fillTexture.anchorX,
      y: -height * fillTexture.anchorY,
    }, this);

    fillTexture._baseObject.mask = this._fillMask!._baseObject;
    return fillTexture;
  }

  private _createValueText(): void {
    if (this.minValueTextModel) {
      this.minValueText = (Urso.objects as ObjectsFacade).create(this.minValueTextModel as Record<string, unknown>, this);
      this.minValueText!.text = this._points[0];
    }

    if (this.maxValueTextModel) {
      this.maxValueText = (Urso.objects as ObjectsFacade).create(this.maxValueTextModel as Record<string, unknown>, this);
      this.maxValueText!.text = this._points.length <= 2 ? '100' : this._points[this._points.length - 1];
    }

    if (this.currentValueTextModel) {
      this.currentValueText = (Urso.objects as ObjectsFacade).create(this.currentValueTextModel as Record<string, unknown>, this);
    }
  }

  private _createTexture(model: Record<string, unknown>): SliderChild {
    if (
      model.type === Urso.types.objects.GRAPHICS ||
      model.type === Urso.types.objects.IMAGE
    ) {
      return (Urso.objects as ObjectsFacade).create(model, this);
    }

    Urso.logger.error('ModulesObjectsModelsSlider objects error: textures should be GRAPHICS or IMAGE type');
    return null as unknown as SliderChild;
  }

  private _setEvents(obj: SliderChild['_baseObject']): void {
    obj.interactive = true;
    obj.buttonMode = true;

    obj
      .on('pointerdown', this._onPointerDown.bind(this) as (...args: unknown[]) => void)
      .on('pointerup', this._onPointerUp.bind(this) as (...args: unknown[]) => void)
      .on('pointerupoutside', this._onPointerUp.bind(this) as (...args: unknown[]) => void)
      .on('touchmove', this._onTouchmove.bind(this) as (...args: unknown[]) => void);

    if (this.handlePointerUpOutside) {
      ((this._baseObject as unknown) as { on: (event: string, handler: (...args: unknown[]) => void) => void })
        .on('pointerupoutside', this._onPointerUp.bind(this) as (...args: unknown[]) => void);
    }
  }

  private _onTouchmove(event: PointerEvent): void {
    const position = this._getEventLocalPosition(event);
    this._onPointerMove(position);
  }

  private _getEventLocalPosition(event: PointerEvent): { x: number; y: number } {
    const world = (Urso.objects as ObjectsFacade).getWorld();
    const worldScale = world._baseObject.scale;

    const x = event.data.global.x / worldScale.x;
    const y = event.data.global.y / worldScale.y;

    return { x, y };
  }

  private _addBaseObject(): void {
    this._baseObject = new Container();

    this._setPoints();
    this._setVariables();
    this._createSliderTextures();
    this._createValueText();
    this._setDefaultValue();
  }

  private _onPointerDown(obj: PointerEvent): void {
    if (obj.target === this._sliderHandle!._baseObject) {
      this._handleIsDragging = true;
    }
  }

  private _onPointerMove({ x, y }: { x: number; y: number }): void {
    if (!this._handleIsDragging) return;

    const value = this.isVertical ? y : x;
    const globalPosition = this.toGlobal()[this.positionKey as 'x' | 'y'];

    if (value < globalPosition) {
      (this._sliderHandle as Record<string, unknown>)[this.positionKey] = 0;
    } else if (value >= globalPosition + this.sliderSize) {
      (this._sliderHandle as Record<string, unknown>)[this.positionKey] = this.sliderSize;
    } else {
      (this._sliderHandle as Record<string, unknown>)[this.positionKey] = value - globalPosition;
    }

    this._updateValueOnMove();
  }

  private _updateValueOnMove(): void {
    const { value } = this._calculateClosestPoint(this._sliderHandle!);

    if (this.currentValueText) {
      this.currentValueText.text = value;
    }

    const data = {
      class: this['class'],
      name: this.name,
      position: (this._sliderHandle as Record<string, unknown>)[this.positionKey],
    };
    this.emit(Urso.events.MODULES_OBJECTS_SLIDER_HANDLE_MOVE as string, data);
  }

  private _onPointerUp(obj: PointerEvent): void {
    this._handleIsDragging = false;
    let targetObj: Record<string, unknown>;

    if (obj.target === this._sliderBg!._baseObject) {
      targetObj = obj.data.getLocalPosition(obj.target) as Record<string, unknown>;
    } else {
      targetObj = this._sliderHandle as unknown as Record<string, unknown>;
    }

    const { coord, value } = this._calculateClosestPoint(targetObj);
    this._dropHandle(coord!, value!);
  }

  private _setPoints(): void {
    if (this.points.length > 1) {
      this._points = [...this.points];
      return;
    }

    const firstPoint = this.points[0] > 0 ? 0 : this.points[0];
    const lastPoint = this.points[0] > 0 ? this.points[0] : 0;

    for (let i = firstPoint; i <= lastPoint; i++) {
      this._points.push(i);
    }
  }

  private _setDefaultValue(): void {
    if (!this.defaultValue) {
      this.defaultValue = this._points[0];
    }

    if (!this._points.includes(this.defaultValue!)) {
      this.defaultValue = this._points[0];
    }

    const value = this._points.indexOf(this.defaultValue!) * this.sliderSize / (this._points.length - 1);
    this._setNewValue(value, this.defaultValue!);
  }

  private _dropHandle(coord: number, value: number): void {
    const data = {
      class: this['class'],
      name: this.name,
      position: coord,
      value: value,
    };

    this.emit(Urso.events.MODULES_OBJECTS_SLIDER_HANDLE_DROP as string, data);
    this._setNewValue(coord, value);
  }

  private _calculateClosestPoint(obj: Record<string, unknown>): { coord?: number; value?: number } {
    const givenValue = obj[this.positionKey] as number;
    let value: number | undefined;
    let coord: number | undefined;

    if (this._points.length <= 2) {
      coord = givenValue;
      value = ~~(100 / this.sliderSize * givenValue);
    } else {
      for (let i = 0; i < this._points.length; i++) {
        const pointCoord = i * this.sliderSize / (this._points.length - 1);

        if (typeof coord === 'number' && givenValue - pointCoord < coord - givenValue) {
          // keep current coord
        } else {
          coord = pointCoord;
          value = this._points[i];
        }
      }
    }

    return { coord, value };
  }

  private _setFillMask(): void {
    if (!this._fillMask) return;

    const handlePos = (this._sliderHandle as Record<string, unknown>)[this.positionKey] as number;
    const bgPos = (this._sliderBg as Record<string, unknown>)[this.positionKey] as number;
    const fillSize = this._fillTexture!._baseObject[this.sizeKey] as number;
    const progress = (handlePos - bgPos) * 100 / fillSize * 0.01;

    const scaleKey = this.isVertical ? 'scaleY' : 'scaleX';
    (this._fillMask as Record<string, unknown>)[scaleKey] = progress;
  }

  private _setNewValue(coord: number, value: number): void {
    (this._sliderHandle as Record<string, unknown>)[this.positionKey] = coord;

    if (this.currentValueText) {
      this.currentValueText.text = value;
    }

    this._setFillMask();
  }

  public _subscribeOnce(): void {
    this.addListener(
      Urso.events.MODULES_SCENES_MOUSE_NEW_POSITION as string,
      this._onPointerMove.bind(this) as ObserverCallback,
    );
  }
}

export default ModulesObjectsModelsSlider;
