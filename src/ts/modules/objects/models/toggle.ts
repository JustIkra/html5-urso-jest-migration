import { Sprite, Texture } from 'pixi.js';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsModelsButton from './button';

interface CacheFacade {
  getTexture: (key: string) => Texture | null;
}

class ModulesObjectsModelsToggle extends ModulesObjectsModelsButton {
  public status: 'pressed' | 'unpressed' = 'unpressed';

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.status = 'unpressed';

    this.type = Urso.types.objects.TOGGLE;
    this._addBaseObject();

    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.action = Urso.helper.recursiveGet('action', params, () => {
      this.emit(Urso.events.MODULES_OBJECTS_TOGGLE_PRESS, {
        name: this.name,
        status: this.status,
        class: this['class'],
      });
    }) as () => void;

    this.buttonFrames = {
      pressedOver: Urso.helper.recursiveGet('buttonFrames.pressedOver', params, null),
      pressedOut: Urso.helper.recursiveGet('buttonFrames.pressedOut', params, null),
      unpressedOver: Urso.helper.recursiveGet('buttonFrames.unpressedOver', params, null),
      unpressedOut: Urso.helper.recursiveGet('buttonFrames.unpressedOut', params, null),
      pressedDown: Urso.helper.recursiveGet('buttonFrames.pressedDown', params, null),
      unpressedDown: Urso.helper.recursiveGet('buttonFrames.unpressedDown', params, null),
      pressedDisabled: Urso.helper.recursiveGet('buttonFrames.pressedDisabled', params, null),
      unpressedDisabled: Urso.helper.recursiveGet('buttonFrames.unpressedDisabled', params, null),
    };

    this.handlePointerUpOutside = Urso.helper.recursiveGet('handlePointerUpOutside', params, true) as boolean;
  }

  public setButtonFrame(key: string, assetKey: string): void {
    this.buttonFrames[key] = assetKey;

    if (this._isOver) {
      this._changeTexture(`${this.status}Over`);
    } else if (this._isDown) {
      this._changeTexture(`${this.status}Down`);
    } else if (this._isDisabled) {
      this._changeTexture(`${this.status}Disabled`);
    } else {
      this._changeTexture(`${this.status}Out`);
    }
  }

  public enable(): void {
    if (!this._isDisabled) return;

    if (this._isOver) {
      this._changeTexture(`${this.status}Over`);
    } else {
      this._changeTexture(`${this.status}Out`);
    }

    this._isDisabled = false;
    (this._baseObject as unknown as Record<string, unknown>).buttonMode = true;
    (this._baseObject as unknown as Record<string, unknown>).interactive = true;
  }

  public disable(): void {
    if (this._isDisabled) return;

    this._changeTexture(`${this.status}Disabled`);
    this._isDisabled = true;
    (this._baseObject as unknown as Record<string, unknown>).buttonMode = false;
    (this._baseObject as unknown as Record<string, unknown>).interactive = false;
  }

  protected _addBaseObject(): void {
    this._baseObject = new Sprite();
    this._changeTexture('unpressedOut');

    (this._baseObject as unknown as Record<string, unknown>).interactive = true;
    (this._baseObject as unknown as Record<string, unknown>).buttonMode = true;

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

  protected _onButtonDown(): void {
    if (this._isDisabled) return;

    this._isDown = true;

    if (this.keyDownAction) {
      this.keyDownAction();
    }

    if (this._isDisabled) return;

    this._changeTexture(`${this.status}Down`);

    this.status = this.status === 'pressed' ? 'unpressed' : 'pressed';
  }

  protected _onButtonUp(): void {
    if (this._isDisabled) return;

    this._isDown = false;

    if (this.action) {
      this.action();
    }

    if (this._isDisabled) return;

    if (this._isOver) {
      this._changeTexture(`${this.status}Over`);
    } else {
      this._changeTexture(`${this.status}Out`);
    }
  }

  protected _onButtonOver(): void {
    this._isOver = true;

    if (this._isDisabled || this._isDown) return;

    if (this.mouseOverAction) {
      this.mouseOverAction();
    }

    this._changeTexture(`${this.status}Over`);
  }

  protected _onButtonOut(): void {
    this._isOver = false;

    if (this._isDisabled || this._isDown) return;

    if (this.mouseOutAction) {
      this.mouseOutAction();
    }

    this._changeTexture(`${this.status}Out`);
  }

  public switchStatus(): void {
    this.status = this.status === 'pressed' ? 'unpressed' : 'pressed';

    if (this._isOver) {
      this._changeTexture(`${this.status}Over`);
    } else {
      this._changeTexture(`${this.status}Out`);
    }
  }

  protected _changeTexture(key: string): boolean {
    const texture = (Urso.cache as CacheFacade).getTexture(this.buttonFrames[key] as string);

    if (!texture) {
      if (key === `${this.status}Out`) {
        Urso.logger.error('ModulesObjectsModelsButton assets error: no out image ' + this.buttonFrames.out);
        return false;
      }

      this._changeTexture(`${this.status}Out`);
      return false;
    }

    (this._baseObject as Sprite).texture = texture;
    return true;
  }
}

export default ModulesObjectsModelsToggle;
