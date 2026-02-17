import ModulesTransportConnectionTypesWebsocket from '../../../../src/ts/modules/transport/connectionTypes/websocket';

describe('ModulesTransportConnectionTypesWebsocket', () => {
  let mockSocket: {
    close: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    onopen: ((ev: Event) => void) | null;
    onmessage: ((ev: MessageEvent) => void) | null;
    onerror: ((ev: Event) => void) | null;
    onclose: ((ev: Event) => void) | null;
  };

  beforeEach(() => {
    mockSocket = {
      close: vi.fn(),
      send: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };

    (globalThis as Record<string, unknown>).WebSocket = vi.fn(() => mockSocket);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a WebSocket on construction', () => {
    const sut = new ModulesTransportConnectionTypesWebsocket({ callbacks: {}, host: 'ws://test' });
    expect(globalThis.WebSocket).toHaveBeenCalledWith('ws://test');
  });

  it('should set onopen/onmessage/onerror/onclose handlers', () => {
    const sut = new ModulesTransportConnectionTypesWebsocket({ callbacks: {}, host: 'ws://test' });
    expect(mockSocket.onopen).toBeDefined();
    expect(mockSocket.onmessage).toBeDefined();
    expect(mockSocket.onerror).toBeDefined();
    expect(mockSocket.onclose).toBeDefined();
  });

  it('should become ready on open and call ready callback', () => {
    const readyCb = vi.fn();
    const sut = new ModulesTransportConnectionTypesWebsocket({ callbacks: { ready: readyCb }, host: 'ws://test' });
    mockSocket.onopen!(new Event('open'));
    expect(sut.readyCheck()).toBe(true);
    expect(readyCb).toHaveBeenCalled();
  });

  it('should call response callback on message', () => {
    const responseCb = vi.fn();
    const sut = new ModulesTransportConnectionTypesWebsocket({ callbacks: { response: responseCb }, host: 'ws://test' });
    mockSocket.onmessage!(new MessageEvent('message', { data: '{"action":"test"}' }));
    expect(responseCb).toHaveBeenCalledWith('{"action":"test"}');
  });

  it('should call error callback and set not ready on error', () => {
    const errorCb = vi.fn();
    const sut = new ModulesTransportConnectionTypesWebsocket({ callbacks: { error: errorCb }, host: 'ws://test' });
    mockSocket.onopen!(new Event('open'));
    expect(sut.readyCheck()).toBe(true);
    mockSocket.onerror!(new Event('error'));
    expect(sut.readyCheck()).toBe(false);
    expect(errorCb).toHaveBeenCalled();
  });

  it('should call close callback and set not ready on close', () => {
    const closeCb = vi.fn();
    const sut = new ModulesTransportConnectionTypesWebsocket({ callbacks: { close: closeCb }, host: 'ws://test' });
    mockSocket.onopen!(new Event('open'));
    mockSocket.onclose!(new Event('close'));
    expect(sut.readyCheck()).toBe(false);
    expect(closeCb).toHaveBeenCalled();
  });

  describe('close', () => {
    it('should close the socket', () => {
      const sut = new ModulesTransportConnectionTypesWebsocket({ callbacks: {}, host: 'ws://test' });
      sut.close();
      expect(mockSocket.close).toHaveBeenCalled();
    });
  });

  describe('send', () => {
    it('should stringify and send message', () => {
      const sut = new ModulesTransportConnectionTypesWebsocket({ callbacks: {}, host: 'ws://test' });
      sut.send({ action: 'spin', data: {} });
      expect(mockSocket.send).toHaveBeenCalledWith('{"action":"spin","data":{}}');
    });
  });

  describe('reconnect', () => {
    it('should close existing connection and create new one after delay', () => {
      vi.useFakeTimers();
      const sut = new ModulesTransportConnectionTypesWebsocket({ callbacks: {}, host: 'ws://test' });
      mockSocket.onopen!(new Event('open'));
      const initialCallCount = (globalThis.WebSocket as unknown as ReturnType<typeof vi.fn>).mock.calls.length;

      sut.reconnect(1000);
      expect(mockSocket.close).toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect((globalThis.WebSocket as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(initialCallCount);
      vi.useRealTimers();
    });
  });
});
