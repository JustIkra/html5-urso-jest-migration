import ModulesAssetsModelsContainer from '../../../../src/ts/modules/assets/models/container';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsContainer', () => {
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

  it('should set type to CONTAINER', () => {
    const sut = new ModulesAssetsModelsContainer({});
    expect(sut.type).toBe(AssetTypeId.CONTAINER);
  });

  it('should null out key in constructor', () => {
    const sut = new ModulesAssetsModelsContainer({ key: 'someKey' });
    expect(sut.key).toBeNoValue();
  });

  it('should null out path in constructor', () => {
    const sut = new ModulesAssetsModelsContainer({ path: '/some/path' });
    expect(sut.path).toBeNoValue();
  });

  it('should default contents to empty array', () => {
    const sut = new ModulesAssetsModelsContainer({});
    expect(sut.contents).toEqual([]);
  });

  it('should accept contents from params', () => {
    const contents = [{ type: AssetTypeId.IMAGE, key: 'img1', path: '/img1.png' }];
    const sut = new ModulesAssetsModelsContainer({ contents });
    expect(sut.contents).toEqual(contents);
  });
});
