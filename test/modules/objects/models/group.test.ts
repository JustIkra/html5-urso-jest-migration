import ModulesObjectsModelsGroup from '../../../../src/ts/modules/objects/models/group';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Container } from 'pixi.js';

describe('ModulesObjectsModelsGroup', () => {
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

  it('should set type to GROUP', () => {
    const sut = new ModulesObjectsModelsGroup({});
    expect(sut.type).toBe(ObjectTypeId.GROUP);
  });

  it('should create a PIXI Container as _baseObject', () => {
    const sut = new ModulesObjectsModelsGroup({});
    expect(sut._baseObject).toBeInstanceOf(Container);
  });

  it('should default groupName to null (not false)', () => {
    const sut = new ModulesObjectsModelsGroup({});
    expect(sut.groupName).toBeNoValue();
  });

  it('should accept groupName from params', () => {
    const sut = new ModulesObjectsModelsGroup({ groupName: 'myGroup' } as Record<string, unknown>);
    expect(sut.groupName).toBe('myGroup');
  });
});
