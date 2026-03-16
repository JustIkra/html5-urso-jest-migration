import ModulesAssetsBaseModel from '../../../src/ts/modules/assets/baseModel';
import { AssetTypeId } from '../../../src/ts/types';

describe('ModulesAssetsBaseModel', () => {
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

  it('should set simpleClass to true', () => {
    const sut = new ModulesAssetsBaseModel({});
    expect(sut.simpleClass).toBe(true);
  });

  it('should default id to null', () => {
    const sut = new ModulesAssetsBaseModel({});
    expect(sut.id).toBeNoValue();
  });

  it('should default type to null', () => {
    const sut = new ModulesAssetsBaseModel({});
    expect(sut.type).toBeNoValue();
  });

  it('should default key to null', () => {
    const sut = new ModulesAssetsBaseModel({});
    expect(sut.key).toBeNoValue();
  });

  it('should default path to null', () => {
    const sut = new ModulesAssetsBaseModel({});
    expect(sut.path).toBeNoValue();
  });

  it('should default loadingGroup to null', () => {
    const sut = new ModulesAssetsBaseModel({});
    expect(sut.loadingGroup).toBeNoValue();
  });

  it('should default placeHolder to null', () => {
    const sut = new ModulesAssetsBaseModel({});
    expect(sut.placeHolder).toBeNoValue();
  });

  it('should default _templatePath to null', () => {
    const sut = new ModulesAssetsBaseModel({});
    expect(sut._templatePath).toBeNoValue();
  });

  it('should accept id from params', () => {
    const sut = new ModulesAssetsBaseModel({ id: 'asset-1' });
    expect(sut.id).toBe('asset-1');
  });

  it('should accept type from params', () => {
    const sut = new ModulesAssetsBaseModel({ type: AssetTypeId.IMAGE });
    expect(sut.type).toBe(AssetTypeId.IMAGE);
  });

  it('should accept key from params', () => {
    const sut = new ModulesAssetsBaseModel({ key: 'myKey' });
    expect(sut.key).toBe('myKey');
  });

  it('should accept path from params', () => {
    const sut = new ModulesAssetsBaseModel({ path: '/assets/img.png' });
    expect(sut.path).toBe('/assets/img.png');
  });

  it('should accept loadingGroup from params', () => {
    const sut = new ModulesAssetsBaseModel({ loadingGroup: 'initial' });
    expect(sut.loadingGroup).toBe('initial');
  });

  it('should accept placeHolder from params', () => {
    const sut = new ModulesAssetsBaseModel({ placeHolder: 'placeholder.png' });
    expect(sut.placeHolder).toBe('placeholder.png');
  });

  it('should set useBinPath to false in development mode', () => {
    mockUrso.config.mode = 'development';
    const sut = new ModulesAssetsBaseModel({});
    expect(sut.useBinPath).toBe(false);
  });

  it('should set useBinPath to true in production mode', () => {
    mockUrso.config.mode = 'production';
    const sut = new ModulesAssetsBaseModel({});
    expect(sut.useBinPath).toBe(true);
  });

  it('should set useBinPath to true when params.useBinPath is true', () => {
    const sut = new ModulesAssetsBaseModel({ useBinPath: true });
    expect(sut.useBinPath).toBe(true);
  });

  it('should call setupParams via constructor', () => {
    const params = { id: 'test-id', key: 'test-key', path: '/test' };
    const sut = new ModulesAssetsBaseModel(params);
    expect(sut.id).toBe('test-id');
    expect(sut.key).toBe('test-key');
    expect(sut.path).toBe('/test');
  });
});
