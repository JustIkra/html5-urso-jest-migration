import ModulesTransportBaseConnectionType from '../../../src/ts/modules/transport/baseConnectionType';

describe('ModulesTransportBaseConnectionType', () => {
  it('should set host from params', () => {
    const sut = new ModulesTransportBaseConnectionType({ callbacks: {}, host: 'ws://test' });
    expect(sut['_host']).toBe('ws://test');
  });

  it('should set host to null when not provided', () => {
    const sut = new ModulesTransportBaseConnectionType({ callbacks: {}, host: null });
    expect(sut['_host']).toBeNoValue();
  });

  it('should store callbacks', () => {
    const cb = vi.fn();
    const sut = new ModulesTransportBaseConnectionType({ callbacks: { ready: cb }, host: null });
    expect(sut['_callbacks'].ready).toBe(cb);
  });

  it('should start not ready', () => {
    const sut = new ModulesTransportBaseConnectionType({ callbacks: {}, host: null });
    expect(sut.readyCheck()).toBe(false);
  });

  it('close should be a no-op', () => {
    const sut = new ModulesTransportBaseConnectionType({ callbacks: {}, host: null });
    expect(() => sut.close()).not.toThrow();
  });

  it('reconnect should be a no-op', () => {
    const sut = new ModulesTransportBaseConnectionType({ callbacks: {}, host: null });
    expect(() => sut.reconnect(1000)).not.toThrow();
  });

  it('send should be a no-op', () => {
    const sut = new ModulesTransportBaseConnectionType({ callbacks: {}, host: null });
    expect(() => sut.send({ action: 'test', data: {} })).not.toThrow();
  });

  describe('_runCallback', () => {
    it('should call callback by name', () => {
      const readyCb = vi.fn();
      const sut = new ModulesTransportBaseConnectionType({ callbacks: { ready: readyCb }, host: null });
      sut._runCallback('ready');
      expect(readyCb).toHaveBeenCalledTimes(1);
    });

    it('should pass params to callback', () => {
      const responseCb = vi.fn();
      const sut = new ModulesTransportBaseConnectionType({ callbacks: { response: responseCb }, host: null });
      sut._runCallback('response', { action: 'test', data: {} });
      expect(responseCb).toHaveBeenCalledWith({ action: 'test', data: {} });
    });

    it('should not throw for unknown callback name', () => {
      const sut = new ModulesTransportBaseConnectionType({ callbacks: {}, host: null });
      expect(() => sut._runCallback('unknown')).not.toThrow();
    });
  });
});
