import type { UrsoInstance, SoundSpriteRange, AudioCodec } from '../../types';

declare const Urso: {
  events: Record<string, string>;
  logger: { error: (...args: unknown[]) => void };
  device: { iOS: boolean };
};

declare const UrsoUtils: {
  Howl: new (opts: Record<string, unknown>) => HowlInstance;
  Howler: { _audioUnlocked: boolean };
};

declare const gsap: {
  to: (target: object, duration: number, vars: Record<string, unknown>) => GsapTween;
};

interface HowlInstance {
  play: (spriteOrId?: string | number) => number;
  stop: (id?: number) => void;
  pause: (id?: number) => void;
  volume: (vol?: number, id?: number) => number;
  loop: (loop?: boolean, id?: number) => boolean;
  mute: (muted: boolean, key?: string) => void;
  playing: (id?: number) => boolean;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  unload: () => void;
  _volume: number;
}

interface GsapTween {
  kill: () => void;
  ratio: number;
}

interface SoundState {
  id: number | null;
  loop: boolean;
  volume: number;
  relaunch: boolean;
  _muted: boolean;
}

interface PlayParams {
  soundKey: string;
  loop?: boolean;
  volume?: number;
  relaunch?: boolean;
  resetVolume?: boolean;
}

interface VolumeParams {
  soundKey: string;
  volume?: number;
  saveVolumeState?: boolean;
}

interface FadeParams {
  fadeTo?: number;
  fadeDuration?: number;
  startSound?: boolean;
  soundKey: string;
  [key: string]: unknown;
}

interface EventConfig {
  events?: Record<string, EventReaction>;
}

interface EventReaction {
  action: string;
  volume: number;
  [key: string]: unknown;
}

const DUMMY_SOUND_DELAY = 500;

class ModulesSoundManagerSoundSprite {
  private _player: HowlInstance | null = null;
  private _totalVolume = 0;
  private _volume = 1;
  private _name: string;
  private _sprite: SoundSpriteRange;
  private _codec: AudioCodec | null;
  private _eventsCfg: Record<string, EventConfig> = {};
  private _fadeTweens: Record<string, GsapTween> = {};
  private _eventsQueue: EventReaction[] = [];
  private _isAudioUnlocked = false;
  private _timeout: ReturnType<typeof setTimeout> | null = null;
  private _dummy: HowlInstance | null = null;
  private _soundsState: Record<string, SoundState> = {};

  public getInstance!: UrsoInstance['getInstance'];
  public addListener!: UrsoInstance['addListener'];
  public removeListener!: UrsoInstance['removeListener'];
  public emit!: UrsoInstance['emit'];

  constructor({ name, sprite, audiosprite, codec }: { name: string; sprite: SoundSpriteRange; audiosprite: string; codec: AudioCodec | null }) {
    this._name = name;
    this._sprite = sprite;
    this._codec = codec;

    this._reactToEvent = this._reactToEvent.bind(this);
    this._audioUnlockHandler = this._audioUnlockHandler.bind(this);

    this._makePlayer(sprite, audiosprite);
    this._soundsState = this._initSoundsState();
  }

  _initSoundsState(): Record<string, SoundState> {
    const soundsNames = Object.keys(this._sprite);
    const soundsStateObj: Record<string, SoundState> = {};

    soundsNames.forEach(soundName => {
      soundsStateObj[soundName] = {
        id: null,
        loop: false,
        volume: 1,
        relaunch: false,
        _muted: false,
      };
    });

    return soundsStateObj;
  }

  _makePlayer(sprite: SoundSpriteRange, audiosprite: string): void {
    if (!this._codec) {
      return;
    }

    const reader = new FileReader();
    const blob = new Blob([audiosprite], { type: `audio/${this._codec}` });

    reader.onloadend = () => {
      const { result: src } = reader;
      this._player = new UrsoUtils.Howl({ src, sprite });
      this._subscribePlayerEvents();
    };

    reader.readAsDataURL(blob);
  }

  _audioUnlockHandler(): void {
    this._isAudioUnlocked = true;
    this._onUnlock();
    this.emit(Urso.events.MODULES_SOUND_MANAGER_CONTEXT_UNLOCKED);
  }

  _subscribePlayerEvents(): void {
    if (UrsoUtils.Howler._audioUnlocked) {
      this._audioUnlockHandler();
    } else {
      this._player!.on('unlock', () => setTimeout(() => {
        this._audioUnlockHandler();
      }, 1000));
    }

    this._player!.on('end', (id: unknown) => {
      const soundState = this._getSoundStateById(id as number);

      if (!soundState)
        return Urso.logger.error(`SoundSprite error: soundState for id '${id}' not found!`);

      if (!soundState.loop)
        soundState.id = null;
    });
  }

  _getSoundStateById(soundId: number): SoundState | undefined {
    return Object.values(this._soundsState).find(({ id }) => id === soundId);
  }

  canPlayCheck(): boolean {
    return this._isAudioUnlocked;
  }

  play({ soundKey, loop = false, volume = this._volume, relaunch = false, resetVolume = true }: PlayParams): boolean {
    if (!this.canPlayCheck() || (this._soundsState[soundKey].id !== null && !relaunch))
      return false;

    this.stop({ soundKey });

    this._soundsState[soundKey].id = this._player!.play(soundKey);

    this.setRelaunch(soundKey, relaunch);
    this.setLoop(soundKey, loop);

    if (!resetVolume)
      volume = this._soundsState[soundKey].volume;

    this.setVolume({ soundKey, volume });

    return true;
  }

  setLoop(soundKey: string, loop = false): void {
    this._soundsState[soundKey].loop = loop;
    this._player!.loop(loop, this._soundsState[soundKey].id!);
  }

  setVolume({ soundKey, volume = 1, saveVolumeState = true }: VolumeParams): void {
    this._player!.volume(volume, this._soundsState[soundKey].id!);

    if (volume === 0) {
      this._changeSoundMute(true, soundKey);
      return;
    } else if (this._soundsState[soundKey]._muted) {
      this._changeSoundMute(false, soundKey);
    }

    if (saveVolumeState) {
      this._soundsState[soundKey].volume = volume;
    }
  }

  setAllVolume(volume: number): void {
    this._totalVolume = volume;

    if (this._player) {
      this._player._volume = volume;
    }

    if (this.canPlayCheck()) {
      this._updateVolume();
    }
  }

  _updateVolume(): void {
    const soundKeys = Object.keys(this._soundsState);
    this._player!._volume = this._totalVolume;
    soundKeys.forEach(soundKey => {
      const soundVolume = this._soundsState[soundKey].volume * this._totalVolume;
      this.setVolume({ soundKey, volume: soundVolume, saveVolumeState: false });
    });
  }

  _changeSoundMute(needMute: boolean, soundKey: string): void {
    this._player!.mute(needMute, soundKey);
    this._soundsState[soundKey]._muted = needMute;
  }

  setRelaunch(soundKey: string, needRelaunch = false): void {
    this._soundsState[soundKey].relaunch = needRelaunch;
  }

  stop({ soundKey }: { soundKey: string }): void {
    if (!this._soundsState[soundKey].id)
      return;

    this._player!.stop(this._soundsState[soundKey].id!);
    this._soundsState[soundKey].id = null;
  }

  pause({ soundKey }: { soundKey: string }): void {
    if (this.canPlayCheck() || this._player!.playing(this._soundsState[soundKey].id!))
      this._player!.pause(this._soundsState[soundKey].id!);
  }

  resume({ soundKey }: { soundKey: string }): void {
    if (this.canPlayCheck() && !this._player!.playing(this._soundsState[soundKey].id!))
      this._player!.play(this._soundsState[soundKey].id!);
  }

  updateEvents(eventsCfg: Record<string, EventConfig>): void {
    this._customUnsubscribe();
    this._saveEvents(eventsCfg);
    this._customSubscribe();
  }

  _stopPrevFade(soundKey: string): void {
    if (this._fadeTweens[soundKey]) {
      this._fadeTweens[soundKey].kill();
    }

    delete this._fadeTweens[soundKey];
  }

  _startFade({ fadeTo, fadeDuration, soundKey }: { fadeTo: number; fadeDuration: number; soundKey: string }): void {
    const fadeFrom = this._soundsState[soundKey].volume;
    const delta = fadeTo - fadeFrom;

    const onUpdate = () => {
      const volume = (fadeFrom + (delta * this._fadeTweens[soundKey].ratio)) * this._totalVolume;
      this.setVolume({ soundKey, volume });
    };

    this._fadeTweens[soundKey] = gsap.to({}, fadeDuration / 1000, { onUpdate });
  }

  fade({ fadeTo = 1, fadeDuration = 200, startSound = false, soundKey, ...others }: FadeParams): void {
    if (startSound) {
      this.play({ ...others, soundKey } as PlayParams);
    }
    if (this._soundsState[soundKey].id === null) {
      return;
    }

    this._stopPrevFade(soundKey);
    this._startFade({ fadeTo, fadeDuration, soundKey });
  }

  _saveEvents(eventsCfg: Record<string, EventConfig>): void {
    this._eventsCfg = eventsCfg;
  }

  _setEventCallback(soundKey: string, event: string): () => void {
    return () => {
      const params = this._eventsCfg[soundKey].events![event];
      this._reactToEvent(soundKey, params);
    };
  }

  _onUnlock(): void {
    this._runEventsFromQueue();
    this._updateVolume();
  }

  _runEventsFromQueue(): void {
    this._eventsQueue.forEach(event => this._reactToEvent((event as EventReaction & { soundKey: string }).soundKey, event));
    this._eventsQueue = [];
  }

  _addEventToQueue(data: EventReaction): void {
    this._eventsQueue.push(data);
  }

  _reactToEvent(soundKey: string, { action, volume, ...otherParams }: EventReaction): void {
    volume *= this._totalVolume;
    const self = this as Record<string, unknown>;
    const params = { ...otherParams, action, soundKey, volume };

    if (!self[action])
      return Urso.logger.error(`SoundSprite error: Sound action '${action}' not found!`);

    if (!this._isAudioUnlocked)
      this._addEventToQueue({ ...params, action, volume });

    (self[action] as (p: Record<string, unknown>) => void)(params);
  }

  _customSubscribe(): void {
    for (const soundKey in this._eventsCfg) {
      const { events = {} } = this._eventsCfg[soundKey];

      for (const event in events) {
        this.addListener(event, this._setEventCallback(soundKey, event).bind(this), true);
      }
    }
  }

  _customUnsubscribe(): void {
    for (const event in this._eventsCfg) {
      this.removeListener(event, this._setEventCallback(event, '').bind(this), true);
    }
  }

  playDummy(): void {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }

    if (!Urso.device.iOS) {
      return;
    }

    this._timeout = setTimeout(() => {
      if (this._dummy) {
        this._dummy.stop();
        this._dummy.unload();
      }

      this._dummy = new UrsoUtils.Howl({
        src: 'data:audio/x-wav;base64,UklGRooWAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YWYWAAAAAAA=',
        html5: true,
      });

      this._dummy.play();
    }, DUMMY_SOUND_DELAY);
  }
}

export default ModulesSoundManagerSoundSprite;
