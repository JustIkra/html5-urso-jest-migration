import ComponentsBaseController from '../base/controller';

declare const Urso: {
  helper: { logicBlocksDo: (ctx: unknown, method: string) => void };
};

interface DebugObject {
  visible: boolean;
}

class ComponentsDebugController extends ComponentsBaseController {
  private _logicBlocks: string[] = ['coords', 'fps', 'timescale'];
  private _visible = true;
  private _comObject: DebugObject | null = null;
  private _created = false;

  constructor(params?: Record<string, unknown>) {
    super(params);
  }

  create(): void {
    this._created = true;

    this._comObject = this.common.findOne!('^debugContainer') as DebugObject | null;
    this._show(true);

    Urso.helper.logicBlocksDo(this, 'create');
  }

  update(): void {
    if (!this._created)
      return;

    Urso.helper.logicBlocksDo(this, 'update');
  }

  _show(visMode?: boolean): void {
    this._visible = (typeof visMode !== 'undefined') ? visMode : !this._visible;
    this._comObject!.visible = this._visible;
  }
}

export default ComponentsDebugController;
