class ComponentsBeeButtonController extends Urso.Core.Components.Base.Controller {

 
    _btnCheck({name}){
        if (name === 'beeBtn'){
            this.emit('components.textingBee.change');
        }
    }

    _subscribeOnce() {
        this.addListener(Urso.events.MODULES_OBJECTS_BUTTON_PRESS, this._btnCheck.bind(this));
    }
    

}

export default ComponentsBeeButtonController;
