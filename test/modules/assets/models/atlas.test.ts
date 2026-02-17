import ModulesAssetsModelsAtlas from '../../../../src/ts/modules/assets/models/atlas';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsAtlas', () => {
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

  it('should set type to ATLAS', () => {
    const sut = new ModulesAssetsModelsAtlas({});
    expect(sut.type).toBe(AssetTypeId.ATLAS);
  });

  it('should default cacheTextures to false', () => {
    const sut = new ModulesAssetsModelsAtlas({});
    expect(sut.cacheTextures).toBe(false);
  });

  it('should accept cacheTextures true from params', () => {
    const sut = new ModulesAssetsModelsAtlas({ cacheTextures: true });
    expect(sut.cacheTextures).toBe(true);
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsModelsAtlas({ key: 'uiAtlas' });
    expect(sut.key).toBe('uiAtlas');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsModelsAtlas({ path: '/atlas/ui.json' });
    expect(sut.path).toBe('/atlas/ui.json');
  });
});
