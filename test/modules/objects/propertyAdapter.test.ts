import ModulesObjectsPropertyAdapter from '../../../src/ts/modules/objects/propertyAdapter';
import { ObjectTypeId } from '../../../src/ts/types';

interface MockPixiObject {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  scale: { x: number; y: number };
  anchor: { x: number; y: number };
  [key: string]: unknown;
}

interface MockModel {
  x: number | string;
  y: number | string;
  anchorX: number;
  anchorY: number;
  scaleX: number;
  scaleY: number;
  alignX: string;
  alignY: string;
  width: number | string | null | false;
  height: number | string | null | false;
  angle: number;
  stretchingType: string | null;
  type: ObjectTypeId | null;
  parent: MockModel | null;
  _baseObject: MockPixiObject;
  contents?: MockModel[];
  [key: string]: unknown;
}

function makePixi(overrides: Partial<MockPixiObject> = {}): MockPixiObject {
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    angle: 0,
    scale: { x: 1, y: 1 },
    anchor: { x: 0, y: 0 },
    ...overrides,
  };
}

function makeModel(overrides: Partial<MockModel> = {}): MockModel {
  return {
    x: 0,
    y: 0,
    anchorX: 0,
    anchorY: 0,
    scaleX: 1,
    scaleY: 1,
    alignX: 'left',
    alignY: 'top',
    width: false,
    height: false,
    angle: 0,
    stretchingType: null,
    type: ObjectTypeId.IMAGE,
    parent: null,
    _baseObject: makePixi(),
    ...overrides,
  };
}

describe('ModulesObjectsPropertyAdapter', () => {
  let sut: ModulesObjectsPropertyAdapter;
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    sut = new ModulesObjectsPropertyAdapter();
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });

  // ========================================================================
  // isAdaptiveProperty
  // ========================================================================

  describe('isAdaptiveProperty', () => {
    it('should return true for x', () => {
      expect(sut.isAdaptiveProperty('x')).toBe(true);
    });

    it('should return true for y', () => {
      expect(sut.isAdaptiveProperty('y')).toBe(true);
    });

    it('should return true for width', () => {
      expect(sut.isAdaptiveProperty('width')).toBe(true);
    });

    it('should return true for height', () => {
      expect(sut.isAdaptiveProperty('height')).toBe(true);
    });

    it('should return true for parent', () => {
      expect(sut.isAdaptiveProperty('parent')).toBe(true);
    });

    it('should return false for non-adaptive property', () => {
      expect(sut.isAdaptiveProperty('alpha')).toBe(false);
    });

    it('should return false for unknown property', () => {
      expect(sut.isAdaptiveProperty('foobar')).toBe(false);
    });
  });

  // ========================================================================
  // _updateHorizontal (via propertyChangeHandler with 'x')
  // ========================================================================

  describe('propertyChangeHandler for x', () => {
    it('should set _baseObject.x from object.x number', () => {
      const obj = makeModel({ x: 50 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'x');
      expect(obj._baseObject.x).toBe(50);
    });

    it('should handle percentage x relative to parent width', () => {
      const parent = makeModel({ width: 200, type: ObjectTypeId.CONTAINER, _baseObject: makePixi({ width: 200 }) });
      const child = makeModel({ x: '50%', parent: parent as MockModel });
      sut.propertyChangeHandler(child as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'x');
      expect(child._baseObject.x).toBe(100);
    });
  });

  // ========================================================================
  // _updateVertical (via propertyChangeHandler with 'y')
  // ========================================================================

  describe('propertyChangeHandler for y', () => {
    it('should set _baseObject.y from object.y number', () => {
      const obj = makeModel({ y: 75 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'y');
      expect(obj._baseObject.y).toBe(75);
    });

    it('should handle percentage y relative to parent height', () => {
      const parent = makeModel({ height: 400, type: ObjectTypeId.CONTAINER, _baseObject: makePixi({ height: 400 }) });
      const child = makeModel({ y: '25%', parent: parent as MockModel });
      sut.propertyChangeHandler(child as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'y');
      expect(child._baseObject.y).toBe(100);
    });
  });

  // ========================================================================
  // _adaptScaleX / _adaptScaleY (false -> null migration)
  // ========================================================================

  describe('scaleX adaptation (false->null migration)', () => {
    it('should set pixi scale.x when scaleX is valid and width is not set', () => {
      const obj = makeModel({ scaleX: 2, width: false });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'scaleX');
      expect(obj._baseObject.scale.x).toBe(2);
    });

    it('should error and reset scaleX when width is already set (not null)', () => {
      const obj = makeModel({ scaleX: 2, width: 100 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'scaleX');
      expect(mockUrso.logger.error).toHaveBeenCalledWith('ScaleX value cannot be set. Width already used!!');
      expect(obj.scaleX).toBe(1);
    });

    it('should allow scaleX of 1 even when width is set', () => {
      const obj = makeModel({ scaleX: 1, width: 100 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'scaleX');
      expect(obj._baseObject.scale.x).toBe(1);
    });
  });

  describe('scaleY adaptation (false->null migration)', () => {
    it('should set pixi scale.y when scaleY is valid and height is not set', () => {
      const obj = makeModel({ scaleY: 0.5, height: false });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'scaleY');
      expect(obj._baseObject.scale.y).toBe(0.5);
    });

    it('should error and reset scaleY when height is already set (not null)', () => {
      const obj = makeModel({ scaleY: 2, height: 200 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'scaleY');
      expect(mockUrso.logger.error).toHaveBeenCalledWith('ScaleY value cannot be set. Height already used!!');
      expect(obj.scaleY).toBe(1);
    });
  });

  // ========================================================================
  // _adaptWidth / _adaptHeight (false -> null migration)
  // ========================================================================

  describe('width adaptation (false->null migration)', () => {
    it('should set pixi width when width is numeric', () => {
      const obj = makeModel({ width: 200 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'width');
      expect(obj._baseObject.width).toBe(200);
    });

    it('should skip when width is null (no value)', () => {
      const pixi = makePixi({ width: 50 });
      const obj = makeModel({ width: null, _baseObject: pixi });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'width');
      expect(obj._baseObject.width).toBe(50); // unchanged
    });

    it('should error and reset width to no-value when scaleX is already set', () => {
      const obj = makeModel({ width: 200, scaleX: 2 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'width');
      expect(mockUrso.logger.error).toHaveBeenCalledWith('Width value cannot be set. ScaleX already used!!', obj);
      expect(obj.width).toBeNoValue();
    });

    it('should not set pixi width for parent types (container)', () => {
      const pixi = makePixi({ width: 50 });
      const obj = makeModel({ width: 300, type: ObjectTypeId.CONTAINER, _baseObject: pixi });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'width');
      expect(obj._baseObject.width).toBe(50); // unchanged
    });
  });

  describe('height adaptation (false->null migration)', () => {
    it('should set pixi height when height is numeric', () => {
      const obj = makeModel({ height: 300 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'height');
      expect(obj._baseObject.height).toBe(300);
    });

    it('should skip when height is null (no value)', () => {
      const pixi = makePixi({ height: 75 });
      const obj = makeModel({ height: null, _baseObject: pixi });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'height');
      expect(obj._baseObject.height).toBe(75); // unchanged
    });

    it('should error and reset height to no-value when scaleY is already set', () => {
      const obj = makeModel({ height: 200, scaleY: 3 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'height');
      expect(mockUrso.logger.error).toHaveBeenCalledWith('Height value cannot be set. ScaleY already used!!', obj);
      expect(obj.height).toBeNoValue();
    });
  });

  // ========================================================================
  // _adaptAlignX / _adaptAlignY
  // ========================================================================

  describe('alignX adaptation', () => {
    it('should return 0 offset for left alignment', () => {
      const obj = makeModel({ alignX: 'left' });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'alignX');
      expect(obj._baseObject.x).toBe(0);
    });

    it('should compute right alignment offset from parent width', () => {
      const parent = makeModel({ width: 400, type: ObjectTypeId.CONTAINER, _baseObject: makePixi({ width: 400 }) });
      const pixi = makePixi({ width: 100 });
      const obj = makeModel({ alignX: 'right', width: 100, parent: parent as MockModel, _baseObject: pixi });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'alignX');
      expect(obj._baseObject.x).toBe(300); // 400 - 100
    });

    it('should compute center alignment offset from parent width', () => {
      const parent = makeModel({ width: 400, type: ObjectTypeId.CONTAINER, _baseObject: makePixi({ width: 400 }) });
      const pixi = makePixi({ width: 100 });
      const obj = makeModel({ alignX: 'center', width: 100, parent: parent as MockModel, _baseObject: pixi });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'alignX');
      expect(obj._baseObject.x).toBe(150); // (400 - 100) / 2
    });

    it('should log error for invalid alignX', () => {
      const obj = makeModel({ alignX: 'bogus' });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'alignX');
      expect(mockUrso.logger.error).toHaveBeenCalledWith('AlignX string is not valid!');
    });
  });

  describe('alignY adaptation', () => {
    it('should return 0 offset for top alignment', () => {
      const obj = makeModel({ alignY: 'top' });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'alignY');
      expect(obj._baseObject.y).toBe(0);
    });

    it('should compute bottom alignment offset from parent height', () => {
      const parent = makeModel({ height: 600, type: ObjectTypeId.CONTAINER, _baseObject: makePixi({ height: 600 }) });
      const pixi = makePixi({ height: 100 });
      const obj = makeModel({ alignY: 'bottom', height: 100, parent: parent as MockModel, _baseObject: pixi });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'alignY');
      expect(obj._baseObject.y).toBe(500); // 600 - 100
    });

    it('should log error for invalid alignY', () => {
      const obj = makeModel({ alignY: 'bogus' });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'alignY');
      expect(mockUrso.logger.error).toHaveBeenCalledWith('AlignY string is not valid!');
    });
  });

  // ========================================================================
  // _adaptAnchorX / _adaptAnchorY
  // ========================================================================

  describe('anchorX adaptation', () => {
    it('should set pixi anchor.x for non-parent types', () => {
      const obj = makeModel({ anchorX: 0.5, type: ObjectTypeId.IMAGE });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'anchorX');
      expect(obj._baseObject.anchor.x).toBe(0.5);
    });

    it('should simulate anchor offset for parent types with width', () => {
      const pixi = makePixi({ width: 200 });
      const obj = makeModel({ anchorX: 0.5, width: 200, type: ObjectTypeId.CONTAINER, _baseObject: pixi });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'anchorX');
      // x = 0 + (-200 * 0.5) + 0 = -100
      expect(obj._baseObject.x).toBe(-100);
    });

    it('should return 0 offset for anchorX 0 on parent types', () => {
      const obj = makeModel({ anchorX: 0, width: 200, type: ObjectTypeId.CONTAINER });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'anchorX');
      expect(obj._baseObject.x).toBe(0);
    });

    it('should log error for invalid anchorX', () => {
      const obj = makeModel({ anchorX: 2 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'anchorX');
      expect(mockUrso.logger.error).toHaveBeenCalledWith('AnchorX value is not valid!', obj);
    });

    it('should warn for types without anchor', () => {
      const obj = makeModel({ anchorX: 0.5, type: ObjectTypeId.SPINE });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'anchorX');
      expect(mockUrso.logger.warn).toHaveBeenCalled();
    });
  });

  describe('anchorY adaptation', () => {
    it('should set pixi anchor.y for non-parent types', () => {
      const obj = makeModel({ anchorY: 0.5, type: ObjectTypeId.IMAGE });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'anchorY');
      expect(obj._baseObject.anchor.y).toBe(0.5);
    });

    it('should log error for invalid anchorY (negative)', () => {
      const obj = makeModel({ anchorY: -1 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'anchorY');
      expect(mockUrso.logger.error).toHaveBeenCalledWith('AnchorY value is not valid!', obj);
    });
  });

  // ========================================================================
  // angle
  // ========================================================================

  describe('angle adaptation', () => {
    it('should set _baseObject.angle', () => {
      const obj = makeModel({ angle: 45 });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'angle');
      expect(obj._baseObject.angle).toBe(45);
    });

    it('should also update horizontal/vertical for parent types', () => {
      const pixi = makePixi();
      const obj = makeModel({ angle: 90, x: 10, y: 20, type: ObjectTypeId.CONTAINER, _baseObject: pixi });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'angle');
      expect(obj._baseObject.angle).toBe(90);
      expect(obj._baseObject.x).toBe(10);
      expect(obj._baseObject.y).toBe(20);
    });
  });

  // ========================================================================
  // _parentChangeHandler
  // ========================================================================

  describe('parent change handler', () => {
    it('should do nothing when parent is null', () => {
      const obj = makeModel({ parent: null });
      // Should not throw
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'parent');
    });

    it('should adapt dependent properties when parent is set', () => {
      const parent = makeModel({ width: 200, height: 200, type: ObjectTypeId.CONTAINER, _baseObject: makePixi({ width: 200, height: 200 }) });
      const child = makeModel({ x: '50%', parent: parent as MockModel });
      sut.propertyChangeHandler(child as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'parent');
      expect(child._baseObject.x).toBe(100);
    });
  });

  // ========================================================================
  // _adaptChildProperties
  // ========================================================================

  describe('child property propagation', () => {
    it('should propagate width changes to children of parent types', () => {
      const childPixi = makePixi();
      const child = makeModel({ width: '50%', _baseObject: childPixi });
      const parent = makeModel({
        width: 400,
        type: ObjectTypeId.CONTAINER,
        _baseObject: makePixi({ width: 400 }),
      });
      child.parent = parent as MockModel;
      (parent as MockModel).contents = [child];
      sut.propertyChangeHandler(parent as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'width');
      expect(childPixi.width).toBe(200); // 50% of 400
    });

    it('should not propagate to children of non-parent types', () => {
      const childPixi = makePixi({ width: 50 });
      const child = makeModel({ width: '50%', _baseObject: childPixi });
      const parent = makeModel({ width: 200, type: ObjectTypeId.IMAGE });
      child.parent = parent as MockModel;
      sut.propertyChangeHandler(parent as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'width');
      // IMAGE is not a parent type, so child should be unaffected
      expect(childPixi.width).toBe(50);
    });
  });

  // ========================================================================
  // _adaptStretchingType
  // ========================================================================

  describe('stretchingType adaptation', () => {
    it('should skip when width is not 100%', () => {
      const obj = makeModel({ width: 50, height: '100%', stretchingType: 'inscribed' });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'stretchingType');
      // no error, just return
      expect(mockUrso.logger.error).not.toHaveBeenCalled();
    });

    it('should skip when stretchingType is null', () => {
      const obj = makeModel({ width: '100%', height: '100%', stretchingType: null });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'stretchingType');
      expect(mockUrso.logger.error).not.toHaveBeenCalled();
    });

    it('should log error for invalid stretchingType', () => {
      const parent = makeModel({ width: 200, height: 200, type: ObjectTypeId.CONTAINER, _baseObject: makePixi({ width: 200, height: 200 }) });
      const pixi = makePixi({ width: 100, height: 50 });
      const obj = makeModel({
        width: '100%',
        height: '100%',
        stretchingType: 'bogus',
        parent: parent as MockModel,
        _baseObject: pixi,
      });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'stretchingType');
      expect(mockUrso.logger.error).toHaveBeenCalledWith('StretchingType value not valid!');
    });

    it('should do nothing for stretchingType "false"', () => {
      const parent = makeModel({ width: 200, height: 200, type: ObjectTypeId.CONTAINER, _baseObject: makePixi({ width: 200, height: 200 }) });
      const pixi = makePixi({ width: 100, height: 100 });
      const obj = makeModel({
        width: '100%',
        height: '100%',
        stretchingType: 'false',
        parent: parent as MockModel,
        _baseObject: pixi,
      });
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'stretchingType');
      expect(mockUrso.logger.error).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // _getPropertyAsNumber with null (false->null migration)
  // ========================================================================

  describe('property as number with no-value (false/null)', () => {
    it('should read from pixi when width is not set on non-parent type', () => {
      const pixi = makePixi({ width: 150 });
      const obj = makeModel({ width: false, type: ObjectTypeId.IMAGE, _baseObject: pixi });
      // Trigger through align which calls _getWidthAsNumber
      const parent = makeModel({ width: 400, type: ObjectTypeId.CONTAINER, _baseObject: makePixi({ width: 400 }) });
      obj.parent = parent as MockModel;
      obj.alignX = 'right';
      sut.propertyChangeHandler(obj as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'alignX');
      // right align: parentWidth(400) - objectWidth(150 from pixi) = 250
      expect(obj._baseObject.x).toBe(250);
    });

    it('should inherit from parent when width is not set on parent type', () => {
      const grandparent = makeModel({ width: 800, type: ObjectTypeId.CONTAINER, _baseObject: makePixi({ width: 800 }) });
      const parent = makeModel({ width: false, type: ObjectTypeId.CONTAINER, parent: grandparent as MockModel, _baseObject: makePixi() });
      // Parent with unset width should inherit from grandparent (800)
      const pixi = makePixi({ width: 100 });
      const child = makeModel({ width: '50%', parent: parent as MockModel, _baseObject: pixi });
      sut.propertyChangeHandler(child as unknown as Parameters<typeof sut.propertyChangeHandler>[0], 'width');
      // 50% of 800 = 400
      expect(pixi.width).toBe(400);
    });
  });
});
