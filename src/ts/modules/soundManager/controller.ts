import type { UrsoInstance, AudioCodec, SoundDoCommand, SoundsCfgData } from '../../types';

interface SoundSpriteInstance {
  updateEvents: (cfg: Record<string, Record<string, string>>) => void;
  setAllVolume: (volume: number) => void;
  playDummy: () => void;
  [action: string]: unknown;
}

class ModulesSoundManagerController {
  private _systemVolume = 1;
  private _globalVolume = 0;
  private _codecsToCheck: AudioCodec[] = ['ogg', 'm4a', 'mp3', 'wav'];
  private _selectedCodec: AudioCodec | null = null;
  private _sounds: Record<string, SoundSpriteInstance> = {};

  public getInstance!: UrsoInstance['getInstance'];
  public addListener!: UrsoInstance['addListener'];

  constructor() {
    this._setCodec();

    this._updateSoundsCfgHandler = this._updateSoundsCfgHandler.bind(this);
    this._doHandler = this._doHandler.bind(this);
  }

  _setCodec(): void {
    for (const codec of this._codecsToCheck) {
      if (UrsoUtils.Howler.codecs(codec)) {
        this._selectedCodec = codec;
        return;
      }
    }
  }

  _createSounds(soundData: SoundsCfgData): void {
    const { eventsCfg, sounds } = soundData;

    for (const soundKey in sounds) {
      if (this._sounds[soundKey])
        continue;

      const { audiosprite, json } = sounds[soundKey];

      const soundSprite = this.getInstance<SoundSpriteInstance>('SoundSprite', {
        sprite: json.sprite,
        name: soundKey,
        audiosprite,
        codec: this._selectedCodec,
      });

      this._sounds[soundKey] = soundSprite;

      soundSprite.updateEvents(eventsCfg);
    }
  }

  _setEventsHandler(): void {
    const soundsCfg = (Urso.localData.get('sounds.cfg') as Record<string, Record<string, string>> | null) || {};

    for (const key in this._sounds)
      if (soundsCfg[key])
        this._sounds[key].updateEvents(soundsCfg[key] as unknown as Record<string, Record<string, string>>);
  }

  _checkSoundExists(name: string): boolean | undefined {
    if (this._sounds[name])
      return true;

    Urso.logger.error(`Sound with key ${name} wasn't found!`);
  }

  _updateSoundsCfgHandler(soundsCfg: SoundsCfgData): void {
    this._createSounds(soundsCfg);
  }

  _doHandler({ action, name, behavior }: SoundDoCommand): void {
    if (this._checkSoundExists(name))
      (this._sounds[name][action] as (b: unknown) => void)(behavior);
  }

  _globalVolumeChange(volume: number): void {
    this._globalVolume = Urso.math.intMakeBetween(volume, 0, 1);
    this._updateSoundVolume();
  }

  _visibilityChange(state: string): void {
    this._systemVolume = ~~(state === 'visible') as number;
    this._updateSoundVolume();

    for (const key in this._sounds)
      this._sounds[key].playDummy();
  }

  _updateSoundVolume(): void {
    const totalVolume = this._globalVolume * this._systemVolume;
    for (const key in this._sounds)
      this._sounds[key].setAllVolume(totalVolume);
  }

  _subscribe(): void {
    this.addListener(Urso.events.MODULES_SOUND_MANAGER_UPDATE_CFG, this._updateSoundsCfgHandler as unknown as () => void, true);
    this.addListener(Urso.events.MODULES_LOGIC_SOUNDS_DO, this._doHandler as unknown as () => void, true);
    this.addListener(Urso.events.MODULES_SOUND_MANAGER_SET_GLOBAL_VOLUME, this._globalVolumeChange.bind(this) as unknown as () => void, true);
    this.addListener(Urso.events.EXTRA_BROWSEREVENTS_WINDOW_VISIBILITYCHANGE, this._visibilityChange.bind(this) as unknown as () => void, true);
  }
}

export default ModulesSoundManagerController;
