class ComponentsTestTemplate {
    constructor() {
        const _imagePath = 'images/';

        this.styles = {
            '^man': {
                x: 20, y: -75
            }
        };

        this.assets = [
            { type: Urso.types.assets.IMAGE, key: 'man', path: _imagePath + 'man.png' }
        ];

        this.objects = [
            {
                type: Urso.types.objects.IMAGE,
                name: 'man',
                assetKey: 'man',
                scaleX:10,
                scaleY:10,
                x: 100
            }
        ];
    };

};

export default ComponentsTestTemplate;
