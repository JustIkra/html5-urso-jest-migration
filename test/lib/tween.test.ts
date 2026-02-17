import LibTween from '../../src/ts/lib/tween';

describe('LibTween', () => {
  let sut: LibTween;

  beforeEach(() => {
    // Mock Urso.scenes.timeScale and addListener
    (Urso as unknown as Record<string, unknown>).scenes = {
      timeScale: 1,
      display: vi.fn(),
    };

    sut = new LibTween();
  });

  // ==========================================================================
  // constructor
  // ==========================================================================

  describe('constructor', () => {
    it('should create a tween manager with singleton true', () => {
      expect(sut.singleton).toBe(true);
    });

    it('should initialize with empty tweens', () => {
      expect(sut.tweens).toEqual({});
    });

    it('should have globalTimeScale reading from Urso.scenes.timeScale', () => {
      expect(sut.globalTimeScale).toBe(1);
    });
  });

  // ==========================================================================
  // add
  // ==========================================================================

  describe('add', () => {
    it('should create a new tween for the given target', () => {
      const target = { x: 0, y: 0 };
      const tween = sut.add(target);
      expect(tween).toBeDefined();
      expect(tween.target).toBe(target);
      expect(tween.isRunning).toBe(false);
    });

    it('should assign a unique id to each tween', () => {
      const t1 = sut.add({ x: 0 });
      const t2 = sut.add({ y: 0 });
      expect(t1.id).not.toBe(t2.id);
    });

    it('should store the tween in the tweens map', () => {
      const tween = sut.add({ x: 0 });
      expect(sut.tweens[tween.id]).toBe(tween);
    });

    it('should have onComplete.add and onComplete.addOnce', () => {
      const tween = sut.add({ x: 0 });
      expect(typeof tween.onComplete.add).toBe('function');
      expect(typeof tween.onComplete.addOnce).toBe('function');
    });

    it('should have onStart.add and onStart.addOnce', () => {
      const tween = sut.add({ x: 0 });
      expect(typeof tween.onStart.add).toBe('function');
      expect(typeof tween.onStart.addOnce).toBe('function');
    });

    it('should have onUpdateCallback', () => {
      const tween = sut.add({ x: 0 });
      expect(typeof tween.onUpdateCallback).toBe('function');
    });
  });

  // ==========================================================================
  // tween.to
  // ==========================================================================

  describe('tween.to', () => {
    it('should add a point with target properties and duration', () => {
      const target = { x: 0, y: 0 };
      const tween = sut.add(target);
      tween.to({ x: 100 }, 1000);
      expect(tween.points.length).toBe(1);
      expect(tween.points[0].propsTo).toEqual({ x: 100 });
      expect(tween.points[0].duration).toBe(1000);
    });

    it('should record starting values in propsFrom', () => {
      const target = { x: 50 };
      const tween = sut.add(target);
      tween.to({ x: 100 }, 1000);
      expect(tween.points[0].propsFrom).toEqual({ x: 50 });
    });

    it('should chain multiple points', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      tween.to({ x: 50 }, 500).to({ x: 100 }, 500);
      expect(tween.points.length).toBe(2);
    });

    it('should auto-start if autostart is true', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      tween.to({ x: 100 }, 1000, undefined, true);
      expect(tween.isRunning).toBe(true);
    });
  });

  // ==========================================================================
  // tween.start / stop / pause / resume
  // ==========================================================================

  describe('tween lifecycle', () => {
    it('should start a tween', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      tween.to({ x: 100 }, 1000);
      tween.start();
      expect(tween.isRunning).toBe(true);
    });

    it('should stop a tween', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      tween.to({ x: 100 }, 1000);
      tween.start();
      tween.stop();
      expect(tween.isRunning).toBe(false);
    });

    it('should pause a tween', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      tween.to({ x: 100 }, 1000);
      tween.start();
      tween.pause();
      expect(tween.isRunning).toBe(false);
    });

    it('should resume a paused tween', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      tween.to({ x: 100 }, 1000);
      tween.start();
      tween.pause();
      tween.resume();
      expect(tween.isRunning).toBe(true);
    });

    it('should fire onStart callbacks', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      const onStartCb = vi.fn();
      tween.onStart.add(onStartCb);
      tween.to({ x: 100 }, 1000);
      tween.start();
      expect(onStartCb).toHaveBeenCalled();
    });

    it('should fire onStartOnce callbacks only once', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      const onStartOnceCb = vi.fn();
      tween.onStart.addOnce(onStartOnceCb);
      tween.to({ x: 100 }, 1000);
      tween.start();
      expect(onStartOnceCb).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // removeAll
  // ==========================================================================

  describe('removeAll', () => {
    it('should stop all tweens', () => {
      const t1 = sut.add({ x: 0 });
      const t2 = sut.add({ y: 0 });
      t1.to({ x: 100 }, 1000);
      t2.to({ y: 100 }, 1000);
      t1.start();
      t2.start();
      sut.removeAll();
      expect(t1.isRunning).toBe(false);
      expect(t2.isRunning).toBe(false);
    });
  });

  // ==========================================================================
  // update
  // ==========================================================================

  describe('update', () => {
    it('should not throw when called', () => {
      expect(() => sut.update()).not.toThrow();
    });

    it('should remove completed tweens', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      tween.to({ x: 100 }, 1000);
      tween.start();
      tween.stop();

      sut.update();
      // After update, the completed tween should be cleaned up
      expect(sut.tweens[tween.id]).toBeUndefined();
    });
  });

  // ==========================================================================
  // onComplete callbacks
  // ==========================================================================

  describe('onComplete', () => {
    it('should return the tween for chaining from addOnce', () => {
      const tween = sut.add({ x: 0 });
      const result = tween.onComplete.addOnce(vi.fn());
      expect(result).toBe(tween);
    });

    it('should return the tween for chaining from add', () => {
      const tween = sut.add({ x: 0 });
      const result = tween.onComplete.add(vi.fn());
      expect(result).toBe(tween);
    });
  });

  // ==========================================================================
  // onUpdateCallback
  // ==========================================================================

  describe('onUpdateCallback', () => {
    it('should return the tween for chaining', () => {
      const tween = sut.add({ x: 0 });
      const result = tween.onUpdateCallback(vi.fn());
      expect(result).toBe(tween);
    });
  });

  // ==========================================================================
  // tween.start with no points
  // ==========================================================================

  describe('edge cases', () => {
    it('should return tween if start is called when already running', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      tween.to({ x: 100 }, 1000);
      tween.start();
      const result = tween.start();
      expect(result).toBe(tween);
    });

    it('should return tween if start is called with no points', () => {
      const target = { x: 0 };
      const tween = sut.add(target);
      const result = tween.start();
      expect(result).toBe(tween);
    });
  });
});
