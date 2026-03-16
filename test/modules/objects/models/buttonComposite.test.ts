import ModulesObjectsModelsButtonComposite from '../../../../src/ts/modules/objects/models/buttonComposite';
import { ObjectTypeId } from '../../../../src/ts/types';

describe('ModulesObjectsModelsButtonComposite', () => {
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

  it('should set type to BUTTONCOMPOSITE', () => {
    const sut = new ModulesObjectsModelsButtonComposite({});
    expect(sut.type).toBe(ObjectTypeId.BUTTONCOMPOSITE);
  });

  it('should have no _baseObject (empty _addBaseObject)', () => {
    const sut = new ModulesObjectsModelsButtonComposite({});
    // _baseObject is not set by _addBaseObject, so it stays at baseModel default
    expect(sut._baseObject).toBeNull();
  });

  it('should provide a default action function', () => {
    const sut = new ModulesObjectsModelsButtonComposite({});
    expect(typeof sut.action).toBe('function');
  });

  it('should default all buttonFrames to null', () => {
    const sut = new ModulesObjectsModelsButtonComposite({});
    expect(sut.buttonFrames.over).toBeNoValue();
    expect(sut.buttonFrames.out).toBeNoValue();
    expect(sut.buttonFrames.pressed).toBeNoValue();
    expect(sut.buttonFrames.disabled).toBeNoValue();
  });

  it('should accept custom action', () => {
    const customAction = vi.fn();
    const sut = new ModulesObjectsModelsButtonComposite({ action: customAction } as Record<string, unknown>);
    expect(sut.action).toBe(customAction);
  });
});
