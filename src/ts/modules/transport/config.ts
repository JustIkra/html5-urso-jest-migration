import type { TransportConfig } from '../../types';

declare const Urso: {
  helper: { parseGetParams: (key: string) => string | null };
};

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
