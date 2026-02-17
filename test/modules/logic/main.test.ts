import ModulesLogicMain from '../../../src/ts/modules/logic/main';

describe('ModulesLogicMain', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should have a run method', () => {
    const sut = new ModulesLogicMain();
    expect(typeof sut.run).toBe('function');
  });

  it('should log info when run is called', () => {
    const sut = new ModulesLogicMain();
    sut.run();
    expect(mockUrso.logger.info).toHaveBeenCalledWith('Modules.Logic.Main run');
  });
});
