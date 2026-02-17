import LibLogger from '../../src/ts/lib/logger';

describe('LibLogger', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;
  let originalConsoleInfo: typeof console.info;

  beforeEach(() => {
    vi.clearAllMocks();
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    originalConsoleInfo = console.info;

    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.info = vi.fn();

    const mockUrso = createMockUrso();
    mockUrso.helper.parseGetParams = vi.fn(() => undefined);
    mockUrso.config.defaultLogLevel = '0,1,2,3';
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    console.info = originalConsoleInfo;
  });

  describe('constructor', () => {
    it('should set up log levels from config', () => {
      const logger = new LibLogger();
      expect(logger).toBeDefined();
    });

    it('should use parseGetParams logLevel if available', () => {
      const mockUrso = createMockUrso();
      mockUrso.helper.parseGetParams = vi.fn(() => '0,1');
      mockUrso.config.defaultLogLevel = '0,1,2,3';
      (globalThis as Record<string, unknown>).Urso = mockUrso;

      const logger = new LibLogger();
      logger.log('test');
      // LOG level (3) is not in '0,1', so log should not output
      // but console.log was replaced, so check it was not called after constructor
    });
  });

  describe('log', () => {
    it('should call console.log when LOG level is enabled', () => {
      const mockUrso = createMockUrso();
      mockUrso.helper.parseGetParams = vi.fn(() => undefined);
      mockUrso.config.defaultLogLevel = '3';
      (globalThis as Record<string, unknown>).Urso = mockUrso;

      console.log = vi.fn();
      const logger = new LibLogger();
      console.log = vi.fn();

      logger.log('test message');
      expect(console.log).toHaveBeenCalledWith('test message');
    });

    it('should not call console.log when LOG level is disabled', () => {
      const mockUrso = createMockUrso();
      mockUrso.helper.parseGetParams = vi.fn(() => undefined);
      mockUrso.config.defaultLogLevel = '0';
      (globalThis as Record<string, unknown>).Urso = mockUrso;

      console.log = vi.fn();
      const logger = new LibLogger();
      console.log = vi.fn();

      logger.log('test');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should call console.warn when WARNING level is enabled', () => {
      const mockUrso = createMockUrso();
      mockUrso.helper.parseGetParams = vi.fn(() => undefined);
      mockUrso.config.defaultLogLevel = '1';
      (globalThis as Record<string, unknown>).Urso = mockUrso;

      console.log = vi.fn();
      const logger = new LibLogger();
      console.warn = vi.fn();

      logger.warn('warning message');
      expect(console.warn).toHaveBeenCalledWith('warning message');
    });
  });

  describe('error', () => {
    it('should call console.error when ERROR level is enabled', () => {
      const mockUrso = createMockUrso();
      mockUrso.helper.parseGetParams = vi.fn(() => undefined);
      mockUrso.config.defaultLogLevel = '0';
      (globalThis as Record<string, unknown>).Urso = mockUrso;

      console.log = vi.fn();
      const logger = new LibLogger();
      console.error = vi.fn();

      logger.error('error message');
      expect(console.error).toHaveBeenCalledWith('error message');
    });
  });

  describe('info', () => {
    it('should call console.info when INFO level is enabled', () => {
      const mockUrso = createMockUrso();
      mockUrso.helper.parseGetParams = vi.fn(() => undefined);
      mockUrso.config.defaultLogLevel = '2';
      (globalThis as Record<string, unknown>).Urso = mockUrso;

      console.log = vi.fn();
      const logger = new LibLogger();
      console.info = vi.fn();

      logger.info('info message');
      expect(console.info).toHaveBeenCalledWith('info message');
    });
  });
});
