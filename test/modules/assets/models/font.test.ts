import ModulesAssetsModelsFont from '../../../../src/ts/modules/assets/models/font';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsFont', () => {
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

  it('should set type to FONT', () => {
    const sut = new ModulesAssetsModelsFont({});
    expect(sut.type).toBe(AssetTypeId.FONT);
  });

  it('should inherit simpleClass from base model', () => {
    const sut = new ModulesAssetsModelsFont({});
    expect(sut.simpleClass).toBe(true);
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsModelsFont({ key: 'Arial' });
    expect(sut.key).toBe('Arial');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsModelsFont({ path: '/fonts/arial.ttf' });
    expect(sut.path).toBe('/fonts/arial.ttf');
  });
});
