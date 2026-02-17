import ModulesObjectsModelsImage from '../../../../src/ts/modules/objects/models/image';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Sprite, Texture } from 'pixi.js';

describe('ModulesObjectsModelsImage', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockTexture: Texture;

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );

    mockTexture = new Texture();
    mockUrso.cache.getTexture = vi.fn(() => mockTexture);
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should set type to IMAGE', () => {
    const sut = new ModulesObjectsModelsImage({});
    expect(sut.type).toBe(ObjectTypeId.IMAGE);
  });

  it('should create a PIXI Sprite as _baseObject', () => {
    const sut = new ModulesObjectsModelsImage({});
    expect(sut._baseObject).toBeInstanceOf(Sprite);
  });

  it('should default assetKey to null (not false)', () => {
    const sut = new ModulesObjectsModelsImage({});
    expect(sut.assetKey).toBeNull();
  });

  it('should accept assetKey from params', () => {
    const sut = new ModulesObjectsModelsImage({ assetKey: 'hero.png' } as Record<string, unknown>);
    expect(sut.assetKey).toBe('hero.png');
  });

  it('should log error when texture not found', () => {
    mockUrso.cache.getTexture = vi.fn(() => null);
    new ModulesObjectsModelsImage({ assetKey: 'missing.png' } as Record<string, unknown>);
    expect(mockUrso.logger.error).toHaveBeenCalledWith(
      expect.stringContaining('no image with key'),
    );
  });

  it('should update texture on changeTexture', () => {
    const sut = new ModulesObjectsModelsImage({ assetKey: 'hero.png' } as Record<string, unknown>);
    const newTexture = new Texture();
    mockUrso.cache.getTexture = vi.fn(() => newTexture);

    sut.changeTexture('villain.png');

    expect(sut.assetKey).toBe('villain.png');
    expect((sut._baseObject as Sprite).texture).toBe(newTexture);
  });

  it('should reuse existing sprite on changeTexture instead of creating new one', () => {
    const sut = new ModulesObjectsModelsImage({ assetKey: 'hero.png' } as Record<string, unknown>);
    const originalBaseObject = sut._baseObject;

    const newTexture = new Texture();
    mockUrso.cache.getTexture = vi.fn(() => newTexture);

    sut.changeTexture('villain.png');

    expect(sut._baseObject).toBe(originalBaseObject);
  });

  it('should call getTexture with the assetKey', () => {
    new ModulesObjectsModelsImage({ assetKey: 'hero.png' } as Record<string, unknown>);
    expect(mockUrso.cache.getTexture).toHaveBeenCalledWith('hero.png');
  });
});
