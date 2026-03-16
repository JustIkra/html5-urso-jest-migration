import type { UrsoInstance, ComponentCommon } from '../../types';

interface TemplateResult {
  styles: Record<string, unknown>;
  assets: unknown[];
  objects: unknown[];
}

export default class ComponentsBaseController {
  protected _templateName = 'Template';
  public common: ComponentCommon;
  public options: Record<string, unknown> | undefined;

  public getInstance!: UrsoInstance['getInstance'];
  public addListener!: UrsoInstance['addListener'];
  public removeListener!: UrsoInstance['removeListener'];
  public emit!: UrsoInstance['emit'];

  constructor(options?: Record<string, unknown>) {
    this._inputValidation(options);

    this.common = {
      find: null,
      findAll: null,
      findOne: null,
      object: null,
    };

    this.options = options;
  }

  _requiredOptionsModel(): Record<string, string> | undefined {
    return undefined;
  }

  _inputValidation(options?: Record<string, unknown>): void {
    const optionsModel = this._requiredOptionsModel();

    if (optionsModel)
      for (const optionKey in optionsModel) {
        if (!options || typeof options[optionKey] !== optionsModel[optionKey])
          Urso.logger.error('Component params model error', this);
      }
  }

  loadUpdate(): void {
    // override in subclass
  }

  assetsMount(): { styles: Record<string, unknown>; assets: unknown[] } {
    const template = this.getInstance<TemplateResult>(this._templateName, this.options);
    return { styles: template.styles, assets: template.assets };
  }

  objectsMount(): unknown[] {
    const template = this.getInstance<TemplateResult>(this._templateName, this.options);
    return template.objects;
  }

  create(): void {
    // override in subclass
  }

  update(_deltaTime?: number): void {
    // override in subclass
  }

  _subscribeOnce(): void {
    // override in subclass
  }

  destroy(): void {
    // override in subclass
  }
}
