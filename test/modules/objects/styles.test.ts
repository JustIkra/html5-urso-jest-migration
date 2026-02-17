import ModulesObjectsStyles from '../../../src/ts/modules/objects/styles';
import { ObjectTypeId } from '../../../src/ts/types';

interface MockStyledObject {
  _uid: string;
  _styles: Record<string, Record<string, unknown>>;
  _originalModel: Record<string, unknown>;
  type: ObjectTypeId | null;
  id: string | null;
  name: string | null;
  class: string | null;
  parent: MockStyledObject | null;
  alpha: number;
  visible: boolean;
  [key: string]: unknown;
}

function makeStyledObj(uid: string, overrides: Partial<MockStyledObject> = {}): MockStyledObject {
  return {
    _uid: uid,
    _styles: {},
    _originalModel: {},
    type: ObjectTypeId.IMAGE,
    id: null,
    name: null,
    class: null,
    parent: null,
    alpha: 1,
    visible: true,
    ...overrides,
  };
}

describe('ModulesObjectsStyles', () => {
  let sut: ModulesObjectsStyles;
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockController: {
    getWorld: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
  };
  let mockSelector: {
    testObject: ReturnType<typeof vi.fn>;
    parse: ReturnType<typeof vi.fn>;
  };
  let mockBaseModel: MockStyledObject;
  let mockTextModel: MockStyledObject;
  let mockSafeSet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUrso = createMockUrso();

    mockBaseModel = makeStyledObj('base-temp');
    mockTextModel = makeStyledObj('text-temp');

    mockController = {
      getWorld: vi.fn(() => makeStyledObj('world')),
      findAll: vi.fn(() => []),
    };

    mockSelector = {
      testObject: vi.fn(() => true),
      parse: vi.fn(() => []),
    };

    mockSafeSet = vi.fn((target: MockStyledObject, key: string, value: unknown) => {
      target[key] = value;
    });

    // Setup Urso.objects._safeSetValueToTarget
    mockUrso.objects._safeSetValueToTarget = mockSafeSet;

    // Setup Urso.template.get
    (mockUrso as unknown as Record<string, unknown>).template = {
      get: vi.fn(() => ({ styles: {} })),
    };

    (globalThis as Record<string, unknown>).Urso = mockUrso;

    const proto = ModulesObjectsStyles.prototype as unknown as Record<string, unknown>;
    proto.getInstance = vi.fn((path: string, ...args: unknown[]) => {
      if (path === 'BaseModel') return mockBaseModel;
      if (path === 'Models.Text') return mockTextModel;
      if (path === 'Selector') return mockSelector;
      if (path === 'Controller') return mockController;
      return null;
    });

    sut = new ModulesObjectsStyles();
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });

  // ========================================================================
  // refresh
  // ========================================================================

  describe('refresh', () => {
    it('should use controller.getWorld when no parent provided', () => {
      sut.refresh();
      expect(mockController.getWorld).toHaveBeenCalled();
    });

    it('should apply styles from template', () => {
      const obj = makeStyledObj('uid1', { class: 'active' });
      mockController.findAll.mockReturnValue([obj]);
      ((mockUrso as unknown as Record<string, unknown>).template as { get: ReturnType<typeof vi.fn> }).get
        .mockReturnValue({ styles: { '.active': { alpha: 0.5 } } });

      sut.refresh();

      expect(mockSafeSet).toHaveBeenCalledWith(obj, 'alpha', 0.5);
    });

    it('should skip style keys that exist in _originalModel', () => {
      const obj = makeStyledObj('uid1', {
        class: 'active',
        _originalModel: { alpha: 0.8 },
      });
      mockController.findAll.mockReturnValue([obj]);
      ((mockUrso as unknown as Record<string, unknown>).template as { get: ReturnType<typeof vi.fn> }).get
        .mockReturnValue({ styles: { '.active': { alpha: 0.5 } } });

      sut.refresh();

      expect(mockSafeSet).not.toHaveBeenCalledWith(obj, 'alpha', 0.5);
    });

    it('should not re-apply style if already in _styles', () => {
      const obj = makeStyledObj('uid1', {
        class: 'active',
        _styles: { '.active': { alpha: 0.5 } },
      });
      mockController.findAll.mockReturnValue([obj]);
      ((mockUrso as unknown as Record<string, unknown>).template as { get: ReturnType<typeof vi.fn> }).get
        .mockReturnValue({ styles: { '.active': { alpha: 0.5 } } });

      sut.refresh();

      expect(mockSafeSet).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // refreshByChangedClassName
  // ========================================================================

  describe('refreshByChangedClassName', () => {
    it('should only apply styles containing the changed className', () => {
      const obj = makeStyledObj('uid1');
      mockController.findAll.mockReturnValue([obj]);
      ((mockUrso as unknown as Record<string, unknown>).template as { get: ReturnType<typeof vi.fn> }).get
        .mockReturnValue({
          styles: {
            '.active': { alpha: 0.5 },
            '#hero': { visible: false },
          },
        });

      sut.refreshByChangedClassName('active');

      // Only .active should be applied, not #hero
      expect(mockSafeSet).toHaveBeenCalledWith(obj, 'alpha', 0.5);
      expect(mockSafeSet).not.toHaveBeenCalledWith(obj, 'visible', false);
    });
  });

  // ========================================================================
  // removeFromCache
  // ========================================================================

  describe('removeFromCache', () => {
    it('should remove object from internal cache', () => {
      const obj = makeStyledObj('uid1');
      mockController.findAll.mockReturnValue([obj]);
      ((mockUrso as unknown as Record<string, unknown>).template as { get: ReturnType<typeof vi.fn> }).get
        .mockReturnValue({ styles: { '.active': { alpha: 0.5 } } });

      // First refresh to populate cache
      sut.refresh();

      // Remove from cache
      sut.removeFromCache(obj as unknown as Parameters<typeof sut.removeFromCache>[0]);

      // Object should no longer be in cache -- next refresh should re-apply
      mockSafeSet.mockClear();
      obj._styles = {}; // clear styles so it can be re-applied
      sut.refresh();
      expect(mockSafeSet).toHaveBeenCalledWith(obj, 'alpha', 0.5);
    });

    it('should handle object not in cache gracefully', () => {
      const obj = makeStyledObj('uid-not-cached');
      expect(() => sut.removeFromCache(obj as unknown as Parameters<typeof sut.removeFromCache>[0])).not.toThrow();
    });
  });

  // ========================================================================
  // _resetInactualStyles
  // ========================================================================

  describe('inactual styles reset', () => {
    it('should remove styles for objects that no longer match selector', () => {
      const obj = makeStyledObj('uid1', { class: 'active' });
      mockController.findAll.mockReturnValue([obj]);
      ((mockUrso as unknown as Record<string, unknown>).template as { get: ReturnType<typeof vi.fn> }).get
        .mockReturnValue({ styles: { '.active': { alpha: 0.5 } } });

      // Apply initial styles
      sut.refresh();
      expect(obj._styles['.active']).toBeDefined();

      // Now simulate class removal — testObject returns false
      mockSelector.testObject.mockReturnValue(false);
      mockController.findAll.mockReturnValue([]); // no new matches

      sut.refresh();

      // Style should be removed from _styles
      expect(obj._styles['.active']).toBeUndefined();
    });
  });

  // ========================================================================
  // _restoreValueByKey
  // ========================================================================

  describe('value restoration', () => {
    it('should restore default from tempObject when style removed', () => {
      mockBaseModel.alpha = 1;

      const obj = makeStyledObj('uid1', { class: 'active', alpha: 0.5 });
      mockController.findAll.mockReturnValue([obj]);
      ((mockUrso as unknown as Record<string, unknown>).template as { get: ReturnType<typeof vi.fn> }).get
        .mockReturnValue({ styles: { '.active': { alpha: 0.5 } } });

      // Apply styles
      sut.refresh();

      // Remove styles (testObject returns false)
      mockSelector.testObject.mockReturnValue(false);
      mockController.findAll.mockReturnValue([]);
      sut.refresh();

      // Should restore alpha from tempObject
      expect(mockSafeSet).toHaveBeenCalledWith(obj, 'alpha', 1);
    });

    it('should use tempTextObject for TEXT type objects', () => {
      mockTextModel.alpha = 0.9;

      const obj = makeStyledObj('uid1', {
        class: 'active',
        type: ObjectTypeId.TEXT,
        alpha: 0.5,
      });
      mockController.findAll.mockReturnValue([obj]);
      ((mockUrso as unknown as Record<string, unknown>).template as { get: ReturnType<typeof vi.fn> }).get
        .mockReturnValue({ styles: { '.active': { alpha: 0.5 } } });

      sut.refresh();

      mockSelector.testObject.mockReturnValue(false);
      mockController.findAll.mockReturnValue([]);
      sut.refresh();

      expect(mockSafeSet).toHaveBeenCalledWith(obj, 'alpha', 0.9);
    });

    it('should not restore if _originalModel has the key', () => {
      const obj = makeStyledObj('uid1', {
        class: 'active',
        _originalModel: { alpha: 0.7 },
      });
      mockController.findAll.mockReturnValue([obj]);
      ((mockUrso as unknown as Record<string, unknown>).template as { get: ReturnType<typeof vi.fn> }).get
        .mockReturnValue({ styles: { '.active': { alpha: 0.5 } } });

      // Style won't be applied because _originalModel has alpha
      sut.refresh();

      // Force into cache manually for restore test
      obj._styles['.active'] = { alpha: 0.5 };

      mockSelector.testObject.mockReturnValue(false);
      mockController.findAll.mockReturnValue([]);
      mockSafeSet.mockClear();
      sut.refresh();

      // _restoreValueByKey should skip because _originalModel.alpha is truthy
      expect(mockSafeSet).not.toHaveBeenCalledWith(obj, 'alpha', expect.anything());
    });
  });

  // ========================================================================
  // _apply stores style on object._styles
  // ========================================================================

  describe('style application', () => {
    it('should add selector entry to object._styles', () => {
      const obj = makeStyledObj('uid1');
      mockController.findAll.mockReturnValue([obj]);
      ((mockUrso as unknown as Record<string, unknown>).template as { get: ReturnType<typeof vi.fn> }).get
        .mockReturnValue({ styles: { '.highlight': { visible: false } } });

      sut.refresh();

      expect(obj._styles['.highlight']).toEqual({ visible: false });
    });
  });
});
