import type { ResolutionConfig, AdaptiveConfig } from '../../types';

class ModulesScenesResolutionsConfig {
  public readonly singleton = true;

  public _orientations: string[] = [
    Urso.device.ScreenOrientation.LANDSCAPE,
    Urso.device.ScreenOrientation.PORTRAIT,
  ];

  public contents: ResolutionConfig[] = [
    {
      name: 'default',
      width: 1920,
      height: 1080,
      orientation: Urso.device.ScreenOrientation.LANDSCAPE as ResolutionConfig['orientation'],
      adaptive: true,
    },
  ];

  public adaptiveConfig: AdaptiveConfig = {
    desktop: {
      supported: true,
      limits: {
        landscape: { min: 1, max: 2 },
        portrait: { min: 0.5, max: 1 },
      },
    },
    mobile: {
      supported: true,
      limits: {
        landscape: { min: 1, max: 2 },
        portrait: { min: 0.5, max: 1 },
      },
    },
  };

  get(): ResolutionConfig[] {
    return this.contents;
  }

  getAdaptive(): AdaptiveConfig {
    return this.adaptiveConfig;
  }

  maxSize(): number {
    return Math.max(this.maxWidth(), this.maxHeight());
  }

  maxWidth(): number {
    return this._maxDimension('width');
  }

  maxHeight(): number {
    return this._maxDimension('height');
  }

  _maxDimension(dim: 'width' | 'height'): number {
    return this.contents.reduce(
      (result, resolution) => (resolution[dim] > result ? resolution[dim] : result),
      0,
    );
  }
}

export default ModulesScenesResolutionsConfig;
