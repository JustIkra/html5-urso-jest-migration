import ModulesObjectsCache from '../../../src/ts/modules/objects/cache';

function makeObj(uid: string, overrides: Record<string, unknown> = {}) {
  return {
    _uid: uid,
    id: null,
    name: null,
    class: null,
    parent: null,
    ...overrides,
  } as unknown as import('../../../src/ts/modules/objects/baseModel').default;
}

describe('ModulesObjectsCache', () => {
  let sut: ModulesObjectsCache;
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    sut = new ModulesObjectsCache();
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });

  // ========================================================================
  // reset
  // ========================================================================

  describe('reset', () => {
    it('should clear all cached data', () => {
      const obj = makeObj('uid1');
      sut.addId('myId', obj);
      sut.addName('myName', obj);
      sut.addClass('myClass', obj);

      sut.reset();

      expect(sut.getId('myId')).toBeNull();
      expect(sut.getName('myName')).toBeNull();
      expect(sut.getClass('myClass')).toBeNull();
    });
  });

  // ========================================================================
  // addId / removeId / getId
  // ========================================================================

  describe('id cache', () => {
    it('should store and retrieve by id', () => {
      const obj = makeObj('uid1');
      sut.addId('hero', obj);
      expect(sut.getId('hero')).toBe(obj);
    });

    it('should return null for missing id', () => {
      expect(sut.getId('nonexistent')).toBeNull();
    });

    it('should log error when adding duplicate id', () => {
      const obj1 = makeObj('uid1');
      const obj2 = makeObj('uid2');
      sut.addId('dup', obj1);
      sut.addId('dup', obj2);
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObjectsCache error: id will be uniq dup'
      );
    });

    it('should remove id from cache', () => {
      const obj = makeObj('uid1');
      sut.addId('hero', obj);
      sut.removeId('hero', obj);
      expect(sut.getId('hero')).toBeNull();
    });

    it('should log error when removing nonexistent id', () => {
      const obj = makeObj('uid1');
      sut.removeId('missing', obj);
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObjectsCache error: no id to remove missing'
      );
    });

    it('should log error when removing id with wrong uid', () => {
      const obj1 = makeObj('uid1');
      const obj2 = makeObj('uid2');
      sut.addId('hero', obj1);
      sut.removeId('hero', obj2);
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObjectsCache error: invalid object with id hero'
      );
    });
  });

  // ========================================================================
  // addName / removeName / getName
  // ========================================================================

  describe('name cache', () => {
    it('should store and retrieve by name', () => {
      const obj = makeObj('uid1');
      sut.addName('label', obj);
      expect(sut.getName('label')).toBe(obj);
    });

    it('should return null for missing name', () => {
      expect(sut.getName('nonexistent')).toBeNull();
    });

    it('should log error when adding duplicate name', () => {
      const obj1 = makeObj('uid1');
      const obj2 = makeObj('uid2');
      sut.addName('dup', obj1);
      sut.addName('dup', obj2);
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObjectsCache error: name will be uniq dup'
      );
    });

    it('should remove name from cache', () => {
      const obj = makeObj('uid1');
      sut.addName('label', obj);
      sut.removeName('label', obj);
      expect(sut.getName('label')).toBeNull();
    });

    it('should log error when removing nonexistent name', () => {
      const obj = makeObj('uid1');
      sut.removeName('missing', obj);
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObjectsCache error: no name to remove missing'
      );
    });

    it('should log error when removing name with wrong uid', () => {
      const obj1 = makeObj('uid1');
      const obj2 = makeObj('uid2');
      sut.addName('label', obj1);
      sut.removeName('label', obj2);
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObjectsCache error: invalid object with name label'
      );
    });
  });

  // ========================================================================
  // addClass / removeClass / getClass
  // ========================================================================

  describe('class cache', () => {
    it('should store and retrieve by class', () => {
      const obj = makeObj('uid1');
      sut.addClass('active', obj);
      expect(sut.getClass('active')).toEqual([obj]);
    });

    it('should return null for missing class', () => {
      expect(sut.getClass('nonexistent')).toBeNull();
    });

    it('should store multiple objects with the same class', () => {
      const obj1 = makeObj('uid1');
      const obj2 = makeObj('uid2');
      sut.addClass('active', obj1);
      sut.addClass('active', obj2);
      const result = sut.getClass('active');
      expect(result).toHaveLength(2);
      expect(result).toContain(obj1);
      expect(result).toContain(obj2);
    });

    it('should not duplicate same object in class cache', () => {
      const obj = makeObj('uid1');
      sut.addClass('active', obj);
      sut.addClass('active', obj);
      expect(sut.getClass('active')).toHaveLength(1);
    });

    it('should handle space-separated class names on add', () => {
      const obj = makeObj('uid1');
      sut.addClass('active highlighted', obj);
      expect(sut.getClass('active')).toEqual([obj]);
      expect(sut.getClass('highlighted')).toEqual([obj]);
    });

    it('should remove object from class cache', () => {
      const obj = makeObj('uid1');
      sut.addClass('active', obj);
      sut.removeClass('active', obj);
      expect(sut.getClass('active')).toBeNull();
    });

    it('should handle space-separated class names on remove', () => {
      const obj = makeObj('uid1');
      sut.addClass('active highlighted', obj);
      sut.removeClass('active highlighted', obj);
      expect(sut.getClass('active')).toBeNull();
      expect(sut.getClass('highlighted')).toBeNull();
    });

    it('should not fail when removing from nonexistent class', () => {
      const obj = makeObj('uid1');
      expect(() => sut.removeClass('missing', obj)).not.toThrow();
    });

    it('should keep class entry when other objects remain', () => {
      const obj1 = makeObj('uid1');
      const obj2 = makeObj('uid2');
      sut.addClass('active', obj1);
      sut.addClass('active', obj2);
      sut.removeClass('active', obj1);
      expect(sut.getClass('active')).toEqual([obj2]);
    });
  });
});
