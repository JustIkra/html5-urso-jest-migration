declare const PIXI: {
  Text: {
    prototype: Record<string, unknown>;
    experimentalLetterSpacing: boolean;
  };
  Container: {
    prototype: Record<string, unknown>;
  };
  MeshMaterial: {
    prototype: Record<string, unknown>;
  };
};

declare const constants: {
  MASK_TYPES: { NONE: number };
};

interface PatchedContext extends CanvasRenderingContext2D {
  textLetterSpacing?: string;
}

interface DrawLetterSpacingContext {
  _style: { letterSpacing: number };
  context: PatchedContext;
  fillCustomColors?: Array<{ position: number; color: string }>;
  text: string;
}

PIXI.Text.prototype.drawLetterSpacing = function (
  this: DrawLetterSpacingContext,
  text: string,
  x: number,
  y: number,
  isStroke?: boolean,
): void {
  if (isStroke === undefined) { isStroke = false; }
  const style = this._style;
  const letterSpacing = style.letterSpacing;

  const supportLetterSpacing = PIXI.Text.experimentalLetterSpacing
    && ('letterSpacing' in CanvasRenderingContext2D.prototype
      || 'textLetterSpacing' in CanvasRenderingContext2D.prototype);

  if ((letterSpacing === 0 || supportLetterSpacing) && (!this.fillCustomColors || this.fillCustomColors.length === 0)) {
    if (supportLetterSpacing) {
      this.context.letterSpacing = String(letterSpacing);
      this.context.textLetterSpacing = String(letterSpacing);
    }
    if (isStroke) {
      this.context.strokeText(text, x, y);
    } else {
      this.context.fillText(text, x, y);
    }
    return;
  }

  let currentPosition = x;

  const textIndexOffset = this.text.indexOf(text);
  const allTextLength = this.text.length;
  const customColors: (string | undefined)[] = new Array(allTextLength);

  if (this.fillCustomColors) {
    for (const colorsParams of this.fillCustomColors) {
      customColors.fill(colorsParams.color, colorsParams.position, allTextLength);
    }
  }

  const stringArray = Array.from ? Array.from(text) : text.split('');
  let previousWidth = this.context.measureText(text).width;
  let currentWidth = 0;

  for (let i = 0; i < stringArray.length; ++i) {
    const currentChar = stringArray[i];

    if (isStroke) {
      this.context.strokeText(currentChar, currentPosition, y);
    } else {
      if (customColors[textIndexOffset + i]) {
        this.context.fillStyle = customColors[textIndexOffset + i]!;
      }
      this.context.fillText(currentChar, currentPosition, y);
    }

    currentWidth = this.context.measureText(text.substring(i + 1)).width;
    currentPosition += previousWidth - currentWidth + letterSpacing;
    previousWidth = currentWidth;
  }
};

interface RenderAdvancedContext {
  filters: Array<{ enabled: boolean }> | null;
  _mask: { isMaskData?: boolean; enabled?: boolean; autoDetect?: boolean; type?: number } | null;
  _enabledFilters: Array<{ enabled: boolean }>;
  cullable: boolean;
  children: Array<{ ignoreParentMask?: boolean; render: (renderer: unknown) => void }>;
  _renderWithCulling: (renderer: unknown) => void;
  _render: (renderer: unknown) => void;
}

interface Renderer {
  batch: { flush: () => void };
  filter: { push: (context: unknown, filters: unknown[]) => void; pop: () => void };
  mask: { push: (context: unknown, mask: unknown) => void; pop: (context: unknown) => void };
}

PIXI.Container.prototype.renderAdvanced = function (
  this: RenderAdvancedContext,
  renderer: Renderer,
): void {
  const filters = this.filters;
  const mask = this._mask;
  const excludedFromMaskChildsIndexes: number[] = [];

  if (filters) {
    if (!this._enabledFilters) {
      this._enabledFilters = [];
    }

    this._enabledFilters.length = 0;

    for (let i = 0; i < filters.length; i++) {
      if (filters[i].enabled) {
        this._enabledFilters.push(filters[i]);
      }
    }
  }

  const flush = (filters && this._enabledFilters && this._enabledFilters.length)
    || (mask && (!mask.isMaskData || (mask.enabled && (mask.autoDetect || mask.type !== constants.MASK_TYPES.NONE))));

  if (flush) {
    renderer.batch.flush();
  }

  if (filters && this._enabledFilters && this._enabledFilters.length) {
    renderer.filter.push(this, this._enabledFilters);
  }

  if (mask) {
    renderer.mask.push(this, this._mask);
  }

  if (this.cullable) {
    this._renderWithCulling(renderer);
  } else {
    this._render(renderer);

    for (let i = 0, j = this.children.length; i < j; ++i) {
      if (!this.children[i].ignoreParentMask || !mask) {
        this.children[i].render(renderer);
      } else if (mask) {
        excludedFromMaskChildsIndexes.push(i);
      }
    }
  }

  if (flush) {
    renderer.batch.flush();
  }

  if (mask) {
    renderer.mask.pop(this);
  }

  if (excludedFromMaskChildsIndexes.length > 0) {
    excludedFromMaskChildsIndexes.forEach(index => this.children[index].render(renderer));
    renderer.batch.flush();
  }

  if (filters && this._enabledFilters && this._enabledFilters.length) {
    renderer.filter.pop();
  }
};

interface MeshMaterialContext {
  uniforms: { uSampler: unknown };
  uvMatrix: { texture: unknown };
}

Object.defineProperty(PIXI.MeshMaterial.prototype, 'texture', {
  get: function (this: MeshMaterialContext) {
    return this.uniforms.uSampler;
  },
  set: function (this: MeshMaterialContext, value: unknown) {
    if (this.uniforms.uSampler !== value) {
      this.uniforms.uSampler = value;
      this.uvMatrix.texture = value;
    }
  },
  enumerable: false,
  configurable: true,
});

export default {};
