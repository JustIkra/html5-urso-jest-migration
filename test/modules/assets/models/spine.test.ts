import ModulesAssetsModelsSpine from '../../../../src/ts/modules/assets/models/spine';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsSpine', () => {
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

  it('should set type to SPINE', () => {
    const sut = new ModulesAssetsModelsSpine({});
    expect(sut.type).toBe(AssetTypeId.SPINE);
  });

  it('should default noAtlas to false', () => {
    const sut = new ModulesAssetsModelsSpine({});
    expect(sut.noAtlas).toBe(false);
  });

  it('should accept noAtlas true from params', () => {
    const sut = new ModulesAssetsModelsSpine({ noAtlas: true });
    expect(sut.noAtlas).toBe(true);
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsModelsSpine({ key: 'heroSpine' });
    expect(sut.key).toBe('heroSpine');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsModelsSpine({ path: '/spine/hero.json' });
    expect(sut.path).toBe('/spine/hero.json');
  });
});
