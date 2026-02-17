import ComponentsLayersSwitcherConfig from '../../../src/ts/components/layersSwitcher/config';

describe('ComponentsLayersSwitcherConfig', () => {
  it('should initialize allLayers with default selectors', () => {
    const config = new ComponentsLayersSwitcherConfig();
    expect(config.allLayers).toEqual([
      '^granny',
      '^mainButton',
      '^logo',
      '.backround',
      '^bonusPopup',
      '.baseGame',
      '.bonusGame',
    ]);
  });

  it('should initialize groupsLayers with default groups', () => {
    const config = new ComponentsLayersSwitcherConfig();
    expect(config.groupsLayers).toEqual({
      'mainElements': ['^logo', '^mainButton', '.baseGame'],
      'background': ['.backround'],
      'granny': ['^granny'],
      'bonusGame': ['.bonusGame', '^bonusPopup'],
    });
  });

  it('should have allLayers as an array', () => {
    const config = new ComponentsLayersSwitcherConfig();
    expect(Array.isArray(config.allLayers)).toBe(true);
  });

  it('should have groupsLayers as an object', () => {
    const config = new ComponentsLayersSwitcherConfig();
    expect(typeof config.groupsLayers).toBe('object');
    expect(config.groupsLayers).not.toBeNull();
  });

  it('should have all group selectors present in allLayers', () => {
    const config = new ComponentsLayersSwitcherConfig();
    for (const group of Object.values(config.groupsLayers)) {
      for (const selector of group) {
        expect(config.allLayers).toContain(selector);
      }
    }
  });
});
