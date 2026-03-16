let bgComCreated = false;

class ComponentsSpinButtonTemplate {
    constructor() {

        this.objects = [
            {
                type: Urso.types.objects.BUTTON,
                name: 'spinButton',
                buttonFrames: {
                    over: 'b1_over',
                    out: 'b1_out',
                    pressed: 'b1_press',
                    disabled: 'b1_disable'
                },
                action: () => {
                    if (bgComCreated) {
                        alert('background component alredy created');
                        return;
                    }

                    Urso.objects.create({
                        type: Urso.types.objects.COMPONENT,
                        name: 'bgCom',
                        componentName: 'background',
                        x: 10, y: 10
                    });

                    bgComCreated = true;
                }
            }
        ];
    };

};

export default ComponentsSpinButtonTemplate;
