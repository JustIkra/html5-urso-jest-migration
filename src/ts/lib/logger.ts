const LEVELS: readonly string[] = ['ERROR', 'WARNING', 'INFO', 'LOG'];

class LibLogger {
  private _logLevel: Record<string, boolean> = {};

  constructor() {
    this._setupLevels();

    if (this._logLevel['LOG']) {
      window.log = console.log.bind(console);
    } else {
      window.log = () => {};
      console.log = () => {};
    }
  }

  public log(...args: unknown[]): void {
    if (!this._logLevel['LOG']) return;
    console.log(...args);
  }

  public info(...args: unknown[]): void {
    if (!this._logLevel['INFO']) return;
    console.info(...args);
  }

  public warn(...args: unknown[]): void {
    if (!this._logLevel['WARNING']) return;
    console.warn(...args);
  }

  public error(...args: unknown[]): void {
    if (!this._logLevel['ERROR']) return;
    console.error(...args);
  }

  private _setupLevels(): void {
    const logLevelsString =
      (Urso.helper.parseGetParams('logLevel') as string | undefined) ||
      (Urso.config.defaultLogLevel as string);
    const logLevelsArray = logLevelsString.split(',');

    for (const [index, level] of Object.entries(LEVELS)) {
      let levelValue = false;

      if (logLevelsArray.includes(index) || logLevelsArray.includes(level)) {
        levelValue = true;
      }

      this._logLevel[level] = levelValue;
    }

    console.log(`LibLogger log Level: ${JSON.stringify(this._logLevel)}`);
  }
}

export default LibLogger;
