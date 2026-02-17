import ModulesTemplateTypes from '../../../src/ts/modules/template/types';
import { AssetTypeId, ObjectTypeId } from '../../../src/ts/types';

describe('ModulesTemplateTypes', () => {
  let sut: ModulesTemplateTypes;

  beforeEach(() => {
    sut = new ModulesTemplateTypes();
  });

  it('should have list with assets and objects', () => {
    expect(sut.list).toHaveProperty('assets');
    expect(sut.list).toHaveProperty('objects');
  });

  it('should have 12 asset entries', () => {
    expect(Object.keys(sut.list.assets)).toHaveLength(12);
  });

  it('should have 24 object entries', () => {
    expect(Object.keys(sut.list.objects)).toHaveLength(24);
  });

  it('should have correct spot-check asset IDs', () => {
    expect(sut.list.assets.ATLAS).toBe(1);
    expect(sut.list.assets.IMAGE).toBe(6);
    expect(sut.list.assets.SPINE).toBe(10);
    expect(sut.list.assets.HTML).toBe(100);
  });

  it('should have correct spot-check object IDs', () => {
    expect(sut.list.objects.CONTAINER).toBe(8);
    expect(sut.list.objects.IMAGE).toBe(15);
    expect(sut.list.objects.TEXT).toBe(22);
    expect(sut.list.objects.WORLD).toBe(25);
  });

  it('should align with AssetTypeId and ObjectTypeId enums', () => {
    for (const [key, value] of Object.entries(sut.list.assets)) {
      expect(value).toBe(AssetTypeId[key as keyof typeof AssetTypeId]);
    }
    for (const [key, value] of Object.entries(sut.list.objects)) {
      expect(value).toBe(ObjectTypeId[key as keyof typeof ObjectTypeId]);
    }
  });

  it('should have no duplicate values within assets or objects', () => {
    const assetValues = Object.values(sut.list.assets);
    expect(new Set(assetValues).size).toBe(assetValues.length);

    const objectValues = Object.values(sut.list.objects);
    expect(new Set(objectValues).size).toBe(objectValues.length);
  });
});
