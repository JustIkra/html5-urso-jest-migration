import ComponentsEditorController from '../../../src/ts/components/editor/controller';

describe('ComponentsEditorController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  const proto = ComponentsEditorController.prototype;
  let mockApi: Record<string, unknown>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockApi = { getCurrentStyles: vi.fn() };

    proto.getInstance = vi.fn((path: string) => {
      if (path === 'Api') return mockApi;
      return undefined;
    }) as ComponentsEditorController['getInstance'];
    proto.addListener = vi.fn() as ComponentsEditorController['addListener'];
    proto.removeListener = vi.fn() as ComponentsEditorController['removeListener'];
    proto.emit = vi.fn() as ComponentsEditorController['emit'];
  });

  afterEach(() => {
    delete (proto as { getInstance?: unknown }).getInstance;
    delete (proto as { addListener?: unknown }).addListener;
    delete (proto as { removeListener?: unknown }).removeListener;
    delete (proto as { emit?: unknown }).emit;
  });

  function createSut(): ComponentsEditorController {
    const sut = new ComponentsEditorController();
    sut.addListener = vi.fn() as ComponentsEditorController['addListener'];
    sut.removeListener = vi.fn() as ComponentsEditorController['removeListener'];
    sut.emit = vi.fn() as ComponentsEditorController['emit'];
    return sut;
  }

  it('should fetch Api via getInstance on construction', () => {
    const sut = createSut();
    expect(sut['_api']).toBe(mockApi);
  });

  it('should set _dev.editorApi on Urso via recursiveSet', () => {
    createSut();
    expect(mockUrso.helper.recursiveSet).toHaveBeenCalledWith(
      '_dev.editorApi',
      mockApi,
      expect.anything(),
    );
  });
});
