import ComponentsBaseController from '../base/controller';
import type ComponentsEditorApi from './api';

class ComponentsEditorController extends ComponentsBaseController {
  private _api: ComponentsEditorApi;

  constructor(params?: Record<string, unknown>) {
    super(params);
    this._api = this.getInstance<ComponentsEditorApi>('Api');
    Urso.helper.recursiveSet('_dev.editorApi', this._api, Urso);
  }
}

export default ComponentsEditorController;
