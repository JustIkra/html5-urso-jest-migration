import ModulesObjectsModelsToggle from '../../../../src/ts/modules/objects/models/toggle';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Sprite, Texture } from 'pixi.js';
import ModulesObjectsModelsButton from '../../../../src/ts/modules/objects/models/button';

describe('ModulesObjectsModelsToggle', () => {
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

  it('should set type to TOGGLE', () => {
    const sut = new ModulesObjectsModelsToggle({});
    expect(sut.type).toBe(ObjectTypeId.TOGGLE);
  });

  it('should extend ModulesObjectsModelsButton', () => {
    const sut = new ModulesObjectsModelsToggle({});
    expect(sut).toBeInstanceOf(ModulesObjectsModelsButton);
  });

  it('should create a Sprite as _baseObject', () => {
    const sut = new ModulesObjectsModelsToggle({});
    expect(sut._baseObject).toBeInstanceOf(Sprite);
  });

  it('should default status to unpressed', () => {
    const sut = new ModulesObjectsModelsToggle({});
    expect(sut.status).toBe('unpressed');
  });

  it('should have 8 buttonFrames (pressed/unpressed x Over/Out/Down/Disabled)', () => {
    const sut = new ModulesObjectsModelsToggle({});
    expect(sut.buttonFrames).toHaveProperty('pressedOver');
    expect(sut.buttonFrames).toHaveProperty('pressedOut');
    expect(sut.buttonFrames).toHaveProperty('unpressedOver');
    expect(sut.buttonFrames).toHaveProperty('unpressedOut');
    expect(sut.buttonFrames).toHaveProperty('pressedDown');
    expect(sut.buttonFrames).toHaveProperty('unpressedDown');
    expect(sut.buttonFrames).toHaveProperty('pressedDisabled');
    expect(sut.buttonFrames).toHaveProperty('unpressedDisabled');
  });

  it('should default all buttonFrames to null', () => {
    const sut = new ModulesObjectsModelsToggle({});
    for (const key of Object.keys(sut.buttonFrames)) {
      expect(sut.buttonFrames[key]).toBeNull();
    }
  });

  describe('switchStatus', () => {
    it('should toggle from unpressed to pressed', () => {
      const sut = new ModulesObjectsModelsToggle({});
      expect(sut.status).toBe('unpressed');
      sut.switchStatus();
      expect(sut.status).toBe('pressed');
    });

    it('should toggle from pressed back to unpressed', () => {
      const sut = new ModulesObjectsModelsToggle({});
      sut.switchStatus();
      sut.switchStatus();
      expect(sut.status).toBe('unpressed');
    });
  });

  describe('enable/disable', () => {
    it('should set interactive to false on disable', () => {
      const sut = new ModulesObjectsModelsToggle({});
      sut.disable();
      expect((sut._baseObject as unknown as Record<string, unknown>).interactive).toBe(false);
    });

    it('should restore interactive to true on enable', () => {
      const sut = new ModulesObjectsModelsToggle({});
      sut.disable();
      sut.enable();
      expect((sut._baseObject as unknown as Record<string, unknown>).interactive).toBe(true);
    });
  });

  it('should register pointer events', () => {
    const sut = new ModulesObjectsModelsToggle({});
    const sprite = sut._baseObject as Sprite & { on: ReturnType<typeof vi.fn> };
    const events = sprite.on.mock.calls.map((c: unknown[]) => c[0]);
    expect(events).toContain('pointerdown');
    expect(events).toContain('pointerup');
    expect(events).toContain('pointerover');
    expect(events).toContain('pointerout');
  });

  it('should have a default action function', () => {
    const sut = new ModulesObjectsModelsToggle({});
    expect(typeof sut.action).toBe('function');
  });
});
