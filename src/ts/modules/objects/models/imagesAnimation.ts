import { Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface CacheFacade {
  getTexture: (key: string) => Texture | null;
}

interface TweenInstance {
  kill: () => void;
  eventCallback: (name: string, callback: () => void) => void;
  targets: () => Array<{ x: number }>;
}

class ModulesObjectsModelsImagesAnimation extends ModulesObjectsBaseModel {
  public assetKey!: string | null;
  public duration!: number;
  public animationKeys!: string[];
  public loop!: boolean;
  public autostart!: boolean;
  public onComplete!: (() => void) | null;

  private _tween: TweenInstance | null = null;
  private _currentFrame: string | number = -1;
  private _defaultTexture: Texture | null = null;
  private _animationTextures: Record<string, Texture> = {};

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.IMAGESANIMATION;

    this._tween = null;
    this._currentFrame = -1;
    this._animationTextures = {};

    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.assetKey = Urso.helper.recursiveGet('assetKey', params, null) as string | null;
    this.duration = Urso.helper.recursiveGet('duration', params, 0) as number;
    this.animationKeys = Urso.helper.recursiveGet('animationKeys', params, []) as string[];
    this.loop = Urso.helper.recursiveGet('loop', params, false) as boolean;
    this.autostart = Urso.helper.recursiveGet('autostart', params, false) as boolean;
    this.onComplete = Urso.helper.recursiveGet('onComplete', params, null) as (() => void) | null;
  }

  private _addBaseObject(): void {
    const texture = (Urso.cache as CacheFacade).getTexture(this.assetKey!);

    if (!texture) {
      Urso.logger.error('ModulesObjectsModelsImage assets error: no image ' + this.assetKey);
    }

    this._defaultTexture = texture;
    this._baseObject = new Sprite(this._defaultTexture!);

    this._createAnimationTextures();

    if (this.autostart) {
      this.start();
    }
  }

  public start(): void {
    this._createTween();
  }

  public stop(): void {
    if (!this._tween) return;

    this._stopAnimation();
  }

  private _createAnimationTextures(): Record<string, Texture> {
    for (const key in this.animationKeys) {
      const texture = (Urso.cache as CacheFacade).getTexture(this.animationKeys[key]);

      if (!texture) continue;

      this._animationTextures[key] = texture;
    }

    return this._animationTextures;
  }

  private _createTween(): void {
    const totalFrames = this.animationKeys.length;
    const tweenParams: Record<string, unknown> = {
      x: totalFrames,
      duration: this.duration / 1000,
      ease: 'none',
    };

    if (this.loop) {
      tweenParams.repeat = -1;
    }

    this._tween = gsap.to({ x: 0 }, tweenParams) as unknown as TweenInstance;

    this._tween.eventCallback('onUpdate', this._onUpdate.bind(this));

    this._tween.eventCallback('onComplete', () => {
      (this._baseObject as Sprite).texture = this._defaultTexture!;
      this._onAnimationComplete();
    });
  }

  private _onUpdate(): void {
    if (!this._tween) return;

    const frameIndex = ~~this._tween.targets()[0].x;
    const frameKey = this.animationKeys[frameIndex];

    if (this._currentFrame !== frameKey) {
      (this._baseObject as Sprite).texture = this._animationTextures[frameIndex];
      this._currentFrame = frameKey;
    }
  }

  private _onAnimationComplete(): void {
    if (this.onComplete) {
      this.onComplete();
    }
  }

  private _stopAnimation(): void {
    this._tween!.kill();
    (this._baseObject as Sprite).texture = this._defaultTexture!;

    this._onAnimationComplete();
  }
}

export default ModulesObjectsModelsImagesAnimation;
