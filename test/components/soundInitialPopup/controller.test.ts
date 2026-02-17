import ComponentsSoundInitialPopupController from '../../../src/ts/components/soundInitialPopup/controller';

describe('ComponentsSoundInitialPopupController', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  function createSut(): ComponentsSoundInitialPopupController {
    const sut = new ComponentsSoundInitialPopupController();
    sut.addListener = vi.fn() as ComponentsSoundInitialPopupController['addListener'];
    sut.removeListener = vi.fn() as ComponentsSoundInitialPopupController['removeListener'];
    sut.emit = vi.fn() as ComponentsSoundInitialPopupController['emit'];
    sut.common = {
      find: null,
      findAll: null,
      findOne: vi.fn() as unknown as ComponentsSoundInitialPopupController['common']['findOne'],
      object: { visible: true } as unknown as ComponentsSoundInitialPopupController['common']['object'],
    };
    return sut;
  }

  it('should start with null buttons', () => {
    const sut = createSut();
    expect(sut.yesButton).toBeNull();
    expect(sut.noButton).toBeNull();
  });

  describe('create', () => {
    it('should find yes and no button graphics', () => {
      const sut = createSut();
      const yesObj = { _baseObject: { tint: 0xFFFFFF } };
      const noObj = { _baseObject: { tint: 0xFFFFFF } };
      (sut.common.findOne as ReturnType<typeof vi.fn>).mockImplementation((selector: string) => {
        if (selector === '^soundInitialPopupButtonYesGraphics') return yesObj;
        if (selector === '^soundInitialPopupButtonNoGraphics') return noObj;
        return null;
      });
      sut.create();
      expect(sut.yesButton).toBe(yesObj);
      expect(sut.noButton).toBe(noObj);
    });
  });

  describe('_tintHandler', () => {
    it('should set tint on yes button when pointer over', () => {
      const sut = createSut();
      sut.yesButton = { _baseObject: { tint: 0xFFFFFF } };
      sut._tintHandler({ buttonName: 'yes', pointerOver: true });
      expect(sut.yesButton._baseObject.tint).toBe(0xd4be69);
    });

    it('should reset tint on yes button when pointer out', () => {
      const sut = createSut();
      sut.yesButton = { _baseObject: { tint: 0xd4be69 } };
      sut._tintHandler({ buttonName: 'yes', pointerOver: false });
      expect(sut.yesButton._baseObject.tint).toBe(0xFFFFFF);
    });

    it('should set tint on no button', () => {
      const sut = createSut();
      sut.noButton = { _baseObject: { tint: 0xFFFFFF } };
      sut._tintHandler({ buttonName: 'no', pointerOver: true });
      expect(sut.noButton._baseObject.tint).toBe(0xd4be69);
    });
  });

  describe('_buttonPressHandler', () => {
    it('should emit volume 1 for yes button', () => {
      const sut = createSut();
      sut._buttonPressHandler({ name: 'soundInitialPopupButtonYesHit' });
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_SOUND_MANAGER_SET_GLOBAL_VOLUME,
        1,
      );
    });

    it('should emit volume 0 for no button', () => {
      const sut = createSut();
      sut._buttonPressHandler({ name: 'soundInitialPopupButtonNoHit' });
      expect(sut.emit).toHaveBeenCalledWith(
        mockUrso.events.MODULES_SOUND_MANAGER_SET_GLOBAL_VOLUME,
        0,
      );
    });

    it('should hide component object after pressing yes or no', () => {
      const sut = createSut();
      sut._buttonPressHandler({ name: 'soundInitialPopupButtonYesHit' });
      expect((sut.common.object as { visible: boolean }).visible).toBe(false);
    });

    it('should not emit or hide for unknown button', () => {
      const sut = createSut();
      sut._buttonPressHandler({ name: 'unknownButton' });
      expect(sut.emit).not.toHaveBeenCalled();
      expect((sut.common.object as { visible: boolean }).visible).toBe(true);
    });
  });

  describe('_subscribeOnce', () => {
    it('should add listeners for pointer action and hit area press', () => {
      const sut = createSut();
      sut._subscribeOnce();
      expect(sut.addListener).toHaveBeenCalledWith(
        'components.soundInitialPopup.pointerAction.popupButton',
        expect.any(Function),
      );
      expect(sut.addListener).toHaveBeenCalledWith(
        mockUrso.events.MODULES_OBJECTS_HIT_AREA_PRESS,
        expect.any(Function),
      );
    });
  });
});
