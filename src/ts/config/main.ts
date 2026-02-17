interface FpsConfig {
  limit: number;
  optimizeLowPerformance: boolean;
}

interface ConfigMainType {
  title: string;
  appVersion: number;
  mode: string;
  defaultLogLevel: string;
  extendingChain: string[];
  defaultScene: string;
  gamePath: string;
  useBinPath: boolean;
  useTransport: boolean;
  fps: FpsConfig;
}

const ConfigMain: ConfigMainType = {
  title: 'Urso',
  appVersion: 0,
  mode: 'development',
  defaultLogLevel: 'ERROR,WARNING,INFO,LOG',
  extendingChain: ['Urso.Core'],
  defaultScene: 'play',
  gamePath: '',
  useBinPath: false,
  useTransport: false,
  fps: {
    limit: 60,
    optimizeLowPerformance: false,
  },
};

export default ConfigMain;
export type { ConfigMainType, FpsConfig };
