import ModulesStatesManagerConfigStates from '../../../src/ts/modules/statesManager/configStates';

describe('ModulesStatesManagerConfigStates', () => {
  it('should be a singleton', () => {
    const sut = new ModulesStatesManagerConfigStates();
    expect(sut.singleton).toBe(true);
  });

  it('should have contents property', () => {
    const sut = new ModulesStatesManagerConfigStates();
    expect(sut.contents).toBeDefined();
    expect(typeof sut.contents).toBe('object');
  });

  it('should return contents via get()', () => {
    const sut = new ModulesStatesManagerConfigStates();
    expect(sut.get()).toBe(sut.contents);
  });

  it('should have START_GAME with callLimit and nextState', () => {
    const sut = new ModulesStatesManagerConfigStates();
    const startGame = sut.contents.START_GAME;
    expect(startGame).toBeDefined();
    expect(startGame.callLimit).toBe(1);
    expect(startGame.nextState).toEqual(['IDLE']);
  });

  it('should have states with different action types (all, race, sequence)', () => {
    const sut = new ModulesStatesManagerConfigStates();
    // SPIN_START uses all
    expect('all' in sut.contents.SPIN_START).toBe(true);
    // GAMBLE uses race
    expect('race' in sut.contents.GAMBLE).toBe(true);
    // PICK_GAME1 uses sequence
    expect('sequence' in sut.contents.PICK_GAME1).toBe(true);
  });

  it('should have nested composite actions in UPDATE_BALANCE', () => {
    const sut = new ModulesStatesManagerConfigStates();
    const updateBalance = sut.contents.UPDATE_BALANCE;
    expect('race' in updateBalance).toBe(true);
  });
});
