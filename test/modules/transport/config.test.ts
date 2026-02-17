import ModulesTransportConfig from '../../../src/ts/modules/transport/config';

describe('ModulesTransportConfig', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    mockUrso.helper.parseGetParams.mockReturnValue(null);
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  it('should return config with autoReconnect true', () => {
    const sut = new ModulesTransportConfig();
    expect(sut.getConfig().autoReconnect).toBe(true);
  });

  it('should return config with reconnectTimeout 5000', () => {
    const sut = new ModulesTransportConfig();
    expect(sut.getConfig().reconnectTimeout).toBe(5000);
  });

  it('should return config with type websocket', () => {
    const sut = new ModulesTransportConfig();
    expect(sut.getConfig().type).toBe('websocket');
  });

  it('should use Urso.helper.parseGetParams for host', () => {
    const sut = new ModulesTransportConfig();
    sut.getConfig();
    expect(mockUrso.helper.parseGetParams).toHaveBeenCalledWith('wsHost');
  });

  it('should return host from parseGetParams', () => {
    mockUrso.helper.parseGetParams.mockReturnValue('ws://localhost:8080');
    const sut = new ModulesTransportConfig();
    expect(sut.getConfig().host).toBe('ws://localhost:8080');
  });

  it('should return null host when parseGetParams returns null', () => {
    const sut = new ModulesTransportConfig();
    expect(sut.getConfig().host).toBeNull();
  });
});
