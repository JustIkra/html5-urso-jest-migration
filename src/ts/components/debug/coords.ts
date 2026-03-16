import type { ComponentCommon } from '../../types';

interface TextObject {
  text: string;
}

class ComponentsDebugCoords {
  private _coordsText: TextObject | null = null;

  public common!: ComponentCommon;

  constructor() {
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
  }

  create(): boolean {
    this._coordsText = this.common.findOne!('^debugCoords') as TextObject | null;
    this.update();
    return true;
  }

  update(): void {
    const coords = Urso.scenes.getMouseCoords();
    this._coordsText!.text = 'x:' + Math.floor(coords.x) + '; y:' + Math.floor(coords.y);
  }
}

export default ComponentsDebugCoords;
