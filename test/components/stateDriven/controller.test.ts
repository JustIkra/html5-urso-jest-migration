import ComponentsStateDrivenController from '../../../src/ts/components/stateDriven/controller';

describe('ComponentsStateDrivenController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    // Add statesManager methods needed by stateDriven
    Object.assign(mockUrso.statesManager, {
      setStateGuard: vi.fn(),
      addActionRun: vi.fn(),
      addActionTerminate: vi.fn(),
      addActionGuard: vi.fn(),
      removeStateGuard: vi.fn(),
      removeActionRun: vi.fn(),
      removeActionTerminate: vi.fn(),
      removeActionGuard: vi.fn(),
    });
  });

  function createSut(): ComponentsStateDrivenController {
    const sut = new ComponentsStateDrivenController();
    sut.addListener = vi.fn() as ComponentsStateDrivenController['addListener'];
    sut.removeListener = vi.fn() as ComponentsStateDrivenController['removeListener'];
    sut.emit = vi.fn() as ComponentsStateDrivenController['emit'];
    return sut;
  }

  it('should initialize with empty configs and caches', () => {
    const sut = createSut();
    expect(sut.configStates).toEqual({});
    expect(sut.configActions).toEqual({});
    expect(sut._finishCallbacks).toEqual({});
    expect(sut._callbacksCache).toEqual({
      stateGuards: {},
      actionTerminates: {},
      actionGuards: {},
      actionRuns: {},
    });
  });

  describe('callFinish', () => {
    it('should call and delete stored finish callback', () => {
      const sut = createSut();
      const finishFn = vi.fn();
      sut._finishCallbacks['spin'] = finishFn;
      sut.callFinish('spin');
      expect(finishFn).toHaveBeenCalled();
      expect(sut._finishCallbacks['spin']).toBeUndefined();
    });

    it('should log error if no finish callback exists', () => {
      const sut = createSut();
      sut.callFinish('nonexistent');
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('no finish for actionKey'),
        'nonexistent',
        expect.anything(),
      );
    });
  });

  describe('_processStates', () => {
    it('should register state guards', () => {
      const sut = createSut();
      const guard = vi.fn(() => true);
      sut.configStates = { IDLE: { guard } };
      sut._processStates();
      expect(mockUrso.statesManager.setStateGuard).toHaveBeenCalledWith(
        'IDLE',
        expect.any(Function),
      );
      expect(sut._callbacksCache.stateGuards).toHaveProperty('IDLE');
    });
  });

  describe('_processActions', () => {
    it('should register action run', () => {
      const sut = createSut();
      const runFn = vi.fn();
      sut.configActions = { startSpin: { run: runFn } };
      sut._processActions();
      expect(mockUrso.statesManager.addActionRun).toHaveBeenCalledWith(
        'startSpin',
        expect.any(Function),
      );
    });

    it('should register action terminate when provided', () => {
      const sut = createSut();
      const runFn = vi.fn();
      const terminateFn = vi.fn();
      sut.configActions = { startSpin: { run: runFn, terminate: terminateFn } };
      sut._processActions();
      expect(mockUrso.statesManager.addActionTerminate).toHaveBeenCalledWith(
        'startSpin',
        expect.any(Function),
      );
    });

    it('should register action guard when provided', () => {
      const sut = createSut();
      const runFn = vi.fn();
      const guardFn = vi.fn(() => true);
      sut.configActions = { startSpin: { run: runFn, guard: guardFn } };
      sut._processActions();
      expect(mockUrso.statesManager.addActionGuard).toHaveBeenCalledWith(
        'startSpin',
        expect.any(Function),
      );
    });

    it('should log error when action has no run', () => {
      const sut = createSut();
      sut.configActions = { badAction: {} };
      sut._processActions();
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('no run function'),
        'badAction',
        expect.anything(),
      );
      expect(mockUrso.statesManager.addActionRun).not.toHaveBeenCalled();
    });

    it('should save finish callback when action run is called', () => {
      const sut = createSut();
      const runFn = vi.fn((finish: () => void) => finish());
      sut.configActions = { startSpin: { run: runFn } };
      sut._processActions();

      const registeredRun = (mockUrso.statesManager.addActionRun as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const finishCb = vi.fn();
      registeredRun(finishCb);

      expect(runFn).toHaveBeenCalled();
    });
  });

  describe('_saveFinish', () => {
    it('should store finish callback', () => {
      const sut = createSut();
      const finish = vi.fn();
      sut._saveFinish('spin', finish);
      expect(sut._finishCallbacks['spin']).toBe(finish);
    });

    it('should log error if key already exists', () => {
      const sut = createSut();
      sut._finishCallbacks['spin'] = vi.fn();
      sut._saveFinish('spin', vi.fn());
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('actionKey alredy exists'),
        'spin',
        expect.any(Function),
        expect.anything(),
      );
    });
  });

  describe('_subscribeOnce', () => {
    it('should process states and actions', () => {
      const sut = createSut();
      const statesSpy = vi.spyOn(sut, '_processStates');
      const actionsSpy = vi.spyOn(sut, '_processActions');
      sut._subscribeOnce();
      expect(statesSpy).toHaveBeenCalled();
      expect(actionsSpy).toHaveBeenCalled();
    });

    it('should add listener for MODULES_STATES_MANAGER_STOP', () => {
      const sut = createSut();
      sut._subscribeOnce();
      expect(sut.addListener).toHaveBeenCalledWith(
        mockUrso.events.MODULES_STATES_MANAGER_STOP,
        expect.any(Function),
        true,
      );
    });
  });

  describe('destroy', () => {
    it('should remove all cached callbacks', () => {
      const sut = createSut();
      const guardFn = vi.fn(() => true);
      const runFn = vi.fn();
      sut._callbacksCache.stateGuards = { IDLE: guardFn };
      sut._callbacksCache.actionRuns = { spin: runFn };
      sut._callbacksCache.actionGuards = {};
      sut._callbacksCache.actionTerminates = {};

      sut.destroy();

      expect(mockUrso.statesManager.removeStateGuard).toHaveBeenCalledWith('IDLE', guardFn);
      expect(mockUrso.statesManager.removeActionRun).toHaveBeenCalledWith('spin', runFn);
    });
  });

  describe('_onStatesManagerStop', () => {
    it('should clear all finish callbacks', () => {
      const sut = createSut();
      sut._finishCallbacks = { spin: vi.fn(), bonus: vi.fn() };
      sut._onStatesManagerStop();
      expect(sut._finishCallbacks).toEqual({});
    });
  });
});
