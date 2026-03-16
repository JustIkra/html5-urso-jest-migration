import ModulesObserverEvents from '../../../src/ts/modules/observer/events';
import { UrsoEvent } from '../../../src/ts/types';

describe('ModulesObserverEvents', () => {
  let sut: ModulesObserverEvents;

  beforeEach(() => {
    sut = new ModulesObserverEvents();
  });

  it('should have a list with 37+ keys', () => {
    const keys = Object.keys(sut.list);
    expect(keys.length).toBeGreaterThanOrEqual(37);
  });

  it('should map every key to a dot-delimited string', () => {
    const values = Object.values(sut.list);
    for (const value of values) {
      expect(typeof value).toBe('string');
      expect(value).toContain('.');
    }
  });

  it('should have all keys and values matching the UrsoEvent enum', () => {
    expect(sut.list).toEqual(UrsoEvent);
  });

  it('should have no duplicate values', () => {
    const values = Object.values(sut.list);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it('should have singleton set to true', () => {
    expect(sut.singleton).toBe(true);
  });
});
