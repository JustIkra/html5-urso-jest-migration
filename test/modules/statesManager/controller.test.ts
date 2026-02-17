import ModulesStatesManagerController from '../../../src/ts/modules/statesManager/controller';
import ModulesStatesManagerFunctionsStorage from '../../../src/ts/modules/statesManager/functionsStorage';

type GuidFunction = ((...args: unknown[]) => unknown) & { _guid?: string };

describe('ModulesStatesManagerController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockConfigStates: Record<string, Record<string, unknown>>;
  let mockHelper: { getActionByConfig: ReturnType<typeof vi.fn> };
  let mockAction: { guard: ReturnType<typeof vi.fn>; run: ReturnType<typeof vi.fn>; forceDestroy: ReturnType<typeof vi.fn>; name: string };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockConfigStates = {
      STATE_A: { action: 'actionA' },
      STATE_B: { action: 'actionB' },
    };

    mockAction = {
      name: 'mockAction',
      guard: vi.fn(() => true),
      run: vi.fn(),
      forceDestroy: vi.fn(),
    };

    mockHelper = {
      getActionByConfig: vi.fn(() => mockAction),
    };

    let storageCallCount = 0;
    ModulesStatesManagerController.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'FunctionsStorage') {
        storageCallCount++;
        return new ModulesStatesManagerFunctionsStorage();
      }
      if (path === 'ConfigStates') return { get: () => mockConfigStates };
      if (path === 'Helper') return mockHelper;
      return {};
    }) as ModulesStatesManagerController['getInstance'];

    ModulesStatesManagerController.prototype.emit = vi.fn() as ModulesStatesManagerController['emit'];
  });

  afterEach(() => {
    delete (ModulesStatesManagerController.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesStatesManagerController.prototype as { emit?: unknown }).emit;
  });

  it('should be a singleton', () => {
    const sut = new ModulesStatesManagerController();
    expect(sut.singleton).toBe(true);
  });

  it('should create 4 FunctionsStorage instances in constructor', () => {
    const sut = new ModulesStatesManagerController();
    expect(sut.statesGuards).toBeInstanceOf(ModulesStatesManagerFunctionsStorage);
    expect(sut.actionsGuards).toBeInstanceOf(ModulesStatesManagerFunctionsStorage);
    expect(sut.actionsRuns).toBeInstanceOf(ModulesStatesManagerFunctionsStorage);
    expect(sut.actionsTerminations).toBeInstanceOf(ModulesStatesManagerFunctionsStorage);
  });

  describe('start', () => {
    it('should run the first state action', () => {
      const sut = new ModulesStatesManagerController();
      // Make action.run capture the callback but don't call it (to prevent infinite loop)
      mockAction.run.mockImplementation(() => {});
      sut.start();
      expect(mockHelper.getActionByConfig).toHaveBeenCalled();
      expect(mockAction.guard).toHaveBeenCalled();
      expect(mockAction.run).toHaveBeenCalled();
    });

    it('should emit STATE_CHANGE event', () => {
      const sut = new ModulesStatesManagerController();
      mockAction.run.mockImplementation(() => {});
      sut.start();
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_STATES_MANAGER_STATE_CHANGE,
        'STATE_A',
      );
    });

    it('should not start twice', () => {
      const sut = new ModulesStatesManagerController();
      mockAction.run.mockImplementation(() => {});
      sut.start();
      const callCount = mockAction.run.mock.calls.length;
      sut.start();
      expect(mockAction.run.mock.calls.length).toBe(callCount);
    });

    it('should skip to next state if guard fails', () => {
      mockAction.guard.mockReturnValueOnce(false).mockReturnValue(true);
      const sut = new ModulesStatesManagerController();
      mockAction.run.mockImplementation(() => {});
      sut.start();
      // Should have moved past STATE_A and reached STATE_B
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_STATES_MANAGER_STATE_CHANGE,
        'STATE_B',
      );
    });
  });

  describe('stop', () => {
    it('should forceDestroy current action and emit STOP event', () => {
      const sut = new ModulesStatesManagerController();
      mockAction.run.mockImplementation(() => {});
      sut.start();
      sut.stop();
      expect(mockAction.forceDestroy).toHaveBeenCalled();
      expect(sut.emit).toHaveBeenCalledWith(mockUrso.events.MODULES_STATES_MANAGER_STOP);
    });

    it('should handle stop when no current action', () => {
      const sut = new ModulesStatesManagerController();
      expect(() => sut.stop()).not.toThrow();
    });
  });

  describe('restart', () => {
    it('should stop and start again', () => {
      const sut = new ModulesStatesManagerController();
      mockAction.run.mockImplementation(() => {});
      sut.start();
      const firstCallCount = mockAction.run.mock.calls.length;
      sut.restart();
      expect(mockAction.run.mock.calls.length).toBeGreaterThan(firstCallCount);
    });
  });

  describe('pause / resume', () => {
    it('should pause state transitions', () => {
      const sut = new ModulesStatesManagerController();
      let nextStateCb: (() => void) | undefined;
      mockAction.run.mockImplementation((cb: () => void) => { nextStateCb = cb; });
      sut.start();
      sut.pause();

      // Complete current action -- nextState should be deferred
      const callCountBefore = (sut.emit as ReturnType<typeof vi.fn>).mock.calls.length;
      nextStateCb!();
      const callCountAfter = (sut.emit as ReturnType<typeof vi.fn>).mock.calls.length;
      // No new STATE_CHANGE emission (paused)
      expect(callCountAfter).toBe(callCountBefore);
    });

    it('should resume and continue state transitions', () => {
      const sut = new ModulesStatesManagerController();
      let nextStateCb: (() => void) | undefined;
      mockAction.run.mockImplementation((cb: () => void) => { nextStateCb = cb; });
      sut.start();
      sut.pause();
      nextStateCb!(); // Triggers _nextState but paused
      sut.resume();
      // After resume, should have emitted STATE_CHANGE for STATE_B
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_STATES_MANAGER_STATE_CHANGE,
        'STATE_B',
      );
    });

    it('should not resume if not paused during action completion', () => {
      const sut = new ModulesStatesManagerController();
      mockAction.run.mockImplementation(() => {});
      sut.start();
      // resume without pause should do nothing
      sut.resume();
    });
  });

  describe('setForceNextState', () => {
    it('should force the next state', () => {
      const sut = new ModulesStatesManagerController();
      let nextStateCb: (() => void) | undefined;
      mockAction.run.mockImplementation((cb: () => void) => { nextStateCb = cb; });
      sut.start();
      sut.setForceNextState('STATE_B');
      nextStateCb!();
      // Second STATE_CHANGE should be STATE_B
      const stateChangeCalls = (sut.emit as ReturnType<typeof vi.fn>).mock.calls.filter(
        (c: unknown[]) => c[0] === mockUrso.events.MODULES_STATES_MANAGER_STATE_CHANGE,
      );
      expect(stateChangeCalls[stateChangeCalls.length - 1][1]).toBe('STATE_B');
    });

    it('should log error for invalid state key', () => {
      const sut = new ModulesStatesManagerController();
      mockAction.run.mockImplementation(() => {});
      sut.start();
      sut.setForceNextState('NONEXISTENT');
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesStatesManagerController: setForceNextState name error',
        'NONEXISTENT',
      );
    });
  });

  describe('action guards', () => {
    it('addActionGuard / checkActionGuard should work together', () => {
      const sut = new ModulesStatesManagerController();
      const guard: GuidFunction = vi.fn(() => false);
      sut.addActionGuard('myAction', guard);
      expect(sut.checkActionGuard('myAction')).toBe(false);
    });

    it('removeActionGuard should remove the guard', () => {
      const sut = new ModulesStatesManagerController();
      const guard: GuidFunction = vi.fn(() => false);
      sut.addActionGuard('myAction', guard);
      sut.removeActionGuard('myAction', guard);
      expect(sut.checkActionGuard('myAction')).toBe(true);
    });
  });

  describe('action runs', () => {
    it('addActionRun / runAction should work together', async () => {
      const sut = new ModulesStatesManagerController();
      const runFn: GuidFunction = vi.fn((resolve: unknown) => { (resolve as () => void)(); });
      sut.addActionRun('myAction', runFn);
      const cb = vi.fn();
      sut.runAction('myAction', cb);
      await vi.waitFor(() => {
        expect(cb).toHaveBeenCalledTimes(1);
      });
    });

    it('removeActionRun should remove the run function', () => {
      const sut = new ModulesStatesManagerController();
      const runFn: GuidFunction = vi.fn();
      sut.addActionRun('myAction', runFn);
      sut.removeActionRun('myAction', runFn);
      const cb = vi.fn();
      sut.runAction('myAction', cb);
      expect(cb).toHaveBeenCalledTimes(1); // Immediate callback since no functions
    });
  });

  describe('action terminations', () => {
    it('addActionTerminate / terminateAction should work together', () => {
      const sut = new ModulesStatesManagerController();
      const terminateFn: GuidFunction = vi.fn();
      sut.addActionTerminate('myAction', terminateFn);
      sut.terminateAction('myAction');
      expect(terminateFn).toHaveBeenCalledTimes(1);
    });

    it('removeActionTerminate should remove the terminate function', () => {
      const sut = new ModulesStatesManagerController();
      const terminateFn: GuidFunction = vi.fn();
      sut.addActionTerminate('myAction', terminateFn);
      sut.removeActionTerminate('myAction', terminateFn);
      sut.terminateAction('myAction');
      expect(terminateFn).not.toHaveBeenCalled();
    });
  });

  describe('state guards', () => {
    it('setStateGuard / checkStateGuard should work together', () => {
      const sut = new ModulesStatesManagerController();
      mockAction.run.mockImplementation(() => {});
      sut.start();
      const guard: GuidFunction = vi.fn(() => false);
      sut.setStateGuard('STATE_A', guard);
      expect(sut.checkStateGuard('STATE_A')).toBe(false);
    });

    it('checkStateGuard should respect callLimit', () => {
      mockConfigStates.STATE_A.callLimit = 1;
      const sut = new ModulesStatesManagerController();
      mockAction.run.mockImplementation(() => {});
      sut.start(); // STATE_A called once
      // After being called once, callLimit=1 should block it
      expect(sut.checkStateGuard('STATE_A')).toBe(false);
    });

    it('removeStateGuard should remove the guard', () => {
      const sut = new ModulesStatesManagerController();
      mockAction.run.mockImplementation(() => {});
      sut.start();
      const guard: GuidFunction = vi.fn(() => false);
      sut.setStateGuard('STATE_B', guard);
      sut.removeStateGuard('STATE_B', guard);
      expect(sut.checkStateGuard('STATE_B')).toBe(true);
    });
  });

  describe('nextState by config.nextState', () => {
    it('should follow nextState array when current state has it', () => {
      mockConfigStates = {
        STATE_A: { action: 'actionA', nextState: ['STATE_C'] },
        STATE_B: { action: 'actionB' },
        STATE_C: { action: 'actionC' },
      };

      const sut = new ModulesStatesManagerController();
      let nextStateCb: (() => void) | undefined;
      mockAction.run.mockImplementation((cb: () => void) => { nextStateCb = cb; });
      sut.start(); // Goes to STATE_A

      nextStateCb!(); // Should go to STATE_C (from nextState)

      const stateChangeCalls = (sut.emit as ReturnType<typeof vi.fn>).mock.calls.filter(
        (c: unknown[]) => c[0] === mockUrso.events.MODULES_STATES_MANAGER_STATE_CHANGE,
      );
      expect(stateChangeCalls[1][1]).toBe('STATE_C');
    });
  });
});
