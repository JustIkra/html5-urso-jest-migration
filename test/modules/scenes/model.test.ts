import ModulesScenesModel from '../../../src/ts/modules/scenes/model';

describe('ModulesScenesModel', () => {
  it('should have loadUpdate as a no-op method', () => {
    const sut = new ModulesScenesModel();
    expect(() => sut.loadUpdate(50)).not.toThrow();
  });

  it('should have preload as a no-op method', () => {
    const sut = new ModulesScenesModel();
    expect(() => sut.preload()).not.toThrow();
  });

  it('should have create as a no-op method', () => {
    const sut = new ModulesScenesModel();
    expect(() => sut.create()).not.toThrow();
  });

  it('should have update as a no-op method', () => {
    const sut = new ModulesScenesModel();
    expect(() => sut.update(16)).not.toThrow();
  });

  it('should have render as a no-op method', () => {
    const sut = new ModulesScenesModel();
    expect(() => sut.render()).not.toThrow();
  });

  it('should have destroy as a no-op method', () => {
    const sut = new ModulesScenesModel();
    expect(() => sut.destroy()).not.toThrow();
  });

  it('should allow lifecycle methods to be overwritten', () => {
    const sut = new ModulesScenesModel();
    const customCreate = vi.fn();
    sut.create = customCreate;
    sut.create();
    expect(customCreate).toHaveBeenCalledTimes(1);
  });
});
