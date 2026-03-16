import ComponentsBaseController from '../base/controller';
import type { LayersSwitcherConfig } from './config';

class ComponentsLayersSwitcherController extends ComponentsBaseController {
  private _config: LayersSwitcherConfig;

  constructor(params?: Record<string, unknown>) {
    super(params);
    this._config = this.getInstance<LayersSwitcherConfig>('Config');
  }

  _showGroup(groupName: string): void {
    const configLayersGroup = this._config.groupsLayers[groupName];

    if (configLayersGroup) {
      this._config.allLayers.forEach(selectorLayers => {
        const layerVisibleStatus = configLayersGroup.includes(selectorLayers);

        Urso.findAll(selectorLayers).forEach((selectorObject) => {
          selectorObject.visible = layerVisibleStatus;
        });
      });
    } else {
      Urso.logger.error(`ComponentsLayersSwitcherController: group '${groupName}' was not found!`);
    }
  }

  _subscribeOnce(): void {
    this.addListener(Urso.events.COMPONENTS_LAYERS_SWITCHER_SWITCH, ((groupName: string) => { this._showGroup(groupName); }) as (params?: unknown) => void);
  }
}

export default ComponentsLayersSwitcherController;
