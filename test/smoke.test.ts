import { Container, Sprite, Text, Graphics, Texture, Application, Assets } from 'pixi.js';
import gsap from 'gsap';
import { Howl, Howler } from 'howler';
import {
  AssetTypeId,
  ObjectTypeId,
  AlignX,
  AlignY,
  UrsoEvent,
  ScreenOrientation,
  StretchingType,
  SelectorPropertyType,
  TransportConnectionType,
  SoundAction,
} from '../src/ts/types';
import type {
  Point,
  Size,
  ObserverCallback,
  ObjectModelParams,
  AssetModelParams,
  UrsoInstance,
  ComponentCommon,
} from '../src/ts/types';

// ============================================================================
// jsdom environment
// ============================================================================

describe('jsdom environment', () => {
  it('should provide document object', () => {
    expect(typeof document).toBe('object');
  });

  it('should provide window object', () => {
    expect(typeof window).toBe('object');
  });
});

// ============================================================================
// Vitest globals
// ============================================================================

describe('vitest globals', () => {
  it('should have describe/it/expect available without imports', () => {
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });

  it('should have vi available', () => {
    expect(vi).toBeDefined();
    expect(typeof vi.fn).toBe('function');
  });
});

// ============================================================================
// createMockUrso()
// ============================================================================

describe('createMockUrso', () => {
  it('should be globally available', () => {
    expect(typeof createMockUrso).toBe('function');
  });

  it('should return an object with all required properties', () => {
    const mock = createMockUrso();

    expect(mock.helper).toBeDefined();
    expect(mock.math).toBeDefined();
    expect(mock.time).toBeDefined();
    expect(mock.logger).toBeDefined();
    expect(mock.observer).toBeDefined();
    expect(mock.cache).toBeDefined();
    expect(mock.config).toBeDefined();
    expect(mock.objects).toBeDefined();
    expect(mock.scenes).toBeDefined();
    expect(mock.statesManager).toBeDefined();
    expect(mock.localData).toBeDefined();
    expect(mock.device).toBeDefined();
    expect(mock.events).toBeDefined();
    expect(mock.types).toBeDefined();
    expect(mock.getInstance).toBeDefined();
    expect(mock.getByPath).toBeDefined();
  });

  it('should have at least 16 properties', () => {
    const mock = createMockUrso();
    expect(Object.keys(mock).length).toBeGreaterThanOrEqual(16);
  });

  it('should provide callable observer methods', () => {
    const mock = createMockUrso();
    mock.observer.add('test.event', vi.fn());
    expect(mock.observer.add).toHaveBeenCalledWith('test.event', expect.any(Function));
    mock.observer.fire('test.event', { data: 1 });
    expect(mock.observer.fire).toHaveBeenCalledWith('test.event', { data: 1 });
    mock.observer.remove('test.event', vi.fn());
    expect(mock.observer.remove).toHaveBeenCalled();
  });

  it('should provide callable logger methods', () => {
    const mock = createMockUrso();
    mock.logger.log('test');
    mock.logger.warn('test');
    mock.logger.error('test');
    mock.logger.info('test');
    expect(mock.logger.log).toHaveBeenCalledWith('test');
    expect(mock.logger.warn).toHaveBeenCalledWith('test');
    expect(mock.logger.error).toHaveBeenCalledWith('test');
    expect(mock.logger.info).toHaveBeenCalledWith('test');
  });

  it('should have events matching UrsoEvent enum', () => {
    const mock = createMockUrso();
    expect(mock.events).toBe(UrsoEvent);
    expect(mock.events.MODULES_SCENES_UPDATE).toBe('modules.scenes.update');
  });

  it('should have types with asset and object type IDs', () => {
    const mock = createMockUrso();
    expect(mock.types.assets).toBe(AssetTypeId);
    expect(mock.types.objects).toBe(ObjectTypeId);
    expect(mock.types.assets.IMAGE).toBe(6);
    expect(mock.types.objects.TEXT).toBe(22);
  });
});

// ============================================================================
// window.Urso and window.log
// ============================================================================

describe('window.Urso', () => {
  it('should be set by setup.ts', () => {
    expect(typeof window.Urso).not.toBe('undefined');
  });

  it('should have observer', () => {
    expect(window.Urso.observer).toBeDefined();
  });
});

describe('window.log', () => {
  it('should be a function', () => {
    expect(typeof window.log).toBe('function');
  });
});

// ============================================================================
// PIXI mock
// ============================================================================

describe('pixi mock', () => {
  it('should provide Container with vi.fn() methods', () => {
    const container = new Container();
    expect(container.addChild).toBeDefined();
    expect(container.removeChild).toBeDefined();
    expect(container.destroy).toBeDefined();
    expect(container.children).toEqual([]);
    expect(container.scale).toEqual({ x: 1, y: 1 });
  });

  it('should provide Sprite extending Container', () => {
    const sprite = new Sprite();
    expect(sprite.texture).toBeDefined();
    expect(sprite.anchor).toBeDefined();
    expect(sprite.addChild).toBeDefined();
  });

  it('should provide Text with text and style', () => {
    const text = new Text({ text: 'hello', style: { fontSize: 12 } });
    expect(text.text).toBe('hello');
    expect(text.style.fontSize).toBe(12);
  });

  it('should provide Graphics with drawing methods', () => {
    const g = new Graphics();
    expect(g.beginFill).toBeDefined();
    expect(g.drawRect).toBeDefined();
    expect(g.clear).toBeDefined();
  });

  it('should provide Texture with statics', () => {
    expect(Texture.EMPTY).toBeDefined();
    expect(Texture.from).toBeDefined();
  });

  it('should provide Application', () => {
    const app = new Application();
    expect(app.renderer).toBeDefined();
    expect(app.stage).toBeDefined();
    expect(app.ticker).toBeDefined();
  });

  it('should provide Assets with load', () => {
    expect(Assets.load).toBeDefined();
  });
});

// ============================================================================
// GSAP mock
// ============================================================================

describe('gsap mock', () => {
  it('should provide gsap.to as vi.fn()', () => {
    expect(gsap.to).toBeDefined();
    const tween = gsap.to({}, { duration: 1 });
    expect(tween).toBeDefined();
    expect(tween.kill).toBeDefined();
    expect(tween.pause).toBeDefined();
  });

  it('should provide gsap.from and gsap.fromTo', () => {
    expect(gsap.from).toBeDefined();
    expect(gsap.fromTo).toBeDefined();
  });

  it('should provide gsap.killTweensOf', () => {
    expect(gsap.killTweensOf).toBeDefined();
  });

  it('should provide gsap.timeline', () => {
    const tl = gsap.timeline();
    expect(tl).toBeDefined();
    expect(tl.to).toBeDefined();
  });
});

// ============================================================================
// Howler mock
// ============================================================================

describe('howler mock', () => {
  it('should provide Howl class with play/stop/pause/volume', () => {
    const howl = new Howl({ src: ['test.mp3'] });
    expect(howl.play).toBeDefined();
    expect(howl.stop).toBeDefined();
    expect(howl.pause).toBeDefined();
    expect(howl.volume).toBeDefined();
    expect(howl.on).toBeDefined();
    expect(howl.unload).toBeDefined();
  });

  it('should provide Howler with codecs', () => {
    expect(Howler.codecs).toBeDefined();
    expect(Howler.codecs('mp3')).toBe(true);
    expect(Howler._audioUnlocked).toBe(true);
  });
});

// ============================================================================
// types.ts imports
// ============================================================================

describe('types.ts enums', () => {
  it('should export AssetTypeId with correct values', () => {
    expect(AssetTypeId.ATLAS).toBe(1);
    expect(AssetTypeId.IMAGE).toBe(6);
    expect(AssetTypeId.SOUND).toBe(9);
    expect(AssetTypeId.SPINE).toBe(10);
    expect(AssetTypeId.HTML).toBe(100);
  });

  it('should export ObjectTypeId with correct values', () => {
    expect(ObjectTypeId.BITMAPTEXT).toBe(2);
    expect(ObjectTypeId.CONTAINER).toBe(8);
    expect(ObjectTypeId.IMAGE).toBe(15);
    expect(ObjectTypeId.TEXT).toBe(22);
    expect(ObjectTypeId.WORLD).toBe(25);
  });

  it('should export AlignX and AlignY', () => {
    expect(AlignX.Left).toBe('left');
    expect(AlignX.Center).toBe('center');
    expect(AlignY.Top).toBe('top');
    expect(AlignY.Bottom).toBe('bottom');
  });

  it('should export ScreenOrientation', () => {
    expect(ScreenOrientation.Landscape).toBe('landscape');
    expect(ScreenOrientation.Portrait).toBe('portrait');
  });

  it('should export StretchingType', () => {
    expect(StretchingType.Inscribed).toBe('inscribed');
    expect(StretchingType.Circumscribed).toBe('circumscribed');
  });

  it('should export SelectorPropertyType', () => {
    expect(SelectorPropertyType.Id).toBe('id');
    expect(SelectorPropertyType.Name).toBe('name');
    expect(SelectorPropertyType.Class).toBe('class');
  });

  it('should export TransportConnectionType', () => {
    expect(TransportConnectionType.Websocket).toBe('websocket');
    expect(TransportConnectionType.Xhr).toBe('xhr');
  });

  it('should export SoundAction', () => {
    expect(SoundAction.Play).toBe('play');
    expect(SoundAction.Stop).toBe('stop');
    expect(SoundAction.Mute).toBe('mute');
  });

  it('should export UrsoEvent with correct string values', () => {
    expect(UrsoEvent.MODULES_SCENES_UPDATE).toBe('modules.scenes.update');
    expect(UrsoEvent.MODULES_ASSETS_GROUP_LOADED).toBe('modules.assets.group.loaded');
    expect(UrsoEvent.MODULES_OBJECTS_BUTTON_PRESS).toBe('modules.objects.button.press');
  });
});

describe('types.ts interfaces (compile-time checks)', () => {
  it('should allow creating Point and Size', () => {
    const p: Point = { x: 10, y: 20 };
    const s: Size = { width: 100, height: 200 };
    expect(p.x).toBe(10);
    expect(s.width).toBe(100);
  });

  it('should allow creating ObserverCallback', () => {
    const cb: ObserverCallback = vi.fn();
    cb._ouid = 'test-uid';
    expect(cb._ouid).toBe('test-uid');
  });

  it('should allow creating partial ObjectModelParams', () => {
    const params: Partial<ObjectModelParams> = {
      type: ObjectTypeId.TEXT,
      name: 'myText',
      x: 100,
      y: 200,
      visible: true,
    };
    expect(params.type).toBe(ObjectTypeId.TEXT);
    expect(params.name).toBe('myText');
  });

  it('should allow null for ObjectModelParams fields', () => {
    const params: Partial<ObjectModelParams> = {
      type: null,
      id: null,
      name: null,
      width: null,
      height: null,
    };
    expect(params.type).toBe(null);
    expect(params.id).toBe(null);
  });

  it('should allow creating partial AssetModelParams', () => {
    const params: Partial<AssetModelParams> = {
      type: AssetTypeId.IMAGE,
      key: 'myImage',
      path: '/images/myImage.png',
    };
    expect(params.type).toBe(AssetTypeId.IMAGE);
  });

  it('should typecheck UrsoInstance interface', () => {
    const mockInstance: UrsoInstance = {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      emit: vi.fn(),
      common: {
        find: null,
        findAll: null,
        findOne: null,
        object: null,
      } satisfies ComponentCommon,
      getInstance: vi.fn(),
      getByPath: vi.fn(),
    };
    expect(mockInstance.addListener).toBeDefined();
    expect(mockInstance.common.object).toBe(null);
  });
});
