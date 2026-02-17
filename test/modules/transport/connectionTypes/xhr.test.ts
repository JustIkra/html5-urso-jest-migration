import ModulesTransportConnectionTypesXhr from '../../../../src/ts/modules/transport/connectionTypes/xhr';

describe('ModulesTransportConnectionTypesXhr', () => {
  let mockXhr: {
    open: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    onerror: ((ev: Event) => void) | null;
    onreadystatechange: ((ev: Event) => void) | null;
    readyState: number;
    response: string;
  };

  beforeEach(() => {
    mockXhr = {
      open: vi.fn(),
      send: vi.fn(),
      onerror: null,
      onreadystatechange: null,
      readyState: 0,
      response: '',
    };

    (globalThis as Record<string, unknown>).XMLHttpRequest = vi.fn(() => mockXhr);
  });

  it('should start ready immediately', () => {
    const sut = new ModulesTransportConnectionTypesXhr({ callbacks: {}, host: 'http://test' });
    expect(sut.readyCheck()).toBe(true);
  });

  it('should call ready callback on construction', () => {
    const readyCb = vi.fn();
    const sut = new ModulesTransportConnectionTypesXhr({ callbacks: { ready: readyCb }, host: 'http://test' });
    expect(readyCb).toHaveBeenCalled();
  });

  describe('send', () => {
    it('should create XHR and send stringified message', () => {
      const sut = new ModulesTransportConnectionTypesXhr({ callbacks: {}, host: 'http://test' });
      sut.send({ action: 'test', data: {} });
      expect(mockXhr.open).toHaveBeenCalledWith('POST', 'http://test', true);
      expect(mockXhr.send).toHaveBeenCalledWith('{"action":"test","data":{}}');
    });
  });

  describe('error handling', () => {
    it('should call error callback on XHR error', () => {
      const errorCb = vi.fn();
      const sut = new ModulesTransportConnectionTypesXhr({ callbacks: { error: errorCb }, host: 'http://test' });
      sut.send({ action: 'test', data: {} });
      mockXhr.onerror!(new Event('error'));
      expect(errorCb).toHaveBeenCalled();
    });
  });

  describe('response handling', () => {
    it('should call response callback when readyState is 4', () => {
      const responseCb = vi.fn();
      const sut = new ModulesTransportConnectionTypesXhr({ callbacks: { response: responseCb }, host: 'http://test' });
      sut.send({ action: 'test', data: {} });

      mockXhr.readyState = 4;
      mockXhr.response = '{"action":"result","data":{"win":100}}';
      mockXhr.onreadystatechange!({ target: mockXhr } as unknown as Event);

      expect(responseCb).toHaveBeenCalledWith({ action: 'result', data: { win: 100 } });
    });

    it('should not call response callback when readyState is not 4', () => {
      const responseCb = vi.fn();
      const sut = new ModulesTransportConnectionTypesXhr({ callbacks: { response: responseCb }, host: 'http://test' });
      sut.send({ action: 'test', data: {} });

      mockXhr.readyState = 2;
      mockXhr.onreadystatechange!({ target: mockXhr } as unknown as Event);

      expect(responseCb).not.toHaveBeenCalled();
    });
  });
});
