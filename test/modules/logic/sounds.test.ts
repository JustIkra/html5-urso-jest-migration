import ModulesLogicSounds from '../../../src/ts/modules/logic/sounds';

describe('ModulesLogicSounds', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockSoundsConfig: { soundsConfig: Record<string, { soundKey: string; event: string; action: string }[]> };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockSoundsConfig = {
      soundsConfig: {
        main: [
          { soundKey: 'click', event: 'ui.click', action: 'play' },
          { soundKey: 'bg', event: 'game.start', action: 'play' },
        ],
      },
    };

    // Inject Urso mixin methods on prototype
    ModulesLogicSounds.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Config.Sounds') return mockSoundsConfig;
      return {};
    }) as ModulesLogicSounds['getInstance'];
    ModulesLogicSounds.prototype.emit = vi.fn() as ModulesLogicSounds['emit'];
    ModulesLogicSounds.prototype.addListener = vi.fn() as ModulesLogicSounds['addListener'];

    // Set up cache for audiosprites
    (mockUrso as unknown as Record<string, unknown>).cache = {
      ...mockUrso.cache,
      assetsList: {
        sound: {},
        json: {},
      },
    };
  });

  afterEach(() => {
    delete (ModulesLogicSounds.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesLogicSounds.prototype as { emit?: unknown }).emit;
    delete (ModulesLogicSounds.prototype as { addListener?: unknown }).addListener;
  });

  function createSut(): ModulesLogicSounds {
    return new ModulesLogicSounds();
  }

  describe('constructor', () => {
    it('should load config from Config.Sounds', () => {
      const sut = createSut();
      expect(sut.getInstance).toHaveBeenCalledWith('Config.Sounds');
      expect(sut['_cfg']).toBe(mockSoundsConfig.soundsConfig);
    });

    it('should initialize _loadedSounds as empty', () => {
      const sut = createSut();
      expect(sut['_loadedSounds']).toEqual({});
    });
  });

  describe('_parseConfig', () => {
    it('should map config entries to event-based structure', () => {
      const sut = createSut();
      const result = sut._parseConfig();
      expect(result.click).toBeDefined();
      expect(result.click.events['ui.click']).toBeDefined();
      expect(result.click.events['ui.click'].action).toBe('play');
    });

    it('should set default values for missing fields', () => {
      const sut = createSut();
      const result = sut._parseConfig();
      expect(result.click.events['ui.click'].volume).toBe(1);
      expect(result.click.events['ui.click'].loop).toBe(false);
      expect(result.click.events['ui.click'].relaunch).toBe(false);
    });

    it('should group events by soundKey', () => {
      mockSoundsConfig.soundsConfig.main.push(
        { soundKey: 'click', event: 'ui.hover', action: 'play' }
      );
      const sut = createSut();
      const result = sut._parseConfig();
      expect(Object.keys(result.click.events).length).toBe(2);
    });
  });

  describe('_getUploadedSounds', () => {
    it('should return only new sounds', () => {
      const sut = createSut();
      const data = {
        bg: { json: {}, audiosprite: 'data1' },
        fx: { json: {}, audiosprite: 'data2' },
      };
      const result = sut._getUploadedSounds(data);
      expect(Object.keys(result)).toEqual(['bg', 'fx']);
    });

    it('should skip already loaded sounds', () => {
      const sut = createSut();
      const data1 = { bg: { json: {}, audiosprite: 'data1' } };
      sut._getUploadedSounds(data1);
      const data2 = { bg: { json: {}, audiosprite: 'data1' }, fx: { json: {}, audiosprite: 'data2' } };
      const result = sut._getUploadedSounds(data2);
      expect(Object.keys(result)).toEqual(['fx']);
    });
  });

  describe('_getLoadedAudiospritesData', () => {
    it('should match sound assets with their json configs', () => {
      const cache = (mockUrso as unknown as { cache: { assetsList: { sound: Record<string, unknown>; json: Record<string, unknown> } } }).cache;
      cache.assetsList.sound = { 'bgm_audiospriteSound': 'audiobuffer' };
      cache.assetsList.json = { 'bgm_audiospriteJson': { sprite: {} } };
      const sut = createSut();
      const result = sut._getLoadedAudiospritesData();
      expect(result.bgm).toBeDefined();
      expect(result.bgm.json).toEqual({ sprite: {} });
    });

    it('should skip sounds without matching json', () => {
      const cache = (mockUrso as unknown as { cache: { assetsList: { sound: Record<string, unknown>; json: Record<string, unknown> } } }).cache;
      cache.assetsList.sound = { 'noJson_audiospriteSound': 'audiobuffer' };
      cache.assetsList.json = {};
      const sut = createSut();
      const result = sut._getLoadedAudiospritesData();
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('_groupLoadedHandler', () => {
    it('should return false when no audiosprite data found', () => {
      const sut = createSut();
      expect(sut._groupLoadedHandler()).toBe(false);
    });

    it('should return false when all sounds already loaded', () => {
      const cache = (mockUrso as unknown as { cache: { assetsList: { sound: Record<string, unknown>; json: Record<string, unknown> } } }).cache;
      cache.assetsList.sound = { 'bgm_audiospriteSound': 'audiobuffer' };
      cache.assetsList.json = { 'bgm_audiospriteJson': { sprite: {} } };
      const sut = createSut();
      sut._groupLoadedHandler(); // loads bgm
      expect(sut._groupLoadedHandler()).toBe(false); // already loaded
    });

    it('should emit update cfg and return true when new sounds found', () => {
      const cache = (mockUrso as unknown as { cache: { assetsList: { sound: Record<string, unknown>; json: Record<string, unknown> } } }).cache;
      cache.assetsList.sound = { 'bgm_audiospriteSound': 'audiobuffer' };
      cache.assetsList.json = { 'bgm_audiospriteJson': { sprite: {} } };
      const sut = createSut();
      expect(sut._groupLoadedHandler()).toBe(true);
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_SOUND_MANAGER_UPDATE_CFG,
        expect.objectContaining({ sounds: expect.any(Object), eventsCfg: expect.any(Object) }),
      );
    });
  });

  describe('_subscribe', () => {
    it('should add listener for group loaded event', () => {
      const sut = createSut();
      sut._subscribe();
      expect(sut.addListener).toHaveBeenCalledWith(
        mockUrso.events.MODULES_ASSETS_GROUP_LOADED,
        expect.any(Function),
        true,
      );
    });
  });
});
