import ModulesSoundManagerSoundSprite from '../../../src/ts/modules/soundManager/soundSprite';

describe('ModulesSoundManagerSoundSprite', () => {
  let mockHowlInstance: {
    play: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    volume: ReturnType<typeof vi.fn>;
    loop: ReturnType<typeof vi.fn>;
    mute: ReturnType<typeof vi.fn>;
    playing: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    unload: ReturnType<typeof vi.fn>;
    _volume: number;
  };

  let mockUrso: ReturnType<typeof createMockUrso>;
  let fileReaderInstances: { onloadend: (() => void) | null; result: string; readAsDataURL: ReturnType<typeof vi.fn> }[];

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockHowlInstance = {
      play: vi.fn(() => 1),
      stop: vi.fn(),
      pause: vi.fn(),
      volume: vi.fn(),
      loop: vi.fn(),
      mute: vi.fn(),
      playing: vi.fn(() => false),
      on: vi.fn(),
      unload: vi.fn(),
      _volume: 1,
    };

    fileReaderInstances = [];

    (globalThis as Record<string, unknown>).UrsoUtils = {
      Howl: vi.fn(() => mockHowlInstance),
      Howler: { _audioUnlocked: true },
    };

    (globalThis as Record<string, unknown>).gsap = {
      to: vi.fn((_target: object, _duration: number, vars: Record<string, unknown>) => {
        return { kill: vi.fn(), ratio: 1 };
      }),
    };

    // Mock FileReader
    const origFileReader = globalThis.FileReader;
    (globalThis as Record<string, unknown>).FileReader = vi.fn(() => {
      const instance = {
        onloadend: null as (() => void) | null,
        result: 'data:audio/ogg;base64,test',
        readAsDataURL: vi.fn(function (this: typeof instance) {
          fileReaderInstances.push(this);
          if (this.onloadend) this.onloadend();
        }),
      };
      return instance;
    });

    // Inject Urso mixin methods on prototype so constructor can use them
    ModulesSoundManagerSoundSprite.prototype.emit = vi.fn() as ModulesSoundManagerSoundSprite['emit'];
    ModulesSoundManagerSoundSprite.prototype.addListener = vi.fn() as ModulesSoundManagerSoundSprite['addListener'];
    ModulesSoundManagerSoundSprite.prototype.removeListener = vi.fn() as ModulesSoundManagerSoundSprite['removeListener'];
  });

  afterEach(() => {
    delete (ModulesSoundManagerSoundSprite.prototype as { emit?: unknown }).emit;
    delete (ModulesSoundManagerSoundSprite.prototype as { addListener?: unknown }).addListener;
    delete (ModulesSoundManagerSoundSprite.prototype as { removeListener?: unknown }).removeListener;
  });

  function createSut(sprite: Record<string, [number, number]> = { click: [0, 500], beep: [500, 300] }, codec: string | null = 'ogg') {
    return new ModulesSoundManagerSoundSprite({
      name: 'testSound',
      sprite,
      audiosprite: 'fake-audio-data',
      codec: codec as 'ogg' | null,
    });
  }

  describe('constructor', () => {
    it('should initialize sounds state from sprite keys', () => {
      const sut = createSut();
      expect(sut['_soundsState']).toHaveProperty('click');
      expect(sut['_soundsState']).toHaveProperty('beep');
      expect(sut['_soundsState'].click.id).toBeNull();
      expect(sut['_soundsState'].click.loop).toBe(false);
      expect(sut['_soundsState'].click.volume).toBe(1);
    });

    it('should create a player via FileReader when codec is set', () => {
      const sut = createSut();
      expect(sut['_player']).toBeDefined();
    });

    it('should not create player when codec is null', () => {
      const sut = createSut({ click: [0, 500] }, null);
      expect(sut['_player']).toBeNull();
    });
  });

  describe('_subscribePlayerEvents', () => {
    it('should call _audioUnlockHandler immediately when Howler already unlocked', () => {
      const sut = createSut();
      expect(sut['_isAudioUnlocked']).toBe(true);
    });

    it('should listen for unlock event when Howler not yet unlocked', () => {
      (globalThis as Record<string, unknown>).UrsoUtils = {
        Howl: vi.fn(() => mockHowlInstance),
        Howler: { _audioUnlocked: false },
      };
      const sut = createSut();
      expect(mockHowlInstance.on).toHaveBeenCalledWith('unlock', expect.any(Function));
    });

    it('should listen for end event', () => {
      const sut = createSut();
      expect(mockHowlInstance.on).toHaveBeenCalledWith('end', expect.any(Function));
    });
  });

  describe('canPlayCheck', () => {
    it('should return true when audio is unlocked', () => {
      const sut = createSut();
      expect(sut.canPlayCheck()).toBe(true);
    });

    it('should return false when audio is not unlocked', () => {
      (globalThis as Record<string, unknown>).UrsoUtils = {
        Howl: vi.fn(() => mockHowlInstance),
        Howler: { _audioUnlocked: false },
      };
      const sut = createSut();
      expect(sut.canPlayCheck()).toBe(false);
    });
  });

  describe('play', () => {
    it('should play a sound and return true', () => {
      const sut = createSut();
      const result = sut.play({ soundKey: 'click' });
      expect(result).toBe(true);
      expect(mockHowlInstance.play).toHaveBeenCalledWith('click');
    });

    it('should return false when audio not unlocked', () => {
      (globalThis as Record<string, unknown>).UrsoUtils = {
        Howl: vi.fn(() => mockHowlInstance),
        Howler: { _audioUnlocked: false },
      };
      const sut = createSut();
      expect(sut.play({ soundKey: 'click' })).toBe(false);
    });

    it('should return false when sound already playing and relaunch is false', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      expect(sut.play({ soundKey: 'click' })).toBe(false);
    });

    it('should allow relaunch when relaunch is true', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      const result = sut.play({ soundKey: 'click', relaunch: true });
      expect(result).toBe(true);
    });

    it('should use saved volume when resetVolume is false', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      sut['_soundsState'].click.id = null; // reset so we can play again
      sut['_soundsState'].click.volume = 0.5;
      sut.play({ soundKey: 'click', resetVolume: false });
      expect(mockHowlInstance.volume).toHaveBeenCalledWith(0.5, expect.anything());
    });
  });

  describe('setLoop', () => {
    it('should set loop state and call player loop', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      sut.setLoop('click', true);
      expect(sut['_soundsState'].click.loop).toBe(true);
      expect(mockHowlInstance.loop).toHaveBeenCalledWith(true, 1);
    });
  });

  describe('setVolume', () => {
    it('should set volume on the player', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      sut.setVolume({ soundKey: 'click', volume: 0.5 });
      expect(mockHowlInstance.volume).toHaveBeenCalledWith(0.5, 1);
      expect(sut['_soundsState'].click.volume).toBe(0.5);
    });

    it('should mute when volume is 0', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      sut.setVolume({ soundKey: 'click', volume: 0 });
      expect(mockHowlInstance.mute).toHaveBeenCalledWith(true, 'click');
    });

    it('should unmute when volume goes from 0 to non-zero', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      sut.setVolume({ soundKey: 'click', volume: 0 });
      sut.setVolume({ soundKey: 'click', volume: 0.5 });
      expect(mockHowlInstance.mute).toHaveBeenCalledWith(false, 'click');
    });

    it('should not save volume when saveVolumeState is false', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      sut.setVolume({ soundKey: 'click', volume: 0.3, saveVolumeState: false });
      expect(sut['_soundsState'].click.volume).toBe(1); // still default
    });
  });

  describe('setAllVolume', () => {
    it('should set total volume and update player', () => {
      const sut = createSut();
      sut.setAllVolume(0.8);
      expect(sut['_totalVolume']).toBe(0.8);
      expect(mockHowlInstance._volume).toBe(0.8);
    });

    it('should call _updateVolume when audio is unlocked', () => {
      const sut = createSut();
      const spy = vi.spyOn(sut, '_updateVolume');
      sut.setAllVolume(0.5);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop a playing sound', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      sut.stop({ soundKey: 'click' });
      expect(mockHowlInstance.stop).toHaveBeenCalledWith(1);
      expect(sut['_soundsState'].click.id).toBeNull();
    });

    it('should do nothing when sound is not playing', () => {
      const sut = createSut();
      sut.stop({ soundKey: 'click' });
      expect(mockHowlInstance.stop).not.toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('should pause a sound', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      sut.pause({ soundKey: 'click' });
      expect(mockHowlInstance.pause).toHaveBeenCalled();
    });
  });

  describe('resume', () => {
    it('should resume a paused sound when audio unlocked and not playing', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      mockHowlInstance.playing.mockReturnValue(false);
      sut.resume({ soundKey: 'click' });
      expect(mockHowlInstance.play).toHaveBeenCalledWith(1);
    });
  });

  describe('setRelaunch', () => {
    it('should set relaunch state', () => {
      const sut = createSut();
      sut.setRelaunch('click', true);
      expect(sut['_soundsState'].click.relaunch).toBe(true);
    });
  });

  describe('updateEvents', () => {
    it('should save events config and subscribe', () => {
      const sut = createSut();
      sut.addListener = vi.fn();
      sut.removeListener = vi.fn();
      const cfg = { click: { events: { 'game.spin': { action: 'play', volume: 1 } } } };
      sut.updateEvents(cfg);
      expect(sut['_eventsCfg']).toBe(cfg);
    });
  });

  describe('fade', () => {
    it('should start a fade when sound is playing', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      sut.fade({ soundKey: 'click', fadeTo: 0, fadeDuration: 500 });
      expect((globalThis as unknown as { gsap: { to: ReturnType<typeof vi.fn> } }).gsap.to).toHaveBeenCalled();
    });

    it('should not fade when sound is not playing', () => {
      const sut = createSut();
      sut.fade({ soundKey: 'click', fadeTo: 0 });
      expect((globalThis as unknown as { gsap: { to: ReturnType<typeof vi.fn> } }).gsap.to).not.toHaveBeenCalled();
    });

    it('should kill previous fade before starting new one', () => {
      const mockTween = { kill: vi.fn(), ratio: 0.5 };
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      sut['_fadeTweens'].click = mockTween;
      sut.fade({ soundKey: 'click', fadeTo: 0 });
      expect(mockTween.kill).toHaveBeenCalled();
    });
  });

  describe('_reactToEvent', () => {
    it('should call the action method on self', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      const stopSpy = vi.spyOn(sut, 'stop');
      sut._reactToEvent('click', { action: 'stop', volume: 1 });
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should log error for unknown action', () => {
      const sut = createSut();
      sut._reactToEvent('click', { action: 'unknownAction', volume: 1 });
      expect(mockUrso.logger.error).toHaveBeenCalledWith(expect.stringContaining('unknownAction'));
    });
  });

  describe('playDummy', () => {
    it('should not create dummy on non-iOS device', () => {
      mockUrso.device.iOS = false;
      const sut = createSut();
      sut.playDummy();
      expect(sut['_timeout']).toBeNull();
    });

    it('should create dummy on iOS device after delay', () => {
      vi.useFakeTimers();
      mockUrso.device.iOS = true;
      const sut = createSut();
      sut.playDummy();
      expect(sut['_timeout']).not.toBeNull();
      vi.advanceTimersByTime(500);
      expect(sut['_dummy']).not.toBeNull();
      vi.useRealTimers();
    });

    it('should clear previous timeout on subsequent calls', () => {
      vi.useFakeTimers();
      mockUrso.device.iOS = true;
      const sut = createSut();
      sut.playDummy();
      const firstTimeout = sut['_timeout'];
      sut.playDummy();
      expect(sut['_timeout']).not.toBe(firstTimeout);
      vi.useRealTimers();
    });
  });

  describe('_getSoundStateById', () => {
    it('should find sound state by howl id', () => {
      const sut = createSut();
      sut.play({ soundKey: 'click' });
      const state = sut._getSoundStateById(1);
      expect(state).toBeDefined();
      expect(state!.id).toBe(1);
    });

    it('should return undefined for unknown id', () => {
      const sut = createSut();
      expect(sut._getSoundStateById(999)).toBeUndefined();
    });
  });

  describe('_initSoundsState', () => {
    it('should create state for each sprite key', () => {
      const sut = createSut({ a: [0, 100], b: [100, 200], c: [200, 300] });
      const state = sut._initSoundsState();
      expect(Object.keys(state)).toEqual(['a', 'b', 'c']);
    });
  });
});
