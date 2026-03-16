import { Sprite, Texture } from 'pixi.js';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface CacheFacade {
  getTexture: (key: string) => Texture | null;
}

interface PointerEvent {
  data: {
    button: number;
  };
}

class ModulesObjectsModelsButton extends ModulesObjectsBaseModel {
  public action!: (() => void);
  public disableRightClick!: boolean;
  public keyDownAction!: (() => void) | null;
  public mouseOverAction!: (() => void) | null;
  public mouseOutAction!: (() => void) | null;
  public noActionOnMouseOut!: boolean;
  public handlePointerUpOutside!: boolean;
  public buttonFrames!: Record<string, unknown>;
  public pixelPerfectOver!: boolean;
  public pixelPerfectClick!: boolean;

  protected _isOver: boolean = false;
  protected _isDown: boolean = false;
  protected _isDisabled: boolean = false;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this._isOver = false;
    this._isDown = false;
    this._isDisabled = false;

    this.type = Urso.types.objects.BUTTON;
    this._addBaseObject();

    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.action = Urso.helper.recursiveGet('action', params, () => {
      this.emit(Urso.events.MODULES_OBJECTS_BUTTON_PRESS, { name: this.name, class: this['class'] });
    }) as () => void;
    this.disableRightClick = Urso.helper.recursiveGet('disableRightClick', params, false) as boolean;
    this.keyDownAction = Urso.helper.recursiveGet('keyDownAction', params, null) as (() => void) | null;
    this.mouseOverAction = Urso.helper.recursiveGet('mouseOverAction', params, null) as (() => void) | null;
    this.mouseOutAction = Urso.helper.recursiveGet('mouseOutAction', params, null) as (() => void) | null;
    this.noActionOnMouseOut = Urso.helper.recursiveGet('noActionOnMouseOut', params, this._checkIsDesktop()) as boolean;
    this.handlePointerUpOutside = Urso.helper.recursiveGet('handlePointerUpOutside', params, true) as boolean;

    this.buttonFrames = {
      over: Urso.helper.recursiveGet('buttonFrames.over', params, null),
      out: Urso.helper.recursiveGet('buttonFrames.out', params, null),
      pressed: Urso.helper.recursiveGet('buttonFrames.pressed', params, null),
      disabled: Urso.helper.recursiveGet('buttonFrames.disabled', params, null),
    };

    this.pixelPerfectOver = Urso.helper.recursiveGet('pixelPerfectOver', params, true) as boolean;
    this.pixelPerfectClick = Urso.helper.recursiveGet('pixelPerfectClick', params, true) as boolean;
  }

  private _checkIsDesktop(): boolean {
    return !!(Urso.device as unknown as Record<string, unknown>).desktop && !Urso.helper.isIpadOS();
  }

  public setButtonFrame(key: string, assetKey: string): void {
    this.buttonFrames[key] = assetKey;

    if (this._isOver) {
      this._changeTexture('over');
    } else if (this._isDown) {
      this._changeTexture('pressed');
    } else if (this._isDisabled) {
      this._changeTexture('disabled');
    } else {
      this._changeTexture('out');
    }
  }

  public enable(): void {
    if (!this._isDisabled) return;

    if (this._isOver) {
      this._changeTexture('over');
    } else {
      this._changeTexture('out');
    }

    this._isDisabled = false;
    (this._baseObject as unknown as Record<string, unknown>).eventMode = 'static';
    (this._baseObject as unknown as Record<string, unknown>).cursor = 'pointer';
  }

  public disable(): void {
    if (this._isDisabled) return;

    this._changeTexture('disabled');
    this._isDisabled = true;
    (this._baseObject as unknown as Record<string, unknown>).eventMode = 'passive';
    delete (this._baseObject as unknown as Record<string, string>).cursor;
  }

  protected _addBaseObject(): void {
    this._baseObject = new Sprite();
    this._changeTexture('out');

    (this._baseObject as unknown as Record<string, unknown>).eventMode = 'static';
    (this._baseObject as unknown as Record<string, unknown>).cursor = 'pointer';

    (this._baseObject as unknown as { on: (e: string, h: (...a: unknown[]) => void) => unknown })
      .on('pointerdown', this._onButtonDown.bind(this) as (...a: unknown[]) => void);
    (this._baseObject as unknown as { on: (e: string, h: (...a: unknown[]) => void) => unknown })
      .on('pointerup', this._onButtonUp.bind(this) as (...a: unknown[]) => void);
    (this._baseObject as unknown as { on: (e: string, h: (...a: unknown[]) => void) => unknown })
      .on('pointerover', this._onButtonOver.bind(this) as (...a: unknown[]) => void);
    (this._baseObject as unknown as { on: (e: string, h: (...a: unknown[]) => void) => unknown })
      .on('pointerout', this._onButtonOut.bind(this) as (...a: unknown[]) => void);

    if (this.handlePointerUpOutside) {
      (this._baseObject as unknown as { on: (e: string, h: (...a: unknown[]) => void) => unknown })
        .on('pointerupoutside', this._onButtonUp.bind(this) as (...a: unknown[]) => void);
    }
  }

  protected _onButtonDown(event: PointerEvent): void {
    if (this._isDisabled) return;

    if (this.disableRightClick && event.data.button !== 0) return;

    this._isDown = true;

    if (this.keyDownAction) {
      this.keyDownAction();
    }

    if (this._isDisabled) return;

    this._changeTexture('pressed');
  }

  protected _onButtonUp(event: PointerEvent): void {
    if (this._isDisabled || !this._isDown) return;

    if (this.disableRightClick && event.data.button !== 0) return;

    this._isDown = false;

    if (this.action) {
      if (!this.noActionOnMouseOut || this._isOver) {
        this.action();
      }
    }

    if (this._isDisabled) return;

    if (this._isOver) {
      this._changeTexture('over');
    } else {
      this._changeTexture('out');
    }
  }

  protected _onButtonOver(): void {
    this._isOver = true;

    if (this._isDisabled) return;

    if (this._isDown) return;

    if (this.mouseOverAction) {
      this.mouseOverAction();
    }

    this._changeTexture('over');
  }

  protected _onButtonOut(): void {
    this._isOver = false;

    if (this._isDisabled) return;

    if (this._isDown) return;

    if (this.mouseOutAction) {
      this.mouseOutAction();
    }

    this._changeTexture('out');
  }

  protected _changeTexture(key: string): boolean {
    const texture = (Urso.cache as CacheFacade).getTexture(this.buttonFrames[key] as string);

    if (!texture) {
      if (key === 'out') {
        Urso.logger.error('ModulesObjectsModelsButton assets error: no out image ' + this.buttonFrames.out);
        return false;
      }

      this._changeTexture('out');
      return false;
    }

    (this._baseObject as Sprite).texture = texture;
    return true;
  }
}

export default ModulesObjectsModelsButton;
