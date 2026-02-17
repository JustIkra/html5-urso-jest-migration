import type { ObjectModelParams } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface ButtonFrames {
  over: unknown;
  out: unknown;
  pressed: unknown;
  disabled: unknown;
}

class ModulesObjectsModelsButtonComposite extends ModulesObjectsBaseModel {
  public action!: (() => void);
  public buttonFrames!: ButtonFrames;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.BUTTONCOMPOSITE;
    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.action = Urso.helper.recursiveGet('action', params, () => {
      this.emit('buttonPressed');
    }) as () => void;

    this.buttonFrames = {
      over: Urso.helper.recursiveGet('buttonFrames.over', params, null),
      out: Urso.helper.recursiveGet('buttonFrames.out', params, null),
      pressed: Urso.helper.recursiveGet('buttonFrames.pressed', params, null),
      disabled: Urso.helper.recursiveGet('buttonFrames.disabled', params, null),
    };
  }

  private _addBaseObject(): void {
    // Empty — buttonComposite has no pixi object
  }
}

export default ModulesObjectsModelsButtonComposite;
