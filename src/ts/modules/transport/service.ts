import type { TransportCallbackMap, TransportConfig, TransportMessage, UrsoInstance } from '../../types';

interface CommunicatorFacade {
  readyCheck: () => boolean;
  send: (message: unknown) => void;
  reconnect: (delay: number) => void;
  close: () => void;
}

interface DecoratorFacade {
  toServer: (message: TransportMessage) => TransportMessage | null;
  toFront: (message: unknown) => TransportMessage | null;
}

class ModulesTransportService {
  private _callbacks: TransportCallbackMap = {};
  private _config: TransportConfig;
  private _communicator: CommunicatorFacade | null = null;

  public getInstance!: UrsoInstance['getInstance'];

  constructor() {
    this._config = this.getInstance<{ getConfig: () => TransportConfig }>('Config').getConfig();
  }

  on(event: string, callback: (data?: unknown) => void, force?: boolean): void {
    if (!this._checkCallback(event) || force) this._setCallback(event, callback);
  }

  init(): void {
    this._createConnection();
  }

  send(message: TransportMessage): boolean {
    if (!this._checkCommunicatorReady()) return false;

    const decoratedMessage = this.getInstance<DecoratorFacade>('Decorator', { callbacks: this._callbacks }).toServer(message);

    if (!decoratedMessage) return false;

    const validatedMessage = this._validateMessage(decoratedMessage);

    if (!validatedMessage) return false;

    this._communicator!.send(validatedMessage);
    return true;
  }

  reconnect(): boolean {
    if (!this._checkCommunicatorReady()) return false;
    this._communicator!.reconnect(this._getAutoReconnetionDelay());
    return true;
  }

  close(): boolean {
    if (!this._checkCommunicatorReady()) return false;
    this._communicator!.close();
    return true;
  }

  _checkCallback(event: string): boolean {
    const result = !!this._callbacks[event];
    if (result) Urso.logger.error(`Overwrite ${event} event detected!`);
    return result;
  }

  _checkCommunicatorReady(): boolean {
    if (!this._communicator) {
      Urso.logger.error('Communicator was not created!');
      return false;
    }
    return this._communicator.readyCheck();
  }

  _destroyCommunicator(): void {
    this._communicator = null;
  }

  _prepareCallback(event: string, callback: (data?: unknown) => void): (message?: unknown) => unknown {
    return (message?: unknown) => {
      const data = this._runMiddleWare(event, message);
      return callback(data);
    };
  }

  _runMiddleWare(event: string, data?: unknown): unknown {
    switch (event) {
      case 'response': {
        const decoratedMessage = this.getInstance<DecoratorFacade>('Decorator', { callbacks: this._callbacks }).toFront(data);
        if (!decoratedMessage) return undefined;
        return this._validateMessage(decoratedMessage);
      }
      case 'close':
      case 'error':
        this._tryReconnect();
      // falls through
      default:
        return data;
    }
  }

  _autoReconnectCheck(): number {
    return this._config.reconnectTimeout;
  }

  _getAutoReconnetionDelay(): number {
    return this._config.autoReconnect ? this._config.reconnectTimeout : 0;
  }

  _tryReconnect(): boolean | void {
    if (!this._autoReconnectCheck()) return false;
    this._communicator!.reconnect(this._getAutoReconnetionDelay());
  }

  _setCallback(event: string, callback: (data?: unknown) => void): void {
    this._callbacks[event] = this._prepareCallback(event, callback);
  }

  _validateMessage(message: TransportMessage): TransportMessage {
    return { ...message };
  }

  _getHost(): string | null {
    return this._config.host;
  }

  _getType(): string {
    return this._config.type;
  }

  _createConnection(): void {
    const host = this._getHost();
    const type = this._getType();
    const callbacks = this._callbacks;
    const capitalizedType = Urso.helper.capitaliseFirstLetter(type);

    this._communicator = this.getInstance<CommunicatorFacade>(`ConnectionTypes.${capitalizedType}`, { callbacks, host });

    if (!this._communicator) Urso.logger.error(`Transport type: '${capitalizedType}' was not found!`);
  }
}

export default ModulesTransportService;
