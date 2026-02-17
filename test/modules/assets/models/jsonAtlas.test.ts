import ModulesAssetsModelsJsonAtlas from '../../../../src/ts/modules/assets/models/jsonAtlas';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsJsonAtlas', () => {
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

  it('should set type to JSONATLAS', () => {
    const sut = new ModulesAssetsModelsJsonAtlas({});
    expect(sut.type).toBe(AssetTypeId.JSONATLAS);
  });

  it('should inherit simpleClass from base model', () => {
    const sut = new ModulesAssetsModelsJsonAtlas({});
    expect(sut.simpleClass).toBe(true);
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsModelsJsonAtlas({ key: 'uiAtlas' });
    expect(sut.key).toBe('uiAtlas');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsModelsJsonAtlas({ path: '/atlas/ui.json' });
    expect(sut.path).toBe('/atlas/ui.json');
  });
});
