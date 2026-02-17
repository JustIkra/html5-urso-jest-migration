import ModulesObjectsModelsNineSlicePlane from '../../../../src/ts/modules/objects/models/nineSlicePlane';
import { ObjectTypeId } from '../../../../src/ts/types';
import { NineSliceSprite, Texture } from 'pixi.js';

describe('ModulesObjectsModelsNineSlicePlane', () => {
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

  it('should set type to NINESLICEPLANE', () => {
    const sut = new ModulesObjectsModelsNineSlicePlane({});
    expect(sut.type).toBe(ObjectTypeId.NINESLICEPLANE);
  });

  it('should create a NineSliceSprite as _baseObject', () => {
    const sut = new ModulesObjectsModelsNineSlicePlane({});
    expect(sut._baseObject).toBeInstanceOf(NineSliceSprite);
  });

  it('should default all slice params to null (not false)', () => {
    const sut = new ModulesObjectsModelsNineSlicePlane({});
    expect(sut.assetKey).toBeNull();
    expect(sut.leftWidth).toBeNull();
    expect(sut.topHeight).toBeNull();
    expect(sut.rightWidth).toBeNull();
    expect(sut.bottomHeight).toBeNull();
  });

  it('should accept slice params from constructor', () => {
    const sut = new ModulesObjectsModelsNineSlicePlane({
      assetKey: 'panel.png',
      leftWidth: 10,
      topHeight: 15,
      rightWidth: 10,
      bottomHeight: 15,
    } as Record<string, unknown>);
    expect(sut.assetKey).toBe('panel.png');
    expect(sut.leftWidth).toBe(10);
    expect(sut.topHeight).toBe(15);
    expect(sut.rightWidth).toBe(10);
    expect(sut.bottomHeight).toBe(15);
  });

  it('should log error when texture not found', () => {
    mockUrso.cache.getTexture = vi.fn(() => null);
    new ModulesObjectsModelsNineSlicePlane({ assetKey: 'missing.png' } as Record<string, unknown>);
    expect(mockUrso.logger.error).toHaveBeenCalledWith(
      expect.stringContaining('no image with key'),
    );
  });

  it('should call getTexture with the assetKey', () => {
    new ModulesObjectsModelsNineSlicePlane({ assetKey: 'panel.png' } as Record<string, unknown>);
    expect(mockUrso.cache.getTexture).toHaveBeenCalledWith('panel.png');
  });
});
