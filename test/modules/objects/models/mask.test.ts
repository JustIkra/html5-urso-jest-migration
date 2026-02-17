import ModulesObjectsModelsMask from '../../../../src/ts/modules/objects/models/mask';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Graphics } from 'pixi.js';

describe('ModulesObjectsModelsMask', () => {
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

  it('should set type to MASK', () => {
    const sut = new ModulesObjectsModelsMask({});
    expect(sut.type).toBe(ObjectTypeId.MASK);
  });

  it('should create a PIXI Graphics as _baseObject', () => {
    const sut = new ModulesObjectsModelsMask({});
    expect(sut._baseObject).toBeInstanceOf(Graphics);
  });

  it('should default rectangle and rectangles to null (not false)', () => {
    const sut = new ModulesObjectsModelsMask({});
    expect(sut.rectangle).toBeNull();
    expect(sut.rectangles).toBeNull();
  });

  it('should draw single rectangle when provided', () => {
    const sut = new ModulesObjectsModelsMask({ rectangle: [50, 50, 100, 100] } as Record<string, unknown>);
    const gfx = sut._baseObject as Graphics;
    expect(gfx.drawRect).toHaveBeenCalledWith(50, 50, 100, 100);
  });

  it('should draw multiple rectangles when provided', () => {
    const rects = [[0, 0, 50, 50], [100, 100, 50, 50]];
    const sut = new ModulesObjectsModelsMask({ rectangles: rects } as Record<string, unknown>);
    const gfx = sut._baseObject as Graphics;
    expect(gfx.drawRect).toHaveBeenCalledTimes(2);
    expect(gfx.drawRect).toHaveBeenCalledWith(0, 0, 50, 50);
    expect(gfx.drawRect).toHaveBeenCalledWith(100, 100, 50, 50);
  });

  it('should call lineStyle, beginFill and endFill', () => {
    const sut = new ModulesObjectsModelsMask({});
    const gfx = sut._baseObject as Graphics;
    expect(gfx.lineStyle).toHaveBeenCalledWith(0);
    expect(gfx.beginFill).toHaveBeenCalledWith(0xffffff);
    expect(gfx.endFill).toHaveBeenCalled();
  });
});
