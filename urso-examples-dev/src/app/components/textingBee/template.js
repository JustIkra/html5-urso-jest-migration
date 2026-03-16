class ComponentsTextingBeeTemplate {
    constructor() {

        this.objects = [
            {
                type: Urso.types.objects.TEXT,
                name: 'textBee2',
                text: 'Bzzz',
                fontFamily: 'Arial',
                fontSize: 36,
                fontStyle: 'italic',
                fontWeight: 'bold',
                fill: ['#ffffff', '#00ff99'], // gradient
                stroke: '#4a1850',
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6,
                wordWrap: true,
                wordWrapWidth: 440,
                x: 1550, y: 900
            }
        ];    
    };

};


export default ComponentsTextingBeeTemplate;

