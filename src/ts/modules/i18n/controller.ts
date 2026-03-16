import type { UrsoInstance, I18nLocalesMap, AssetTypeId } from '../../types';

class ModulesI18nController {
  #vocabulary: Record<string, string> | null = null;

  public getInstance!: UrsoInstance['getInstance'];
  public emit!: UrsoInstance['emit'];

  get(localeId: string, localeVariables: Record<string, unknown> = {}): string {
    if (this.#vocabulary && this.#vocabulary[localeId]) {
      return Urso.helper.interpolate(this.#vocabulary[localeId], localeVariables);
    }
    return localeId;
  }

  setLocale(localeKey: string): void {
    const jsonResource = Urso.cache.getJson(localeKey);

    if (!jsonResource) {
      Urso.logger.error('ModulesI18nController setLocale error, no loaded json:' + localeKey + '. Check assets please');
      return;
    }

    this.#vocabulary = jsonResource as Record<string, string> | null;
    this.emit(Urso.events.MODULES_I18N_NEW_LOCALE_WAS_SET, localeKey);
  }

  loadAndSetLocale(localeKey: string, pathToLocaleJson?: string): void {
    const jsonResource = Urso.cache.getJson(localeKey);

    if (jsonResource) {
      this.setLocale(localeKey);
    }

    if (pathToLocaleJson) {
      this._loadLocaleByPath(localeKey, pathToLocaleJson);
    } else {
      this._loadLocaleByConfig(localeKey);
    }
  }

  _loadLocaleByConfig(localeKey: string): void {
    const locales = this.getInstance<{ locales: I18nLocalesMap }>('Config').locales;
    const pathToLocaleJson = locales[localeKey];

    if (!pathToLocaleJson) {
      Urso.logger.error(
        'ModulesI18nController _loadLocaleByConfig error, no locale data in config:' +
          localeKey +
          '. Check ModulesI18nConfig please',
      );
      return;
    }

    this._loadLocaleByPath(localeKey, pathToLocaleJson);
  }

  _loadLocaleByPath(localeKey: string, pathToLocaleJson: string): void {
    const localeAsset = { type: Urso.types.assets.JSON, key: localeKey, path: pathToLocaleJson };
    Urso.assets.preload(localeAsset, () => this.setLocale(localeKey));
  }
}

export default ModulesI18nController;
