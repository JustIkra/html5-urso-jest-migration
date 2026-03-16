class ComponentsTestController extends Urso.Core.Components.Base.Controller {

    constructor(options) {
        super(options);

        this.factor = 1 / 10;
    }

    _requiredOptionsModel() {
        return {
            x: 'number',
            text: 'string'
        };
    }

    create() {
        console.log('ComTestController created with options', this.options)
    }

    _subscribeOnce() {
        //this.addListener('ComponentsTestController'+asdasd)
    }

    update(delta) {
        let object = Urso.findOne('^testBtn');

        if (!object)
            return

        object.x += delta * this.factor;

        if (object.x > 1000)
            object.x = 1;

        if (object.x < 0)
            object.x = 1000;
    }

    _btnHandler({ name }) {
        if (name === 'testBtn')
            this.factor *= -1;
    }

    _subscribeOnce() {
        this.addListener(Urso.events.MODULES_OBJECTS_BUTTON_PRESS, this._btnHandler.bind(this));
    }

}

export default ComponentsTestController;
