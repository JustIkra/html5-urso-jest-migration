import ModulesSoundManagerController from '../../../src/ts/modules/soundManager/controller';

describe('ModulesSoundManagerController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockSoundSprite: {
    updateEvents: ReturnType<typeof vi.fn>;
    setAllVolume: ReturnType<typeof vi.fn>;
    playDummy: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockSoundSprite = {
      updateEvents: vi.fn(),
      setAllVolume: vi.fn(),
      playDummy: vi.fn(),
      play: vi.fn(),
      stop: vi.fn(),
    };

    (globalThis as Record<string, unknown>).UrsoUtils = {
      Howler: {
        codecs: vi.fn((codec: string) => codec === 'ogg'),
      },
    };
  });

  function createSut(): ModulesSoundManagerController {
    const sut = new ModulesSoundManagerController();
    sut.getInstance = vi.fn(() => mockSoundSprite) as ModulesSoundManagerController['getInstance'];
    sut.addListener = vi.fn();
    return sut;
  }

  describe('constructor', () => {
    it('should set codec from Howler codecs check', () => {
      const sut = createSut();
      expect(sut['_selectedCodec']).toBe('ogg');
    });

    it('should leave codec null when no codec supported', () => {
      (globalThis as Record<string, unknown>).UrsoUtils = {
        Howler: { codecs: vi.fn(() => false) },
      };
      const sut = createSut();
      expect(sut['_selectedCodec']).toBeNull();
    });

    it('should have zero global volume', () => {
      const sut = createSut();
      expect(sut['_globalVolume']).toBe(0);
    });
  });

  describe('_createSounds', () => {
    it('should create sound sprites from data', () => {
      const sut = createSut();
      sut._createSounds({
        eventsCfg: {},
        sounds: {
          bgMusic: {
            audiosprite: 'data',
            json: { sprite: { intro: [0, 1000] } },
          },
        },
      });
      expect(sut.getInstance).toHaveBeenCalledWith('SoundSprite', expect.objectContaining({
        name: 'bgMusic',
        codec: 'ogg',
      }));
      expect(mockSoundSprite.updateEvents).toHaveBeenCalledWith({});
    });

    it('should not recreate existing sounds', () => {
      const sut = createSut();
      const data = {
        eventsCfg: {},
        sounds: {
          bgMusic: { audiosprite: 'data', json: { sprite: { intro: [0, 1000] } } },
        },
      } as Parameters<typeof sut._createSounds>[0];
      sut._createSounds(data);
      sut._createSounds(data);
      expect(sut.getInstance).toHaveBeenCalledTimes(1);
    });
  });

  describe('_checkSoundExists', () => {
    it('should return true for existing sound', () => {
      const sut = createSut();
      sut['_sounds'].test = mockSoundSprite;
      expect(sut._checkSoundExists('test')).toBe(true);
    });

    it('should log error for missing sound', () => {
      const sut = createSut();
      sut._checkSoundExists('missing');
      expect(mockUrso.logger.error).toHaveBeenCalledWith(expect.stringContaining('missing'));
    });
  });

  describe('_doHandler', () => {
    it('should call action on the sound sprite', () => {
      const sut = createSut();
      sut['_sounds'].test = mockSoundSprite;
      sut._doHandler({ action: 'play' as never, name: 'test', behavior: undefined });
      expect(mockSoundSprite.play).toHaveBeenCalled();
    });
  });

  describe('_globalVolumeChange', () => {
    it('should clamp volume between 0 and 1', () => {
      const sut = createSut();
      sut._globalVolumeChange(1.5);
      expect(sut['_globalVolume']).toBe(1);
    });

    it('should update sound volume after change', () => {
      const sut = createSut();
      sut['_sounds'].test = mockSoundSprite;
      sut._globalVolumeChange(0.8);
      expect(mockSoundSprite.setAllVolume).toHaveBeenCalled();
    });
  });

  describe('_visibilityChange', () => {
    it('should set system volume to 1 when visible', () => {
      const sut = createSut();
      sut['_sounds'].test = mockSoundSprite;
      sut._visibilityChange('visible');
      expect(sut['_systemVolume']).toBe(1);
    });

    it('should set system volume to 0 when hidden', () => {
      const sut = createSut();
      sut['_sounds'].test = mockSoundSprite;
      sut._visibilityChange('hidden');
      expect(sut['_systemVolume']).toBe(0);
    });

    it('should call playDummy on all sounds', () => {
      const sut = createSut();
      sut['_sounds'].test = mockSoundSprite;
      sut._visibilityChange('visible');
      expect(mockSoundSprite.playDummy).toHaveBeenCalled();
    });
  });

  describe('_updateSoundVolume', () => {
    it('should set total volume on all sounds', () => {
      const sut = createSut();
      sut['_sounds'].bg = mockSoundSprite;
      sut['_globalVolume'] = 0.5;
      sut['_systemVolume'] = 1;
      sut._updateSoundVolume();
      expect(mockSoundSprite.setAllVolume).toHaveBeenCalledWith(0.5);
    });
  });

  describe('_subscribe', () => {
    it('should add listeners for sound events', () => {
      const sut = createSut();
      sut._subscribe();
      expect(sut.addListener).toHaveBeenCalledTimes(4);
    });
  });

  describe('_setEventsHandler', () => {
    it('should update events from localData', () => {
      const sut = createSut();
      sut['_sounds'].test = mockSoundSprite;
      mockUrso.localData.get.mockReturnValue({ test: { events: {} } });
      sut._setEventsHandler();
      expect(mockSoundSprite.updateEvents).toHaveBeenCalled();
    });

    it('should skip sounds not in config', () => {
      const sut = createSut();
      sut['_sounds'].test = mockSoundSprite;
      mockUrso.localData.get.mockReturnValue({});
      sut._setEventsHandler();
      expect(mockSoundSprite.updateEvents).not.toHaveBeenCalled();
    });
  });
});
