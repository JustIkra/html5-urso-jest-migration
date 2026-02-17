import ModulesStatesManagerSequence from '../../../src/ts/modules/statesManager/sequence';
import ModulesStatesManagerAction from '../../../src/ts/modules/statesManager/action';

describe('ModulesStatesManagerSequence', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  function createMockAction(guardResult: boolean = true): ModulesStatesManagerAction {
    return {
      name: 'mockAction',
      finished: false,
      guard: vi.fn(() => guardResult),
      run: vi.fn(),
      terminate: vi.fn(),
      forceDestroy: vi.fn(),
    } as unknown as ModulesStatesManagerAction;
  }

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    ModulesStatesManagerSequence.prototype.emit = vi.fn() as ModulesStatesManagerSequence['emit'];
  });

  afterEach(() => {
    delete (ModulesStatesManagerSequence.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesStatesManagerSequence.prototype as { emit?: unknown }).emit;
  });

  it('should set name to Sequence', () => {
    const actions = [createMockAction()];
    let idx = 0;
    ModulesStatesManagerSequence.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
      return {};
    }) as ModulesStatesManagerSequence['getInstance'];

    const sut = new ModulesStatesManagerSequence([{ action: 'a' }]);
    expect(sut.name).toBe('Sequence');
  });

  it('should run actions one at a time in sequence', () => {
    let runCb1: (() => void) | undefined;
    const a1 = createMockAction();
    a1.run = vi.fn((cb: () => void) => { runCb1 = cb; });
    const a2 = createMockAction();
    a2.run = vi.fn();

    const actions = [a1, a2];
    let idx = 0;
    ModulesStatesManagerSequence.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
      return {};
    }) as ModulesStatesManagerSequence['getInstance'];

    const sut = new ModulesStatesManagerSequence([{ action: 'a' }, { action: 'b' }]);
    sut.run(vi.fn());

    // a1 should be running, a2 should NOT have run yet
    expect(a1.run).toHaveBeenCalled();
    expect(a2.run).not.toHaveBeenCalled();

    // Complete a1
    a1.finished = true;
    runCb1!();

    // Now a2 should run
    expect(a2.run).toHaveBeenCalled();
  });

  it('should skip actions whose guard fails', () => {
    const a1 = createMockAction(false); // Guard fails
    const a2 = createMockAction(true);
    a2.run = vi.fn();

    const actions = [a1, a2];
    let idx = 0;
    ModulesStatesManagerSequence.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
      return {};
    }) as ModulesStatesManagerSequence['getInstance'];

    const sut = new ModulesStatesManagerSequence([{ action: 'a' }, { action: 'b' }]);
    sut.run(vi.fn());

    // a1 guard fails, should be marked finished
    expect(a1.finished).toBe(true);
    expect(a1.run).not.toHaveBeenCalled();
    // a2 should run
    expect(a2.run).toHaveBeenCalled();
  });

  it('should call onFinishCallback when all actions complete', () => {
    let runCb1: (() => void) | undefined;
    let runCb2: (() => void) | undefined;
    const a1 = createMockAction();
    a1.run = vi.fn((cb: () => void) => { runCb1 = cb; });
    const a2 = createMockAction();
    a2.run = vi.fn((cb: () => void) => { runCb2 = cb; });

    const actions = [a1, a2];
    let idx = 0;
    ModulesStatesManagerSequence.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
      return {};
    }) as ModulesStatesManagerSequence['getInstance'];

    const sut = new ModulesStatesManagerSequence([{ action: 'a' }, { action: 'b' }]);
    const cb = vi.fn();
    sut.run(cb);

    a1.finished = true;
    runCb1!();
    expect(cb).not.toHaveBeenCalled();

    a2.finished = true;
    runCb2!();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  describe('terminate', () => {
    it('should terminate only the currently running action', () => {
      const a1 = createMockAction();
      a1.run = vi.fn();
      const a2 = createMockAction();

      const actions = [a1, a2];
      let idx = 0;
      ModulesStatesManagerSequence.prototype.getInstance = vi.fn((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
        return {};
      }) as ModulesStatesManagerSequence['getInstance'];

      const sut = new ModulesStatesManagerSequence([{ action: 'a' }, { action: 'b' }]);
      sut.run(vi.fn());
      sut.terminate();

      // Only a1 (currently running) should be terminated
      expect(a1.terminate).toHaveBeenCalled();
      // a2 hasn't started, should not be terminated
      expect(a2.terminate).not.toHaveBeenCalled();
    });

    it('should not terminate twice', () => {
      const a1 = createMockAction();
      a1.run = vi.fn();

      const actions = [a1];
      let idx = 0;
      ModulesStatesManagerSequence.prototype.getInstance = vi.fn((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
        return {};
      }) as ModulesStatesManagerSequence['getInstance'];

      const sut = new ModulesStatesManagerSequence([{ action: 'a' }]);
      sut.run(vi.fn());
      sut.terminate();
      sut.terminate();
      expect(a1.terminate).toHaveBeenCalledTimes(1);
    });

    it('should call _onFinish after termination completes the _checkFinish loop', () => {
      // When terminating is true and all actions finish, _checkFinish still calls _onFinish
      const a1 = createMockAction();
      a1.finished = true;
      const a2 = createMockAction();
      a2.finished = true;

      const actions = [a1, a2];
      let idx = 0;
      ModulesStatesManagerSequence.prototype.getInstance = vi.fn((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
        return {};
      }) as ModulesStatesManagerSequence['getInstance'];

      const sut = new ModulesStatesManagerSequence([{ action: 'a' }, { action: 'b' }]);
      const cb = vi.fn();
      sut.run(cb);
      // All already finished so onFinish is called
      expect(cb).toHaveBeenCalledTimes(1);
    });
  });
});
