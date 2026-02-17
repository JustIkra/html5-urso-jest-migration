import ModulesObjectsModelsComponent from '../../../../src/ts/modules/objects/models/component';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Container } from 'pixi.js';

describe('ModulesObjectsModelsComponent', () => {
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

  it('should set type to COMPONENT', () => {
    const sut = new ModulesObjectsModelsComponent({});
    expect(sut.type).toBe(ObjectTypeId.COMPONENT);
  });

  it('should create a PIXI Container as _baseObject', () => {
    const sut = new ModulesObjectsModelsComponent({});
    expect(sut._baseObject).toBeInstanceOf(Container);
  });

  it('should default componentName to null', () => {
    const sut = new ModulesObjectsModelsComponent({});
    expect(sut.componentName).toBeNull();
  });

  it('should default options to null', () => {
    const sut = new ModulesObjectsModelsComponent({});
    expect(sut.options).toBeNull();
  });

  it('should default contents to empty array', () => {
    const sut = new ModulesObjectsModelsComponent({});
    expect(sut.contents).toEqual([]);
  });

  it('should auto-generate name when none provided', () => {
    const sut = new ModulesObjectsModelsComponent({});
    expect(sut.name).toMatch(/^component_/);
  });

  it('should keep user-provided name', () => {
    const sut = new ModulesObjectsModelsComponent({ name: 'myComp' } as Record<string, unknown>);
    expect(sut.name).toBe('myComp');
  });

  it('should set instance to null when no _controller', () => {
    const sut = new ModulesObjectsModelsComponent({});
    expect(sut.instance).toBeNull();
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
