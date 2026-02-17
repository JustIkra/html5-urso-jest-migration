import ModulesAssetsModelsSpineAtlas from '../../../../src/ts/modules/assets/models/spineAtlas';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsSpineAtlas', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should set type to SPINEATLAS', () => {
    const sut = new ModulesAssetsModelsSpineAtlas({});
    expect(sut.type).toBe(AssetTypeId.SPINEATLAS);
  });

  it('should inherit simpleClass from base model', () => {
    const sut = new ModulesAssetsModelsSpineAtlas({});
    expect(sut.simpleClass).toBe(true);
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsModelsSpineAtlas({ key: 'heroSpineAtlas' });
    expect(sut.key).toBe('heroSpineAtlas');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsModelsSpineAtlas({ path: '/spine/hero.atlas' });
    expect(sut.path).toBe('/spine/hero.atlas');
  });
});
