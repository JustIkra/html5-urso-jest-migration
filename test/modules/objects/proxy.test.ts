import ModulesObjectsProxy from '../../../src/ts/modules/objects/proxy';
import gsap from 'gsap';

interface MockPixi {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  scale: { x: number; y: number };
  anchor: { x: number; y: number };
  zIndex: number;
  alpha: number;
  visible: boolean;
  dirty?: boolean;
  updateTransform: ReturnType<typeof vi.fn>;
  _texture?: { orig: { width: number; height: number } };
  [key: string]: unknown;
}

interface MockModel {
  _baseObject: MockPixi;
  _originalModel: Record<string, unknown>;
  _transitions: { tweens: Record<string, { kill: ReturnType<typeof vi.fn> } | null> };
  proxyObject: unknown;
  maxWidth: number | null;
  maxHeight: number | null;
  transitionProperty: string | null;
  transitionDuration: number | null;
  transitionDelay: number | null;
  x: number;
  y: number;
  z: number;
  alpha: number;
  visible: boolean;
  angle: number;
  width: number | string | null;
  height: number | string | null;
  scaleX: number;
  scaleY: number;
  anchorX: number;
  anchorY: number;
  alignX: string;
  alignY: string;
  id: string | null;
  name: string | null;
  class: string | null;
  modifyValue: (key: string, val: unknown) => unknown;
  [key: string]: unknown;
}

function makePixi(overrides: Partial<MockPixi> = {}): MockPixi {
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    angle: 0,
    scale: { x: 1, y: 1 },
    anchor: { x: 0, y: 0 },
    zIndex: 0,
    alpha: 1,
    visible: true,
    updateTransform: vi.fn(),
    ...overrides,
  };
}

function makeModel(overrides: Partial<MockModel> = {}): MockModel {
  return {
    _baseObject: makePixi(),
    _originalModel: {},
    _transitions: { tweens: {} },
    proxyObject: null,
    maxWidth: null,
    maxHeight: null,
    transitionProperty: null,
    transitionDuration: null,
    transitionDelay: null,
    x: 0,
    y: 0,
    z: 0,
    alpha: 1,
    visible: true,
    angle: 0,
    width: null,
    height: null,
    scaleX: 1,
    scaleY: 1,
    anchorX: 0,
    anchorY: 0,
    alignX: 'left',
    alignY: 'top',
    id: null,
    name: null,
    class: null,
    modifyValue: (_key: string, val: unknown) => val,
    ...overrides,
  };
}

describe('ModulesObjectsProxy', () => {
  let sut: ModulesObjectsProxy;
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockPropertyAdapter: {
    isAdaptiveProperty: ReturnType<typeof vi.fn>;
    propertyChangeHandler: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockPropertyAdapter = {
      isAdaptiveProperty: vi.fn(() => false),
      propertyChangeHandler: vi.fn(),
    };

    const proto = ModulesObjectsProxy.prototype as unknown as Record<string, unknown>;
    proto.getInstance = vi.fn((path: string) => {
      if (path === 'PropertyAdapter') return mockPropertyAdapter;
      return null;
    });

    sut = new ModulesObjectsProxy();
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });

  // ========================================================================
  // get() - proxy creation
  // ========================================================================

  describe('get()', () => {
    it('should return a proxy of the model', () => {
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]);
      expect(proxy).toBeDefined();
    });

    it('should set model.proxyObject to the proxy', () => {
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]);
      expect(model.proxyObject).toBe(proxy);
    });

    it('should allow reading properties through the proxy', () => {
      const model = makeModel({ alpha: 0.5 });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      expect(proxy.alpha).toBe(0.5);
    });
  });

  // ========================================================================
  // set - property aliasing
  // ========================================================================

  describe('property set through proxy', () => {
    it('should update _originalModel on set', () => {
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 0.3;
      expect(model._originalModel.alpha).toBe(0.3);
    });

    it('should NOT update _originalModel for parent (exception)', () => {
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.parent = null as unknown as MockModel;
      expect(model._originalModel.parent).toBeUndefined();
    });

    it('should call propertyAdapter for adaptive properties', () => {
      mockPropertyAdapter.isAdaptiveProperty.mockReturnValue(true);
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.x = 100;
      expect(mockPropertyAdapter.propertyChangeHandler).toHaveBeenCalled();
    });

    it('should use recursiveSet for non-adaptive aliased properties', () => {
      mockPropertyAdapter.isAdaptiveProperty.mockReturnValue(false);
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 0.7;
      expect(mockUrso.helper.recursiveSet).toHaveBeenCalledWith('alpha', 0.7, model._baseObject);
    });

    it('should set dirty flag if it exists on baseObject', () => {
      const pixi = makePixi({ dirty: false });
      const model = makeModel({ _baseObject: pixi });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 0.5;
      expect(pixi.dirty).toBe(true);
    });
  });

  // ========================================================================
  // z -> zIndex alias
  // ========================================================================

  describe('z -> zIndex alias', () => {
    it('should map z property to zIndex on set', () => {
      mockPropertyAdapter.isAdaptiveProperty.mockReturnValue(false);
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.z = 5;
      expect(mockUrso.helper.recursiveSet).toHaveBeenCalledWith('zIndex', 5, model._baseObject);
    });
  });

  // ========================================================================
  // selector properties warning
  // ========================================================================

  describe('selector properties warning', () => {
    it('should log error when setting id directly through proxy', () => {
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.id = 'newId';
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObjectsProxy error: you are trying to change selector property: id'
      );
    });

    it('should log error when setting name directly through proxy', () => {
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.name = 'newName';
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObjectsProxy error: you are trying to change selector property: name'
      );
    });

    it('should log error when setting class directly through proxy', () => {
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy['class'] = 'newClass';
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObjectsProxy error: you are trying to change selector property: class'
      );
    });
  });

  // ========================================================================
  // safeSetValueToTarget
  // ========================================================================

  describe('safeSetValueToTarget', () => {
    it('should set value without selector property warning', () => {
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      sut.safeSetValueToTarget(proxy as unknown as Parameters<typeof sut.safeSetValueToTarget>[0], 'id', 'safeId');
      expect(mockUrso.logger.error).not.toHaveBeenCalledWith(
        expect.stringContaining('selector property')
      );
    });

    it('should preserve _originalModel value', () => {
      const model = makeModel({ _originalModel: { id: 'originalId' } });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      sut.safeSetValueToTarget(proxy as unknown as Parameters<typeof sut.safeSetValueToTarget>[0], 'id', 'tempId');
      expect(model._originalModel.id).toBe('originalId');
    });
  });

  // ========================================================================
  // _checkMaxSize
  // ========================================================================

  describe('maxSize checking', () => {
    it('should skip when maxWidth and maxHeight are both null', () => {
      const pixi = makePixi();
      const model = makeModel({ _baseObject: pixi, maxWidth: null, maxHeight: null });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 0.5; // trigger set
      expect(pixi.updateTransform).not.toHaveBeenCalled();
    });

    it('should downscale when object exceeds maxWidth', () => {
      const pixi = makePixi({ width: 200, height: 100, scale: { x: 1, y: 1 } });
      const model = makeModel({ _baseObject: pixi, maxWidth: 100 });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 1; // trigger set to invoke _checkMaxSize
      // scaleNeed = |1 * 100 / 200| = 0.5
      expect(pixi.scale.x).toBe(0.5);
      expect(pixi.scale.y).toBe(0.5);
    });

    it('should downscale when object exceeds maxHeight', () => {
      const pixi = makePixi({ width: 100, height: 300, scale: { x: 1, y: 1 } });
      const model = makeModel({ _baseObject: pixi, maxHeight: 150 });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 1; // trigger
      // scaleNeed (from maxHeight) = |1 * 150 / 300| = 0.5
      expect(pixi.scale.y).toBe(0.5);
    });

    it('should use the smaller scale when both maxWidth and maxHeight are set', () => {
      const pixi = makePixi({ width: 200, height: 400, scale: { x: 1, y: 1 } });
      const model = makeModel({ _baseObject: pixi, maxWidth: 100, maxHeight: 100 });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 1; // trigger
      // scaleX = |1 * 100 / 200| = 0.5, scaleY = |1 * 100 / 400| = 0.25
      // min(0.5, 0.25) = 0.25
      expect(pixi.scale.x).toBe(0.25);
      expect(pixi.scale.y).toBe(0.25);
    });

    it('should not scale above 1', () => {
      const pixi = makePixi({ width: 50, height: 50, scale: { x: 0.5, y: 0.5 } });
      const model = makeModel({ _baseObject: pixi, maxWidth: 200 });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 1; // trigger
      // maxWidth > baseObjectWidth (50) and scale.x < 1 -> calculation needed
      // scaleNeed = |0.5 * 200 / 50| = 2 -> capped at 1
      expect(pixi.scale.x).toBe(1);
      expect(pixi.scale.y).toBe(1);
    });
  });

  // ========================================================================
  // _checkNeedTransitions
  // ========================================================================

  describe('transitions', () => {
    it('should not create tween when transitionProperty is null', () => {
      const model = makeModel({ transitionProperty: null });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 0.5;
      expect(gsap.to).not.toHaveBeenCalled();
    });

    it('should create tween when transition is configured for property', () => {
      const pixi = makePixi({ alpha: 1 });
      const model = makeModel({
        _baseObject: pixi,
        transitionProperty: 'alpha',
        transitionDuration: 500,
      });
      // Need to set oldValue on baseObject before setting new value
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 0.5;
      expect(gsap.to).toHaveBeenCalled();
    });

    it('should kill existing tween before creating new one', () => {
      const killFn = vi.fn();
      const model = makeModel({
        transitionProperty: 'alpha',
        transitionDuration: 300,
        _transitions: { tweens: { alpha: { kill: killFn } } },
      });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 0.5;
      expect(killFn).toHaveBeenCalled();
    });

    it('should include delay when transitionDelay is set', () => {
      const pixi = makePixi({ alpha: 1 });
      const model = makeModel({
        _baseObject: pixi,
        transitionProperty: 'alpha',
        transitionDuration: 1000,
        transitionDelay: 200,
      });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 0.5;
      expect(gsap.to).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ delay: 0.2 }),
      );
    });
  });

  // ========================================================================
  // symbol keys
  // ========================================================================

  describe('symbol key handling', () => {
    it('should pass through symbol keys on get', () => {
      const sym = Symbol('test');
      const model = makeModel();
      (model as unknown as Record<symbol, unknown>)[sym] = 'symValue';
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]);
      expect((proxy as unknown as Record<symbol, unknown>)[sym]).toBe('symValue');
    });

    it('should pass through symbol keys on set', () => {
      const sym = Symbol('test');
      const model = makeModel();
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]);
      (proxy as unknown as Record<symbol, unknown>)[sym] = 'newSymValue';
      expect((model as unknown as Record<symbol, unknown>)[sym]).toBe('newSymValue');
    });
  });

  // ========================================================================
  // modifyValue
  // ========================================================================

  describe('modifyValue', () => {
    it('should call modifyValue on set', () => {
      const model = makeModel({
        modifyValue: vi.fn((_key: string, val: unknown) => val),
      });
      const proxy = sut.get(model as unknown as Parameters<typeof sut.get>[0]) as unknown as MockModel;
      proxy.alpha = 0.8;
      expect(model.modifyValue).toHaveBeenCalledWith('alpha', 0.8);
    });
  });
});
