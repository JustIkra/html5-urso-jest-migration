import ModulesObjectsConfig from '../../../src/ts/modules/objects/config';
import { ObjectTypeId } from '../../../src/ts/types';

describe('ModulesObjectsConfig', () => {
  let sut: ModulesObjectsConfig;

  beforeEach(() => {
    sut = new ModulesObjectsConfig();
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });

  it('should start with empty objectsToCache array', () => {
    expect(sut.objectsToCache).toEqual([]);
  });

  it('should accept ObjectTypeId values in objectsToCache', () => {
    sut.objectsToCache = [ObjectTypeId.IMAGE, ObjectTypeId.SPINE];
    expect(sut.objectsToCache).toEqual([15, 21]);
    expect(sut.objectsToCache).toHaveLength(2);
  });
});
