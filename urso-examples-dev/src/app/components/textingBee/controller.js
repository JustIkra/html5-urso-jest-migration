class ComponentsTextingBeeController extends Urso.Core.Components.Base.Controller {
  
    constructor(options) {
        super(options);
        
        this.txtBee;
        this.randomText = [
            'LoL', 'Click again', 'I dare u', 'Bees the best', 'Crocos loosers', 'Stop doin it', 'Do something usefull!'
        ];
       
    }

    create() {
        this.txtBee = this.common.findOne('^textBee2')
    }

    _changeText() {
        this.txtBee.text = this.randomText[Urso.math.getRandomInt(this.randomText.length-1)]
    }

    _subscribeOnce() {
        this.addListener('components.textingBee.change', this._changeText.bind(this));
    }
}

export default ComponentsTextingBeeController;