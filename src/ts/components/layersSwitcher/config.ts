interface LayersSwitcherConfig {
  allLayers: string[];
  groupsLayers: Record<string, string[]>;
}

class ComponentsLayersSwitcherConfig implements LayersSwitcherConfig {
  public allLayers: string[];
  public groupsLayers: Record<string, string[]>;

  constructor() {
    this.allLayers = [
      '^granny',
      '^mainButton',
      '^logo',
      '.backround',
      '^bonusPopup',
      '.baseGame',
      '.bonusGame',
    ];

    this.groupsLayers = {
      'mainElements': ['^logo', '^mainButton', '.baseGame'],
      'background': ['.backround'],
      'granny': ['^granny'],
      'bonusGame': ['.bonusGame', '^bonusPopup'],
    };
  }
}

export default ComponentsLayersSwitcherConfig;
export type { LayersSwitcherConfig };
