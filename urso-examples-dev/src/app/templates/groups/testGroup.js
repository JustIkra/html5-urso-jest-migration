class AppTemplatesGroupsTestGroup {
    constructor() {
        const _imagePath = 'images/';

        this.styles = {
            '^urso': {
                x: 50, y: 600
            }
        };

        this.assets = [
            { type: Urso.types.assets.IMAGE, key: 'urso', path: _imagePath + 'urso.jpg' }
        ];

        this.objects = [
            {
                type: Urso.types.objects.IMAGE,
                name: 'urso',
                assetKey: 'urso',
                x: 600
            }
        ];
    };

};

export default AppTemplatesGroupsTestGroup;
