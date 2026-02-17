import ConfigMain from '../../src/ts/config/main';

describe('ConfigMain', () => {
  it('should have title Urso', () => {
    expect(ConfigMain.title).toBe('Urso');
  });

  it('should have appVersion 0', () => {
    expect(ConfigMain.appVersion).toBe(0);
  });

  it('should have mode development', () => {
    expect(ConfigMain.mode).toBe('development');
  });

  it('should have default log level with all levels', () => {
    expect(ConfigMain.defaultLogLevel).toBe('ERROR,WARNING,INFO,LOG');
  });

  it('should have extendingChain with Urso.Core', () => {
    expect(ConfigMain.extendingChain).toEqual(['Urso.Core']);
  });

  it('should have defaultScene play', () => {
    expect(ConfigMain.defaultScene).toBe('play');
  });

  it('should have empty gamePath', () => {
    expect(ConfigMain.gamePath).toBe('');
  });

  it('should have useBinPath false', () => {
    expect(ConfigMain.useBinPath).toBe(false);
  });

  it('should have useTransport false', () => {
    expect(ConfigMain.useTransport).toBe(false);
  });

  it('should have fps config', () => {
    expect(ConfigMain.fps).toEqual({
      limit: 60,
      optimizeLowPerformance: false,
    });
  });
});
