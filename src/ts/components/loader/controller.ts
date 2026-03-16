import ComponentsBaseController from '../base/controller';

interface SceneObject {
  text: string;
  _baseObject: {
    mask: unknown;
    scale: { x: number };
  };
  visible: boolean;
}

class ComponentsLoaderController extends ComponentsBaseController {
  loadUpdate(loadProgress?: number): void {
    this.setLoadProgress(loadProgress as number);
  }

  create(): void {
    this.setMask();
  }

  setMask(): void {
    if (this.loaderBg && this.loaderBgMask)
      this.loaderBg._baseObject.mask = this.loaderBgMask._baseObject;
  }

  formatAmountText(text: number): string {
    return `${text}%`;
  }

  setLoadProgress(val: number): void {
    if (!this.componentCreated) return;

    this.loaderBgMask!._baseObject.scale.x = val;
    this.loadAmountText!.text = this.formatAmountText(val);
  }

  get componentCreated(): boolean {
    return !!this.loadAmountText && !!this.loaderBg && !!this.loaderBgMask;
  }

  get loadAmountText(): SceneObject | null {
    return Urso.findOne('.loadAmountText') as SceneObject | null;
  }

  get loaderBg(): SceneObject | null {
    return Urso.findOne('^loaderBg') as SceneObject | null;
  }

  get loaderBgMask(): SceneObject | null {
    return Urso.findOne('^loaderBgMask') as SceneObject | null;
  }
}

export default ComponentsLoaderController;
