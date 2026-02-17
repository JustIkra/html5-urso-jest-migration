import ModulesObjectsModelsContainer from '../../../../src/ts/modules/objects/models/container';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Container } from 'pixi.js';

describe('ModulesObjectsModelsContainer', () => {
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

  it('should set type to CONTAINER', () => {
    const sut = new ModulesObjectsModelsContainer({});
    expect(sut.type).toBe(ObjectTypeId.CONTAINER);
  });

  it('should create a PIXI Container as _baseObject', () => {
    const sut = new ModulesObjectsModelsContainer({});
    expect(sut._baseObject).toBeInstanceOf(Container);
  });

  it('should default contents to empty array', () => {
    const sut = new ModulesObjectsModelsContainer({});
    expect(sut.contents).toEqual([]);
  });

  it('should accept contents from params', () => {
    const children = [{ type: ObjectTypeId.IMAGE }];
    const sut = new ModulesObjectsModelsContainer({ contents: children } as Record<string, unknown>);
    expect(sut.contents).toBe(children);
  });

  it('should extend ModulesObjectsBaseModel', () => {
    const sut = new ModulesObjectsModelsContainer({});
    expect(sut.simpleClass).toBe(true);
  });
});
