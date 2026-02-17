import ModulesStatesManagerHelper from '../../../src/ts/modules/statesManager/helper';

describe('ModulesStatesManagerHelper', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    ModulesStatesManagerHelper.prototype.getInstance = vi.fn((path: string) => {
      if (path.startsWith('Actions.')) return null;
      return { name: path };
    }) as ModulesStatesManagerHelper['getInstance'];
  });

  afterEach(() => {
    delete (ModulesStatesManagerHelper.prototype as { getInstance?: unknown }).getInstance;
  });

  it('should be a singleton', () => {
    const sut = new ModulesStatesManagerHelper();
    expect(sut.singleton).toBe(true);
  });

  describe('getActionByConfig', () => {
    it('should create an Action for { action: "myAction" } when no custom action exists', () => {
      const sut = new ModulesStatesManagerHelper();
      sut.getActionByConfig({ action: 'myAction' });

      expect(mockUrso.helper.capitaliseFirstLetter).toHaveBeenCalledWith('myAction');
      // First call is for 'Actions.MyAction' (returns null), second is for 'Action'
      expect(sut.getInstance).toHaveBeenCalledWith('Actions.MyAction');
      expect(sut.getInstance).toHaveBeenCalledWith('Action', 'myAction');
    });

    it('should return custom action instance if it exists', () => {
      const customAction = { name: 'customAction', guard: vi.fn() };
      (ModulesStatesManagerHelper.prototype.getInstance as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        if (path === 'Actions.MyAction') return customAction;
        return null;
      });

      const sut = new ModulesStatesManagerHelper();
      const result = sut.getActionByConfig({ action: 'myAction' });
      expect(result).toBe(customAction);
    });

    it('should handle { all: [...] } config', () => {
      const sut = new ModulesStatesManagerHelper();
      sut.getActionByConfig({ all: [{ action: 'a' }] });

      expect(mockUrso.helper.capitaliseFirstLetter).toHaveBeenCalledWith('all');
      expect(sut.getInstance).toHaveBeenCalledWith('All', [{ action: 'a' }]);
    });

    it('should handle { race: [...] } config', () => {
      const sut = new ModulesStatesManagerHelper();
      sut.getActionByConfig({ race: [{ action: 'a' }] });

      expect(mockUrso.helper.capitaliseFirstLetter).toHaveBeenCalledWith('race');
      expect(sut.getInstance).toHaveBeenCalledWith('Race', [{ action: 'a' }]);
    });

    it('should handle { sequence: [...] } config', () => {
      const sut = new ModulesStatesManagerHelper();
      sut.getActionByConfig({ sequence: [{ action: 'a' }] });

      expect(mockUrso.helper.capitaliseFirstLetter).toHaveBeenCalledWith('sequence');
      expect(sut.getInstance).toHaveBeenCalledWith('Sequence', [{ action: 'a' }]);
    });
  });
});
