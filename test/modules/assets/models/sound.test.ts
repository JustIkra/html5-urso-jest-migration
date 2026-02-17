import ModulesAssetsModelsSound from '../../../../src/ts/modules/assets/models/sound';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsSound', () => {
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

  it('should set type to SOUND', () => {
    const sut = new ModulesAssetsModelsSound({});
    expect(sut.type).toBe(AssetTypeId.SOUND);
  });

  it('should inherit simpleClass from base model', () => {
    const sut = new ModulesAssetsModelsSound({});
    expect(sut.simpleClass).toBe(true);
  });

  it('should set params with loadType 1 and xhrType blob', () => {
    const sut = new ModulesAssetsModelsSound({});
    expect(sut.params).toEqual({ loadType: 1, xhrType: 'blob' });
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsModelsSound({ key: 'bgMusic' });
    expect(sut.key).toBe('bgMusic');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsModelsSound({ path: '/sounds/bg.mp3' });
    expect(sut.path).toBe('/sounds/bg.mp3');
  });
});
