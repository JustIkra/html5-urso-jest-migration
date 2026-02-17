import ModulesObjectsModelsGraphics from '../../../../src/ts/modules/objects/models/graphics';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Graphics } from 'pixi.js';

describe('ModulesObjectsModelsGraphics', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (!obj) return defaultValue;
        // Support dotted keys like 'figure.polygon'
        const parts = key.split('.');
        let current: unknown = obj;
        for (const part of parts) {
          if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
            current = (current as Record<string, unknown>)[part];
          } else {
            return defaultValue;
          }
        }
        return current;
      },
    );
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should set type to GRAPHICS', () => {
    const sut = new ModulesObjectsModelsGraphics({});
    expect(sut.type).toBe(ObjectTypeId.GRAPHICS);
  });

  it('should create a PIXI Graphics as _baseObject', () => {
    const sut = new ModulesObjectsModelsGraphics({});
    expect(sut._baseObject).toBeInstanceOf(Graphics);
  });

  it('should default polygon and rectangle to empty arrays', () => {
    const sut = new ModulesObjectsModelsGraphics({});
    expect(sut.polygon).toEqual([]);
    expect(sut.rectangle).toEqual([]);
  });

  it('should default fillColor to 0x000000', () => {
    const sut = new ModulesObjectsModelsGraphics({});
    expect(sut.fillColor).toBe(0x000000);
  });

  it('should draw polygon when polygon data provided', () => {
    const polygonData = [0, 0, 100, 0, 100, 100, 0, 100];
    const sut = new ModulesObjectsModelsGraphics({ figure: { polygon: polygonData } } as Record<string, unknown>);

    const gfx = sut._baseObject as Graphics;
    expect(gfx.beginFill).toHaveBeenCalled();
    expect(gfx.drawPolygon).toHaveBeenCalledWith(polygonData);
    expect(gfx.endFill).toHaveBeenCalled();
  });

  it('should draw rectangle when rectangle data provided', () => {
    const rectData = [10, 20, 100, 50];
    const sut = new ModulesObjectsModelsGraphics({ figure: { rectangle: rectData } } as Record<string, unknown>);

    const gfx = sut._baseObject as Graphics;
    expect(gfx.beginFill).toHaveBeenCalled();
    expect(gfx.drawRect).toHaveBeenCalledWith(10, 20, 100, 50);
    expect(gfx.endFill).toHaveBeenCalled();
  });

  it('should not draw anything when no polygon or rectangle', () => {
    const sut = new ModulesObjectsModelsGraphics({});
    const gfx = sut._baseObject as Graphics;
    expect(gfx.beginFill).not.toHaveBeenCalled();
  });
});
