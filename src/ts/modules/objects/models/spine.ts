import * as spine from '@esotericsoftware/spine-pixi-v8';
import type { ObjectModelParams, ObserverCallback } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface AnimationConfig {
  timeScale: number;
  name: string | null;
  skinName: string | null;
  loop: boolean;
  onComplete: (() => void) | null;
}

interface SpineState {
  setAnimation: (track: number, name: string, loop: boolean) => unknown;
  addAnimation: (track: number, name: string, loop: boolean, delay: number) => unknown;
  clearTrack: (track: number) => void;
  clearTracks: () => void;
  clearListeners: () => void;
  setEmptyAnimations: () => void;
  addEmptyAnimation: (track: number, mixDuration: number, delay: number) => void;
  addListener: (listener: Record<string, unknown>) => void;
  removeListener: (listener: Record<string, unknown>) => void;
  listeners: unknown[];
  timeScale: number;
}

interface SpineStateData {
  setMix: (from: string, to: string, duration: number) => void;
}

interface SpineSkeleton {
  setToSetupPose: () => void;
  setSkinByName: (name: string) => void;
  findSlot: (name: string) => { setAttachment: (attachment: unknown) => void } | null;
  findSlotIndex: (name: string) => number;
  findBone: (name: string) => unknown;
  findIkConstraint: (name: string) => unknown;
}

interface SpineData {
  findAnimation: (name: string) => unknown;
  findEvent: (name: string) => unknown;
}

interface SpineObject {
  state: SpineState;
  stateData: SpineStateData;
  skeleton: SpineSkeleton;
  spineData: SpineData;
  addSlotObject: (slot: unknown, displayObject: unknown) => void;
}

interface CacheFacade {
  getSpine: (key: string) => unknown;
  getGlobalAtlas: () => unknown;
}

interface ScenesFacade {
  timeScale: number;
}

class ModulesObjectsModelsSpine extends ModulesObjectsBaseModel {
  public assetKey!: string | null;
  public animation!: AnimationConfig;
  public contents!: ModulesObjectsBaseModel[];

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.SPINE;
    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.assetKey = Urso.helper.recursiveGet('assetKey', params, null) as string | null;

    this.animation = {
      timeScale: Urso.helper.recursiveGet('animation.timeScale', params, 1) as number,
      name: Urso.helper.recursiveGet('animation.name', params, null) as string | null,
      skinName: Urso.helper.recursiveGet('animation.skinName', params, null) as string | null,
      loop: Urso.helper.recursiveGet('animation.loop', params, false) as boolean,
      onComplete: Urso.helper.recursiveGet('animation.onComplete', params, null) as (() => void) | null,
    };

    (params as Record<string, unknown>).animation = this.animation;
    this.contents = Urso.helper.recursiveGet('contents', params, []) as ModulesObjectsBaseModel[];
  }

  public play(animationName: string, loopFlag: boolean = false, track: number = 0): void {
    this._spine.state.setAnimation(track, animationName, loopFlag);
  }

  public setMix(from: string, to: string, duration: number): void {
    this._spine.stateData.setMix(from, to, duration);
  }

  public clearListeners(): void {
    this._spine.state.clearListeners();
    this._spine.state.addListener({ event: this._eventHandler.bind(this) });
  }

  public setSkinByName(skinName: string): void {
    this._spine.skeleton.setSkinByName(skinName);
  }

  public setToSetupPose(): void {
    this._spine.skeleton.setToSetupPose();
  }

  public setSkinByNameAndReset(skinName: string): void {
    this.setSkinByName(skinName);
    this.setToSetupPose();
  }

  public playAndThen(animation: string, func: () => void, track?: number): void {
    this.playInSequenceAndThen([animation], func, track);
  }

  public playInSequence(animations: string[]): void {
    this._playInSequenceAndThen(animations);
  }

  public playInSequenceAndThen(animations: string[], func?: () => void, track?: number): void {
    this._playInSequenceAndThen(animations, func, track);
  }

  private _playInSequenceAndThen(animations: string[], func?: () => void, track?: number): void {
    this.stop();
    let removeSelf = (): void => { };
    let animationCount = 0;

    const completer = {
      complete: (): void => {
        animationCount++;

        if (animations[animationCount]) {
          this.play(animations[animationCount], false, track);
        } else {
          if (func) func();
          removeSelf();
        }
      },
    };

    removeSelf = () => this._spine.state.removeListener(completer);
    this._spine.state.addListener(completer);
    this.play(animations[0], false, track);
  }

  public stopTrack(track: number): void {
    this.clearTrack(track);
    this._spine.state.addEmptyAnimation(track, 0.2, 0);
    this.setToSetupPose();
  }

  public clearTrack(track: number): void {
    this._spine.state.clearTrack(track);
  }

  public stop(): void {
    this._spine.state.clearTracks();
  }

  public reset(): void {
    this._spine.state.setEmptyAnimations();
  }

  public addToSlot(slotName: string, object: ModulesObjectsBaseModel): void {
    this._addToSlot(slotName, object, false);
  }

  public replaceSlotWith(slotName: string, object: ModulesObjectsBaseModel): void {
    this._addToSlot(slotName, object, true);
  }

  public setAnimationConfig(config: Partial<AnimationConfig> = {}): void {
    this.animation = {
      ...this.animation,
      ...config,
    };

    if (config.onComplete) {
      if (this._spine.state.listeners.length !== 0) {
        Urso.logger.warn('ModulesObjectsModelsSpine setAnimationConfig warning: animation state listeners will be cleared');
      }

      this._spine.state.clearListeners();
      this._spine.state.addListener({ complete: this.animation.onComplete });
    }
  }

  public getChildByName(name: string): unknown {
    return (this as unknown as { children: unknown[] }).children[this._spine.skeleton.findSlotIndex(name)];
  }

  public findSlot(name: string): unknown {
    return this._spine.skeleton.findSlot(name);
  }

  public findBone(name: string): unknown {
    return this._spine.skeleton.findBone(name);
  }

  public findIkConstraint(name: string): unknown {
    return this._spine.skeleton.findIkConstraint(name);
  }

  public findAnimation(name: string): unknown {
    return this._spine.spineData.findAnimation(name);
  }

  public findEvent(name: string): unknown {
    return this._spine.spineData.findEvent(name);
  }

  public getTimeScale(): number {
    return (Urso.scenes as ScenesFacade).timeScale * this.animation.timeScale;
  }

  private get _spine(): SpineObject {
    return this._baseObject as unknown as SpineObject;
  }

  private _addBaseObject(): void {
    const spineAsset = (Urso.cache as CacheFacade).getSpine(this.assetKey!);
    const spineAtlas = (Urso.cache as CacheFacade).getGlobalAtlas();

    if (!spineAsset || !spineAtlas) {
      Urso.logger.error('ModulesObjectsModelsSpine assets error: no spine or atlas object ' + this.assetKey);
    }

    const attachmentLoader = new spine.AtlasAttachmentLoader(spineAtlas as spine.TextureAtlas);

    const parser = spineAsset instanceof Uint8Array
      ? new spine.SkeletonBinary(attachmentLoader)
      : new spine.SkeletonJson(attachmentLoader);

    const skeletonData = parser.readSkeletonData(spineAsset as string & Uint8Array);

    this._baseObject = new (spine.Spine as unknown as new (opts: Record<string, unknown>) => spine.Spine)({
      skeletonData,
      autoUpdate: true,
    });

    Object.defineProperty(this._spine.state, 'timeScale', { get: this.getTimeScale.bind(this) });

    if (this.animation.onComplete) {
      this._spine.state.addListener({ complete: this.animation.onComplete });
    }

    if (this.animation.skinName) {
      this.setSkinByName(this.animation.skinName);
    }

    if (this.animation.name) {
      this.play(this.animation.name, this.animation.loop);
    }

    this._spine.state.addListener({ event: this._eventHandler.bind(this) });
  }

  private _eventHandler(_: unknown, event: { data: { name: string } }): void {
    this.emit(Urso.events.MODULES_OBJECTS_SPINE_EVENT, {
      eventName: event.data.name,
      name: this.name,
      class: this['class'],
    });
  }

  private _addToSlot(slotName: string, object: ModulesObjectsBaseModel, replaceSlotContents: boolean): void {
    if (!object?._baseObject) {
      Urso.logger.warn('ModulesObjectsModelsSpine _addToSlot error: invalid object ' + object);
      return;
    }

    const spineObj = this._spine;
    const currentSlot = spineObj.skeleton.findSlot(slotName);

    if (!currentSlot) {
      Urso.logger.error('ModulesObjectsModelsSpine _addToSlot slotName: ' + slotName);
      return;
    }

    (object._baseObject as unknown as Record<string, unknown>).scale = { x: 1, y: -1 };

    (Urso.objects as { removeChild: (parent: unknown, child: unknown, flag: boolean) => void })
      .removeChild(object.parent, object, true);

    if (replaceSlotContents) {
      currentSlot.setAttachment(null);
    }

    this.addChild(object);
    spineObj.addSlotObject(currentSlot, object._baseObject);
  }
}

export default ModulesObjectsModelsSpine;
