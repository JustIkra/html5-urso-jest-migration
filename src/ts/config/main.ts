import type { ConfigMainType } from '../types';

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
export type { ConfigMainType, FpsConfig } from '../types';
