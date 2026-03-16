class ComponentsRedPushModificationDesctopController extends Urso.Core.Components.Base.Controller {
  
    constructor(options) {
        super(options);

        this.redPushButton;
    }

    create() {
        this.redPushButton = this.common.findOne('^redPush');
        console.info('%c!! ComponentsRedPushModificationDesctopController modification', 'color: blue');
    }

    _btnCheck({name}){
        if (name === 'redPush'){
            if (this.redPushButton.y <= 100){
                gsap.to(this.redPushButton, 2, {y:'1000'});
            }else {
                gsap.to(this.redPushButton, 2, {y:'100'});
            }
        }
    }

    _subscribeOnce() {
        this.addListener(Urso.events.MODULES_OBJECTS_BUTTON_PRESS, this._btnCheck.bind(this));
    }
    

}

export default ComponentsRedPushModificationDesctopController;

