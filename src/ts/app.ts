import type { GsapGlobal, GsapTween } from './types';

declare const gsap: GsapGlobal;

class App {
  public version = 'APP_VERSION';

  constructor() {
    this.setup = this.setup.bind(this);
  }

  async setup(): Promise<void> {
    this.sayHello();

    Urso.helper = new (Urso.Core.Lib as Record<string, new () => unknown>).Helper() as typeof Urso.helper;

    const Instances = (Urso.Core.Modules as Record<string, Record<string, new () => Record<string, unknown>>>).Instances;
    const instances = new Instances.Controller();
    Urso.getInstance = instances.getInstance as typeof Urso.getInstance;
    Urso.getByPath = instances.getByPath as typeof Urso.getByPath;
    Urso.getInstancesModes = instances.getModes as typeof Urso.getInstancesModes;
    Urso.addInstancesMode = instances.addMode as typeof Urso.addInstancesMode;
    Urso.removeInstancesMode = instances.removeMode as typeof Urso.removeInstancesMode;

    Urso.Game = {};
    for (const extention of Urso.config.extendingChain)
      Urso.helper.mergeObjectsRecursive(Urso.Game, Urso.helper.recursiveGet(extention, window, {}) as Record<string, unknown>, true);

    Urso.observer = Urso.getInstance('Modules.Observer.Controller');

    Urso.browserEvents = Urso.getInstance('Extra.BrowserEvents');
    this._addTimeouts();

    Urso.cache = Urso.getInstance('Lib.Cache');
    Urso.device = Urso.getByPath('Lib.Device');
    Urso.loader = Urso.getInstance('Lib.Loader');
    Urso.localData = Urso.getInstance('Lib.LocalData');
    Urso.logger = Urso.getInstance('Lib.Logger');
    Urso.math = Urso.getInstance('Lib.Math');
    Urso.time = Urso.getInstance('Lib.Time');
    Urso.tween = Urso.getInstance('Lib.Tween');

    Urso.assets = Urso.getInstance('Modules.Assets.Controller');
    Urso.i18n = Urso.getInstance('Modules.I18n.Controller');
    Urso.transport = Urso.getInstance('Modules.Transport.Controller');
    Urso.logic = Urso.getInstance('Modules.Logic.Controller');
    Urso.objects = Urso.getInstance('Modules.Objects.Controller');
    Urso.scenes = Urso.getInstance('Modules.Scenes.Controller');
    await Urso.scenes.init();
    Urso.soundManager = Urso.getInstance('Modules.SoundManager.Controller');
    Urso.statesManager = Urso.getInstance('Modules.StatesManager.Controller');
    Urso.template = Urso.getInstance('Modules.Template.Controller');

    document.title = Urso.config.title;

    Urso.addInstancesMode(!Urso.helper.mobileAndTabletCheck() ? 'desktop' : 'mobile');

    Urso.device.whenReady(() => {
      Urso.assets.updateQuality();
      Urso.assets.checkWebPSupport();
      Urso.getInstance<{ run: () => void }>('App').run();
    });
  }

  sayHello(): void {
    console.log(`%c ${String.fromCodePoint(0x1F43B)} Urso ${this.version} `, 'background: #222; color: #bada55');
  }

  run(): void {
    Urso.logic.do('run');
    Urso.scenes.display(Urso.config.defaultScene);
  }

  _addTimeouts(): void {
    Urso.setTimeout = (callback: () => void, delay: number) => {
      return gsap.delayedCall(delay / 1000, callback);
    };

    Urso.clearTimeout = (tween: GsapTween) => {
      tween.kill();
    };
  }
}

export default App;
