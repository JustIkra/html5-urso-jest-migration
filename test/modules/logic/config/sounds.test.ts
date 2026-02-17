import ModulesLogicConfigSounds from '../../../../src/ts/modules/logic/config/sounds';

describe('ModulesLogicConfigSounds', () => {
  it('should be a singleton', () => {
    const sut = new ModulesLogicConfigSounds();
    expect(sut.singleton).toBe(true);
  });

  it('should have soundsConfig', () => {
    const sut = new ModulesLogicConfigSounds();
    expect(sut.soundsConfig).toBeDefined();
  });

  it('should have main config with sound entries', () => {
    const sut = new ModulesLogicConfigSounds();
    expect(sut.soundsConfig.main).toBeDefined();
    expect(sut.soundsConfig.main.length).toBeGreaterThan(0);
  });

  it('should have sound1 play entry', () => {
    const sut = new ModulesLogicConfigSounds();
    const entry = sut.soundsConfig.main.find(e => e.soundKey === 'sound1');
    expect(entry).toBeDefined();
    expect(entry!.action).toBe('play');
  });

  it('should have sound_check entries with various actions', () => {
    const sut = new ModulesLogicConfigSounds();
    const checkEntries = sut.soundsConfig.main.filter(e => e.soundKey === 'sound_check');
    expect(checkEntries.length).toBe(5);
    const actions = checkEntries.map(e => e.action);
    expect(actions).toContain('play');
    expect(actions).toContain('stop');
    expect(actions).toContain('pause');
    expect(actions).toContain('resume');
  });

  it('should have loop entry with relaunch and loop flags', () => {
    const sut = new ModulesLogicConfigSounds();
    const loopEntry = sut.soundsConfig.main.find(e => e.loop === true);
    expect(loopEntry).toBeDefined();
    expect(loopEntry!.relaunch).toBe(true);
    expect(loopEntry!.loop).toBe(true);
  });

  it('should return same config from getSoundsConfig', () => {
    const sut = new ModulesLogicConfigSounds();
    const config = sut.getSoundsConfig();
    expect(config).toEqual(sut.soundsConfig);
  });
});
