class ComponentsBackgroundTemplate {
    constructor() {
        const _imagePath = 'images/';

        this.styles = {
            '^bg': {
                x: 20, y: 20
            }
        };

        this.assets = [
            { type: Urso.types.assets.IMAGE, key: 'bg', path: _imagePath + 'test/bg.jpg' }
        ];

        this.objects = [
            {
                type: Urso.types.objects.IMAGE,
                name: 'bg',
                assetKey: 'bg',
                x: 100
            }
        ];
    };

};

export default ComponentsBackgroundTemplate;
