import ModulesStatesManagerAll from '../../../src/ts/modules/statesManager/all';
import ModulesStatesManagerAction from '../../../src/ts/modules/statesManager/action';

describe('ModulesStatesManagerAll', () => {
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

    ModulesStatesManagerAll.prototype.emit = vi.fn() as ModulesStatesManagerAll['emit'];
  });

  afterEach(() => {
    delete (ModulesStatesManagerAll.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesStatesManagerAll.prototype as { emit?: unknown }).emit;
  });

  it('should set name to All', () => {
    const actions = [createMockAction(), createMockAction()];
    let idx = 0;
    ModulesStatesManagerAll.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
      return {};
    }) as ModulesStatesManagerAll['getInstance'];

    const sut = new ModulesStatesManagerAll([{ action: 'a' }, { action: 'b' }]);
    expect(sut.name).toBe('All');
  });

  it('should wait for ALL actions to finish before calling onFinishCallback', () => {
    let runCb1: (() => void) | undefined;
    let runCb2: (() => void) | undefined;
    const a1 = createMockAction();
    a1.run = vi.fn((cb: () => void) => { runCb1 = cb; });
    const a2 = createMockAction();
    a2.run = vi.fn((cb: () => void) => { runCb2 = cb; });

    const actions = [a1, a2];
    let idx = 0;
    ModulesStatesManagerAll.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
      return {};
    }) as ModulesStatesManagerAll['getInstance'];

    const sut = new ModulesStatesManagerAll([{ action: 'a' }, { action: 'b' }]);
    const cb = vi.fn();
    sut.run(cb);

    // First action finishes - should NOT call onFinish yet (All waits for all)
    a1.finished = true;
    runCb1!();
    expect(cb).not.toHaveBeenCalled();

    // Second action finishes - NOW should call onFinish
    a2.finished = true;
    runCb2!();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('should NOT terminate other actions when one finishes (unlike Race)', () => {
    let runCb1: (() => void) | undefined;
    const a1 = createMockAction();
    a1.run = vi.fn((cb: () => void) => { runCb1 = cb; });
    const a2 = createMockAction();
    a2.run = vi.fn();

    const actions = [a1, a2];
    let idx = 0;
    ModulesStatesManagerAll.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
      return {};
    }) as ModulesStatesManagerAll['getInstance'];

    const sut = new ModulesStatesManagerAll([{ action: 'a' }, { action: 'b' }]);
    sut.run(vi.fn());

    // First action finishes
    a1.finished = true;
    runCb1!();

    // a2 should NOT be terminated
    expect(a2.terminate).not.toHaveBeenCalled();
  });

  describe('guard', () => {
    it('should return true if any child action guard passes', () => {
      const actions = [createMockAction(false), createMockAction(true)];
      let idx = 0;
      ModulesStatesManagerAll.prototype.getInstance = vi.fn((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
        return {};
      }) as ModulesStatesManagerAll['getInstance'];
      const sut = new ModulesStatesManagerAll([{ action: 'a' }, { action: 'b' }]);
      expect(sut.guard()).toBe(true);
    });

    it('should return false if all child action guards fail', () => {
      const actions = [createMockAction(false), createMockAction(false)];
      let idx = 0;
      ModulesStatesManagerAll.prototype.getInstance = vi.fn((path: string) => {
        if (path === 'Helper') return { getActionByConfig: vi.fn(() => actions[idx++]) };
        return {};
      }) as ModulesStatesManagerAll['getInstance'];
      const sut = new ModulesStatesManagerAll([{ action: 'a' }, { action: 'b' }]);
      expect(sut.guard()).toBe(false);
    });
  });
});
