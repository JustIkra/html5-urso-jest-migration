import ModulesAssetsModelsImage from '../../../../src/ts/modules/assets/models/image';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsImage', () => {
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

  it('should set type to IMAGE', () => {
    const sut = new ModulesAssetsModelsImage({});
    expect(sut.type).toBe(AssetTypeId.IMAGE);
  });

  it('should default preloadGPU to false', () => {
    const sut = new ModulesAssetsModelsImage({});
    expect(sut.preloadGPU).toBe(false);
  });

  it('should accept preloadGPU true from params', () => {
    const sut = new ModulesAssetsModelsImage({ preloadGPU: true });
    expect(sut.preloadGPU).toBe(true);
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsModelsImage({ key: 'bgImage' });
    expect(sut.key).toBe('bgImage');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsModelsImage({ path: '/images/bg.png' });
    expect(sut.path).toBe('/images/bg.png');
  });
});
