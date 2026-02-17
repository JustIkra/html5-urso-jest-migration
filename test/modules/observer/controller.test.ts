import ModulesObserverController from '../../../src/ts/modules/observer/controller';
import { UrsoEvent } from '../../../src/ts/types';
import type { ObserverCallback } from '../../../src/ts/types';

describe('ModulesObserverController', () => {
  let sut: ModulesObserverController;
  let mockUrso: ReturnType<typeof createMockUrso>;

  function makeSut(): ModulesObserverController {
    // Inject getInstance before construction
    const eventsInstance = { list: UrsoEvent };
    ModulesObserverController.prototype.getInstance = vi.fn(() => eventsInstance) as ModulesObserverController['getInstance'];
    return new ModulesObserverController();
  }

  beforeEach(() => {
    vi.useFakeTimers();
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
    sut = makeSut();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ========================================================================
  // Construction
  // ========================================================================

  describe('constructor', () => {
    it('should set Urso.events from getInstance("Events").list', () => {
      expect(sut.getInstance).toHaveBeenCalledWith('Events');
      expect(Urso.events).toBe(UrsoEvent);
    });

    it('should start with empty _observers', () => {
      // Verify by clearing and checking return
      expect(sut.clear()).toBe(true);
    });

    it('should start with empty prefix', () => {
      // If prefix is empty, local suffix is '_@'
      // Adding a local listener should use suffix '_@'
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb);

      // Fire with global should miss the local-suffixed listener
      // Fire with the event normally (which fires both global and local)
      sut.fire('test.event');
      expect(cb).toHaveBeenCalled();
    });

    it('should start with _counter at 0', () => {
      // First callback gets observer_1
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, true);
      expect(cb._ouid).toBe('observer_1');
    });
  });

  // ========================================================================
  // fire()
  // ========================================================================

  describe('fire', () => {
    it('should fire global and local listeners', () => {
      const globalCb: ObserverCallback = vi.fn();
      const localCb: ObserverCallback = vi.fn();

      sut.add('test.event', globalCb, true);
      sut.add('test.event', localCb, false);

      sut.fire('test.event', 'data');

      expect(globalCb).toHaveBeenCalledWith('data');
      expect(localCb).toHaveBeenCalledWith('data');
    });

    it('should log error and return when eventName is empty', () => {
      sut.fire('');
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObserverController fire error:',
        ''
      );
    });

    it('should delay fire using setTimeout when delay is provided', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, true);

      sut.fire('test.event', 'delayed-data', 100);

      expect(cb).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(cb).toHaveBeenCalledWith('delayed-data');
    });

    it('should pass params through to callbacks', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, true);

      const params = { key: 'value', num: 42 };
      sut.fire('test.event', params);

      expect(cb).toHaveBeenCalledWith(params);
    });

    it('should call callback with undefined when no params given', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, true);

      sut.fire('test.event');

      expect(cb).toHaveBeenCalledWith(undefined);
    });
  });

  // ========================================================================
  // add()
  // ========================================================================

  describe('add', () => {
    it('should add a global listener when global is true', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, true);

      // Fire should reach it from global path
      sut.fire('test.event');
      expect(cb).toHaveBeenCalled();
    });

    it('should add a local listener when global is falsy', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb);

      // Fire should reach it from local path
      sut.fire('test.event');
      expect(cb).toHaveBeenCalled();
    });

    it('should log error when eventName is empty', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('', cb);
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObserverController add error:',
        '',
        cb
      );
    });

    it('should log error when callback is missing', () => {
      sut.add('test.event', undefined as unknown as ObserverCallback);
      expect(mockUrso.logger.error).toHaveBeenCalled();
    });

    it('should assign _ouid to callback', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, true);
      expect(cb._ouid).toBeDefined();
      expect(cb._ouid).toMatch(/^observer_\d+$/);
    });

    it('should reuse existing _ouid if already set', () => {
      const cb: ObserverCallback = vi.fn();
      cb._ouid = 'custom_uid';
      sut.add('test.event', cb, true);
      expect(cb._ouid).toBe('custom_uid');
    });

    it('should increment counter for each new callback', () => {
      const cb1: ObserverCallback = vi.fn();
      const cb2: ObserverCallback = vi.fn();
      sut.add('test.event', cb1, true);
      sut.add('test.event', cb2, true);
      expect(cb1._ouid).toBe('observer_1');
      expect(cb2._ouid).toBe('observer_2');
    });
  });

  // ========================================================================
  // remove()
  // ========================================================================

  describe('remove', () => {
    it('should remove a global listener', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, true);
      sut.remove('test.event', cb, true);

      sut.fire('test.event');
      expect(cb).not.toHaveBeenCalled();
    });

    it('should remove a local listener', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, false);
      sut.remove('test.event', cb, false);

      sut.fire('test.event');
      expect(cb).not.toHaveBeenCalled();
    });

    it('should log error when event name does not exist in observers', () => {
      const cb: ObserverCallback = vi.fn();
      cb._ouid = 'test_uid';
      sut.remove('nonexistent.event', cb, true);
      expect(mockUrso.logger.error).toHaveBeenCalledWith(
        'ModulesObserverController remove error, no observer with',
        'nonexistent.event',
        cb
      );
    });

    it('should log error when callback has no _ouid', () => {
      const cb: ObserverCallback = vi.fn();
      sut.remove('test.event', cb, true);
      expect(mockUrso.logger.error).toHaveBeenCalled();
    });

    it('should clean up empty event buckets after removal', () => {
      mockUrso.helper.getObjectSize = vi.fn(() => 0);
      (globalThis as Record<string, unknown>).Urso = mockUrso;

      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, true);
      sut.remove('test.event', cb, true);

      // After removal and cleanup, firing should not reach callback
      sut.fire('test.event');
      expect(cb).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // setPrefix()
  // ========================================================================

  describe('setPrefix', () => {
    it('should change the local suffix used for scoping', () => {
      const cbScene1: ObserverCallback = vi.fn();
      const cbScene2: ObserverCallback = vi.fn();

      sut.setPrefix('scene1');
      sut.add('test.event', cbScene1);

      sut.setPrefix('scene2');
      sut.add('test.event', cbScene2);

      sut.fire('test.event');
      // Only scene2 local listener should fire because prefix is now 'scene2'
      expect(cbScene1).not.toHaveBeenCalled();
      expect(cbScene2).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // clearAllLocal()
  // ========================================================================

  describe('clearAllLocal', () => {
    it('should remove all local listeners but keep global ones', () => {
      const globalCb: ObserverCallback = vi.fn();
      const localCb: ObserverCallback = vi.fn();

      sut.add('test.event', globalCb, true);
      sut.add('test.event', localCb, false);

      sut.clearAllLocal();

      sut.fire('test.event');
      expect(globalCb).toHaveBeenCalled();
      expect(localCb).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // clear()
  // ========================================================================

  describe('clear', () => {
    it('should remove all listeners and return true', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, true);

      const result = sut.clear();

      expect(result).toBe(true);
      sut.fire('test.event');
      expect(cb).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // _getUid (tested indirectly through add)
  // ========================================================================

  describe('_getUid (via add)', () => {
    it('should return existing _ouid if callback already has one', () => {
      const cb: ObserverCallback = vi.fn();
      cb._ouid = 'pre_existing_uid';
      sut.add('test.event', cb, true);
      expect(cb._ouid).toBe('pre_existing_uid');
    });

    it('should generate new uid when callback has none', () => {
      const cb: ObserverCallback = vi.fn();
      sut.add('test.event', cb, true);
      expect(cb._ouid).toBe('observer_1');
    });
  });

  // ========================================================================
  // Integration
  // ========================================================================

  describe('integration', () => {
    it('should support full add -> fire -> remove cycle', () => {
      const cb: ObserverCallback = vi.fn();

      sut.add('game.started', cb, true);
      sut.fire('game.started', { level: 1 });
      expect(cb).toHaveBeenCalledWith({ level: 1 });
      expect(cb).toHaveBeenCalledTimes(1);

      sut.remove('game.started', cb, true);
      sut.fire('game.started', { level: 2 });
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('should support multiple listeners on same event', () => {
      const cb1: ObserverCallback = vi.fn();
      const cb2: ObserverCallback = vi.fn();
      const cb3: ObserverCallback = vi.fn();

      sut.add('multi.event', cb1, true);
      sut.add('multi.event', cb2, true);
      sut.add('multi.event', cb3, true);

      sut.fire('multi.event', 'hello');

      expect(cb1).toHaveBeenCalledWith('hello');
      expect(cb2).toHaveBeenCalledWith('hello');
      expect(cb3).toHaveBeenCalledWith('hello');
    });

    it('should scope local events to current prefix', () => {
      const sceneCb1: ObserverCallback = vi.fn();
      const sceneCb2: ObserverCallback = vi.fn();
      const globalCb: ObserverCallback = vi.fn();

      sut.setPrefix('scene_a');
      sut.add('event', sceneCb1, false);
      sut.add('event', globalCb, true);

      sut.setPrefix('scene_b');
      sut.add('event', sceneCb2, false);

      sut.fire('event');

      // Global always fires
      expect(globalCb).toHaveBeenCalled();
      // Only scene_b local fires because prefix is scene_b
      expect(sceneCb2).toHaveBeenCalled();
      // scene_a local should not fire
      expect(sceneCb1).not.toHaveBeenCalled();
    });

    it('should handle clearAllLocal then add new listeners', () => {
      const oldCb: ObserverCallback = vi.fn();
      const newCb: ObserverCallback = vi.fn();

      sut.add('event', oldCb);
      sut.clearAllLocal();
      sut.add('event', newCb);

      sut.fire('event');

      expect(oldCb).not.toHaveBeenCalled();
      expect(newCb).toHaveBeenCalled();
    });
  });
});
