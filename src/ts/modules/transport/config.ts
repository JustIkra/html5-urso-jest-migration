import type { TransportConfig } from '../../types';

class ModulesTransportConfig {
  getConfig(): TransportConfig {
    return {
      autoReconnect: true,
      reconnectTimeout: 5000,
      type: 'websocket' as TransportConfig['type'],
      host: Urso.helper.parseGetParams('wsHost') as string | null,
    };
  }
}

export default ModulesTransportConfig;
