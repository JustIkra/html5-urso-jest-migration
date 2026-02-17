import { Graphics, Rectangle, Circle, Polygon } from 'pixi.js';
import type { ObjectModelParams, UrsoEvent } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface CustomInteractionArea {
  type: 'rectangle' | 'circle' | 'polygon';
  params: number[];
}

interface PointerEvent {
  data: {
    button: number;
    global: { x: number; y: number };
  };
}

interface ObjectsFacade {
  getWorld: () => {
    _baseObject: { scale: { x: number; y: number } };
  };
}

class ModulesObjectsModelsHitArea extends ModulesObjectsBaseModel {
  public action!: ((position: { x: number; y: number }) => void);
  public disableRightClick!: boolean;
  public keyDownAction!: ((position: { x: number; y: number }) => void) | null;
  public mouseOverAction!: (() => void) | null;
  public mouseOutAction!: (() => void) | null;
  public onTouchMoveCallback!: ((position: { x: number; y: number }) => void) | null;
  public handlePointerUpOutside!: boolean;
  public customInteractionArea!: CustomInteractionArea | null;

  private _isDisabled: boolean = false;
  private _isDown: boolean = false;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);
    this._isDisabled = false;
    this._isDown = false;

    this.type = Urso.types.objects.HITAREA;

    this._addBaseObject();

    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.action = Urso.helper.recursiveGet(
      'action', params, (position: { x: number; y: number }) => {
        this.emit(Urso.events.MODULES_OBJECTS_HIT_AREA_PRESS as string, { position, name: this.name, class: this['class'] });
      },
    ) as (position: { x: number; y: number }) => void;
    this.disableRightClick = Urso.helper.recursiveGet('disableRightClick', params, false) as boolean;
    this.keyDownAction = Urso.helper.recursiveGet('keyDownAction', params, null) as ((position: { x: number; y: number }) => void) | null;
    this.mouseOverAction = Urso.helper.recursiveGet('mouseOverAction', params, null) as (() => void) | null;
    this.mouseOutAction = Urso.helper.recursiveGet('mouseOutAction', params, null) as (() => void) | null;
    this.onTouchMoveCallback = Urso.helper.recursiveGet('onTouchMoveCallback', params, null) as ((position: { x: number; y: number }) => void) | null;
    this.handlePointerUpOutside = Urso.helper.recursiveGet('handlePointerUpOutside', params, true) as boolean;
    this.customInteractionArea = Urso.helper.recursiveGet('customInteractionArea', params, null) as CustomInteractionArea | null;
  }

  public enable(): void {
    if (!this._isDisabled) return;

    this._isDisabled = false;
    (this._baseObject as unknown as Record<string, unknown>).interactive = true;
  }

  public disable(): void {
    if (this._isDisabled) return;

    this._isDisabled = true;
    (this._baseObject as unknown as Record<string, unknown>).interactive = false;
  }

  private _addBaseObject(): void {
    const gfx = new Graphics();

    gfx.lineStyle(0);
    gfx.beginFill(0xffffff);
    gfx.drawRect(0, 0, this.width as number, this.height as number);
    gfx.endFill();
    gfx.alpha = 0;
    (gfx as unknown as Record<string, unknown>).cacheAsBitmap = true;

    (gfx as unknown as Record<string, unknown>).eventMode = 'static';
    (gfx as unknown as Record<string, unknown>).cursor = 'pointer';

    (gfx as unknown as { on: (event: string, handler: (e: PointerEvent) => void) => unknown })
      .on('pointerdown', this._onPressDown.bind(this));
    (gfx as unknown as { on: (event: string, handler: (e: PointerEvent) => void) => unknown })
      .on('pointerup', this._onPressUp.bind(this));
    (gfx as unknown as { on: (event: string, handler: (e: PointerEvent) => void) => unknown })
      .on('pointerupoutside', this._onPressUpOutside.bind(this));
    (gfx as unknown as { on: (event: string, handler: () => void) => unknown })
      .on('pointerover', this._onOver.bind(this));
    (gfx as unknown as { on: (event: string, handler: () => void) => unknown })
      .on('pointerout', this._onOut.bind(this));
    (gfx as unknown as { on: (event: string, handler: (e: PointerEvent) => void) => unknown })
      .on('touchmove', this._onTouchmove.bind(this));

    if (this.customInteractionArea) {
      (gfx as unknown as Record<string, unknown>).hitArea = this._getHitAreaObject(this.customInteractionArea);
    }

    this._baseObject = gfx;
  }

  private _onTouchmove(event: PointerEvent): void {
    if (this._isDisabled) return;

    const position = this._getEventLocalPosition(event);

    if (this.onTouchMoveCallback) {
      this.onTouchMoveCallback(position);
    }
  }

  private _onPressDown(event: PointerEvent): void {
    if (this._isDisabled) return;

    if (this.disableRightClick && event.data.button !== 0) return;

    if (this._isDown) return;

    this._isDown = true;

    if (this.keyDownAction) {
      const position = this._getEventLocalPosition(event);
      this.keyDownAction(position);
    }
  }

  private _onPressUp(event: PointerEvent): void {
    if (this._isDisabled) return;

    if (this.disableRightClick && event.data.button !== 0) return;

    if (!this._isDown) return;

    this._isDown = false;

    if (this.action) {
      const position = this._getEventLocalPosition(event);
      this.action(position);
    }
  }

  private _onPressUpOutside(event: PointerEvent): void {
    if (this.handlePointerUpOutside) {
      this._onPressUp(event);
      return;
    }

    if (this._isDisabled) return;

    this._isDown = false;
  }

  private _onOver(): void {
    if (this._isDisabled) return;

    if (this.mouseOverAction) {
      this.mouseOverAction();
    }
  }

  private _onOut(): void {
    if (this._isDisabled) return;

    if (this.mouseOutAction) {
      this.mouseOutAction();
    }
  }

  private _getEventLocalPosition(event: PointerEvent): { x: number; y: number } {
    const world = (Urso.objects as ObjectsFacade).getWorld();
    const worldScale = world._baseObject.scale;

    const x = event.data.global.x / worldScale.x;
    const y = event.data.global.y / worldScale.y;

    return { x, y };
  }

  private _getHitAreaObject(area: CustomInteractionArea): Rectangle | Circle | Polygon | null {
    if (!area.type) return null;

    const constructors: Record<string, new (...args: number[]) => Rectangle | Circle | Polygon> = {
      rectangle: Rectangle as unknown as new (...args: number[]) => Rectangle,
      circle: Circle as unknown as new (...args: number[]) => Circle,
      polygon: Polygon as unknown as new (...args: number[]) => Polygon,
    };

    const Ctor = constructors[area.type];
    if (!Ctor) return null;

    return new Ctor(...area.params);
  }
}

export default ModulesObjectsModelsHitArea;
