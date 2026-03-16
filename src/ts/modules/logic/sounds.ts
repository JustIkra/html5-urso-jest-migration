import type { UrsoInstance } from '../../types';

interface SoundConfigEntry {
  soundKey: string;
  event: string;
  action?: string;
  relaunch?: boolean;
  loop?: boolean;
  volume?: number;
  [key: string]: unknown;
}

interface SoundsConfig {
  soundsConfig: Record<string, SoundConfigEntry[]>;
}

interface ParsedEventConfig {
  events: Record<string, { action: string; relaunch: boolean; loop: boolean; volume: number; [key: string]: unknown }>;
}

interface AudiospriteEntry {
  json: unknown;
  audiosprite: unknown;
}

class ModulesLogicSounds {
  private _cfg: Record<string, SoundConfigEntry[]> | null = null;
  private _loadedSounds: Record<string, AudiospriteEntry> = {};

  public getInstance!: UrsoInstance['getInstance'];
  public emit!: UrsoInstance['emit'];
  public addListener!: UrsoInstance['addListener'];

  constructor() {
    this._setDefaultConfig();
    this._loadedSounds = {};
  }

  _setDefaultConfig(): void {
    const cfg = this.getInstance<SoundsConfig>('Config.Sounds');
    this._cfg = cfg.soundsConfig;
  }

  _parseConfig(): Record<string, ParsedEventConfig> {
    const mappedCfg: Record<string, ParsedEventConfig> = {};
    const configs = Object.keys(this._cfg!);

    configs.forEach(configName => {
      const cfg = this._cfg![configName];

      cfg.forEach(obj => {
        const {
          action = 'play',
          relaunch = false,
          loop = false,
          volume = 1,
          ...otherParams
        } = obj;

        if (!mappedCfg[obj.soundKey])
          mappedCfg[obj.soundKey] = { events: {} };

        mappedCfg[obj.soundKey].events[obj.event] = {
          ...otherParams,
          action,
          relaunch,
          loop,
          volume,
        };
      });
    });

    return mappedCfg;
  }

  _getUploadedSounds(audiospriteData: Record<string, AudiospriteEntry>): Record<string, AudiospriteEntry> {
    const newAudiospriteData: Record<string, AudiospriteEntry> = {};

    for (const key in audiospriteData) {
      if (!this._loadedSounds[key]) {
        this._loadedSounds[key] = audiospriteData[key];
        newAudiospriteData[key] = audiospriteData[key];
      }
    }

    return newAudiospriteData;
  }

  _getLoadedAudiospritesData(): Record<string, AudiospriteEntry> {
    const allAudiosprites = Urso.cache.assetsList.sound;
    const audiospriteData: Record<string, AudiospriteEntry> = {};

    for (const [key, audiosprite] of Object.entries(allAudiosprites)) {
      const audiospriteKey = key.replace('_audiospriteSound', '');
      const jsonKey = audiospriteKey + '_audiospriteJson';
      const json = Urso.cache.assetsList.json[jsonKey];

      if (!json)
        continue;

      audiospriteData[audiospriteKey] = { json, audiosprite };
    }

    return audiospriteData;
  }

  _groupLoadedHandler(): boolean {
    const audiospriteData = this._getLoadedAudiospritesData();

    if (Object.keys(audiospriteData).length === 0)
      return false;

    const uploadedAudiospriteData = this._getUploadedSounds(audiospriteData);

    if (Object.keys(uploadedAudiospriteData).length === 0)
      return false;

    const eventsCfg = this._parseConfig();
    const soundData = { sounds: { ...uploadedAudiospriteData }, eventsCfg };

    this.emit(Urso.events.MODULES_SOUND_MANAGER_UPDATE_CFG, soundData);
    return true;
  }

  _subscribe(): void {
    this.addListener(Urso.events.MODULES_ASSETS_GROUP_LOADED, this._groupLoadedHandler.bind(this) as () => void, true);
  }
}

export default ModulesLogicSounds;
