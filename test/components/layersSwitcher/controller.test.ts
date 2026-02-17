import ComponentsLayersSwitcherController from '../../../src/ts/components/layersSwitcher/controller';

describe('ComponentsLayersSwitcherController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockConfig: { allLayers: string[]; groupsLayers: Record<string, string[]> };
  const proto = ComponentsLayersSwitcherController.prototype;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockConfig = {
      allLayers: ['^layer1', '^layer2', '.layer3'],
      groupsLayers: {
        'groupA': ['^layer1', '.layer3'],
        'groupB': ['^layer2'],
      },
    };

    mockUrso.getInstance.mockReturnValue(mockConfig);

    // getInstance is called in constructor, so inject on prototype
    proto.getInstance = vi.fn((path: string) => {
      if (path === 'Config') return mockConfig;
      return undefined;
    }) as ComponentsLayersSwitcherController['getInstance'];
    proto.addListener = vi.fn() as ComponentsLayersSwitcherController['addListener'];
    proto.removeListener = vi.fn() as ComponentsLayersSwitcherController['removeListener'];
    proto.emit = vi.fn() as ComponentsLayersSwitcherController['emit'];
  });

  afterEach(() => {
    delete (proto as { getInstance?: unknown }).getInstance;
    delete (proto as { addListener?: unknown }).addListener;
    delete (proto as { removeListener?: unknown }).removeListener;
    delete (proto as { emit?: unknown }).emit;
  });

  function createSut(): ComponentsLayersSwitcherController {
    const sut = new ComponentsLayersSwitcherController();
    sut.addListener = vi.fn() as ComponentsLayersSwitcherController['addListener'];
    sut.removeListener = vi.fn() as ComponentsLayersSwitcherController['removeListener'];
    sut.emit = vi.fn() as ComponentsLayersSwitcherController['emit'];
    return sut;
  }

  it('should fetch config via getInstance on construction', () => {
    const sut = createSut();
    expect(sut['_config']).toBe(mockConfig);
  });

  describe('_showGroup', () => {
    it('should show layers in the group and hide others', () => {
      const sut = createSut();
      const obj1 = { visible: false };
      const obj2 = { visible: true };
      const obj3 = { visible: false };

      mockUrso.findAll.mockImplementation((selector: string) => {
        if (selector === '^layer1') return [obj1];
        if (selector === '^layer2') return [obj2];
        if (selector === '.layer3') return [obj3];
        return [];
      });

      sut._showGroup('groupA');

      expect(obj1.visible).toBe(true);
      expect(obj2.visible).toBe(false);
      expect(obj3.visible).toBe(true);
    });

    it('should handle groupB correctly', () => {
      const sut = createSut();
      const obj1 = { visible: true };
      const obj2 = { visible: false };
      const obj3 = { visible: true };

      mockUrso.findAll.mockImplementation((selector: string) => {
        if (selector === '^layer1') return [obj1];
        if (selector === '^layer2') return [obj2];
        if (selector === '.layer3') return [obj3];
        return [];
      });

      sut._showGroup('groupB');

      expect(obj1.visible).toBe(false);
      expect(obj2.visible).toBe(true);
      expect(obj3.visible).toBe(false);
    });

    it('should log error for unknown group', () => {
      const sut = createSut();
      sut._showGroup('unknownGroup');
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('unknownGroup'),
      );
    });

    it('should handle empty findAll results', () => {
      const sut = createSut();
      mockUrso.findAll.mockReturnValue([]);
      expect(() => sut._showGroup('groupA')).not.toThrow();
    });

    it('should handle multiple objects per selector', () => {
      const sut = createSut();
      const objs1 = [{ visible: false }, { visible: false }];
      const objs2 = [{ visible: true }];
      const objs3 = [{ visible: false }, { visible: false }, { visible: false }];

      mockUrso.findAll.mockImplementation((selector: string) => {
        if (selector === '^layer1') return objs1;
        if (selector === '^layer2') return objs2;
        if (selector === '.layer3') return objs3;
        return [];
      });

      sut._showGroup('groupA');

      objs1.forEach(obj => expect(obj.visible).toBe(true));
      objs2.forEach(obj => expect(obj.visible).toBe(false));
      objs3.forEach(obj => expect(obj.visible).toBe(true));
    });
  });

  describe('_subscribeOnce', () => {
    it('should add listener for COMPONENTS_LAYERS_SWITCHER_SWITCH', () => {
      const sut = createSut();
      sut._subscribeOnce();
      expect(sut.addListener).toHaveBeenCalledWith(
        mockUrso.events.COMPONENTS_LAYERS_SWITCHER_SWITCH,
        expect.any(Function),
      );
    });

    it('should call _showGroup when event fires', () => {
      const sut = createSut();
      const spy = vi.spyOn(sut, '_showGroup').mockImplementation(() => {});
      sut._subscribeOnce();

      const callback = (sut.addListener as ReturnType<typeof vi.fn>).mock.calls[0][1];
      callback('groupA');
      expect(spy).toHaveBeenCalledWith('groupA');
    });
  });
});
