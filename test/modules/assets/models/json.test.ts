import ModulesAssetsModelsJson from '../../../../src/ts/modules/assets/models/json';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsJson', () => {
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

  it('should set type to JSON', () => {
    const sut = new ModulesAssetsModelsJson({});
    expect(sut.type).toBe(AssetTypeId.JSON);
  });

  it('should inherit simpleClass from base model', () => {
    const sut = new ModulesAssetsModelsJson({});
    expect(sut.simpleClass).toBe(true);
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsModelsJson({ key: 'gameConfig' });
    expect(sut.key).toBe('gameConfig');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsModelsJson({ path: '/data/config.json' });
    expect(sut.path).toBe('/data/config.json');
  });
});
