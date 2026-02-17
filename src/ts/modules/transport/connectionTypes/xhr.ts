import ModulesTransportBaseConnectionType from '../baseConnectionType';
import type { TransportConnectionParams } from '../../../types';

declare const log: (...args: unknown[]) => void;

class ModulesTransportConnectionTypesXhr extends ModulesTransportBaseConnectionType {
  private _xhr: XMLHttpRequest | null = null;

  constructor(params: TransportConnectionParams) {
    super(params);
    this._ready = true;
    this._runCallback('ready');
  }

  send(message: unknown): void {
    this._createXhr();
    const preparedMessage = JSON.stringify(message);
    this._xhr!.send(preparedMessage);
    log('[XHR] SEND:', preparedMessage);
  }

  private _getMethod(): string {
    return 'POST';
  }

  private _createXhr(): void {
    this._xhr = new XMLHttpRequest();
    this._xhr.onerror = this._onError.bind(this);
    this._xhr.onreadystatechange = this._onReadyStateChange.bind(this);
    this._xhr.open(this._getMethod(), this._host!, true);
  }

  private _onMessage(message: string): void {
    const res = JSON.parse(message);
    this._runCallback('response', res);
    log('[XHR] RESPONSE RECEIVED', message);
  }

  private _onError(): void {
    this._runCallback('error');
    log('[XHR] ERROR');
  }

  private _onReadyStateChange(event: Event): void {
    const target = event.target as XMLHttpRequest;
    if (target.readyState === 4) this._onMessage(target.response);
  }
}

export default ModulesTransportConnectionTypesXhr;
