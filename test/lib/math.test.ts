import LibMath from '../../src/ts/lib/math';

describe('LibMath', () => {
  let sut: LibMath;

  beforeEach(() => {
    sut = new LibMath();
  });

  describe('intMakeBetween', () => {
    it('should return num when within range', () => {
      expect(sut.intMakeBetween(5, 0, 10)).toBe(5);
    });

    it('should clamp to min when below range', () => {
      expect(sut.intMakeBetween(-5, 0, 10)).toBe(0);
    });

    it('should clamp to max when above range', () => {
      expect(sut.intMakeBetween(15, 0, 10)).toBe(10);
    });

    it('should return min when num equals min', () => {
      expect(sut.intMakeBetween(0, 0, 10)).toBe(0);
    });

    it('should return max when num equals max', () => {
      expect(sut.intMakeBetween(10, 0, 10)).toBe(10);
    });
  });

  describe('getRandomInt', () => {
    it('should return integer between 0 and max', () => {
      for (let i = 0; i < 50; i++) {
        const result = sut.getRandomInt(10);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('getRandomIntBetween', () => {
    it('should return integer between min and max', () => {
      for (let i = 0; i < 50; i++) {
        const result = sut.getRandomIntBetween(5, 10);
        expect(result).toBeGreaterThanOrEqual(5);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('roundToDigits', () => {
    it('should round to specified digits', () => {
      expect(sut.roundToDigits(3.14159, 2)).toBe(3.14);
    });

    it('should round to zero digits', () => {
      expect(sut.roundToDigits(3.7, 0)).toBe(4);
    });

    it('should return null for NaN num', () => {
      expect(sut.roundToDigits(NaN, 2)).toBeNoValue();
    });

    it('should return null for NaN digits', () => {
      expect(sut.roundToDigits(3.14, NaN)).toBeNoValue();
    });
  });

  describe('isInt', () => {
    it('should return true for integer', () => {
      expect(sut.isInt(5)).toBe(true);
    });

    it('should return false for float', () => {
      expect(sut.isInt(5.5)).toBe(false);
    });

    it('should return false for string', () => {
      expect(sut.isInt('5')).toBe(false);
    });

    it('should return true for zero', () => {
      expect(sut.isInt(0)).toBe(true);
    });
  });

  describe('isFloat', () => {
    it('should return true for float', () => {
      expect(sut.isFloat(5.5)).toBe(true);
    });

    it('should return false for integer', () => {
      expect(sut.isFloat(5)).toBe(false);
    });

    it('should return false for string', () => {
      expect(sut.isFloat('5.5')).toBe(false);
    });
  });

  describe('getDecimalsLength', () => {
    it('should return number of decimal places', () => {
      expect(sut.getDecimalsLength(3.14)).toBe(2);
    });

    it('should return 0 for integer', () => {
      expect(sut.getDecimalsLength(5)).toBe(0);
    });

    it('should handle long decimals', () => {
      expect(sut.getDecimalsLength(1.12345)).toBe(5);
    });
  });

  describe('multiplyFloats', () => {
    it('should multiply floats with precision', () => {
      expect(sut.multiplyFloats([0.1, 0.2])).toBe(0.02);
    });

    it('should multiply integers normally', () => {
      expect(sut.multiplyFloats([2, 3])).toBe(6);
    });
  });

  describe('addFloats', () => {
    it('should add floats with precision', () => {
      expect(sut.addFloats([0.1, 0.2])).toBe(0.3);
    });

    it('should add integers normally', () => {
      expect(sut.addFloats([1, 2, 3])).toBe(6);
    });
  });

  describe('subtractFloats', () => {
    it('should subtract floats with precision', () => {
      expect(sut.subtractFloats([0.3, 0.1])).toBe(0.2);
    });

    it('should subtract integers normally', () => {
      expect(sut.subtractFloats([10, 3])).toBe(7);
    });
  });

  describe('getMaxDecimalsLength', () => {
    it('should return max decimal length', () => {
      expect(sut.getMaxDecimalsLength([1.1, 2.22, 3.333])).toBe(3);
    });

    it('should return 0 for integers', () => {
      expect(sut.getMaxDecimalsLength([1, 2, 3])).toBe(0);
    });

    it('should handle zero values', () => {
      expect(sut.getMaxDecimalsLength([0, 1.5])).toBe(1);
    });
  });
});
