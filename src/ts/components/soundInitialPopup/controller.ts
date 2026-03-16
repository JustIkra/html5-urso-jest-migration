import ComponentsBaseController from '../base/controller';

interface ButtonObject {
  _baseObject: {
    tint: number;
  };
}

interface TintParams {
  buttonName: string;
  pointerOver: boolean;
}

interface PressParams {
  name: string;
}

class ComponentsSoundInitialPopupController extends ComponentsBaseController {
  public yesButton: ButtonObject | null = null;
  public noButton: ButtonObject | null = null;

  create(): void {
    this.yesButton = this.common.findOne!('^soundInitialPopupButtonYesGraphics') as unknown as ButtonObject | null;
    this.noButton = this.common.findOne!('^soundInitialPopupButtonNoGraphics') as unknown as ButtonObject | null;
  }

  _tintHandler({ buttonName, pointerOver }: TintParams): void {
    const button = buttonName === 'yes' ? this.yesButton : this.noButton;
    button!._baseObject.tint = pointerOver ? 0xd4be69 : 0xFFFFFF;
  }

  _buttonPressHandler({ name }: PressParams): void {
    switch (name) {
      case 'soundInitialPopupButtonYesHit':
        this.emit(Urso.events.MODULES_SOUND_MANAGER_SET_GLOBAL_VOLUME, 1);
        break;
      case 'soundInitialPopupButtonNoHit':
        this.emit(Urso.events.MODULES_SOUND_MANAGER_SET_GLOBAL_VOLUME, 0);
        break;
      default:
        return;
    }

    this.common.object!.visible = false;
  }

  _subscribeOnce(): void {
    this.addListener('components.soundInitialPopup.pointerAction.popupButton', this._tintHandler.bind(this) as (params?: unknown) => void);
    this.addListener(Urso.events.MODULES_OBJECTS_HIT_AREA_PRESS, this._buttonPressHandler.bind(this) as (params?: unknown) => void);
  }
}

export default ComponentsSoundInitialPopupController;
