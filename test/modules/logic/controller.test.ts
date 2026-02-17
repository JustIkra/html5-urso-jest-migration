import ModulesLogicController from '../../../src/ts/modules/logic/controller';

describe('ModulesLogicController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockMain: { run: ReturnType<typeof vi.fn> };
  let mockSounds: Record<string, unknown>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockMain = { run: vi.fn(() => 'main-result') };
    mockSounds = {};

    ModulesLogicController.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Main') return mockMain;
      if (path === 'Sounds') return mockSounds;
      return {};
    }) as ModulesLogicController['getInstance'];
  });

  afterEach(() => {
    delete (ModulesLogicController.prototype as { getInstance?: unknown }).getInstance;
  });

  function createSut(): ModulesLogicController {
    return new ModulesLogicController();
  }

  describe('constructor', () => {
    it('should have base logic blocks', () => {
      const sut = createSut();
      expect(sut.logicBlocks).toContain('main');
      expect(sut.logicBlocks).toContain('sounds');
    });

    it('should create instances for each logic block', () => {
      const sut = createSut();
      expect(sut.getInstance).toHaveBeenCalledWith('Main');
      expect(sut.getInstance).toHaveBeenCalledWith('Sounds');
    });
  });

  describe('getAdditionalLogicBlocks', () => {
    it('should return empty array by default', () => {
      const sut = createSut();
      expect(sut.getAdditionalLogicBlocks()).toEqual([]);
    });
  });

  describe('do', () => {
    it('should call named function on all instances that have it', () => {
      const sut = createSut();
      const results = sut.do('run');
      expect(mockMain.run).toHaveBeenCalled();
      expect(results.main).toBe('main-result');
    });

    it('should skip instances without the function', () => {
      const sut = createSut();
      const results = sut.do('run');
      expect(results.sounds).toBeUndefined();
    });

    it('should pass additional arguments', () => {
      const sut = createSut();
      sut.do('run', 'arg1', 'arg2');
      expect(mockMain.run).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should return empty results when no instance has the method', () => {
      const sut = createSut();
      const results = sut.do('nonExistentMethod');
      expect(Object.keys(results).length).toBe(0);
    });
  });

  describe('_subscribe', () => {
    it('should be a no-op', () => {
      const sut = createSut();
      expect(() => sut._subscribe()).not.toThrow();
    });
  });

  describe('_createLogicInstances', () => {
    it('should use capitaliseFirstLetter for block names', () => {
      const sut = createSut();
      expect(mockUrso.helper.capitaliseFirstLetter).toHaveBeenCalledWith('main');
      expect(mockUrso.helper.capitaliseFirstLetter).toHaveBeenCalledWith('sounds');
    });
  });
});
