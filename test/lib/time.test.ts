import LibTime from '../../src/ts/lib/time';

describe('LibTime', () => {
  let sut: LibTime;

  beforeEach(() => {
    sut = new LibTime();
  });

  describe('get', () => {
    it('should return current time in milliseconds when no date provided', () => {
      const before = Date.now();
      const result = sut.get();
      const after = Date.now();
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });

    it('should return time from provided date', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      expect(sut.get(date)).toBe(date.getTime());
    });
  });

  describe('getUnixtime', () => {
    it('should return current unix timestamp in seconds', () => {
      const before = Math.floor(Date.now() / 1000);
      const result = sut.getUnixtime();
      const after = Math.floor(Date.now() / 1000);
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });

    it('should return unix timestamp from provided date', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      expect(sut.getUnixtime(date)).toBe(Math.floor(date.getTime() / 1000));
    });

    it('should truncate milliseconds (integer result)', () => {
      const result = sut.getUnixtime();
      expect(Number.isInteger(result)).toBe(true);
    });
  });
});
