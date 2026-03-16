class ComponentsBeeButtonTemplate {
    constructor() {
        
        const _imagePath = 'images/';

        this.assets = [
            { type: Urso.types.assets.IMAGE, key: 'bee1', path: _imagePath + 'test/bee1.jpg'}         
        ]

        this.objects = [
            {
                type: Urso.types.objects.BUTTON,
                name: 'beeBtn',
                buttonFrames: {
                    out: 'bee1',
                },
                x: 1500, y: 700
            }
        ];
    };

};

export default ComponentsBeeButtonTemplate;
