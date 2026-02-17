import type { TransportMessage, UrsoInstance } from '../../types';

interface ServiceFacade {
  init: () => void;
  on: (event: string, handler: (data?: unknown) => void, force?: boolean) => void;
  send: (message: TransportMessage) => void;
  reconnect: () => void;
  close: () => void;
}

class ModulesTransportController {
  private _service: ServiceFacade | null = null;

  public getInstance!: UrsoInstance['getInstance'];

  _updateService(): void {
    this._service = this.getInstance<ServiceFacade>('Service');
  }

  init(): void {
    this._updateService();
    this._service!.init();
  }

  setOnConnectionHandler(handler: (data?: unknown) => void): void {
    this._service!.on('connection', handler);
  }

  setReadyHandler(handler: (data?: unknown) => void): void {
    this._service!.on('ready', handler);
  }

  setErrorHandler(handler: (data?: unknown) => void): void {
    this._service!.on('error', handler);
  }

  setResponseHandler(handler: (data?: unknown) => void): void {
    this._service!.on('response', handler);
  }

  setOnCloseHandler(handler: (data?: unknown) => void): void {
    this._service!.on('close', handler);
  }

  send(message: TransportMessage): void {
    this._service!.send(message);
  }

  reconnect(): void {
    this._service!.reconnect();
  }

  close(): void {
    this._service!.close();
  }
}

export default ModulesTransportController;
