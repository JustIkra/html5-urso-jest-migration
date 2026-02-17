describe('ExtraPixiPatch', () => {
  let mockPIXI: {
    Text: { prototype: Record<string, unknown>; experimentalLetterSpacing: boolean };
    Container: { prototype: Record<string, unknown> };
    MeshMaterial: { prototype: Record<string, unknown> };
  };

  beforeEach(() => {
    mockPIXI = {
      Text: { prototype: {}, experimentalLetterSpacing: false },
      Container: { prototype: {} },
      MeshMaterial: { prototype: {} },
    };
    (globalThis as Record<string, unknown>).PIXI = mockPIXI;
    (globalThis as Record<string, unknown>).constants = { MASK_TYPES: { NONE: 0 } };
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).PIXI;
    delete (globalThis as Record<string, unknown>).constants;
    vi.resetModules();
  });

  it('should patch Text.prototype.drawLetterSpacing', async () => {
    await import('../../src/ts/extra/pixiPatch');
    expect(typeof mockPIXI.Text.prototype.drawLetterSpacing).toBe('function');
  });

  it('should patch Container.prototype.renderAdvanced', async () => {
    await import('../../src/ts/extra/pixiPatch');
    expect(typeof mockPIXI.Container.prototype.renderAdvanced).toBe('function');
  });

  it('should patch MeshMaterial.prototype texture property', async () => {
    await import('../../src/ts/extra/pixiPatch');
    const descriptor = Object.getOwnPropertyDescriptor(mockPIXI.MeshMaterial.prototype, 'texture');
    expect(descriptor).toBeDefined();
    expect(typeof descriptor!.get).toBe('function');
    expect(typeof descriptor!.set).toBe('function');
  });

  describe('drawLetterSpacing', () => {
    it('should call fillText for non-stroke text', async () => {
      await import('../../src/ts/extra/pixiPatch');
      const drawFn = mockPIXI.Text.prototype.drawLetterSpacing as (text: string, x: number, y: number, isStroke?: boolean) => void;
      const mockContext = {
        measureText: vi.fn(() => ({ width: 10 })),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        fillStyle: '',
      };
      const context = {
        _style: { letterSpacing: 0 },
        context: mockContext,
        text: 'hello',
        fillCustomColors: undefined,
      };
      drawFn.call(context, 'hello', 0, 0, false);
      expect(mockContext.fillText).toHaveBeenCalledWith('hello', 0, 0);
    });

    it('should call strokeText for stroke text', async () => {
      await import('../../src/ts/extra/pixiPatch');
      const drawFn = mockPIXI.Text.prototype.drawLetterSpacing as (text: string, x: number, y: number, isStroke?: boolean) => void;
      const mockContext = {
        measureText: vi.fn(() => ({ width: 10 })),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        fillStyle: '',
      };
      const context = {
        _style: { letterSpacing: 0 },
        context: mockContext,
        text: 'hello',
        fillCustomColors: undefined,
      };
      drawFn.call(context, 'hello', 0, 0, true);
      expect(mockContext.strokeText).toHaveBeenCalledWith('hello', 0, 0);
    });
  });

  describe('renderAdvanced', () => {
    it('should render children', async () => {
      await import('../../src/ts/extra/pixiPatch');
      const renderFn = mockPIXI.Container.prototype.renderAdvanced as (renderer: unknown) => void;
      const child = { render: vi.fn(), ignoreParentMask: false };
      const renderer = {
        batch: { flush: vi.fn() },
        filter: { push: vi.fn(), pop: vi.fn() },
        mask: { push: vi.fn(), pop: vi.fn() },
      };
      const context = {
        filters: null,
        _mask: null,
        _enabledFilters: [],
        cullable: false,
        children: [child],
        _renderWithCulling: vi.fn(),
        _render: vi.fn(),
      };
      renderFn.call(context, renderer);
      expect(context._render).toHaveBeenCalledWith(renderer);
      expect(child.render).toHaveBeenCalledWith(renderer);
    });
  });

  describe('MeshMaterial texture property', () => {
    it('should get and set texture via uniforms', async () => {
      await import('../../src/ts/extra/pixiPatch');
      const obj = Object.create(mockPIXI.MeshMaterial.prototype);
      obj.uniforms = { uSampler: 'oldTexture' };
      obj.uvMatrix = { texture: null };

      expect(obj.texture).toBe('oldTexture');

      obj.texture = 'newTexture';
      expect(obj.uniforms.uSampler).toBe('newTexture');
      expect(obj.uvMatrix.texture).toBe('newTexture');
    });

    it('should not update if same texture', async () => {
      await import('../../src/ts/extra/pixiPatch');
      const obj = Object.create(mockPIXI.MeshMaterial.prototype);
      obj.uniforms = { uSampler: 'sameTexture' };
      obj.uvMatrix = { texture: 'old' };

      obj.texture = 'sameTexture';
      expect(obj.uvMatrix.texture).toBe('old');
    });
  });
});
