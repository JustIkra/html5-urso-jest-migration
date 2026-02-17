import LibHelper from '../../src/ts/lib/helper';

describe('LibHelper', () => {
  let sut: LibHelper;

  beforeEach(() => {
    sut = new LibHelper();
  });

  // ==========================================================================
  // recursiveGet
  // ==========================================================================

  describe('recursiveGet', () => {
    it('should return value for simple key', () => {
      const obj = { foo: 42 };
      expect(sut.recursiveGet('foo', obj)).toBe(42);
    });

    it('should return value for dot-path key', () => {
      const obj = { a: { b: { c: 'deep' } } };
      expect(sut.recursiveGet('a.b.c', obj)).toBe('deep');
    });

    it('should return defaultResult when key is missing', () => {
      const obj = { a: 1 };
      expect(sut.recursiveGet('b', obj, 'default')).toBe('default');
    });

    it('should return defaultResult when dot-path is partially missing', () => {
      const obj = { a: { b: 1 } };
      expect(sut.recursiveGet('a.c.d', obj, 'fallback')).toBe('fallback');
    });

    it('should return defaultResult when object is undefined', () => {
      expect(sut.recursiveGet('a', undefined, 'def')).toBe('def');
    });

    it('should accept array key format', () => {
      const obj = { a: { b: 99 } };
      expect(sut.recursiveGet(['a', 'b'], obj)).toBe(99);
    });

    it('should return the full object if key is empty string', () => {
      const obj = { a: 1 };
      expect(sut.recursiveGet('', obj)).toEqual(obj);
    });

    it('should return defaultResult when intermediate is null', () => {
      const obj = { a: null };
      expect(sut.recursiveGet('a.b', obj, 'def')).toBe('def');
    });

    it('should return falsy values correctly (0, false, empty string)', () => {
      const obj = { zero: 0, no: false, empty: '' };
      expect(sut.recursiveGet('zero', obj)).toBe(0);
      expect(sut.recursiveGet('no', obj)).toBe(false);
      expect(sut.recursiveGet('empty', obj)).toBe('');
    });
  });

  // ==========================================================================
  // recursiveSet
  // ==========================================================================

  describe('recursiveSet', () => {
    it('should set value for simple key', () => {
      const obj: Record<string, unknown> = {};
      sut.recursiveSet('foo', 42, obj);
      expect(obj.foo).toBe(42);
    });

    it('should set value for dot-path key creating intermediary objects', () => {
      const obj: Record<string, unknown> = {};
      sut.recursiveSet('a.b.c', 'deep', obj);
      expect((obj.a as Record<string, unknown> as Record<string, Record<string, unknown>>).b.c).toBe('deep');
    });

    it('should return true', () => {
      const obj: Record<string, unknown> = {};
      expect(sut.recursiveSet('x', 1, obj)).toBe(true);
    });

    it('should overwrite existing values', () => {
      const obj: Record<string, unknown> = { a: 1 };
      sut.recursiveSet('a', 2, obj);
      expect(obj.a).toBe(2);
    });

    it('should accept array key format', () => {
      const obj: Record<string, unknown> = {};
      sut.recursiveSet(['x', 'y'], 10, obj);
      expect((obj.x as Record<string, unknown>).y).toBe(10);
    });
  });

  // ==========================================================================
  // recursiveDelete
  // ==========================================================================

  describe('recursiveDelete', () => {
    it('should delete a simple key', () => {
      const obj: Record<string, unknown> = { a: 1, b: 2 };
      expect(sut.recursiveDelete('a', obj)).toBe(true);
      expect(obj.a).toBeUndefined();
      expect(obj.b).toBe(2);
    });

    it('should delete a dot-path key', () => {
      const obj = { a: { b: { c: 3 } } };
      expect(sut.recursiveDelete('a.b.c', obj)).toBe(true);
      expect(obj.a.b.c).toBeUndefined();
    });

    it('should return false when key is missing', () => {
      const obj: Record<string, unknown> = { a: 1 };
      expect(sut.recursiveDelete('b', obj)).toBe(false);
    });

    it('should return false when dot-path intermediate is missing', () => {
      const obj: Record<string, unknown> = { a: 1 };
      expect(sut.recursiveDelete('a.b.c', obj)).toBe(false);
    });
  });

  // ==========================================================================
  // mergeObjectsRecursive
  // ==========================================================================

  describe('mergeObjectsRecursive', () => {
    it('should merge two flat objects', () => {
      const result = sut.mergeObjectsRecursive({ a: 1 }, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should merge nested objects', () => {
      const obj1 = { nested: { a: 1, b: 2 } };
      const obj2 = { nested: { b: 3, c: 4 } };
      const result = sut.mergeObjectsRecursive(obj1, obj2);
      expect(result).toEqual({ nested: { a: 1, b: 3, c: 4 } });
    });

    it('should not mutate obj1 when mergeInFirstFlag is false', () => {
      const obj1 = { a: 1 };
      sut.mergeObjectsRecursive(obj1, { b: 2 });
      expect(obj1).toEqual({ a: 1 });
    });

    it('should mutate obj1 when mergeInFirstFlag is true', () => {
      const obj1: Record<string, unknown> = { a: 1 };
      sut.mergeObjectsRecursive(obj1, { b: 2 }, true);
      expect(obj1).toEqual({ a: 1, b: 2 });
    });

    it('should overwrite non-object values with obj2 values', () => {
      const result = sut.mergeObjectsRecursive({ a: 1 }, { a: 2 });
      expect(result.a).toBe(2);
    });
  });

  // ==========================================================================
  // objectClone
  // ==========================================================================

  describe('objectClone', () => {
    it('should deep clone an object', () => {
      const obj = { a: { b: [1, 2, 3] }, c: 'text' };
      const clone = sut.objectClone(obj) as typeof obj;
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
      expect(clone.a).not.toBe(obj.a);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, { x: 3 }];
      const clone = sut.objectClone(arr) as typeof arr;
      expect(clone).toEqual(arr);
      expect(clone).not.toBe(arr);
    });

    it('should keep imageSrc as-is (no deep clone)', () => {
      const imgSrc = { data: 'binary' };
      const obj = { imageSrc: imgSrc, other: { x: 1 } };
      const clone = sut.objectClone(obj) as typeof obj;
      expect(clone.imageSrc).toBe(imgSrc);
    });

    it('should return non-object values as-is', () => {
      expect(sut.objectClone(42)).toBe(42);
      expect(sut.objectClone('str')).toBe('str');
      expect(sut.objectClone(null)).toBe(null);
      expect(sut.objectClone(undefined)).toBe(undefined);
    });

    it('should produce [object Object] when recursion limit reached', () => {
      const obj = { a: { b: { c: 1 } } };
      const clone = sut.objectClone(obj, 1) as Record<string, unknown>;
      expect((clone.a as Record<string, unknown>).b).toBe('[object Object]');
    });
  });

  // ==========================================================================
  // objectApply
  // ==========================================================================

  describe('objectApply', () => {
    it('should apply values from toObj to fromObj', () => {
      const fromObj: Record<string, unknown> = { a: 1 };
      const toObj = { b: 2 };
      const result = sut.objectApply(fromObj, toObj);
      expect(result.b).toBe(2);
    });

    it('should overwrite different values', () => {
      const fromObj: Record<string, unknown> = { a: 1 };
      const toObj = { a: 2 };
      sut.objectApply(fromObj, toObj);
      expect(fromObj.a).toBe(2);
    });

    it('should return fromObj when recursiveCalls is 0', () => {
      const fromObj: Record<string, unknown> = { a: 1 };
      const toObj = { b: 2 };
      const result = sut.objectApply(fromObj, toObj, 0);
      expect(result.b).toBeUndefined();
    });
  });

  // ==========================================================================
  // initial
  // ==========================================================================

  describe('initial', () => {
    it('should return array without last element', () => {
      const arr = [1, 2, 3];
      const result = sut.initial(arr);
      expect(result).toEqual([1, 2]);
    });

    it('should mutate the input array', () => {
      const arr = [1, 2, 3];
      sut.initial(arr);
      expect(arr).toEqual([1, 2]);
    });

    it('should return empty array for single element', () => {
      expect(sut.initial([1])).toEqual([]);
    });
  });

  // ==========================================================================
  // stringReplace
  // ==========================================================================

  describe('stringReplace', () => {
    it('should replace all occurrences of needle', () => {
      expect(sut.stringReplace('a', 'b', 'banana')).toBe('bbnbnb');
    });

    it('should return original when needle not found', () => {
      expect(sut.stringReplace('x', 'y', 'hello')).toBe('hello');
    });

    it('should handle empty needle', () => {
      const result = sut.stringReplace('', '-', 'ab');
      expect(result).toBe('-a-b-');
    });
  });

  // ==========================================================================
  // capitaliseFirstLetter
  // ==========================================================================

  describe('capitaliseFirstLetter', () => {
    it('should capitalize first letter', () => {
      expect(sut.capitaliseFirstLetter('hello')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(sut.capitaliseFirstLetter('a')).toBe('A');
    });

    it('should handle already capitalized string', () => {
      expect(sut.capitaliseFirstLetter('Hello')).toBe('Hello');
    });
  });

  // ==========================================================================
  // ldgZero
  // ==========================================================================

  describe('ldgZero', () => {
    it('should pad with leading zeros', () => {
      expect(sut.ldgZero(5, 3)).toBe('005');
    });

    it('should return original number string when already long enough', () => {
      expect(sut.ldgZero(123, 3)).toBe('123');
    });

    it('should handle zero', () => {
      expect(sut.ldgZero(0, 4)).toBe('0000');
    });
  });

  // ==========================================================================
  // mergeArrays
  // ==========================================================================

  describe('mergeArrays', () => {
    it('should merge arrays keeping unique elements', () => {
      expect(sut.mergeArrays([1, 2, 3], [2, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    it('should handle empty arrays', () => {
      expect(sut.mergeArrays([], [1, 2])).toEqual([1, 2]);
      expect(sut.mergeArrays([1, 2], [])).toEqual([1, 2]);
    });
  });

  // ==========================================================================
  // arraysGetUniqElements
  // ==========================================================================

  describe('arraysGetUniqElements', () => {
    it('should return elements unique to each array', () => {
      expect(sut.arraysGetUniqElements([1, 2, 3], [2, 3, 4])).toEqual([1, 4]);
    });

    it('should return all elements when no overlap', () => {
      expect(sut.arraysGetUniqElements([1, 2], [3, 4])).toEqual([1, 2, 3, 4]);
    });

    it('should return empty when arrays are identical', () => {
      expect(sut.arraysGetUniqElements([1, 2], [1, 2])).toEqual([]);
    });
  });

  // ==========================================================================
  // objectFlip
  // ==========================================================================

  describe('objectFlip', () => {
    it('should swap keys and values', () => {
      expect(sut.objectFlip({ a: 'x', b: 'y' })).toEqual({ x: 'a', y: 'b' });
    });

    it('should convert numeric values to string keys', () => {
      expect(sut.objectFlip({ a: 1, b: 2 })).toEqual({ '1': 'a', '2': 'b' });
    });
  });

  // ==========================================================================
  // getObjectSize
  // ==========================================================================

  describe('getObjectSize', () => {
    it('should return number of keys', () => {
      expect(sut.getObjectSize({ a: 1, b: 2, c: 3 })).toBe(3);
    });

    it('should return 0 for empty object', () => {
      expect(sut.getObjectSize({})).toBe(0);
    });
  });

  // ==========================================================================
  // checkDeepEqual
  // ==========================================================================

  describe('checkDeepEqual', () => {
    it('should return true for equal objects', () => {
      expect(sut.checkDeepEqual({ a: 1 }, { a: 1 })).toBe(true);
    });

    it('should return false for different objects', () => {
      expect(sut.checkDeepEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('should handle nested objects', () => {
      expect(sut.checkDeepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    });
  });

  // ==========================================================================
  // checkEqual
  // ==========================================================================

  describe('checkEqual', () => {
    it('should return true for objects with same keys in different order', () => {
      expect(sut.checkEqual({ b: 2, a: 1 }, { a: 1, b: 2 })).toBe(true);
    });

    it('should return false for different objects', () => {
      expect(sut.checkEqual({ a: 1 }, { a: 2 })).toBe(false);
    });
  });

  // ==========================================================================
  // checkArraysPartialEntry
  // ==========================================================================

  describe('checkArraysPartialEntry', () => {
    it('should return true when partial is subset of main', () => {
      expect(sut.checkArraysPartialEntry([1, 2, 3, 4], [2, 3])).toBe(true);
    });

    it('should return false when partial is not subset', () => {
      expect(sut.checkArraysPartialEntry([1, 2], [3, 4])).toBe(false);
    });

    it('should return false when main is null', () => {
      expect(sut.checkArraysPartialEntry(null, [1])).toBe(false);
    });

    it('should return false when partial is null', () => {
      expect(sut.checkArraysPartialEntry([1], null)).toBe(false);
    });
  });

  // ==========================================================================
  // reactive
  // ==========================================================================

  describe('reactive', () => {
    it('should call callback when property value is set', () => {
      const obj = { x: 10 };
      const cb = vi.fn();
      sut.reactive(obj, 'x', cb);
      obj.x = 20;
      expect(cb).toHaveBeenCalledWith(20);
    });

    it('should still allow reading the property', () => {
      const obj = { x: 10 };
      sut.reactive(obj, 'x', vi.fn());
      expect(obj.x).toBe(10);
      obj.x = 50;
      expect(obj.x).toBe(50);
    });

    it('should return false when no descriptor found', () => {
      const obj = Object.create(null);
      expect(sut.reactive(obj, 'missing', vi.fn())).toBe(false);
    });
  });

  // ==========================================================================
  // interpolate
  // ==========================================================================

  describe('interpolate', () => {
    it('should replace ${key} with value', () => {
      expect(sut.interpolate('Hello ${name}!', { name: 'World' })).toBe('Hello World!');
    });

    it('should handle multiple replacements', () => {
      expect(sut.interpolate('Bet ${bet} with Multi ${multi}', { bet: '12', multi: '13' })).toBe(
        'Bet 12 with Multi 13'
      );
    });

    it('should leave unreplaced placeholders', () => {
      expect(sut.interpolate('${a} and ${b}', { a: 'X' })).toBe('X and ${b}');
    });
  });

  // ==========================================================================
  // getRGB / getColor32
  // ==========================================================================

  describe('getRGB', () => {
    it('should extract RGB components from color number', () => {
      const rgb = sut.getRGB(0xff0000);
      expect(rgb.red).toBe(255);
      expect(rgb.green).toBe(0);
      expect(rgb.blue).toBe(0);
      expect(rgb.alpha).toBe(255);
    });

    it('should handle green color', () => {
      const rgb = sut.getRGB(0x00ff00);
      expect(rgb.red).toBe(0);
      expect(rgb.green).toBe(255);
      expect(rgb.blue).toBe(0);
    });

    it('should handle blue color', () => {
      const rgb = sut.getRGB(0x0000ff);
      expect(rgb.red).toBe(0);
      expect(rgb.green).toBe(0);
      expect(rgb.blue).toBe(255);
    });
  });

  describe('getColor32', () => {
    it('should combine ARGB values into 32-bit number', () => {
      const color = sut.getColor32(255, 255, 0, 0);
      expect(color).toBe((-1 << 24) | (255 << 16) | (0 << 8) | 0);
    });
  });

  // ==========================================================================
  // interpolateColor32
  // ==========================================================================

  describe('interpolateColor32', () => {
    it('should return startColor when both are equal', () => {
      expect(sut.interpolateColor32(0xff0000, 0xff0000, 0.5)).toBe(0xff0000);
    });

    it('should interpolate between two colors', () => {
      const result = sut.interpolateColor32(0x000000, 0xffffff, 0.5);
      expect(typeof result).toBe('number');
    });
  });

  // ==========================================================================
  // interpolateColorRGB
  // ==========================================================================

  describe('interpolateColorRGB', () => {
    it('should interpolate RGB values at step 0', () => {
      const result = sut.interpolateColorRGB(
        { red: 0, green: 0, blue: 0 },
        { red: 100, green: 200, blue: 50 },
        0
      );
      expect(result.red).toBe(0);
      expect(result.green).toBe(0);
      expect(result.blue).toBe(0);
    });

    it('should interpolate RGB values at step 1', () => {
      const result = sut.interpolateColorRGB(
        { red: 0, green: 0, blue: 0 },
        { red: 100, green: 200, blue: 50 },
        1
      );
      expect(result.red).toBe(100);
      expect(result.green).toBe(200);
      expect(result.blue).toBe(50);
    });

    it('should interpolate RGB values at step 0.5', () => {
      const result = sut.interpolateColorRGB(
        { red: 0, green: 0, blue: 0 },
        { red: 100, green: 200, blue: 50 },
        0.5
      );
      expect(result.red).toBe(50);
      expect(result.green).toBe(100);
      expect(result.blue).toBe(25);
    });
  });

  // ==========================================================================
  // getLengthBy2Points
  // ==========================================================================

  describe('getLengthBy2Points', () => {
    it('should calculate distance between two points', () => {
      expect(sut.getLengthBy2Points({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    });

    it('should return 0 for same point', () => {
      expect(sut.getLengthBy2Points({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
    });
  });

  // ==========================================================================
  // getAngleBy3Points
  // ==========================================================================

  describe('getAngleBy3Points', () => {
    it('should return 0 when points overlap (a=0 or b=0)', () => {
      expect(sut.getAngleBy3Points({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
    });

    it('should calculate angle for right angle triangle', () => {
      const angle = sut.getAngleBy3Points({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 });
      expect(angle).toBeCloseTo(Math.PI / 2, 5);
    });
  });

  // ==========================================================================
  // getRadian / getAngle
  // ==========================================================================

  describe('getRadian', () => {
    it('should convert degrees to radians', () => {
      expect(sut.getRadian(180)).toBeCloseTo(Math.PI, 10);
    });

    it('should convert 90 degrees', () => {
      expect(sut.getRadian(90)).toBeCloseTo(Math.PI / 2, 10);
    });
  });

  describe('getAngle', () => {
    it('should convert radians to degrees', () => {
      expect(sut.getAngle(Math.PI)).toBeCloseTo(180, 10);
    });

    it('should convert pi/2 radians', () => {
      expect(sut.getAngle(Math.PI / 2)).toBeCloseTo(90, 10);
    });
  });

  // ==========================================================================
  // rowsToCols / transpose
  // ==========================================================================

  describe('rowsToCols', () => {
    it('should transpose a matrix', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
      ];
      expect(sut.rowsToCols(matrix)).toEqual([
        [1, 4],
        [2, 5],
        [3, 6],
      ]);
    });
  });

  describe('transpose', () => {
    it('should transpose a matrix', () => {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      expect(sut.transpose(matrix)).toEqual([
        [1, 3],
        [2, 4],
      ]);
    });
  });

  // ==========================================================================
  // renameObjectsKey
  // ==========================================================================

  describe('renameObjectsKey', () => {
    it('should rename a key', () => {
      const obj: Record<string, unknown> = { old: 'value' };
      sut.renameObjectsKey(obj, 'old', 'new');
      expect(obj.new).toBe('value');
      expect(obj.old).toBeUndefined();
    });

    it('should do nothing when oldKey equals newKey', () => {
      const obj: Record<string, unknown> = { same: 'value' };
      sut.renameObjectsKey(obj, 'same', 'same');
      expect(obj.same).toBe('value');
    });
  });

  // ==========================================================================
  // mobileAndTabletCheck
  // ==========================================================================

  describe('mobileAndTabletCheck', () => {
    it('should return false for desktop user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        configurable: true,
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true,
      });
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });
      expect(sut.mobileAndTabletCheck()).toBe(false);
    });

    it('should return true for mobile user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        configurable: true,
      });
      expect(sut.mobileAndTabletCheck()).toBe(true);
    });
  });

  // ==========================================================================
  // isIpadOS
  // ==========================================================================

  describe('isIpadOS', () => {
    it('should return true when maxTouchPoints > 2 and MacIntel platform', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true,
      });
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });
      expect(sut.isIpadOS()).toBe(true);
    });

    it('should return false when maxTouchPoints <= 2', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 1,
        configurable: true,
      });
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });
      expect(sut.isIpadOS()).toBe(false);
    });
  });

  // ==========================================================================
  // logicBlocksDo
  // ==========================================================================

  describe('logicBlocksDo', () => {
    it('should create logicBlocksInstances on first call', () => {
      const mockInstance = {
        testFunc: vi.fn(() => 'result'),
      };
      const entity = {
        _logicBlocks: { block1: 'test' },
        getInstance: vi.fn(() => mockInstance),
      };

      const results = sut.logicBlocksDo(entity, 'testFunc', 'arg1');
      expect(entity.getInstance).toHaveBeenCalledWith('Test');
      expect(results).toEqual(['result']);
    });

    it('should reuse existing logicBlocksInstances on subsequent calls', () => {
      const mockInstance = {
        testFunc: vi.fn(() => 'result'),
      };
      const entity = {
        _logicBlocks: { block1: 'test' },
        _logicBlocksInstances: { test: mockInstance },
        getInstance: vi.fn(),
      };

      sut.logicBlocksDo(entity, 'testFunc');
      expect(entity.getInstance).not.toHaveBeenCalled();
    });

    it('should skip blocks without the requested function', () => {
      const entity = {
        _logicBlocks: { block1: 'test' },
        _logicBlocksInstances: { test: {} },
        getInstance: vi.fn(),
      };

      const results = sut.logicBlocksDo(entity, 'nonExistent');
      expect(results).toEqual([]);
    });
  });

  // ==========================================================================
  // parseGetParams
  // ==========================================================================

  describe('parseGetParams', () => {
    it('should return empty object when no query string', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://example.com' },
        writable: true,
        configurable: true,
      });
      expect(sut.parseGetParams()).toEqual({});
    });

    it('should parse query string parameters', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://example.com?foo=bar&baz=qux' },
        writable: true,
        configurable: true,
      });
      expect(sut.parseGetParams()).toEqual({ foo: 'bar', baz: 'qux' });
    });

    it('should return specific parameter by name', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://example.com?name=test' },
        writable: true,
        configurable: true,
      });
      expect(sut.parseGetParams('name')).toBe('test');
    });

    it('should return undefined for missing parameter', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://example.com?name=test' },
        writable: true,
        configurable: true,
      });
      expect(sut.parseGetParams('missing')).toBeUndefined();
    });

    it('should handle parameter without value', () => {
      Object.defineProperty(window, 'location', {
        value: { href: 'http://example.com?flag' },
        writable: true,
        configurable: true,
      });
      expect(sut.parseGetParams()).toEqual({ flag: '' });
    });
  });

  // ==========================================================================
  // waitForDomElement
  // ==========================================================================

  describe('waitForDomElement', () => {
    it('should resolve immediately if element exists', async () => {
      const div = document.createElement('div');
      div.className = 'test-element';
      document.body.appendChild(div);

      const result = await sut.waitForDomElement('.test-element');
      expect(result).toBe(div);

      document.body.removeChild(div);
    });

    it('should wait for element to appear', async () => {
      const promise = sut.waitForDomElement('.delayed-element');

      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'delayed-element';
        document.body.appendChild(div);
      }, 10);

      const result = await promise;
      expect(result.className).toBe('delayed-element');

      document.body.removeChild(result);
    });
  });
});
