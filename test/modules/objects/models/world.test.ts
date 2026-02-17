import ModulesObjectsModelsWorld from '../../../../src/ts/modules/objects/models/world';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Container } from 'pixi.js';

describe('ModulesObjectsModelsWorld', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockPixiWorld: Container;

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );

    mockPixiWorld = new Container();
    (mockUrso as unknown as Record<string, unknown>).scenes = {
      ...mockUrso.scenes,
      getPixiWorld: vi.fn(() => mockPixiWorld),
    };
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should set type to WORLD', () => {
    const sut = new ModulesObjectsModelsWorld({});
    expect(sut.type).toBe(ObjectTypeId.WORLD);
  });

  it('should use Urso.scenes.getPixiWorld() as _baseObject', () => {
    const sut = new ModulesObjectsModelsWorld({});
    expect(sut._baseObject).toBe(mockPixiWorld);
  });

  it('should default contents to empty array', () => {
    const sut = new ModulesObjectsModelsWorld({});
    expect(sut.contents).toEqual([]);
  });

  it('should accept contents from params', () => {
    const children = [{ type: ObjectTypeId.CONTAINER }];
    const sut = new ModulesObjectsModelsWorld({ contents: children } as Record<string, unknown>);
    expect(sut.contents).toBe(children);
  });
});
