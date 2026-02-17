import type { I18nLocalesMap } from '../../types';

class ModulesI18nConfig {
  public readonly singleton = true;

  public locales: I18nLocalesMap = {
    de: 'i18n/de.json',
    en: 'i18n/en.json',
    ru: 'i18n/ru.json',
  };
}

export default ModulesI18nConfig;
