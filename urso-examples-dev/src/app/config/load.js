import BackgroundController from '../components/background/controller';
import BackgroundTemplate from '../components/background/template';
import BackgroundView from '../components/background/view';
import BeeButtonController from '../components/beeButton/controller';
import BeeButtonTemplate from '../components/beeButton/template';
import RedPushController from '../components/redPush/controller';
import RedPushTemplate from '../components/redPush/template';
import RedPushDesktopModController from '../components/redPush/modifications/desktop/controller';
import RedPushDesktopMixinController from '../components/redPush/mixins/desktop/controller';
import SpinButtonController from '../components/spinButton/controller';
import SpinButtonTemplate from '../components/spinButton/template';
import TestController from '../components/test/controller';
import TestTemplate from '../components/test/template';
import TextingBeeController from '../components/textingBee/controller';
import TextingBeeTemplate from '../components/textingBee/template';
import ConfigMain from '../config/main';
import TestGroup from '../templates/groups/testGroup';
import PlayScene from '../templates/scenes/play';

window.Urso.App = {
    Components: {
        Background: {
            Controller: BackgroundController,
            Template: BackgroundTemplate,
            View: BackgroundView
        },
        BeeButton: {
            Controller: BeeButtonController,
            Template: BeeButtonTemplate
        },
        RedPush: {
            Controller: RedPushController,
            Template: RedPushTemplate,
            modifications: {
                Desktop: {
                    Controller: RedPushDesktopModController
                }
            },
            mixins: {
                Desktop: {
                    Controller: RedPushDesktopMixinController
                }
            }
        },
        SpinButton: {
            Controller: SpinButtonController,
            Template: SpinButtonTemplate
        },
        Test: {
            Controller: TestController,
            Template: TestTemplate
        },
        TextingBee: {
            Controller: TextingBeeController,
            Template: TextingBeeTemplate
        }
    },
    Config: {
        Main: ConfigMain
    },
    Templates: {
        Groups: {
            TestGroup
        },
        Scenes: {
            Play: PlayScene
        }
    }
};
