class ComponentsRedPushTemplate {
    constructor() {
        
        const _imagePath = 'images/';

        this.assets = [
            { type: Urso.types.assets.IMAGE, key: 'pushButton', path: _imagePath + 'pushButton.png'}           
        ]

        this.objects = [
            {
                type: Urso.types.objects.BUTTON,
                name: 'redPush',
                buttonFrames: {
                    out: 'pushButton',
                },
                x: 300, 
                y: 300
            }
        ];
    };

};

export default ComponentsRedPushTemplate;
