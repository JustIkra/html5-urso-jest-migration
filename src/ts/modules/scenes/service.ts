import type { UrsoInstance } from '../../types';
import type ModulesScenesModel from './model';

interface ParsedTemplate {
  styles: Record<string, unknown>;
  assets: unknown[];
  objects: unknown[];
  components: { create: () => void; update: (dt: number) => void; destroy: () => void; loadUpdate: (p: number) => void }[];
}

interface PixiWrapperFacade {
  init: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  isPaused: () => boolean;
  setNewScene: (model: ModulesScenesModel) => void;
}

declare const Urso: {
  events: Record<string, string>;
  helper: { mergeArrays: <T>(a: T[], b: T[]) => T[] };
  template: {
    parse: (template: unknown, additional?: boolean) => ParsedTemplate;
    scene: (name: string) => unknown | null;
  };
  assets: { preload: (assets: unknown, onLoaded: () => void, onProgress?: (p: number) => void) => void };
  objects: { create: (objects: unknown, parent?: unknown, flag?: boolean) => unknown };
  observer: { clearAllLocal: () => void; setPrefix: (prefix: string) => void };
};

declare const gsap: { globalTimeline: { timeScale: (v: number) => void } };

class ModulesScenesService {
  public readonly singleton = true;

  public timeScale = 1;

  public _displayInProgress = false;
  public _currentSceneName: string | null = null;
  public _currentSceneTemplate: ParsedTemplate | null = null;
  public _sceneModel: ModulesScenesModel | null = null;
  public _pixiWrapper!: PixiWrapperFacade;

  public getInstance!: UrsoInstance['getInstance'];
  public emit!: UrsoInstance['emit'];

  constructor() {
    this._assetsLoadedHandler = this._assetsLoadedHandler.bind(this);
    this.loadUpdate = this.loadUpdate.bind(this);
  }

  async init(): Promise<void> {
    this._pixiWrapper = this.getInstance<PixiWrapperFacade>('PixiWrapper');
    await this._pixiWrapper.init();
  }

  pause(): void {
    this.getInstance<PixiWrapperFacade>('PixiWrapper').pause();
    this.emit(Urso.events.MODULES_SCENES_PAUSE);
  }

  resume(): void {
    this.getInstance<PixiWrapperFacade>('PixiWrapper').resume();
    this.emit(Urso.events.MODULES_SCENES_RESUME);
  }

  getTimeScale(): number {
    const loopPaused = this.getInstance<PixiWrapperFacade>('PixiWrapper').isPaused();
    return loopPaused ? 0 : this.timeScale;
  }

  setTimeScale(value: number): void {
    this.timeScale = value;
    gsap.globalTimeline.timeScale(this.timeScale);
  }

  addObject(objects: unknown, parent?: unknown, doNotRefreshStylesFlag?: boolean): unknown | null {
    const newTemplatePart = Urso.template.parse({ objects: [objects] }, true);

    if (newTemplatePart.assets.length) {
      Urso.assets.preload(newTemplatePart.assets, () =>
        this._newTemplateAssetsLoadedHandler(newTemplatePart, parent, doNotRefreshStylesFlag),
      );
      return null;
    } else {
      return this._newTemplateAssetsLoadedHandler(newTemplatePart, parent, doNotRefreshStylesFlag);
    }
  }

  _newTemplateAssetsLoadedHandler(
    newTemplatePart: ParsedTemplate,
    parent?: unknown,
    doNotRefreshStylesFlag?: boolean,
  ): unknown {
    const objectToCreate = newTemplatePart.objects[0];
    const result = Urso.objects.create(objectToCreate, parent, doNotRefreshStylesFlag);

    if (newTemplatePart.components && newTemplatePart.components.length > 0) {
      newTemplatePart.components.forEach((component) => component.create());
      if (this._currentSceneTemplate) {
        this._currentSceneTemplate.components = Urso.helper.mergeArrays(
          this._currentSceneTemplate.components,
          newTemplatePart.components,
        );
      }
    }

    return result;
  }

  display(name: string): false | void {
    if (this._displayInProgress) {
      console.warn('Scenes.display is busy ', this._currentSceneName);
      return false;
    }

    const template = Urso.template.scene(name);

    if (!template) {
      console.error('Scenes.display error: no template for scene', name);
      return false;
    }

    this._displayInProgress = true;
    this.emit(Urso.events.MODULES_SCENES_DISPLAY_START, name);

    if (this._sceneModel) this._sceneModel.destroy();

    this._currentSceneName = name;
    Urso.observer.clearAllLocal();
    Urso.observer.setPrefix(name);

    this._currentSceneTemplate = Urso.template.parse(template);
    this._sceneModel = this.getInstance<ModulesScenesModel>('Model');

    const tpl = this._currentSceneTemplate;
    this._sceneModel.loadUpdate = (loadProgress?: number) => {
      tpl.components.forEach((c) => c.loadUpdate(loadProgress!));
    };
    this._sceneModel.create = () => {
      tpl.components.forEach((c) => c.create());
    };
    this._sceneModel.update = (deltaTime?: number) => {
      tpl.components.forEach((c) => c.update(deltaTime!));
    };
    this._sceneModel.destroy = () => {
      tpl.components.forEach((c) => c.destroy());
    };

    this.getInstance<PixiWrapperFacade>('PixiWrapper').setNewScene(this._sceneModel);
    this.emit(Urso.events.MODULES_SCENES_NEW_SCENE_INIT, name);

    Urso.assets.preload(tpl.assets, this._assetsLoadedHandler, this.loadUpdate);
  }

  loadUpdate(loadProgress: number): void {
    if (!this._sceneModel) return;

    this._sceneModel.loadUpdate(loadProgress);
    this.emit(Urso.events.MODULES_ASSETS_LOAD_PROGRESS, loadProgress);
  }

  _assetsLoadedHandler(): void {
    if (!this._currentSceneTemplate) return;

    Urso.objects.create(this._currentSceneTemplate.objects);

    this._sceneModel!.create();

    this._displayInProgress = false;

    this.emit(Urso.events.MODULES_SCENES_DISPLAY_FINISHED);
  }
}

export default ModulesScenesService;
