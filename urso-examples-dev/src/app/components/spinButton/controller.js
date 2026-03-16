class ComponentsSpinButtonController extends Urso.Core.Components.Base.Controller {

    constructor(options) {
        super(options);

        this._checkButton = this._checkButton.bind(this);
    }

    _checkButton({name}) {
        if (name === 'spinButton')
            this.emit('components.SpinButton.spin');
    }

    _subscribeOnce() {
        this.addListener(Urso.events.MODULES_OBJECTS_BUTTON_PRESS, this._checkButton);
    }

}

export default ComponentsSpinButtonController;
