import ModulesStatesManagerRace from '../../../src/ts/modules/statesManager/race';
import ModulesStatesManagerAction from '../../../src/ts/modules/statesManager/action';

describe('ModulesStatesManagerRace', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockActions: ModulesStatesManagerAction[];

  function createMockAction(guardResult: boolean = true): ModulesStatesManagerAction {
    const action = {
      name: 'mockAction',
      finished: false,
      guard: vi.fn(() => guardResult),
      run: vi.fn((cb: () => void) => { cb(); }),
      terminate: vi.fn(),
      forceDestroy: vi.fn(),
    } as unknown as ModulesStatesManagerAction;
    return action;
  }

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockActions = [createMockAction(), createMockAction()];
    let actionIndex = 0;

    ModulesStatesManagerRace.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Helper') {
        return {
          getActionByConfig: vi.fn(() => mockActions[actionIndex++]),
        };
      }
      if (path === 'Controller') return { checkActionGuard: vi.fn(() => true) };
      return {};
    }) as ModulesStatesManagerRace['getInstance'];

    ModulesStatesManagerRace.prototype.emit = vi.fn() as ModulesStatesManagerRace['emit'];
  });

  afterEach(() => {
    delete (ModulesStatesManagerRace.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesStatesManagerRace.prototype as { emit?: unknown }).emit;
  });

  it('should set name to Race', () => {
    const sut = new ModulesStatesManagerRace([{ action: 'a' }, { action: 'b' }]);
    expect(sut.name).toBe('Race');
  });

  describe('guard', () => {
    it('should return true if any child action guard passes', () => {
      mockActions = [createMockAction(false), createMockAction(true)];
      let idx = 0;
      (ModulesStatesManagerRace.prototype.getInstance as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => mockActions[idx++]) };
        return {};
      });
      const sut = new ModulesStatesManagerRace([{ action: 'a' }, { action: 'b' }]);
      expect(sut.guard()).toBe(true);
    });

    it('should return false if all child action guards fail', () => {
      mockActions = [createMockAction(false), createMockAction(false)];
      let idx = 0;
      (ModulesStatesManagerRace.prototype.getInstance as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => mockActions[idx++]) };
        return {};
      });
      const sut = new ModulesStatesManagerRace([{ action: 'a' }, { action: 'b' }]);
      expect(sut.guard()).toBe(false);
    });
  });

  describe('run', () => {
    it('should run all guarded actions and call onFinishCallback when first finishes', () => {
      const cb = vi.fn();
      // Both actions pass guard. Since run triggers immediate callback -> first triggers terminate
      const sut = new ModulesStatesManagerRace([{ action: 'a' }, { action: 'b' }]);
      sut.run(cb);
      // Both actions ran
      expect(mockActions[0].run).toHaveBeenCalled();
      expect(mockActions[1].run).toHaveBeenCalled();
    });

    it('should mark non-guarded actions as finished', () => {
      mockActions = [createMockAction(true), createMockAction(false)];
      let idx = 0;
      (ModulesStatesManagerRace.prototype.getInstance as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => mockActions[idx++]) };
        return {};
      });
      const sut = new ModulesStatesManagerRace([{ action: 'a' }, { action: 'b' }]);
      sut.run(vi.fn());
      expect(mockActions[1].finished).toBe(true);
    });

    it('should call onFinishCallback when all actions are finished (race: first finishes, rest get terminated)', () => {
      // Make actions not auto-finish so we can control it
      const a1 = createMockAction();
      let runCb1: (() => void) | undefined;
      a1.run = vi.fn((cb: () => void) => { runCb1 = cb; });

      const a2 = createMockAction();
      let runCb2: (() => void) | undefined;
      a2.run = vi.fn((cb: () => void) => { runCb2 = cb; });

      mockActions = [a1, a2];
      let idx = 0;
      (ModulesStatesManagerRace.prototype.getInstance as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => mockActions[idx++]) };
        return {};
      });

      const sut = new ModulesStatesManagerRace([{ action: 'a' }, { action: 'b' }]);
      const cb = vi.fn();
      sut.run(cb);

      // First action finishes - triggers _actionSuccessHandler which calls terminate on remaining
      a1.finished = true;
      runCb1!();

      expect(a2.terminate).toHaveBeenCalled();
    });
  });

  describe('terminate', () => {
    it('should terminate all non-finished child actions', () => {
      const a1 = createMockAction();
      a1.run = vi.fn(); // Don't auto-finish
      const a2 = createMockAction();
      a2.run = vi.fn();

      mockActions = [a1, a2];
      let idx = 0;
      (ModulesStatesManagerRace.prototype.getInstance as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => mockActions[idx++]) };
        return {};
      });

      const sut = new ModulesStatesManagerRace([{ action: 'a' }, { action: 'b' }]);
      sut.run(vi.fn());
      sut.terminate();
      expect(a1.terminate).toHaveBeenCalled();
      expect(a2.terminate).toHaveBeenCalled();
    });

    it('should not terminate already finished actions', () => {
      const a1 = createMockAction();
      a1.finished = true;
      const a2 = createMockAction();
      a2.run = vi.fn();

      mockActions = [a1, a2];
      let idx = 0;
      (ModulesStatesManagerRace.prototype.getInstance as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => mockActions[idx++]) };
        return {};
      });

      const sut = new ModulesStatesManagerRace([{ action: 'a' }, { action: 'b' }]);
      sut.run(vi.fn());
      sut.terminate();
      expect(a1.terminate).not.toHaveBeenCalled();
    });

    it('should not terminate twice', () => {
      const sut = new ModulesStatesManagerRace([{ action: 'a' }, { action: 'b' }]);
      sut.run(vi.fn());
      sut.terminate();
      sut.terminate();
      // No error thrown, second call is no-op
    });
  });

  describe('forceDestroy', () => {
    it('should forceDestroy all non-finished child actions', () => {
      const a1 = createMockAction();
      a1.run = vi.fn();
      const a2 = createMockAction();
      a2.run = vi.fn();

      mockActions = [a1, a2];
      let idx = 0;
      (ModulesStatesManagerRace.prototype.getInstance as ReturnType<typeof vi.fn>).mockImplementation((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => mockActions[idx++]) };
        return {};
      });

      const sut = new ModulesStatesManagerRace([{ action: 'a' }, { action: 'b' }]);
      sut.forceDestroy();
      expect(a1.forceDestroy).toHaveBeenCalled();
      expect(a2.forceDestroy).toHaveBeenCalled();
    });
  });
});
