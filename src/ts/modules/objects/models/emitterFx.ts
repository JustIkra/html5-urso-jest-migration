import { Container } from 'pixi.js';
import * as particlesFx from '@urso/revolt-fx';
import type { ObjectModelParams, ObserverCallback } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface CacheFacade {
  getJson: (key: string) => FxSettingsData | null;
}

interface FxSettingsData {
  emitters: Array<{ name: string }>;
  spritesheetFilter?: string;
  /** Index signature required: FX settings data has variable emitter config properties */
  [key: string]: unknown;
}

interface FxBundle {
  initBundle: (data: FxSettingsData) => void;
  getParticleEmitter: (name: string) => FxEmitter;
  update: () => void;
}

interface FxEmitter {
  init: (container: unknown, resetPosition: boolean, scale: number) => void;
  start: () => void;
  stop: (immediate?: boolean) => void;
  on: {
    completed: {
      add: (callback: () => void) => void;
    };
  };
}

class ModulesObjectsModelsEmitterFx extends ModulesObjectsBaseModel {
  public autostart!: boolean;
  public cfg!: string | null;
  public spritesheetFilter!: string | null;

  private _bundle: FxBundle | null = null;
  private _emitter: FxEmitter | null = null;
  private _isActive: boolean = false;
  private _defaultEmitterName: string = '';

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.EMITTERFX;

    this._emitter = null;
    this.update = this.update.bind(this);

    this._addBaseObject();
    this._createBundle();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.autostart = Urso.helper.recursiveGet('autostart', params, false) as boolean;
    this.cfg = Urso.helper.recursiveGet('cfg', params, null) as string | null;
    this.spritesheetFilter = Urso.helper.recursiveGet('spritesheetFilter', params, null) as string | null;
  }

  public update(): void {
    if (this._emitter) {
      this._bundle!.update();
    }
  }

  public play(emitterName?: string): void {
    this._isActive = true;

    emitterName = emitterName || this._defaultEmitterName;

    this._emitter = this._bundle!.getParticleEmitter(emitterName);
    this._emitter.init(this._baseObject, true, 1);
    this._emitter.start();
  }

  public stop(): void {
    if (!this._emitter) return;

    this._emitter.stop();
    this._emitter.on.completed.add(() => {
      if (!this._isActive) {
        this._emitter = null;
      }
    });

    this._isActive = false;
  }

  private _addBaseObject(): void {
    this._baseObject = new Container();
  }

  private _createBundle(): void {
    this._bundle = new particlesFx.FX() as unknown as FxBundle;
    const fxSettingsData = (Urso.cache as CacheFacade).getJson(this.cfg!) as FxSettingsData;

    if (this.spritesheetFilter) {
      fxSettingsData.spritesheetFilter = this.spritesheetFilter;
    }

    this._defaultEmitterName = fxSettingsData.emitters[0].name;

    this._bundle.initBundle(fxSettingsData);

    if (this.autostart) {
      this.play();
    }
  }

  public _subscribeOnce(): void {
    this.addListener(
      Urso.events.MODULES_SCENES_UPDATE,
      this.update as ObserverCallback,
      true,
    );
  }

  protected _customDestroy(): void {
    this.removeListener(
      Urso.events.MODULES_SCENES_UPDATE,
      this.update as ObserverCallback,
    );
    if (this._emitter) {
      this._emitter.stop(false);
    }
    this._bundle = null;
    this._emitter = null;
  }
}

export default ModulesObjectsModelsEmitterFx;
