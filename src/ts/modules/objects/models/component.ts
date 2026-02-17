import { Container } from 'pixi.js';
import type { ObjectModelParams } from '../../../types';
import ModulesObjectsBaseModel from '../baseModel';

interface ControllerInstance {
  common: {
    find: ((selector: string) => unknown[]) | null;
    findOne: ((selector: string) => unknown | null) | null;
    findAll: ((selector: string) => unknown[]) | null;
    object: unknown;
    /** Index signature required: component common bag holds dynamic helpers */
    [key: string]: unknown;
  };
  /** Index signature required: controller instances expose dynamic lifecycle methods */
  [key: string]: unknown;
}

interface UrsoFindFacade {
  find: (selector: string) => unknown[];
  findOne: (selector: string) => unknown | null;
  findAll: (selector: string) => unknown[];
}

class ModulesObjectsModelsComponent extends ModulesObjectsBaseModel {
  public componentName!: string | null;
  public options!: Record<string, unknown> | null;
  public contents!: ModulesObjectsBaseModel[];
  public instance: ControllerInstance | null = null;
  public _controller!: ControllerInstance | null;

  constructor(params: Partial<ObjectModelParams>) {
    super(params);

    this.type = Urso.types.objects.COMPONENT;
    this.instance = null;

    this._controller = Urso.helper.recursiveGet('_controller', params, null) as ControllerInstance | null;

    this._addBaseObject();
  }

  public setupParams(params: Partial<ObjectModelParams>): void {
    super.setupParams(params);

    this.componentName = Urso.helper.recursiveGet('componentName', params, null) as string | null;
    this.options = Urso.helper.recursiveGet('options', params, null) as Record<string, unknown> | null;
    this.contents = Urso.helper.recursiveGet('contents', params, []) as ModulesObjectsBaseModel[];
  }

  private _addBaseObject(): void {
    this._baseObject = new Container();

    if (!this.name) {
      this.name = 'component_' + this._uid;
    }

    this._setCommonFunctions();
  }

  private _setCommonFunctions(): void {
    this.instance = this._controller;

    if (this.instance) {
      this._setupFind(this.instance);
    }
  }

  private _setupFind(instance: ControllerInstance): void {
    const urso = Urso as unknown as UrsoFindFacade;
    const name = this.name;
    instance.common.find = (selector: string) => urso.find(`^${name} ${selector}`);
    instance.common.findOne = (selector: string) => urso.findOne(`^${name} ${selector}`);
    instance.common.findAll = (selector: string) => urso.findAll(`^${name} ${selector}`);
  }
}

export default ModulesObjectsModelsComponent;
