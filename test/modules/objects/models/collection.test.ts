import ModulesObjectsModelsCollection from '../../../../src/ts/modules/objects/models/collection';
import type { CollectionArray } from '../../../../src/ts/modules/objects/models/collection';

describe('ModulesObjectsModelsCollection', () => {
  beforeEach(() => {
    const mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  function makeChild(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      x: 0,
      y: 0,
      visible: true,
      addClass: vi.fn(),
      removeClass: vi.fn(),
      ...overrides,
    };
  }

  it('should return an array, not a class instance', () => {
    const children = [makeChild(), makeChild()];
    const result = new ModulesObjectsModelsCollection(children as never[]) as unknown as CollectionArray;
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('should return same array reference as passed in', () => {
    const children = [makeChild()];
    const result = new ModulesObjectsModelsCollection(children as never[]) as unknown as CollectionArray;
    expect(result).toBe(children);
  });

  it('should default to empty array when no param', () => {
    const result = new ModulesObjectsModelsCollection() as unknown as CollectionArray;
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  describe('setProperty', () => {
    it('should set property on all children when all have it', () => {
      const c1 = makeChild({ x: 0 });
      const c2 = makeChild({ x: 5 });
      const result = new ModulesObjectsModelsCollection([c1, c2] as never[]) as unknown as CollectionArray;

      const success = result.setProperty('x', 42);

      expect(success).toBe(true);
      expect(c1.x).toBe(42);
      expect(c2.x).toBe(42);
    });

    it('should return false and not set when not all children have the property', () => {
      const c1 = makeChild({ x: 0 });
      const c2 = makeChild();
      delete c2.x;
      const result = new ModulesObjectsModelsCollection([c1, c2] as never[]) as unknown as CollectionArray;

      const success = result.setProperty('nonExistent', 42);

      expect(success).toBe(false);
    });
  });

  describe('addClass', () => {
    it('should call addClass on all children that have the method', () => {
      const c1 = makeChild();
      const c2 = makeChild();
      const result = new ModulesObjectsModelsCollection([c1, c2] as never[]) as unknown as CollectionArray;

      result.addClass('active');

      expect(c1.addClass).toHaveBeenCalledWith('active');
      expect(c2.addClass).toHaveBeenCalledWith('active');
    });

    it('should skip children that do not have addClass', () => {
      const c1 = makeChild();
      const c2 = makeChild();
      delete c2.addClass;
      const result = new ModulesObjectsModelsCollection([c1, c2] as never[]) as unknown as CollectionArray;

      result.addClass('active');

      expect(c1.addClass).toHaveBeenCalledWith('active');
    });
  });

  describe('removeClass', () => {
    it('should call removeClass on all children', () => {
      const c1 = makeChild();
      const c2 = makeChild();
      const result = new ModulesObjectsModelsCollection([c1, c2] as never[]) as unknown as CollectionArray;

      result.removeClass('active');

      expect(c1.removeClass).toHaveBeenCalledWith('active');
      expect(c2.removeClass).toHaveBeenCalledWith('active');
    });
  });
});
