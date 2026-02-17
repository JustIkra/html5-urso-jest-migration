import type { TransportCallbackMap, TransportMessage } from '../../types';

class ModulesTransportDecorator {
  public readonly singleton = true;

  private _callbacks: TransportCallbackMap;

  constructor(params: { callbacks: TransportCallbackMap }) {
    this._callbacks = params.callbacks;
  }

  toServer(message: TransportMessage): TransportMessage | null {
    return message;
  }

  toFront(message: unknown): TransportMessage | null {
    return message as TransportMessage;
  }
}

export default ModulesTransportDecorator;
