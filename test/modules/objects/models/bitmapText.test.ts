import ModulesObjectsModelsBitmapText from '../../../../src/ts/modules/objects/models/bitmapText';
import { ObjectTypeId } from '../../../../src/ts/types';
import { BitmapText } from 'pixi.js';

describe('ModulesObjectsModelsBitmapText', () => {
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

  it('should set type to BITMAPTEXT', () => {
    const sut = new ModulesObjectsModelsBitmapText({});
    expect(sut.type).toBe(ObjectTypeId.BITMAPTEXT);
  });

  it('should create a PIXI BitmapText as _baseObject', () => {
    const sut = new ModulesObjectsModelsBitmapText({});
    expect(sut._baseObject).toBeInstanceOf(BitmapText);
  });

  // false -> null
  it('should default text to null (not false)', () => {
    const sut = new ModulesObjectsModelsBitmapText({});
    expect(sut.text).toBeNoValue();
  });

  it('should default localeId to null (not false)', () => {
    const sut = new ModulesObjectsModelsBitmapText({});
    expect(sut.localeId).toBeNoValue();
  });

  it('should default fontName to null (not false)', () => {
    const sut = new ModulesObjectsModelsBitmapText({});
    expect(sut.fontName).toBeNoValue();
  });

  it('should default fontSize to null (not false)', () => {
    const sut = new ModulesObjectsModelsBitmapText({});
    expect(sut.fontSize).toBeNoValue();
  });

  it('should accept text from params', () => {
    const sut = new ModulesObjectsModelsBitmapText({ text: 'Score: 100' } as Record<string, unknown>);
    expect(sut.text).toBe('Score: 100');
  });

  it('should use i18n when localeId is set', () => {
    mockUrso.i18n.get = vi.fn(() => 'Translated');
    const sut = new ModulesObjectsModelsBitmapText({ localeId: 'score_label' } as Record<string, unknown>);
    expect(mockUrso.i18n.get).toHaveBeenCalledWith('score_label', {});
    expect(sut.text).toBe('Translated');
  });

  it('should not call i18n when no localeId', () => {
    const sut = new ModulesObjectsModelsBitmapText({ text: 'raw' } as Record<string, unknown>);
    expect(mockUrso.i18n.get).not.toHaveBeenCalled();
  });

  it('should default letterSpacing to 0', () => {
    const sut = new ModulesObjectsModelsBitmapText({});
    expect(sut.letterSpacing).toBe(0);
  });
});
