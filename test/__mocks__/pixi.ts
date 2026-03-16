import { vi } from 'vitest';

export class Container {
  children: Container[] = [];
  scale = { x: 1, y: 1 };
  position = { x: 0, y: 0 };
  visible = true;
  alpha = 1;
  width = 0;
  height = 0;
  parent: Container | null = null;
  transform = {};
  label = '';
  sortableChildren = false;

  addChild = vi.fn((child: Container) => {
    this.children.push(child);
    return child;
  });
  removeChild = vi.fn((child: Container) => {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return child;
  });
  destroy = vi.fn();
  toGlobal = vi.fn(() => ({ x: 0, y: 0 }));
  toLocal = vi.fn(() => ({ x: 0, y: 0 }));
  sortChildren = vi.fn();
  setFromMatrix = vi.fn();
  updateTransform = vi.fn();
  getBounds = vi.fn(() => ({ x: 0, y: 0, width: 0, height: 0 }));
  removeFromParent = vi.fn();
  on = vi.fn(function (this: Container) { return this; });
  off = vi.fn(function (this: Container) { return this; });
}

export class Sprite extends Container {
  texture: Texture = Texture.EMPTY;
  anchor = {
    x: 0,
    y: 0,
    set: vi.fn((x: number, y?: number) => {
      this.anchor.x = x;
      this.anchor.y = y ?? x;
    }),
  };

  static from = vi.fn(() => new Sprite());
}

export class Text extends Container {
  text = '';
  style: Record<string, unknown> = {};
  resolution = 1;

  constructor(textOrOptions?: string | { text?: string; style?: Record<string, unknown> }, style?: Record<string, unknown>) {
    super();
    if (typeof textOrOptions === 'string') {
      this.text = textOrOptions;
      this.style = style ?? {};
    } else if (textOrOptions) {
      this.text = textOrOptions.text ?? '';
      this.style = textOrOptions.style ?? {};
    }
  }
}

export class Graphics extends Container {
  beginFill = vi.fn(() => this);
  drawRect = vi.fn(() => this);
  drawCircle = vi.fn(() => this);
  drawRoundedRect = vi.fn(() => this);
  drawPolygon = vi.fn(() => this);
  endFill = vi.fn(() => this);
  clear = vi.fn(() => this);
  lineStyle = vi.fn(() => this);
  moveTo = vi.fn(() => this);
  lineTo = vi.fn(() => this);
  rect = vi.fn(() => this);
  fill = vi.fn(() => this);
  stroke = vi.fn(() => this);
  circle = vi.fn(() => this);
  roundRect = vi.fn(() => this);
  poly = vi.fn(() => this);
  on = vi.fn(() => this);
  off = vi.fn(() => this);
  interactive = false;
  eventMode = 'auto';
  cursor = 'auto';
  cacheAsBitmap = false;
  hitArea: unknown = null;
}

export class BitmapText extends Container {
  text = '';
  font: Record<string, unknown> = {};
}

// JS uses PIXI.NineSlicePlane (v7 name), TS uses NineSliceSprite (v8 name)
export class NineSlicePlane extends Container {
  texture: Texture = Texture.EMPTY;
  leftWidth = 0;
  rightWidth = 0;
  topHeight = 0;
  bottomHeight = 0;

  constructor(
    texture?: Texture | { texture?: Texture; leftWidth?: number; topHeight?: number; rightWidth?: number; bottomHeight?: number },
    leftWidth?: number,
    topHeight?: number,
    rightWidth?: number,
    bottomHeight?: number,
  ) {
    super();
    if (texture instanceof Texture) {
      this.texture = texture;
      if (leftWidth !== undefined) this.leftWidth = leftWidth;
      if (topHeight !== undefined) this.topHeight = topHeight;
      if (rightWidth !== undefined) this.rightWidth = rightWidth;
      if (bottomHeight !== undefined) this.bottomHeight = bottomHeight;
    } else if (texture) {
      if (texture.texture) this.texture = texture.texture;
      if (texture.leftWidth !== undefined) this.leftWidth = texture.leftWidth;
      if (texture.topHeight !== undefined) this.topHeight = texture.topHeight;
      if (texture.rightWidth !== undefined) this.rightWidth = texture.rightWidth;
      if (texture.bottomHeight !== undefined) this.bottomHeight = texture.bottomHeight;
    }
  }
}

export class NineSliceSprite extends Container {
  texture: Texture = Texture.EMPTY;
  leftWidth = 0;
  rightWidth = 0;
  topHeight = 0;
  bottomHeight = 0;

  constructor(options?: {
    texture?: Texture;
    leftWidth?: number;
    topHeight?: number;
    rightWidth?: number;
    bottomHeight?: number;
  }) {
    super();
    if (options) {
      if (options.texture) this.texture = options.texture;
      if (options.leftWidth !== undefined) this.leftWidth = options.leftWidth;
      if (options.topHeight !== undefined) this.topHeight = options.topHeight;
      if (options.rightWidth !== undefined) this.rightWidth = options.rightWidth;
      if (options.bottomHeight !== undefined) this.bottomHeight = options.bottomHeight;
    }
  }
}

export class Texture {
  width = 0;
  height = 0;
  baseTexture = {};
  source = {};

  static EMPTY = new Texture();
  static from = vi.fn(() => new Texture());
  static WHITE = new Texture();
}

export class Application {
  renderer = {
    generateTexture: vi.fn(() => new Texture()),
    resize: vi.fn(),
    width: 800,
    height: 600,
    view: {},
  };
  stage = new Container();
  ticker = {
    add: vi.fn(),
    remove: vi.fn(),
    maxFPS: 60,
    FPS: 60,
    deltaTime: 1,
  };
  screen = { width: 800, height: 600 };
  canvas = document.createElement('canvas');
  init = vi.fn(() => Promise.resolve());
  destroy = vi.fn();
}

export class Assets {
  static load = vi.fn(() => Promise.resolve({}));
  static add = vi.fn();
  static get = vi.fn();
}

export class EventEmitter {
  on = vi.fn();
  off = vi.fn();
  emit = vi.fn();
  once = vi.fn();
}

export class FederatedPointerEvent {}

export class Point {
  x = 0;
  y = 0;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export class Rectangle {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export class Circle {
  x = 0;
  y = 0;
  radius = 0;
  constructor(x = 0, y = 0, radius = 0) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}

export class Polygon {
  points: number[] = [];
  constructor(...args: number[]) {
    this.points = args;
  }
}

export class FillGradient {
  type = 'linear';
  colorStops: unknown[] = [];
  constructor(_options?: Record<string, unknown>) {}
}

export class RenderTexture extends Texture {}

export const ExtensionType = {
  LoadParser: 'load-parser',
  ResolveParser: 'resolve-parser',
  CacheParser: 'cache-parser',
  DetectionParser: 'detection-parser',
};

export const extensions = {
  add: vi.fn(),
  remove: vi.fn(),
};
