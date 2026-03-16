interface ServiceInstance {
  updateQuality: () => void;
  getQuality: () => string;
  getCurrentResolution: () => number;
  sortAssets: (assets: unknown) => Record<string, unknown[]>;
  startLoad: (assetsSpace: Record<string, unknown[]>, callback: () => void, updateCallback: (progress: number) => void) => void;
  loadGroup: (assetsSpace: null, name: string | number, callback: () => void, updateCallback: (progress: number) => void) => void;
  checkWebPSupport: () => void;
  preloadAllImagesInGPU: () => void;
}

class ModulesAssetsController {
  public singleton: boolean = true;

  public getInstance!: <T = unknown>(path: string, ...args: unknown[]) => T;

  updateQuality(): void {
    if (Urso.config.useBinPath) {
      this.getInstance<ServiceInstance>('Service').updateQuality();
    }

    console.log('[ASSETS] Quality set to', this.getInstance<ServiceInstance>('Service').getQuality());
  }

  getQuality(): string {
    return this.getInstance<ServiceInstance>('Service').getQuality();
  }

  getCurrentResolution(): number {
    return this.getInstance<ServiceInstance>('Service').getCurrentResolution();
  }

  preload(assets: unknown, callback: () => void, updateCallback: (progress: number) => void = () => {}): void {
    const assetsSpace = this.getInstance<ServiceInstance>('Service').sortAssets(assets);
    this.getInstance<ServiceInstance>('Service').startLoad(assetsSpace, callback, updateCallback);
  }

  loadGroup(name: string | number, callback: () => void, updateCallback: (progress: number) => void = () => {}): void {
    this.getInstance<ServiceInstance>('Service').loadGroup(null, name, callback, updateCallback);
  }

  checkWebPSupport(): void {
    this.getInstance<ServiceInstance>('Service').checkWebPSupport();
  }

  preloadAllImagesInGPU(): void {
    this.getInstance<ServiceInstance>('Service').preloadAllImagesInGPU();
  }
}

export default ModulesAssetsController;
