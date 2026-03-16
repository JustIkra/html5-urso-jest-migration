import ModulesObjectsModelsSpine from '../../../../src/ts/modules/objects/models/spine';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

describe('ModulesObjectsModelsSpine', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );
    mockUrso.cache.getSpine = vi.fn(() => '{"bones":[],"slots":[],"skins":[]}');
    mockUrso.cache.getGlobalAtlas = vi.fn(() => ({}));
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should set type to SPINE', () => {
    const sut = new ModulesObjectsModelsSpine({});
    expect(sut.type).toBe(ObjectTypeId.SPINE);
  });

  it('should create a Spine as _baseObject', () => {
    const sut = new ModulesObjectsModelsSpine({});
    expect(sut._baseObject).toBeInstanceOf(Spine);
  });

  it('should default assetKey to null', () => {
    const sut = new ModulesObjectsModelsSpine({});
    expect(sut.assetKey).toBeNoValue();
  });

  it('should default animation config', () => {
    const sut = new ModulesObjectsModelsSpine({});
    expect(sut.animation.timeScale).toBe(1);
    expect(sut.animation.name).toBeNoValue();
    expect(sut.animation.skinName).toBeNoValue();
    expect(sut.animation.loop).toBe(false);
    expect(sut.animation.onComplete).toBeNoValue();
  });

  it('should default contents to empty array', () => {
    const sut = new ModulesObjectsModelsSpine({});
    expect(sut.contents).toEqual([]);
  });

  it('should log error when spine asset not found', () => {
    mockUrso.cache.getSpine = vi.fn(() => null);
    new ModulesObjectsModelsSpine({ assetKey: 'missing' } as Record<string, unknown>);
    expect(mockUrso.logger.error).toHaveBeenCalled();
  });

  it('should log error when atlas not found', () => {
    mockUrso.cache.getGlobalAtlas = vi.fn(() => null);
    new ModulesObjectsModelsSpine({});
    expect(mockUrso.logger.error).toHaveBeenCalled();
  });

  describe('play', () => {
    it('should call state.setAnimation with defaults', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.play('idle');
      expect(spine.state.setAnimation).toHaveBeenCalledWith(0, 'idle', false);
    });

    it('should pass loop and track params', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.play('walk', true, 1);
      expect(spine.state.setAnimation).toHaveBeenCalledWith(1, 'walk', true);
    });
  });

  describe('setMix', () => {
    it('should call stateData.setMix', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Record<string, unknown>;
      sut.setMix('walk', 'jump', 0.2);
      expect((spine.stateData as { setMix: ReturnType<typeof vi.fn> }).setMix).toHaveBeenCalledWith('walk', 'jump', 0.2);
    });
  });

  describe('setSkinByName', () => {
    it('should call skeleton.setSkinByName', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.setSkinByName('dark');
      expect(spine.skeleton.setSkinByName).toHaveBeenCalledWith('dark');
    });
  });

  describe('setToSetupPose', () => {
    it('should call skeleton.setToSetupPose', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.setToSetupPose();
      expect(spine.skeleton.setToSetupPose).toHaveBeenCalled();
    });
  });

  describe('setSkinByNameAndReset', () => {
    it('should call both setSkinByName and setToSetupPose', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.setSkinByNameAndReset('light');
      expect(spine.skeleton.setSkinByName).toHaveBeenCalledWith('light');
      expect(spine.skeleton.setToSetupPose).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should call state.clearTracks', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.stop();
      expect(spine.state.clearTracks).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should call state.setEmptyAnimations', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.reset();
      expect(spine.state.setEmptyAnimations).toHaveBeenCalled();
    });
  });

  describe('clearTrack', () => {
    it('should call state.clearTrack', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.clearTrack(1);
      expect(spine.state.clearTrack).toHaveBeenCalledWith(1);
    });
  });

  describe('stopTrack', () => {
    it('should clear track, add empty animation, and reset pose', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.stopTrack(2);
      expect(spine.state.clearTrack).toHaveBeenCalledWith(2);
      expect(spine.state.addEmptyAnimation).toHaveBeenCalledWith(2, 0.2, 0);
      expect(spine.skeleton.setToSetupPose).toHaveBeenCalled();
    });
  });

  describe('clearListeners', () => {
    it('should clear and re-add event listener', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.clearListeners();
      expect(spine.state.clearListeners).toHaveBeenCalled();
      expect(spine.state.addListener).toHaveBeenCalledWith(expect.objectContaining({ event: expect.any(Function) }));
    });
  });

  describe('findSlot', () => {
    it('should delegate to skeleton.findSlot', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.findSlot('arm');
      expect(spine.skeleton.findSlot).toHaveBeenCalledWith('arm');
    });
  });

  describe('findBone', () => {
    it('should delegate to skeleton.findBone', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.findBone('hip');
      expect(spine.skeleton.findBone).toHaveBeenCalledWith('hip');
    });
  });

  describe('findAnimation', () => {
    it('should delegate to spineData.findAnimation', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Record<string, unknown>;
      sut.findAnimation('attack');
      expect((spine.spineData as { findAnimation: ReturnType<typeof vi.fn> }).findAnimation).toHaveBeenCalledWith('attack');
    });
  });

  describe('findEvent', () => {
    it('should delegate to spineData.findEvent', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Record<string, unknown>;
      sut.findEvent('footstep');
      expect((spine.spineData as { findEvent: ReturnType<typeof vi.fn> }).findEvent).toHaveBeenCalledWith('footstep');
    });
  });

  describe('getTimeScale', () => {
    it('should return scenes.timeScale * animation.timeScale', () => {
      const sut = new ModulesObjectsModelsSpine({});
      (mockUrso.scenes as Record<string, unknown>).timeScale = 2;
      sut.animation.timeScale = 0.5;
      expect(sut.getTimeScale()).toBe(1);
    });
  });

  describe('setAnimationConfig', () => {
    it('should merge config into animation', () => {
      const sut = new ModulesObjectsModelsSpine({});
      sut.setAnimationConfig({ timeScale: 2 });
      expect(sut.animation.timeScale).toBe(2);
    });

    it('should set onComplete listener when provided', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      const cb = vi.fn();
      sut.setAnimationConfig({ onComplete: cb });
      expect(spine.state.clearListeners).toHaveBeenCalled();
      expect(spine.state.addListener).toHaveBeenCalledWith(expect.objectContaining({ complete: cb }));
    });
  });

  describe('addToSlot', () => {
    it('should warn on invalid object', () => {
      const sut = new ModulesObjectsModelsSpine({});
      sut.addToSlot('slot1', null as unknown as ModulesObjectsModelsSpine);
      expect(mockUrso.logger.warn).toHaveBeenCalled();
    });
  });

  describe('playInSequence', () => {
    it('should call stop then play first animation', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      sut.playInSequence(['a', 'b']);
      expect(spine.state.clearTracks).toHaveBeenCalled();
      expect(spine.state.setAnimation).toHaveBeenCalledWith(0, 'a', false);
    });
  });

  describe('playAndThen', () => {
    it('should delegate to playInSequenceAndThen with single animation', () => {
      const sut = new ModulesObjectsModelsSpine({});
      const spine = sut._baseObject as unknown as Spine;
      const cb = vi.fn();
      sut.playAndThen('anim', cb);
      expect(spine.state.setAnimation).toHaveBeenCalledWith(0, 'anim', false);
      expect(spine.state.addListener).toHaveBeenCalled();
    });
  });
});
