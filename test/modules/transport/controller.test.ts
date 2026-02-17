import ModulesTransportController from '../../../src/ts/modules/transport/controller';

describe('ModulesTransportController', () => {
  let mockService: {
    init: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    reconnect: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockService = {
      init: vi.fn(),
      on: vi.fn(),
      send: vi.fn(),
      reconnect: vi.fn(),
      close: vi.fn(),
    };

    ModulesTransportController.prototype.getInstance = vi.fn(() => mockService) as ModulesTransportController['getInstance'];
  });

  afterEach(() => {
    delete (ModulesTransportController.prototype as { getInstance?: unknown }).getInstance;
  });

  describe('init', () => {
    it('should update service and call init', () => {
      const sut = new ModulesTransportController();
      sut.init();
      expect(sut.getInstance).toHaveBeenCalledWith('Service');
      expect(mockService.init).toHaveBeenCalled();
    });
  });

  describe('handler setters', () => {
    it('setOnConnectionHandler should register connection handler', () => {
      const sut = new ModulesTransportController();
      sut.init();
      const handler = vi.fn();
      sut.setOnConnectionHandler(handler);
      expect(mockService.on).toHaveBeenCalledWith('connection', handler);
    });

    it('setReadyHandler should register ready handler', () => {
      const sut = new ModulesTransportController();
      sut.init();
      const handler = vi.fn();
      sut.setReadyHandler(handler);
      expect(mockService.on).toHaveBeenCalledWith('ready', handler);
    });

    it('setErrorHandler should register error handler', () => {
      const sut = new ModulesTransportController();
      sut.init();
      const handler = vi.fn();
      sut.setErrorHandler(handler);
      expect(mockService.on).toHaveBeenCalledWith('error', handler);
    });

    it('setResponseHandler should register response handler', () => {
      const sut = new ModulesTransportController();
      sut.init();
      const handler = vi.fn();
      sut.setResponseHandler(handler);
      expect(mockService.on).toHaveBeenCalledWith('response', handler);
    });

    it('setOnCloseHandler should register close handler', () => {
      const sut = new ModulesTransportController();
      sut.init();
      const handler = vi.fn();
      sut.setOnCloseHandler(handler);
      expect(mockService.on).toHaveBeenCalledWith('close', handler);
    });
  });

  describe('send', () => {
    it('should delegate to service', () => {
      const sut = new ModulesTransportController();
      sut.init();
      sut.send({ action: 'spin', data: {} });
      expect(mockService.send).toHaveBeenCalledWith({ action: 'spin', data: {} });
    });
  });

  describe('reconnect', () => {
    it('should delegate to service', () => {
      const sut = new ModulesTransportController();
      sut.init();
      sut.reconnect();
      expect(mockService.reconnect).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should delegate to service', () => {
      const sut = new ModulesTransportController();
      sut.init();
      sut.close();
      expect(mockService.close).toHaveBeenCalled();
    });
  });
});
