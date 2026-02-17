import type { UrsoInstance, ObjectTypeId, StylesMap } from '../../types';
import type ModulesTemplateModel from './model';

interface ComponentInstance {
  assetsMount: () => { styles?: StylesMap; assets?: TemplateParseable[] };
  objectsMount: () => TemplateParseable[] | null;
  object: TemplateParseable | null;
  create: () => void;
}

interface TemplateParseable {
  /** Allow any additional template fields */
  [key: string]: unknown;
  contents?: TemplateParseable[];
  type?: ObjectTypeId | number;
  groupName?: string;
  componentName?: string;
  options?: Record<string, unknown>;
  _templatePath?: string | null;
  _parsed?: boolean;
  _controller?: ComponentInstance;
}

declare const Urso: {
  types: { objects: Record<string, number> };
  helper: {
    capitaliseFirstLetter: (s: string) => string;
    mergeObjectsRecursive: <T>(a: T, b: T, deep?: boolean) => T;
    mergeArrays: <T>(a: T[], b: T[]) => T[];
  };
  logger: { error: (...args: unknown[]) => void };
  getInstance: <T = unknown>(path: string, ...args: unknown[]) => T;
};

class ModulesTemplateService {
  public readonly singleton = true;

  public _currentTemplate!: ModulesTemplateModel & { components: (ComponentInstance | unknown)[] };
  public _actualFullTemplate!: ModulesTemplateModel & { components: (ComponentInstance | unknown)[] };

  public getInstance!: UrsoInstance['getInstance'];

  constructor() {
    this._currentTemplate = this.getInstance<ModulesTemplateModel>('Model') as ModulesTemplateModel & { components: (ComponentInstance | unknown)[] };
    this._actualFullTemplate = this.getInstance<ModulesTemplateModel>('Model') as ModulesTemplateModel & { components: (ComponentInstance | unknown)[] };
  }

  getTemplate(): ModulesTemplateModel {
    return this._actualFullTemplate;
  }

  getSceneOrGroup(name: string, namespace: string): ModulesTemplateModel {
    const nameCapitalise = Urso.helper.capitaliseFirstLetter(name);
    const path = `Templates.${namespace}.${nameCapitalise}`;
    const entity = Urso.getInstance<ModulesTemplateModel>(path);
    this._setTemplatePath(entity, path);
    return entity;
  }

  parse(template: ModulesTemplateModel & { _templatePath?: string | null }, additionalTemplateFlag?: boolean): ModulesTemplateModel {
    this._currentTemplate = Urso.helper.mergeObjectsRecursive(
      this.getInstance<ModulesTemplateModel>('Model'),
      template,
    ) as ModulesTemplateModel & { components: (ComponentInstance | unknown)[] };

    this._parseAssets(this._currentTemplate.assets as TemplateParseable[], template._templatePath ?? null);
    this._parseObjects(this._currentTemplate.objects as TemplateParseable[], template._templatePath ?? null);

    if (additionalTemplateFlag) {
      this._actualFullTemplate.assets = Urso.helper.mergeArrays(this._actualFullTemplate.assets, this._currentTemplate.assets);
      this._actualFullTemplate.components = Urso.helper.mergeArrays(this._actualFullTemplate.components, this._currentTemplate.components);
      this._actualFullTemplate.objects = Urso.helper.mergeArrays(this._actualFullTemplate.objects, this._currentTemplate.objects);
      Urso.helper.mergeObjectsRecursive(this._actualFullTemplate.styles, this._currentTemplate.styles);
    } else {
      this._actualFullTemplate = this._currentTemplate;
    }

    return this._currentTemplate;
  }

  _setTemplatePath(target: { _templatePath?: string | null }, templatePath: string | null): void {
    target._templatePath = templatePath;
  }

  _parseAssets(assets: TemplateParseable[], templatePath: string | null): void {
    for (const asset of assets) {
      this._setTemplatePath(asset, templatePath);
    }
  }

  _parseObjects(objects: TemplateParseable[], templatePath: string | null): void {
    for (const obj of objects) {
      this._setTemplatePath(obj, templatePath);

      if (obj.contents) this._parseObjects(obj.contents, templatePath);

      if (obj.type === Urso.types.objects.GROUP) this._processGroup(obj);

      if (obj.type === Urso.types.objects.COMPONENT) this._processComponent(obj);

      obj._parsed = true;
    }
  }

  _processGroup(obj: TemplateParseable): void {
    const groupTemplate = this.getInstance<{ group: (name: string) => ModulesTemplateModel & { _templatePath?: string | null } }>('Controller').group(obj.groupName!);

    if (!groupTemplate)
      Urso.logger.error('ModulesTemplateController group Template error ' + obj.groupName);

    if ((groupTemplate as { assets?: TemplateParseable[] }).assets)
      this._parseAssets((groupTemplate as { assets: TemplateParseable[] }).assets, groupTemplate._templatePath ?? null);

    if ((groupTemplate as { objects?: TemplateParseable[] }).objects)
      this._parseObjects((groupTemplate as { objects: TemplateParseable[] }).objects, groupTemplate._templatePath ?? null);

    this._mergeStylesAndAssets({ styles: groupTemplate.styles, assets: (groupTemplate as { assets?: TemplateParseable[] }).assets });

    obj.contents = (groupTemplate as { objects?: TemplateParseable[] }).objects || [];
  }

  _processComponent(obj: TemplateParseable): void {
    const path = 'Components.' + Urso.helper.capitaliseFirstLetter(obj.componentName!) + '.Controller';
    const componentInstance = Urso.getInstance<ComponentInstance>(path, obj.options);

    if (!componentInstance) {
      Urso.logger.error(`ModulesTemplateController Component error. Component "${obj.componentName}" not found. Please check components _info.js file.`);
      Urso.logger.error(`To use only templates use Groups please.`);
    }

    const data = componentInstance.assetsMount();

    if (data.assets)
      this._parseAssets(data.assets as TemplateParseable[], path);

    this._mergeStylesAndAssets(data);

    const componentsObjects = componentInstance.objectsMount();

    if (componentsObjects)
      this._parseObjects(componentsObjects, path);

    obj.contents = obj.contents
      ? Urso.helper.mergeArrays(obj.contents, componentsObjects || [])
      : (componentsObjects || []);

    obj._controller = componentInstance;
    componentInstance.object = obj;

    this._currentTemplate.components.push(componentInstance);
  }

  _mergeStylesAndAssets(data: { styles?: StylesMap; assets?: unknown[] }): void {
    if (data.styles)
      this._currentTemplate.styles = Urso.helper.mergeObjectsRecursive(
        this._currentTemplate.styles,
        data.styles,
        true,
      );

    if (data.assets)
      this._currentTemplate.assets = Urso.helper.mergeArrays(
        this._currentTemplate.assets,
        data.assets as typeof this._currentTemplate.assets,
      );
  }
}

export default ModulesTemplateService;
