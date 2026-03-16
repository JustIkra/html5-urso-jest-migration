import ModulesObjectsBaseModel from '../../../src/ts/modules/objects/baseModel';
import { ObjectTypeId, AlignX, AlignY } from '../../../src/ts/types';

describe('ModulesObjectsBaseModel', () => {
  let sut: ModulesObjectsBaseModel;
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    // Make recursiveGet return the value from params or the default
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      }
    );
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    sut = new ModulesObjectsBaseModel({});
  });

  // ========================================================================
  // Constructor defaults (false→null migration)
  // ========================================================================

  describe('constructor defaults', () => {
    it('should set simpleClass to true', () => {
      expect(sut.simpleClass).toBe(true);
    });

    it('should set parent to null (not false)', () => {
      expect(sut.parent).toBeNoValue();
    });

    it('should set proxyObject to null', () => {
      expect(sut.proxyObject).toBeNull();
    });

    it('should set destroyed to false', () => {
      expect(sut.destroyed).toBe(false);
    });

    it('should set id to null (not false)', () => {
      expect(sut.id).toBeNoValue();
    });

    it('should set name to null (not false)', () => {
      expect(sut.name).toBeNoValue();
    });

    it('should set class to null (not false)', () => {
      expect(sut['class']).toBeNoValue();
    });

    it('should set width to null (not false)', () => {
      expect(sut.width).toBeNoValue();
    });

    it('should set height to null (not false)', () => {
      expect(sut.height).toBeNoValue();
    });

    it('should set maxWidth to null (not false)', () => {
      expect(sut.maxWidth).toBeNoValue();
    });

    it('should set maxHeight to null (not false)', () => {
      expect(sut.maxHeight).toBeNoValue();
    });

    it('should set stretchingType to null (not false)', () => {
      expect(sut.stretchingType).toBeNoValue();
    });

    it('should set transitionDelay to null (not false)', () => {
      expect(sut.transitionDelay).toBeNoValue();
    });

    it('should set transitionDuration to null (not false)', () => {
      expect(sut.transitionDuration).toBeNoValue();
    });

    it('should set transitionProperty to null (not false)', () => {
      expect(sut.transitionProperty).toBeNoValue();
    });

    it('should set _uid to null (not false)', () => {
      expect(sut._uid).toBeNoValue();
    });

    it('should set _templatePath to null (not false)', () => {
      expect(sut._templatePath).toBeNoValue();
    });

    it('should set _baseObject to null', () => {
      expect(sut._baseObject).toBeNull();
    });
  });

  // ========================================================================
  // Constructor with params
  // ========================================================================

  describe('constructor with params', () => {
    it('should apply type from params', () => {
      const model = new ModulesObjectsBaseModel({ type: ObjectTypeId.IMAGE });
      expect(model.type).toBe(ObjectTypeId.IMAGE);
    });

    it('should apply x, y, z from params', () => {
      const model = new ModulesObjectsBaseModel({ x: 100, y: 200, z: 5 });
      expect(model.x).toBe(100);
      expect(model.y).toBe(200);
      expect(model.z).toBe(5);
    });

    it('should accept percentage strings for x and y', () => {
      const model = new ModulesObjectsBaseModel({ x: '50%', y: '25%' });
      expect(model.x).toBe('50%');
      expect(model.y).toBe('25%');
    });

    it('should apply scale from params', () => {
      const model = new ModulesObjectsBaseModel({ scaleX: 2, scaleY: 0.5 });
      expect(model.scaleX).toBe(2);
      expect(model.scaleY).toBe(0.5);
    });

    it('should apply align from params', () => {
      const model = new ModulesObjectsBaseModel({
        alignX: AlignX.Center,
        alignY: AlignY.Bottom,
      });
      expect(model.alignX).toBe('center');
      expect(model.alignY).toBe('bottom');
    });

    it('should apply custom from params', () => {
      const model = new ModulesObjectsBaseModel({ custom: { foo: 'bar' } });
      expect(model.custom).toEqual({ foo: 'bar' });
    });
  });

  // ========================================================================
  // setupParams
  // ========================================================================

  describe('setupParams', () => {
    it('should update fields from new params', () => {
      sut.setupParams({ id: 'newId', name: 'newName', visible: false });
      expect(sut.id).toBe('newId');
      expect(sut.name).toBe('newName');
      expect(sut.visible).toBe(false);
    });
  });

  // ========================================================================
  // modifyValue
  // ========================================================================

  describe('modifyValue', () => {
    it('should return the value unchanged', () => {
      expect(sut.modifyValue('x', 42)).toBe(42);
      expect(sut.modifyValue('name', 'test')).toBe('test');
    });
  });

  // ========================================================================
  // Numeric defaults
  // ========================================================================

  describe('numeric defaults', () => {
    it('should default x to 0', () => {
      expect(sut.x).toBe(0);
    });

    it('should default y to 0', () => {
      expect(sut.y).toBe(0);
    });

    it('should default z to 0', () => {
      expect(sut.z).toBe(0);
    });

    it('should default scaleX to 1', () => {
      expect(sut.scaleX).toBe(1);
    });

    it('should default scaleY to 1', () => {
      expect(sut.scaleY).toBe(1);
    });

    it('should default alpha to 1', () => {
      expect(sut.alpha).toBe(1);
    });

    it('should default angle to 0', () => {
      expect(sut.angle).toBe(0);
    });

    it('should default blendMode to 1', () => {
      expect(sut.blendMode).toBe(1);
    });
  });

  // ========================================================================
  // Boolean defaults
  // ========================================================================

  describe('boolean defaults', () => {
    it('should default visible to true', () => {
      expect(sut.visible).toBe(true);
    });

    it('should default append to true', () => {
      expect(sut.append).toBe(true);
    });

    it('should default ignoreParentMask to false', () => {
      expect(sut.ignoreParentMask).toBe(false);
    });
  });

  // ========================================================================
  // String/enum defaults
  // ========================================================================

  describe('string/enum defaults', () => {
    it('should default alignX to left', () => {
      expect(sut.alignX).toBe('left');
    });

    it('should default alignY to top', () => {
      expect(sut.alignY).toBe('top');
    });

    it('should default custom to empty object', () => {
      expect(sut.custom).toEqual({});
    });
  });
});
