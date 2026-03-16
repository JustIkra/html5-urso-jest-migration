class ComponentsRedPushController extends Urso.Core.Components.Base.Controller {
  
    constructor(options) {
        super(options);

        this.redPushButton;
    }

    create() {
        this.redPushButton = this.common.findOne('^redPush');
    }

    _btnCheck({name}){
        if (name === 'redPush'){
            if (this.redPushButton.x <= 100){
                gsap.to(this.redPushButton, 2, {x:'1000'});
            }else {
                gsap.to(this.redPushButton, 2, {x:'100'});
            }
        }
    }

    _subscribeOnce() {
        this.addListener(Urso.events.MODULES_OBJECTS_BUTTON_PRESS, this._btnCheck.bind(this));
    }
    

}

export default ComponentsRedPushController;

