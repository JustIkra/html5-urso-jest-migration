import ModulesTransportService from '../../../src/ts/modules/transport/service';

describe('ModulesTransportService', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;
  let mockCommunicator: {
    readyCheck: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    reconnect: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };
  let mockDecorator: {
    toServer: ReturnType<typeof vi.fn>;
    toFront: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;

    mockCommunicator = {
      readyCheck: vi.fn(() => true),
      send: vi.fn(),
      reconnect: vi.fn(),
      close: vi.fn(),
    };

    mockDecorator = {
      toServer: vi.fn((msg: unknown) => msg),
      toFront: vi.fn((msg: unknown) => msg),
    };

    ModulesTransportService.prototype.getInstance = vi.fn((path: string) => {
      if (path === 'Config') return { getConfig: () => ({ autoReconnect: true, reconnectTimeout: 5000, type: 'websocket', host: 'ws://test' }) };
      if (path === 'Decorator') return mockDecorator;
      if (path.startsWith('ConnectionTypes.')) return mockCommunicator;
      return {};
    }) as ModulesTransportService['getInstance'];
  });

  afterEach(() => {
    delete (ModulesTransportService.prototype as { getInstance?: unknown }).getInstance;
  });

  it('should load config in constructor', () => {
    const sut = new ModulesTransportService();
    expect(sut['_config'].type).toBe('websocket');
    expect(sut['_config'].host).toBe('ws://test');
  });

  describe('on', () => {
    it('should set callback for event', () => {
      const sut = new ModulesTransportService();
      const handler = vi.fn();
      sut.on('ready', handler);
      expect(sut['_callbacks'].ready).toBeDefined();
    });

    it('should warn on overwrite', () => {
      const sut = new ModulesTransportService();
      sut.on('ready', vi.fn());
      sut.on('ready', vi.fn());
      expect(mockUrso.logger.error).toHaveBeenCalledWith(expect.stringContaining('Overwrite ready event'));
    });

    it('should allow force overwrite', () => {
      const sut = new ModulesTransportService();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      sut.on('ready', handler1);
      sut.on('ready', handler2, true);
      // Should not throw, force flag allows overwrite
    });
  });

  describe('init', () => {
    it('should create connection', () => {
      const sut = new ModulesTransportService();
      sut.init();
      expect(sut.getInstance).toHaveBeenCalledWith('ConnectionTypes.Websocket', expect.anything());
    });
  });

  describe('send', () => {
    it('should send decorated and validated message', () => {
      const sut = new ModulesTransportService();
      sut.init();
      const result = sut.send({ action: 'spin', data: {} });
      expect(mockDecorator.toServer).toHaveBeenCalledWith({ action: 'spin', data: {} });
      expect(mockCommunicator.send).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when communicator not ready', () => {
      mockCommunicator.readyCheck.mockReturnValue(false);
      const sut = new ModulesTransportService();
      sut.init();
      expect(sut.send({ action: 'spin', data: {} })).toBe(false);
    });

    it('should return false when decorator returns null', () => {
      mockDecorator.toServer.mockReturnValue(null);
      const sut = new ModulesTransportService();
      sut.init();
      expect(sut.send({ action: 'spin', data: {} })).toBe(false);
    });

    it('should return false when no communicator exists', () => {
      const sut = new ModulesTransportService();
      // Don't call init()
      expect(sut.send({ action: 'spin', data: {} })).toBe(false);
      expect(mockUrso.logger.error).toHaveBeenCalledWith('Communicator was not created!');
    });
  });

  describe('reconnect', () => {
    it('should reconnect communicator', () => {
      const sut = new ModulesTransportService();
      sut.init();
      expect(sut.reconnect()).toBe(true);
      expect(mockCommunicator.reconnect).toHaveBeenCalled();
    });

    it('should return false when not ready', () => {
      mockCommunicator.readyCheck.mockReturnValue(false);
      const sut = new ModulesTransportService();
      sut.init();
      expect(sut.reconnect()).toBe(false);
    });
  });

  describe('close', () => {
    it('should close communicator', () => {
      const sut = new ModulesTransportService();
      sut.init();
      expect(sut.close()).toBe(true);
      expect(mockCommunicator.close).toHaveBeenCalled();
    });

    it('should return false when not ready', () => {
      mockCommunicator.readyCheck.mockReturnValue(false);
      const sut = new ModulesTransportService();
      sut.init();
      expect(sut.close()).toBe(false);
    });
  });

  describe('_validateMessage', () => {
    it('should return shallow copy of message', () => {
      const sut = new ModulesTransportService();
      const msg = { action: 'test', data: { value: 1 } };
      const result = sut._validateMessage(msg);
      expect(result).toEqual(msg);
      expect(result).not.toBe(msg);
    });
  });

  describe('_destroyCommunicator', () => {
    it('should set communicator to null', () => {
      const sut = new ModulesTransportService();
      sut.init();
      sut._destroyCommunicator();
      expect(sut['_communicator']).toBeNull();
    });
  });

  describe('_runMiddleWare', () => {
    it('should decorate response messages', () => {
      const sut = new ModulesTransportService();
      sut.init();
      const result = sut._runMiddleWare('response', { action: 'result', data: {} });
      expect(mockDecorator.toFront).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should return undefined when decorator returns null for response', () => {
      mockDecorator.toFront.mockReturnValue(null);
      const sut = new ModulesTransportService();
      sut.init();
      const result = sut._runMiddleWare('response', {});
      expect(result).toBeUndefined();
    });

    it('should attempt reconnect on error/close events', () => {
      const sut = new ModulesTransportService();
      sut.init();
      sut._runMiddleWare('error', {});
      expect(mockCommunicator.reconnect).toHaveBeenCalled();
    });

    it('should pass through data for unknown events', () => {
      const sut = new ModulesTransportService();
      const data = { test: true };
      expect(sut._runMiddleWare('custom', data)).toBe(data);
    });
  });
});
