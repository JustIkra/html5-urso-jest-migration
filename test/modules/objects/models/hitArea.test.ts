import ModulesObjectsModelsHitArea from '../../../../src/ts/modules/objects/models/hitArea';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Graphics, Rectangle, Circle, Polygon } from 'pixi.js';

describe('ModulesObjectsModelsHitArea', () => {
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

  it('should set type to HITAREA', () => {
    const sut = new ModulesObjectsModelsHitArea({});
    expect(sut.type).toBe(ObjectTypeId.HITAREA);
  });

  it('should create a Graphics as _baseObject', () => {
    const sut = new ModulesObjectsModelsHitArea({});
    expect(sut._baseObject).toBeInstanceOf(Graphics);
  });

  it('should draw a transparent rect on the Graphics', () => {
    const sut = new ModulesObjectsModelsHitArea({});
    const gfx = sut._baseObject as Graphics;
    expect(gfx.lineStyle).toHaveBeenCalledWith(0);
    expect(gfx.beginFill).toHaveBeenCalledWith(0xffffff);
    expect(gfx.drawRect).toHaveBeenCalled();
    expect(gfx.endFill).toHaveBeenCalled();
  });

  it('should set eventMode to static and cursor to pointer', () => {
    const sut = new ModulesObjectsModelsHitArea({});
    const gfx = sut._baseObject as Graphics & { eventMode: string; cursor: string };
    expect(gfx.eventMode).toBe('static');
    expect(gfx.cursor).toBe('pointer');
  });

  it('should register pointer event listeners', () => {
    const sut = new ModulesObjectsModelsHitArea({});
    const gfx = sut._baseObject as Graphics & { on: ReturnType<typeof vi.fn> };
    const events = gfx.on.mock.calls.map((c: unknown[]) => c[0]);
    expect(events).toContain('pointerdown');
    expect(events).toContain('pointerup');
    expect(events).toContain('pointerupoutside');
    expect(events).toContain('pointerover');
    expect(events).toContain('pointerout');
    expect(events).toContain('touchmove');
  });

  it('should default disableRightClick to false', () => {
    const sut = new ModulesObjectsModelsHitArea({});
    expect(sut.disableRightClick).toBe(false);
  });

  it('should default handlePointerUpOutside to true', () => {
    const sut = new ModulesObjectsModelsHitArea({});
    expect(sut.handlePointerUpOutside).toBe(true);
  });

  it('should default keyDownAction/mouseOverAction/mouseOutAction/onTouchMoveCallback to null', () => {
    const sut = new ModulesObjectsModelsHitArea({});
    expect(sut.keyDownAction).toBeNoValue();
    expect(sut.mouseOverAction).toBeNoValue();
    expect(sut.mouseOutAction).toBeNoValue();
    expect(sut.onTouchMoveCallback).toBeNoValue();
  });

  it('should default customInteractionArea to null', () => {
    const sut = new ModulesObjectsModelsHitArea({});
    expect(sut.customInteractionArea).toBeNull();
  });

  describe('custom hit areas', () => {
    it('should set Rectangle hitArea', () => {
      const sut = new ModulesObjectsModelsHitArea({
        customInteractionArea: { type: 'rectangle', params: [10, 20, 100, 200] },
      } as Record<string, unknown>);
      const gfx = sut._baseObject as Graphics & { hitArea: unknown };
      expect(gfx.hitArea).toBeInstanceOf(Rectangle);
    });

    it('should set Circle hitArea', () => {
      const sut = new ModulesObjectsModelsHitArea({
        customInteractionArea: { type: 'circle', params: [50, 50, 30] },
      } as Record<string, unknown>);
      const gfx = sut._baseObject as Graphics & { hitArea: unknown };
      expect(gfx.hitArea).toBeInstanceOf(Circle);
    });

    it('should set Polygon hitArea', () => {
      const sut = new ModulesObjectsModelsHitArea({
        customInteractionArea: { type: 'polygon', params: [0, 0, 100, 0, 50, 100] },
      } as Record<string, unknown>);
      const gfx = sut._baseObject as Graphics & { hitArea: unknown };
      expect(gfx.hitArea).toBeInstanceOf(Polygon);
    });
  });

  describe('enable/disable', () => {
    it('should disable interactive on disable()', () => {
      const sut = new ModulesObjectsModelsHitArea({});
      sut.disable();
      const gfx = sut._baseObject as Graphics & { interactive: boolean };
      expect(gfx.interactive).toBe(false);
    });

    it('should re-enable interactive on enable() after disable()', () => {
      const sut = new ModulesObjectsModelsHitArea({});
      sut.disable();
      sut.enable();
      const gfx = sut._baseObject as Graphics & { interactive: boolean };
      expect(gfx.interactive).toBe(true);
    });

    it('should be idempotent — double disable does nothing extra', () => {
      const sut = new ModulesObjectsModelsHitArea({});
      sut.disable();
      sut.disable(); // no-op
      sut.enable();
      const gfx = sut._baseObject as Graphics & { interactive: boolean };
      expect(gfx.interactive).toBe(true);
    });
  });
});
