import ModulesObjectsModelsImagesAnimation from '../../../../src/ts/modules/objects/models/imagesAnimation';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';

describe('ModulesObjectsModelsImagesAnimation', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  const fakeTexture = new Texture();

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );
    mockUrso.cache.getTexture = vi.fn(() => fakeTexture);
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should set type to IMAGESANIMATION', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({});
    expect(sut.type).toBe(ObjectTypeId.IMAGESANIMATION);
  });

  it('should create a Sprite as _baseObject', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({});
    expect(sut._baseObject).toBeInstanceOf(Sprite);
  });

  it('should default assetKey to null', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({});
    expect(sut.assetKey).toBeNull();
  });

  it('should default duration to 0', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({});
    expect(sut.duration).toBe(0);
  });

  it('should default animationKeys to empty array', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({});
    expect(sut.animationKeys).toEqual([]);
  });

  it('should default loop to false', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({});
    expect(sut.loop).toBe(false);
  });

  it('should default autostart to false', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({});
    expect(sut.autostart).toBe(false);
  });

  it('should default onComplete to null', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({});
    expect(sut.onComplete).toBeNull();
  });

  it('should log error when texture not found', () => {
    mockUrso.cache.getTexture = vi.fn(() => null);
    new ModulesObjectsModelsImagesAnimation({ assetKey: 'missing' } as Record<string, unknown>);
    expect(mockUrso.logger.error).toHaveBeenCalled();
  });

  it('should call getTexture for assetKey', () => {
    new ModulesObjectsModelsImagesAnimation({ assetKey: 'hero_idle' } as Record<string, unknown>);
    expect(mockUrso.cache.getTexture).toHaveBeenCalledWith('hero_idle');
  });

  it('should autostart when autostart=true', () => {
    new ModulesObjectsModelsImagesAnimation({ autostart: true } as Record<string, unknown>);
    expect(gsap.to).toHaveBeenCalled();
  });

  it('should not autostart by default', () => {
    vi.mocked(gsap.to).mockClear();
    new ModulesObjectsModelsImagesAnimation({});
    expect(gsap.to).not.toHaveBeenCalled();
  });

  it('should create a tween on start()', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({
      animationKeys: ['f0', 'f1', 'f2'],
      duration: 1000,
    } as Record<string, unknown>);
    sut.start();
    expect(gsap.to).toHaveBeenCalledWith(
      { x: 0 },
      expect.objectContaining({ x: 3, duration: 1, ease: 'none' }),
    );
  });

  it('should set repeat=-1 for loop', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({
      animationKeys: ['f0'],
      duration: 500,
      loop: true,
    } as Record<string, unknown>);
    sut.start();
    expect(gsap.to).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ repeat: -1 }),
    );
  });

  it('should stop without error when no tween exists', () => {
    const sut = new ModulesObjectsModelsImagesAnimation({});
    expect(() => sut.stop()).not.toThrow();
  });
});
