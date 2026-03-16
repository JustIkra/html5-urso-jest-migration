import ModulesObjectsModelsComponent from '../../../../src/ts/modules/objects/models/component';
import type { ObjectModelParams } from '../../../../src/ts/types';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Container } from 'pixi.js';

describe('ModulesObjectsModelsComponent', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  // JS _setupFind crashes if _controller is falsy (no guard) — provide a default mock
  let defaultController: Record<string, unknown>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    defaultController = {
      common: { find: null, findOne: null, findAll: null, object: null },
    };
  });

  function createComponent(overrides: Record<string, unknown> = {}): ModulesObjectsModelsComponent {
    return new ModulesObjectsModelsComponent({ _controller: defaultController, ...overrides } as unknown as Partial<ObjectModelParams>);
  }

  it('should set type to COMPONENT', () => {
    const sut = createComponent();
    expect(sut.type).toBe(ObjectTypeId.COMPONENT);
  });

  it('should create a PIXI Container as _baseObject', () => {
    const sut = createComponent();
    expect(sut._baseObject).toBeInstanceOf(Container);
  });

  it('should default componentName to null', () => {
    const sut = createComponent();
    expect(sut.componentName).toBeNoValue();
  });

  it('should default options to null', () => {
    const sut = createComponent();
    expect(sut.options).toBeNoValue();
  });

  it('should default contents to empty array', () => {
    const sut = createComponent();
    expect(sut.contents).toEqual([]);
  });

  it('should auto-generate name when none provided', () => {
    const sut = createComponent();
    expect(sut.name).toMatch(/^component_/);
  });

  it('should keep user-provided name', () => {
    const sut = createComponent({ name: 'myComp' });
    expect(sut.name).toBe('myComp');
  });

  it('should set instance to controller when _controller given', () => {
    const sut = createComponent();
    expect(sut.instance).toBe(defaultController);
  });

  it('should wire find/findOne/findAll on instance.common when _controller given', () => {
    const controller = {
      common: {
        find: null as unknown,
        findOne: null as unknown,
        findAll: null as unknown,
        object: null,
      },
    };
    const sut = new ModulesObjectsModelsComponent({ _controller: controller, name: 'hero' } as Record<string, unknown>);

    expect(sut.instance).toBe(controller);
    expect(typeof controller.common.find).toBe('function');
    expect(typeof controller.common.findOne).toBe('function');
    expect(typeof controller.common.findAll).toBe('function');

    // Verify scoped selector
    (controller.common.find as (s: string) => unknown[])('.child');
    expect(mockUrso.find).toHaveBeenCalledWith('^hero .child');

    (controller.common.findOne as (s: string) => unknown)('#item');
    expect(mockUrso.findOne).toHaveBeenCalledWith('^hero #item');

    (controller.common.findAll as (s: string) => unknown[])('.all');
    expect(mockUrso.findAll).toHaveBeenCalledWith('^hero .all');
  });
});
