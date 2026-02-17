import type { UrsoInstance, TemplateTypesList } from '../../types';
import type ModulesTemplateModel from './model';

interface ServiceFacade {
  getTemplate: () => ModulesTemplateModel;
  getSceneOrGroup: (name: string, namespace: string) => ModulesTemplateModel;
  parse: (template: ModulesTemplateModel, additionalTemplateFlag?: boolean) => ModulesTemplateModel;
}

declare const Urso: {
  types: TemplateTypesList;
};

class ModulesTemplateController {
  public readonly singleton = true;

  public getInstance!: UrsoInstance['getInstance'];

  constructor() {
    Urso.types = this.getInstance<{ list: TemplateTypesList }>('Types').list;
  }

  get(): ModulesTemplateModel {
    return this.getInstance<ServiceFacade>('Service').getTemplate();
  }

  scene(name: string): ModulesTemplateModel {
    return this.getInstance<ServiceFacade>('Service').getSceneOrGroup(name, 'Scenes');
  }

  group(name: string): ModulesTemplateModel {
    return this.getInstance<ServiceFacade>('Service').getSceneOrGroup(name, 'Groups');
  }

  parse(template: ModulesTemplateModel, additionalTemplateFlag?: boolean): ModulesTemplateModel {
    return this.getInstance<ServiceFacade>('Service').parse(template, additionalTemplateFlag);
  }
}

export default ModulesTemplateController;
