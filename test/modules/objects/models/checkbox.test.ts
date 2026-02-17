import ModulesObjectsModelsCheckbox from '../../../../src/ts/modules/objects/models/checkbox';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Container } from 'pixi.js';
import ModulesObjectsModelsToggle from '../../../../src/ts/modules/objects/models/toggle';

describe('ModulesObjectsModelsCheckbox', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  const unpressedOutFrame = { type: ObjectTypeId.IMAGE, assetKey: 'unchecked.png' };
  const pressedOutFrame = { type: ObjectTypeId.IMAGE, assetKey: 'checked.png' };

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );
    mockUrso.helper.objectClone = vi.fn((obj: unknown) => JSON.parse(JSON.stringify(obj)));
    mockUrso.cache.getTexture = vi.fn(() => null);
    mockUrso.objects.create = vi.fn((_model: unknown, _parent?: unknown) => ({
      _baseObject: {
        interactive: false,
        buttonMode: false,
        on: vi.fn().mockReturnThis(),
        clear: vi.fn(),
        beginFill: vi.fn(),
        drawPolygon: vi.fn(),
        drawRect: vi.fn(),
        endFill: vi.fn(),
        width: 50,
        height: 50,
      },
      changeTexture: vi.fn(),
    }));
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should set type to CHECKBOX', () => {
    const sut = new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
    } as Record<string, unknown>);
    expect(sut.type).toBe(ObjectTypeId.CHECKBOX);
  });

  it('should extend ModulesObjectsModelsToggle', () => {
    const sut = new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
    } as Record<string, unknown>);
    expect(sut).toBeInstanceOf(ModulesObjectsModelsToggle);
  });

  it('should create a Container as _baseObject (not Sprite)', () => {
    const sut = new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
    } as Record<string, unknown>);
    expect(sut._baseObject).toBeInstanceOf(Container);
  });

  it('should default status to unpressed', () => {
    const sut = new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
    } as Record<string, unknown>);
    expect(sut.status).toBe('unpressed');
  });

  it('should default lable to null', () => {
    const sut = new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
    } as Record<string, unknown>);
    expect(sut.lable).toBeNull();
  });

  it('should default defaultStatus to unpressed', () => {
    const sut = new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
    } as Record<string, unknown>);
    expect(sut.defaultStatus).toBe('unpressed');
  });

  it('should default contents to empty array', () => {
    const sut = new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
    } as Record<string, unknown>);
    expect(sut.contents).toEqual([]);
  });

  it('should call objects.create for checkbox', () => {
    new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
    } as Record<string, unknown>);
    expect(mockUrso.objects.create).toHaveBeenCalled();
  });

  it('should call objects.create for lable when provided', () => {
    new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
      lable: { type: ObjectTypeId.TEXT, text: 'Accept' },
    } as Record<string, unknown>);
    // checkbox + lable = 2 create calls
    expect(mockUrso.objects.create).toHaveBeenCalledTimes(2);
  });

  it('should call objectClone before creating objects', () => {
    new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
    } as Record<string, unknown>);
    expect(mockUrso.helper.objectClone).toHaveBeenCalled();
  });

  it('should have a default action function', () => {
    const sut = new ModulesObjectsModelsCheckbox({
      'buttonFrames.unpressedOut': unpressedOutFrame,
    } as Record<string, unknown>);
    expect(typeof sut.action).toBe('function');
  });
});
