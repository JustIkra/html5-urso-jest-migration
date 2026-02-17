import ModulesI18nConfig from '../../../src/ts/modules/i18n/config';

describe('ModulesI18nConfig', () => {
  it('should be a singleton', () => {
    const sut = new ModulesI18nConfig();
    expect(sut.singleton).toBe(true);
  });

  it('should have locales with de, en, ru keys', () => {
    const sut = new ModulesI18nConfig();
    expect(sut.locales).toHaveProperty('de');
    expect(sut.locales).toHaveProperty('en');
    expect(sut.locales).toHaveProperty('ru');
  });

  it('should have paths for each locale', () => {
    const sut = new ModulesI18nConfig();
    expect(sut.locales.de).toBe('i18n/de.json');
    expect(sut.locales.en).toBe('i18n/en.json');
    expect(sut.locales.ru).toBe('i18n/ru.json');
  });

  it('should have exactly 3 locales by default', () => {
    const sut = new ModulesI18nConfig();
    expect(Object.keys(sut.locales)).toHaveLength(3);
  });

  it('should allow adding new locales', () => {
    const sut = new ModulesI18nConfig();
    sut.locales.fr = 'i18n/fr.json';
    expect(sut.locales.fr).toBe('i18n/fr.json');
    expect(Object.keys(sut.locales)).toHaveLength(4);
  });
});
