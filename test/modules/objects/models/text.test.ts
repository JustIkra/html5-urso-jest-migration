import ModulesObjectsModelsText from '../../../../src/ts/modules/objects/models/text';
import { ObjectTypeId } from '../../../../src/ts/types';
import { Text } from 'pixi.js';

describe('ModulesObjectsModelsText', () => {
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

  it('should set type to TEXT', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut.type).toBe(ObjectTypeId.TEXT);
  });

  it('should create a PIXI Text as _baseObject', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut._baseObject).toBeInstanceOf(Text);
  });

  // false -> null migration
  it('should default text to null (not false)', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut.text).toBeNoValue();
  });

  it('should default localeId to null (not false)', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut.localeId).toBeNoValue();
  });

  it('should default fontSize to null (not false)', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut.fontSize).toBeNoValue();
  });

  it('should default dropShadow to null (not false)', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut.dropShadow).toBeNoValue();
  });

  it('should default wordWrap to null (not false)', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut.wordWrap).toBeNoValue();
  });

  it('should default fillCustomColors to null (not false)', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut.fillCustomColors).toBeNoValue();
  });

  it('should default fillGradientStops to null (not false)', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut.fillGradientStops).toBeNoValue();
  });

  it('should accept text from params', () => {
    const sut = new ModulesObjectsModelsText({ text: 'Hello' } as Record<string, unknown>);
    expect(sut.text).toBe('Hello');
  });

  it('should default fontFamily to Arial', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut.fontFamily).toBe('Arial');
  });

  it('should default fill to #000000', () => {
    const sut = new ModulesObjectsModelsText({});
    expect(sut.fill).toBe('#000000');
  });

  it('should use i18n when localeId is set', () => {
    mockUrso.i18n.get = vi.fn(() => 'Translated');
    const sut = new ModulesObjectsModelsText({ localeId: 'greeting' } as Record<string, unknown>);
    expect(mockUrso.i18n.get).toHaveBeenCalledWith('greeting', {});
    expect(sut.text).toBe('Translated');
  });

  it('should not call i18n when no localeId', () => {
    const sut = new ModulesObjectsModelsText({ text: 'raw' } as Record<string, unknown>);
    expect(mockUrso.i18n.get).not.toHaveBeenCalled();
    expect(sut.text).toBe('raw');
  });

  describe('modifyValue', () => {
    it('should pass through non-fill keys', () => {
      const sut = new ModulesObjectsModelsText({});
      expect(sut.modifyValue('alpha', 0.5)).toBe(0.5);
    });

    it('should return non-array fill as-is', () => {
      const sut = new ModulesObjectsModelsText({});
      expect(sut.modifyValue('fill', '#ff0000')).toBe('#ff0000');
    });

    it('should create FillGradient for array fill', () => {
      const sut = new ModulesObjectsModelsText({ fill: ['#ffffff', '#00ff99'] } as Record<string, unknown>);
      const result = sut.modifyValue('fill', ['#ffffff', '#00ff99']);
      expect(result).toBeDefined();
    });
  });
});
