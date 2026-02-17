import ComponentsDebugTemplate from '../../../src/ts/components/debug/template';

describe('ComponentsDebugTemplate', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should have objects array', () => {
    const sut = new ComponentsDebugTemplate();
    expect(sut.objects).toBeDefined();
    expect(Array.isArray(sut.objects)).toBe(true);
  });

  it('should have a container as root object', () => {
    const sut = new ComponentsDebugTemplate();
    expect(sut.objects[0].name).toBe('debugContainer');
  });

  it('should have debugCoords text in container', () => {
    const sut = new ComponentsDebugTemplate();
    const contents = sut.objects[0].contents!;
    const coords = contents.find(c => c.name === 'debugCoords');
    expect(coords).toBeDefined();
    expect(coords!.text).toBe('x:0, y:0');
  });

  it('should have debugFps text in container', () => {
    const sut = new ComponentsDebugTemplate();
    const contents = sut.objects[0].contents!;
    const fps = contents.find(c => c.name === 'debugFps');
    expect(fps).toBeDefined();
    expect(fps!.text).toBe('fps: 0');
  });

  it('should have debugTimescaleValue text in container', () => {
    const sut = new ComponentsDebugTemplate();
    const contents = sut.objects[0].contents!;
    const timescale = contents.find(c => c.name === 'debugTimescaleValue');
    expect(timescale).toBeDefined();
    expect(timescale!.visible).toBe(false);
  });

  it('should have 3 children in the container', () => {
    const sut = new ComponentsDebugTemplate();
    expect(sut.objects[0].contents!.length).toBe(3);
  });
});
