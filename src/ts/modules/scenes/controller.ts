import type { UrsoInstance } from '../../types';

interface ServiceFacade {
  init: () => Promise<void>;
  display: (name: string) => void;
  pause: () => void;
  resume: () => void;
  loadUpdate: (loadProgress: number) => void;
  addObject: (objects: unknown, parent?: unknown, doNotRefreshStylesFlag?: boolean) => unknown | null;
  getTimeScale: () => number;
  setTimeScale: (value: number) => void;
}

interface PixiWrapperFacade {
  getFps: () => number;
  getFpsData: () => { fps: number; limit: number };
  getPixiWorld: () => unknown;
  getCachedMouseCoords: () => { x: number; y: number };
  getRenderer: () => unknown;
  generateTexture: (obj: unknown) => unknown;
}

interface ResolutionsFacade {
  getTemplateSize: () => { orientation: string; width: number; height: number };
}

class ModulesScenesController {
  public readonly singleton = true;

  public _service!: ServiceFacade;

  public getInstance!: UrsoInstance['getInstance'];

  async init(): Promise<void> {
    this._service = this.getInstance<ServiceFacade>('Service');
    await this._service.init();
  }

  display(name: string): void {
    this._service.display(name);
  }

  getFps(): number {
    return this.getInstance<PixiWrapperFacade>('PixiWrapper').getFps();
  }

  getFpsData(): { fps: number; limit: number } {
    return this.getInstance<PixiWrapperFacade>('PixiWrapper').getFpsData();
  }

  pause(): void {
    this._service.pause();
  }

  resume(): void {
    this._service.resume();
  }

  loadUpdate(loadProgress: number): void {
    this._service.loadUpdate(loadProgress);
  }

  getPixiWorld(): unknown {
    return this.getInstance<PixiWrapperFacade>('PixiWrapper').getPixiWorld();
  }

  getTemplateSize(): { orientation: string; width: number; height: number } {
    return this.getInstance<ResolutionsFacade>('Resolutions').getTemplateSize();
  }

  getMouseCoords(): { x: number; y: number } {
    return this.getInstance<PixiWrapperFacade>('PixiWrapper').getCachedMouseCoords();
  }

  addObject(objects: unknown, parent?: unknown, doNotRefreshStylesFlag?: boolean): unknown | null {
    return this._service.addObject(objects, parent, doNotRefreshStylesFlag);
  }

  generateTexture(obj: unknown): unknown {
    return this.getInstance<PixiWrapperFacade>('PixiWrapper').generateTexture(obj);
  }

  getRenderer(): unknown {
    return this.getInstance<PixiWrapperFacade>('PixiWrapper').getRenderer();
  }

  get timeScale(): number {
    return this._service.getTimeScale();
  }

  set timeScale(value: number) {
    this._service.setTimeScale(value);
  }
}

export default ModulesScenesController;
