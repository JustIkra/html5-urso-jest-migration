import type { ObjectTypeId } from '../../types';

class ModulesObjectsConfig {
  public readonly singleton: boolean = true;
  public objectsToCache: ObjectTypeId[] = [];
}

export default ModulesObjectsConfig;
