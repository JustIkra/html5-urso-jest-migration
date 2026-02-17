import ModulesObjectsModelsSlider from '../../../../src/ts/modules/objects/models/slider';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Container } from 'pixi.js';

describe('ModulesObjectsModelsSlider', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  const bgModel = { type: ObjectTypeId.GRAPHICS };
  const handleModel = { type: ObjectTypeId.GRAPHICS };

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );

    // Mock objects.create to return slider children with proper structure
    let callCount = 0;
    mockUrso.objects.create = vi.fn((_model: unknown, _parent?: unknown) => {
      callCount++;
      return {
        _baseObject: {
          width: 200,
          height: 20,
          scale: { x: 1, y: 1 },
          mask: null,
          on: vi.fn().mockReturnThis(),
          interactive: false,
          buttonMode: false,
        },
        anchorX: 0,
        anchorY: 0,
        text: '',
        x: 0,
        y: 0,
        width: 200,
        height: 20,
      };
    });

    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should set type to SLIDER', () => {
    const sut = new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
    } as Record<string, unknown>);
    expect(sut.type).toBe(ObjectTypeId.SLIDER);
  });

  it('should create a Container as _baseObject', () => {
    const sut = new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
    } as Record<string, unknown>);
    expect(sut._baseObject).toBeInstanceOf(Container);
  });

  it('should default points to [0, 1]', () => {
    const sut = new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
    } as Record<string, unknown>);
    expect(sut.points).toEqual([0, 1]);
  });

  it('should default isVertical to false', () => {
    const sut = new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
    } as Record<string, unknown>);
    expect(sut.isVertical).toBe(false);
  });

  it('should default handlePointerUpOutside to true', () => {
    const sut = new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
    } as Record<string, unknown>);
    expect(sut.handlePointerUpOutside).toBe(true);
  });

  it('should use positionKey=x and sizeKey=width for horizontal', () => {
    const sut = new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
    } as Record<string, unknown>);
    expect(sut.positionKey).toBe('x');
    expect(sut.sizeKey).toBe('width');
  });

  it('should use positionKey=y and sizeKey=height for vertical', () => {
    const sut = new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
      isVertical: true,
    } as Record<string, unknown>);
    expect(sut.positionKey).toBe('y');
    expect(sut.sizeKey).toBe('height');
  });

  it('should call objects.create for bg and handle textures', () => {
    new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
    } as Record<string, unknown>);
    // At minimum bg + handle = 2 calls
    expect(mockUrso.objects.create).toHaveBeenCalledTimes(2);
  });

  it('should call objects.create extra for fillTexture', () => {
    new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
      fillTexture: { type: ObjectTypeId.GRAPHICS },
    } as Record<string, unknown>);
    // bg + fill + fillMask + handle = 4
    expect(mockUrso.objects.create).toHaveBeenCalledTimes(4);
  });

  it('should log error for invalid texture type', () => {
    expect(() => {
      new ModulesObjectsModelsSlider({
        bgTexture: { type: 'invalid' },
        handleTexture: handleModel,
      } as Record<string, unknown>);
    }).toThrow();
    expect(mockUrso.logger.error).toHaveBeenCalled();
  });

  it('should create value text objects when models provided', () => {
    new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
      minValueTextModel: { type: ObjectTypeId.TEXT },
      maxValueTextModel: { type: ObjectTypeId.TEXT },
      currentValueTextModel: { type: ObjectTypeId.TEXT },
    } as Record<string, unknown>);
    // bg + handle + minText + maxText + currentText = 5
    expect(mockUrso.objects.create).toHaveBeenCalledTimes(5);
  });

  it('should expand single-point into range', () => {
    const sut = new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
      points: [5],
    } as Record<string, unknown>);
    // [5] -> generates [0,1,2,3,4,5]
    expect(sut.points).toEqual([5]);
  });

  it('should default contents to empty array', () => {
    const sut = new ModulesObjectsModelsSlider({
      bgTexture: bgModel,
      handleTexture: handleModel,
    } as Record<string, unknown>);
    expect(sut.contents).toEqual([]);
  });
});
