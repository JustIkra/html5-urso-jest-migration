import type { TransportConnectionParams, TransportCallbackMap } from '../../types';

class ModulesTransportBaseConnectionType {
  protected _host: string | null;
  protected _callbacks: TransportCallbackMap;
  protected _ready: boolean = false;

  constructor(params: TransportConnectionParams) {
    this._host = params.host || null;
    this._callbacks = params.callbacks || {};
    this._ready = false;
  }

  close(): void {}

  readyCheck(): boolean {
    return this._ready;
  }

  reconnect(_delay?: number): void {}

  send(_message: unknown): void {}

  _runCallback(name: string, params?: unknown): void {
    if (this._callbacks[name]) this._callbacks[name](params);
  }
}

export default ModulesTransportBaseConnectionType;
