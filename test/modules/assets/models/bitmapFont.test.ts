import ModulesAssetsModelsBitmapFont from '../../../../src/ts/modules/assets/models/bitmapFont';
import { AssetTypeId } from '../../../../src/ts/types';

describe('ModulesAssetsModelsBitmapFont', () => {
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

  it('should set type to BITMAPFONT', () => {
    const sut = new ModulesAssetsModelsBitmapFont({});
    expect(sut.type).toBe(AssetTypeId.BITMAPFONT);
  });

  it('should inherit simpleClass from base model', () => {
    const sut = new ModulesAssetsModelsBitmapFont({});
    expect(sut.simpleClass).toBe(true);
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsModelsBitmapFont({ key: 'myBitmapFont' });
    expect(sut.key).toBe('myBitmapFont');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsModelsBitmapFont({ path: '/fonts/bitmap.fnt' });
    expect(sut.path).toBe('/fonts/bitmap.fnt');
  });
});
