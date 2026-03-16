const ComponentsRedPushMixinDesctopController = (superclass) => class extends superclass {

    create() {
        console.info('%c!! ComponentsRedPushDesctopController mixin', 'color: blue');
        super.create();
    }

}

export default ComponentsRedPushMixinDesctopController;
