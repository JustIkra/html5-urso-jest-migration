import ModulesI18nController from '../../../src/ts/modules/i18n/controller';

describe('ModulesI18nController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = {
      ...mockUrso,
      types: { assets: { JSON: 7 }, objects: {} },
      assets: { preload: vi.fn((_a: unknown, cb: () => void) => cb()) },
    };

    ModulesI18nController.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Config')
        return {
          locales: {
            de: 'i18n/de.json',
            en: 'i18n/en.json',
            ru: 'i18n/ru.json',
          },
        };
      return {};
    }) as ModulesI18nController['getInstance'];

    ModulesI18nController.prototype.emit = vi.fn() as ModulesI18nController['emit'];
  });

  afterEach(() => {
    delete (ModulesI18nController.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesI18nController.prototype as { emit?: unknown }).emit;
  });

  describe('get', () => {
    it('should return localeId when no vocabulary set', () => {
      const sut = new ModulesI18nController();
      expect(sut.get('hello.world')).toBe('hello.world');
    });

    it('should return localeId when key not found in vocabulary', () => {
      const sut = new ModulesI18nController();
      mockUrso.cache.getJson.mockReturnValue({ greeting: 'Hallo' });
      sut.setLocale('de');
      expect(sut.get('missing.key')).toBe('missing.key');
    });

    it('should return translated text when vocabulary has the key', () => {
      const sut = new ModulesI18nController();
      mockUrso.cache.getJson.mockReturnValue({ greeting: 'Hello' });
      mockUrso.helper.interpolate.mockReturnValue('Hello');
      sut.setLocale('en');
      expect(sut.get('greeting')).toBe('Hello');
    });

    it('should interpolate variables', () => {
      const sut = new ModulesI18nController();
      mockUrso.cache.getJson.mockReturnValue({ bet_info: 'Bet: ${bet}' });
      mockUrso.helper.interpolate.mockReturnValue('Bet: 100');
      sut.setLocale('en');
      expect(sut.get('bet_info', { bet: 100 })).toBe('Bet: 100');
      expect(mockUrso.helper.interpolate).toHaveBeenCalledWith('Bet: ${bet}', { bet: 100 });
    });
  });

  describe('setLocale', () => {
    it('should set vocabulary from cache and emit event', () => {
      const sut = new ModulesI18nController();
      mockUrso.cache.getJson.mockReturnValue({ greeting: 'Hallo' });
      sut.setLocale('de');
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_I18N_NEW_LOCALE_WAS_SET,
        'de',
      );
    });

    it('should log error when json not found in cache', () => {
      const sut = new ModulesI18nController();
      mockUrso.cache.getJson.mockReturnValue(null);
      sut.setLocale('fr');
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('setLocale error'),
      );
      expect(sut.emit).not.toHaveBeenCalled();
    });

    it('should update vocabulary so subsequent get() uses new locale', () => {
      const sut = new ModulesI18nController();
      mockUrso.cache.getJson.mockReturnValue({ hello: 'Hallo' });
      mockUrso.helper.interpolate.mockReturnValue('Hallo');
      sut.setLocale('de');

      expect(sut.get('hello')).toBe('Hallo');
    });
  });

  describe('loadAndSetLocale', () => {
    it('should set locale immediately if json already cached', () => {
      const sut = new ModulesI18nController();
      mockUrso.cache.getJson.mockReturnValue({ hello: 'Hello' });
      sut.loadAndSetLocale('en');
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_I18N_NEW_LOCALE_WAS_SET,
        'en',
      );
    });

    it('should load locale by path when pathToLocaleJson provided', () => {
      const sut = new ModulesI18nController();
      mockUrso.cache.getJson.mockReturnValue(null);
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, unknown>;
      const mockPreload = vi.fn((_a: unknown, cb: () => void) => {
        mockUrso.cache.getJson.mockReturnValue({ hello: 'Bonjour' });
        cb();
      });
      (urso as Record<string, unknown>).assets = { preload: mockPreload };

      sut.loadAndSetLocale('fr', 'i18n/fr.json');
      expect(mockPreload).toHaveBeenCalledWith(
        { type: 7, key: 'fr', path: 'i18n/fr.json' },
        expect.any(Function),
      );
    });

    it('should load locale by config when no path provided', () => {
      const sut = new ModulesI18nController();
      mockUrso.cache.getJson.mockReturnValue(null);
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, unknown>;
      const mockPreload = vi.fn((_a: unknown, cb: () => void) => {
        mockUrso.cache.getJson.mockReturnValue({ hello: 'Hallo' });
        cb();
      });
      (urso as Record<string, unknown>).assets = { preload: mockPreload };

      sut.loadAndSetLocale('de');
      expect(mockPreload).toHaveBeenCalledWith(
        { type: 7, key: 'de', path: 'i18n/de.json' },
        expect.any(Function),
      );
    });

    it('should log error when locale not in config and no path provided', () => {
      const sut = new ModulesI18nController();
      mockUrso.cache.getJson.mockReturnValue(null);
      sut.loadAndSetLocale('zh');
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('_loadLocaleByConfig error'),
      );
    });
  });

  describe('_loadLocaleByPath', () => {
    it('should preload asset and call setLocale on completion', () => {
      const sut = new ModulesI18nController();
      const urso = (globalThis as Record<string, unknown>).Urso as Record<string, unknown>;
      const mockPreload = vi.fn((_a: unknown, cb: () => void) => {
        mockUrso.cache.getJson.mockReturnValue({ ok: 'yes' });
        cb();
      });
      (urso as Record<string, unknown>).assets = { preload: mockPreload };

      sut._loadLocaleByPath('test', 'i18n/test.json');
      expect(mockPreload).toHaveBeenCalledWith(
        { type: 7, key: 'test', path: 'i18n/test.json' },
        expect.any(Function),
      );
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_I18N_NEW_LOCALE_WAS_SET,
        'test',
      );
    });
  });
});
