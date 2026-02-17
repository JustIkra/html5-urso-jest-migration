import ModulesTransportBaseConnectionType from '../baseConnectionType';
import type { TransportConnectionParams } from '../../../types';

declare const log: (...args: unknown[]) => void;

class ModulesTransportConnectionTypesWebsocket extends ModulesTransportBaseConnectionType {
  private _reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private _socket: WebSocket | null = null;

  constructor(params: TransportConnectionParams) {
    super(params);
    this._createSocket();
  }

  close(): void {
    this._socket!.close();
    log('[SOCKET]: CLOSED');
  }

  reconnect(delay: number): void {
    log('[SOCKET]: RECONNECTING in ', delay);

    if (this._ready) this.close();

    this._reconnectTimeout = setTimeout(() => {
      this._clearTimeout();
      this._createSocket();
      log('[SOCKET]: RECONNECTED');
    }, delay);
  }

  send(message: unknown): void {
    const preparedMessage = JSON.stringify(message);
    this._socket!.send(preparedMessage);
    log('[SOCKET]: SEND:', preparedMessage);
  }

  private _clearTimeout(): void {
    if (this._reconnectTimeout) clearTimeout(this._reconnectTimeout);
    this._reconnectTimeout = null;
  }

  private _createSocket(): void {
    this._socket = new WebSocket(this._host!);
    this._socket.onopen = this._onOpen.bind(this);
    this._socket.onmessage = this._onMessage.bind(this);
    this._socket.onerror = this._onError.bind(this);
    this._socket.onclose = this._onClose.bind(this);
    log('[SOCKET]: CREATED');
  }

  private _onOpen(): void {
    this._ready = true;
    this._runCallback('ready');
    log('[SOCKET]: READY');
  }

  private _onMessage(message: MessageEvent): void {
    log('[SOCKET]: RECEIVED ', message.data);
    this._runCallback('response', message.data);
  }

  private _onClose(): void {
    this._ready = false;
    this._socket = null;
    this._runCallback('close');
  }

  private _onError(): void {
    this._ready = false;
    this._runCallback('error');
    log('[SOCKET]: ERROR');
  }
}

export default ModulesTransportConnectionTypesWebsocket;
