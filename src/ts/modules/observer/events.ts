import { UrsoEvent } from '../../types';

class ModulesObserverEvents {
  public readonly singleton: boolean = true;
  public readonly list: typeof UrsoEvent = UrsoEvent;
}

export default ModulesObserverEvents;
