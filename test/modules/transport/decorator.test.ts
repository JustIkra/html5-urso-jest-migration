import ModulesTransportDecorator from '../../../src/ts/modules/transport/decorator';

describe('ModulesTransportDecorator', () => {
  it('should be a singleton', () => {
    const sut = new ModulesTransportDecorator({ callbacks: {} });
    expect(sut.singleton).toBe(true);
  });

  describe('toServer', () => {
    it('should return message as-is (identity transform)', () => {
      const sut = new ModulesTransportDecorator({ callbacks: {} });
      const message = { action: 'spin', data: { bet: 100 } };
      expect(sut.toServer(message)).toBe(message);
    });
  });

  describe('toFront', () => {
    it('should return message as-is (identity transform)', () => {
      const sut = new ModulesTransportDecorator({ callbacks: {} });
      const message = { action: 'result', data: { win: 500 } };
      expect(sut.toFront(message)).toBe(message);
    });
  });
});
