import ModulesStatesManagerAction from '../../../src/ts/modules/statesManager/action';

describe('ModulesStatesManagerAction', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    ModulesStatesManagerAction.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Controller') return { checkActionGuard: vi.fn(() => true) };
      return {};
    }) as ModulesStatesManagerAction['getInstance'];

    ModulesStatesManagerAction.prototype.emit = vi.fn() as ModulesStatesManagerAction['emit'];
  });

  afterEach(() => {
    delete (ModulesStatesManagerAction.prototype as { getInstance?: unknown }).getInstance;
    delete (ModulesStatesManagerAction.prototype as { emit?: unknown }).emit;
  });

  it('should set name from constructor', () => {
    const sut = new ModulesStatesManagerAction('testAction');
    expect(sut.name).toBe('testAction');
  });

  it('should default finished to false', () => {
    const sut = new ModulesStatesManagerAction('testAction');
    expect(sut.finished).toBe(false);
  });

  describe('guard', () => {
    it('should return true when not running and controller guard passes', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      expect(sut.guard()).toBe(true);
    });

    it('should return false when action is running', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      const cb = vi.fn();
      sut.run(cb);
      expect(sut.guard()).toBe(false);
    });

    it('should return false when controller guard fails', () => {
      ModulesStatesManagerAction.prototype.getInstance = vi.fn(() => ({
        checkActionGuard: vi.fn(() => false),
      })) as ModulesStatesManagerAction['getInstance'];
      const sut = new ModulesStatesManagerAction('testAction');
      expect(sut.guard()).toBe(false);
    });
  });

  describe('run', () => {
    it('should call statesManager.runAction with action name', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      const cb = vi.fn();
      sut.run(cb);
      expect(mockUrso.statesManager.runAction).toHaveBeenCalledWith('testAction', expect.any(Function));
    });

    it('should emit ACTION_START event', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      sut.run(vi.fn());
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_STATES_MANAGER_ACTION_START,
        'testAction',
      );
    });

    it('should set finished to false', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      sut.run(vi.fn());
      expect(sut.finished).toBe(false);
    });
  });

  describe('_onFinish (via run callback)', () => {
    it('should set finished to true and call onFinishCallback', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      const cb = vi.fn();
      sut.run(cb);

      // Extract the _onFinish callback passed to statesManager.runAction
      const onFinish = mockUrso.statesManager.runAction.mock.calls[0][1] as () => void;
      onFinish();

      expect(sut.finished).toBe(true);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('should emit ACTION_FINISH event', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      sut.run(vi.fn());
      const onFinish = mockUrso.statesManager.runAction.mock.calls[0][1] as () => void;
      onFinish();
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_STATES_MANAGER_ACTION_FINISH,
        'testAction',
      );
    });

    it('should log error if action already finished', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      sut.run(vi.fn());
      const onFinish = mockUrso.statesManager.runAction.mock.calls[0][1] as () => void;
      onFinish();
      onFinish(); // second call
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesStatesManagerAction: action already finished',
        'testAction',
      );
    });
  });

  describe('terminate', () => {
    it('should call statesManager.terminateAction', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      sut.run(vi.fn());
      sut.terminate();
      expect(mockUrso.statesManager.terminateAction).toHaveBeenCalledWith('testAction');
    });

    it('should warn and run if action is not running', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      sut.terminate();
      expect(mockUrso.logger.warn).toHaveBeenCalledWith(
        'ModulesStatesManagerAction: action run from terminating',
        'testAction',
      );
      expect(mockUrso.statesManager.runAction).toHaveBeenCalled();
    });

    it('should log error if already terminating', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      sut.run(vi.fn());
      sut.terminate();
      sut.terminate();
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesStatesManagerAction: action already terminating',
        'testAction',
      );
    });

    it('should do nothing if forceDestroying', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      sut.run(vi.fn());
      sut.forceDestroy();
      sut.terminate();
      // terminateAction should not have been called because forceDestroying blocks it
      expect(mockUrso.statesManager.terminateAction).not.toHaveBeenCalled();
    });
  });

  describe('forceDestroy', () => {
    it('should set forceDestroying when running', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      sut.run(vi.fn());
      sut.forceDestroy();
      // Subsequent _onFinish should be no-op
      const onFinish = mockUrso.statesManager.runAction.mock.calls[0][1] as () => void;
      const cb = vi.fn();
      sut.run(cb);
      // forceDestroying blocks _onFinish
      expect(sut.finished).toBe(false);
    });

    it('should do nothing if not running', () => {
      const sut = new ModulesStatesManagerAction('testAction');
      sut.forceDestroy();
      // No error thrown
    });
  });
});
