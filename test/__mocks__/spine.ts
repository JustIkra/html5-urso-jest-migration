import { vi } from 'vitest';
import { Container } from './pixi';

export class Spine extends Container {
  skeleton = {
    setToSetupPose: vi.fn(),
    setSkinByName: vi.fn(),
    data: { findAnimation: vi.fn(() => null) },
    findSlot: vi.fn(() => ({ setAttachment: vi.fn() })),
    findSlotIndex: vi.fn(() => -1),
    findBone: vi.fn(() => null),
    findIkConstraint: vi.fn(() => null),
  };
  state = {
    setAnimation: vi.fn(() => ({ listener: {} })),
    addAnimation: vi.fn(() => ({ listener: {} })),
    clearTrack: vi.fn(),
    clearTracks: vi.fn(),
    clearListeners: vi.fn(),
    setEmptyAnimations: vi.fn(),
    addEmptyAnimation: vi.fn(),
    tracks: [] as unknown[],
    listeners: [] as unknown[],
    addListener: vi.fn(),
    removeListener: vi.fn(),
    update: vi.fn(),
    apply: vi.fn(),
    setEmptyAnimation: vi.fn(),
    timeScale: 1,
  };
  stateData = {
    setMix: vi.fn(),
  };
  spineData = {
    findAnimation: vi.fn(() => null),
    findEvent: vi.fn(() => null),
  };
  autoUpdate = true;

  addSlotObject = vi.fn();

  constructor(_options?: Record<string, unknown>) {
    super();
  }

  static from = vi.fn(() => new Spine());
}

export class AtlasAttachmentLoader {
  constructor(_atlas: unknown) {}
}

export class SkeletonJson {
  scale = 1;
  constructor(_loader: unknown) {}
  readSkeletonData = vi.fn(() => ({}));
}

export class SkeletonBinary {
  scale = 1;
  constructor(_loader: unknown) {}
  readSkeletonData = vi.fn(() => ({}));
}

export class TextureAtlas {
  constructor(_atlasText: string, _textureLoader: unknown) {}
  dispose = vi.fn();
}

export class SpineTexture {
  static from = vi.fn(() => new SpineTexture());
}
