import ComponentsSoundInitialPopupTemplate from '../../../src/ts/components/soundInitialPopup/template';

describe('ComponentsSoundInitialPopupTemplate', () => {
  let mockUrso: ReturnType<typeof createMockUrso>;

  beforeEach(() => {
    mockUrso = createMockUrso();
    (globalThis as Record<string, unknown>).Urso = mockUrso;
  });

  function createSut(): ComponentsSoundInitialPopupTemplate {
    const sut = new ComponentsSoundInitialPopupTemplate();
    sut.emit = vi.fn() as ComponentsSoundInitialPopupTemplate['emit'];
    return sut;
  }

  it('should create objects array', () => {
    const sut = createSut();
    expect(Array.isArray(sut.objects)).toBe(true);
    expect(sut.objects.length).toBe(5);
  });

  it('should have HITAREA as first object', () => {
    const sut = createSut();
    expect(sut.objects[0].type).toBe(mockUrso.types.objects.HITAREA);
  });

  it('should have GRAPHICS as second object', () => {
    const sut = createSut();
    expect(sut.objects[1].type).toBe(mockUrso.types.objects.GRAPHICS);
  });

  it('should have TEXT as third object with Enable sound text', () => {
    const sut = createSut();
    expect(sut.objects[2].type).toBe(mockUrso.types.objects.TEXT);
    expect(sut.objects[2].text).toBe('Enable sound?');
  });

  it('should have YES button container', () => {
    const sut = createSut();
    const yesContainer = sut.objects[3];
    expect(yesContainer.type).toBe(mockUrso.types.objects.CONTAINER);
    expect(yesContainer.contents).toBeDefined();
    expect(yesContainer.contents!.length).toBe(3);
  });

  it('should have NO button container', () => {
    const sut = createSut();
    const noContainer = sut.objects[4];
    expect(noContainer.type).toBe(mockUrso.types.objects.CONTAINER);
    expect(noContainer.contents).toBeDefined();
    expect(noContainer.contents!.length).toBe(3);
  });

  it('should have onOverCallback in YES hit area', () => {
    const sut = createSut();
    const yesHit = sut.objects[3].contents![2];
    expect(yesHit.name).toBe('soundInitialPopupButtonYesHit');
    expect(typeof yesHit.onOverCallback).toBe('function');
    expect(typeof yesHit.onOutCallback).toBe('function');
  });

  it('should call emit on YES onOverCallback', () => {
    const sut = createSut();
    const yesHit = sut.objects[3].contents![2];
    yesHit.onOverCallback!();
    expect(sut.emit).toHaveBeenCalledWith(
      'components.soundInitialPopup.pointerAction.popupButton',
      { buttonName: 'yes', pointerOver: true },
    );
  });

  it('should call emit on NO onOutCallback', () => {
    const sut = createSut();
    const noHit = sut.objects[4].contents![2];
    noHit.onOutCallback!();
    expect(sut.emit).toHaveBeenCalledWith(
      'components.soundInitialPopup.pointerAction.popupButton',
      { buttonName: 'no', pointerOver: false },
    );
  });
});
