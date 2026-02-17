import type { ComponentCommon } from '../../types';

declare const Urso: {
  scenes: { timeScale: number };
  math: { roundToDigits: (num: number, digits: number) => number };
};

interface TextObject {
  text: string | number;
  visible: boolean;
}

class ComponentsDebugTimescale {
  private _timescaleText: TextObject | null = null;

  public scaleStep = 0.5;
  public scaleInfoDuration = 2000;

  private _minusButtonsCodes = [109, 189];
  private _plusButtonsCodes = [107, 187];
  private _hideId: ReturnType<typeof setTimeout> | null = null;

  public common!: ComponentCommon;

  constructor() {
    this.create = this.create.bind(this);
  }

  create(): boolean {
    document.addEventListener('keydown', this.keyPressTest.bind(this));
    this._timescaleText = this.common.findOne!('^debugTimescaleValue') as TextObject | null;
    return true;
  }

  keyPressTest(e: KeyboardEvent): void {
    const evtobj = e;

    if (!evtobj.altKey)
      return;

    let factor = 0;

    if (this._minusButtonsCodes.includes(evtobj.keyCode)) {
      factor = -1;
    }

    if (this._plusButtonsCodes.includes(evtobj.keyCode)) {
      factor = 1;
    }

    if (!factor)
      return;

    const timescaleDiff = Urso.scenes.timeScale >= 1 ? this.scaleStep * factor : (this.scaleStep * factor) * 0.1;
    let timescaleNewValue = Urso.scenes.timeScale + timescaleDiff;

    if (timescaleNewValue < 0.1)
      timescaleNewValue = 0.1;

    Urso.scenes.timeScale = Urso.math.roundToDigits(timescaleNewValue, 2);

    this._timescaleText!.text = Urso.scenes.timeScale;
    this._timescaleText!.visible = true;

    if (this._hideId)
      clearTimeout(this._hideId);

    this._hideId = setTimeout(() => this._timescaleText!.visible = false, this.scaleInfoDuration);
  }
}

export default ComponentsDebugTimescale;
