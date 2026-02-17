import ModulesAssetsModelsHtml from '../../../../src/ts/modules/assets/models/html';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsHtml', () => {
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

  it('should set type to HTML', () => {
    const sut = new ModulesAssetsModelsHtml({});
    expect(sut.type).toBe(AssetTypeId.HTML);
  });

  it('should inherit simpleClass from base model', () => {
    const sut = new ModulesAssetsModelsHtml({});
    expect(sut.simpleClass).toBe(true);
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsModelsHtml({ key: 'popup' });
    expect(sut.key).toBe('popup');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsModelsHtml({ path: '/html/popup.html' });
    expect(sut.path).toBe('/html/popup.html');
  });
});
