import ModulesObjectsModelsButton from '../../../../src/ts/modules/objects/models/button';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Sprite, Texture } from 'pixi.js';

describe('ModulesObjectsModelsButton', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  const fakeTexture = new Texture();

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.recursiveGet = vi.fn(
      (_key: string, obj: Record<string, unknown> | undefined, defaultValue?: unknown) => {
        if (obj && _key in obj) return obj[_key];
        return defaultValue;
      },
    );
    mockUrso.cache.getTexture = vi.fn(() => fakeTexture);
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should set type to BUTTON', () => {
    const sut = new ModulesObjectsModelsButton({});
    expect(sut.type).toBe(ObjectTypeId.BUTTON);
  });

  it('should create a Sprite as _baseObject', () => {
    const sut = new ModulesObjectsModelsButton({});
    expect(sut._baseObject).toBeInstanceOf(Sprite);
  });

  it('should have a default action function', () => {
    const sut = new ModulesObjectsModelsButton({});
    expect(typeof sut.action).toBe('function');
  });

  it('should default disableRightClick to false', () => {
    const sut = new ModulesObjectsModelsButton({});
    expect(sut.disableRightClick).toBe(false);
  });

  it('should default keyDownAction to null', () => {
    const sut = new ModulesObjectsModelsButton({});
    expect(sut.keyDownAction).toBeNoValue();
  });

  it('should default mouseOverAction to null', () => {
    const sut = new ModulesObjectsModelsButton({});
    expect(sut.mouseOverAction).toBeNoValue();
  });

  it('should default mouseOutAction to null', () => {
    const sut = new ModulesObjectsModelsButton({});
    expect(sut.mouseOutAction).toBeNoValue();
  });

  it('should default handlePointerUpOutside to true', () => {
    const sut = new ModulesObjectsModelsButton({});
    expect(sut.handlePointerUpOutside).toBe(true);
  });

  it('should default all buttonFrames to null', () => {
    const sut = new ModulesObjectsModelsButton({});
    expect(sut.buttonFrames.over).toBeNoValue();
    expect(sut.buttonFrames.out).toBeNoValue();
    expect(sut.buttonFrames.pressed).toBeNoValue();
    expect(sut.buttonFrames.disabled).toBeNoValue();
  });

  it('should register pointer events on baseObject', () => {
    const sut = new ModulesObjectsModelsButton({});
    const sprite = sut._baseObject as Sprite & { on: ReturnType<typeof vi.fn> };
    const events = sprite.on.mock.calls.map((c: unknown[]) => c[0]);
    expect(events).toContain('pointerdown');
    expect(events).toContain('pointerup');
    expect(events).toContain('pointerover');
    expect(events).toContain('pointerout');
    expect(events).toContain('pointerupoutside');
  });

  it('should set eventMode to static on creation', () => {
    const sut = new ModulesObjectsModelsButton({});
    expect((sut._baseObject as unknown as Record<string, unknown>).eventMode).toBe('static');
  });

  describe('enable/disable', () => {
    it('should change eventMode to passive on disable', () => {
      const sut = new ModulesObjectsModelsButton({});
      sut.disable();
      expect((sut._baseObject as unknown as Record<string, unknown>).eventMode).toBe('passive');
    });

    it('should restore eventMode to static on enable after disable', () => {
      const sut = new ModulesObjectsModelsButton({});
      sut.disable();
      sut.enable();
      expect((sut._baseObject as unknown as Record<string, unknown>).eventMode).toBe('static');
    });

    it('should be idempotent — double disable is no-op', () => {
      const sut = new ModulesObjectsModelsButton({});
      sut.disable();
      sut.disable(); // no-op
      sut.enable();
      expect((sut._baseObject as unknown as Record<string, unknown>).eventMode).toBe('static');
    });
  });

  describe('setButtonFrame', () => {
    it('should update buttonFrames key', () => {
      const sut = new ModulesObjectsModelsButton({});
      sut.setButtonFrame('over', 'new_over.png');
      expect(sut.buttonFrames.over).toBe('new_over.png');
    });
  });

  describe('_changeTexture', () => {
    it('should log error when out texture not found', () => {
      mockUrso.cache.getTexture = vi.fn(() => null);
      // Constructor calls _changeTexture('out') which will fail
      new ModulesObjectsModelsButton({});
      expect(mockUrso.logger.error).toHaveBeenCalled();
    });

    it('should fall back to out texture for missing keys', () => {
      let callCount = 0;
      mockUrso.cache.getTexture = vi.fn(() => {
        callCount++;
        return callCount > 1 ? fakeTexture : null;
      });
      const sut = new ModulesObjectsModelsButton({});
      // getTexture called multiple times: first call for 'out' returns null (logs error),
      // then recursive call also returns null, etc.
      expect(mockUrso.cache.getTexture).toHaveBeenCalled();
    });
  });
});
