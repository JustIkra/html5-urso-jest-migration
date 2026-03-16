type Constructor = new (...args: unknown[]) => object;

class LibComposition {
  public static inherit(..._bases: Constructor[]): Constructor {
    class Classes {
      public get base(): Constructor[] {
        return _bases;
      }

      constructor(..._args: unknown[]) {
        let index = 0;

        for (const b of this.base) {
          const obj = new b(_args[index++]);
          LibComposition.copy(this, obj);
        }
      }
    }

    for (const base of _bases) {
      LibComposition.copy(Classes, base);
      LibComposition.copy(Classes.prototype, base.prototype, true);
    }

    return Classes as unknown as Constructor;
  }

  public static copy(_target: object, _source: object, protoFlag?: boolean): void {
    for (const key of Reflect.ownKeys(_source)) {
      if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
        const desc = Object.getOwnPropertyDescriptor(_source, key);
        if (desc) {
          Object.defineProperty(_target, key, desc);
        }
      }
    }

    if (protoFlag && Object.getPrototypeOf(_source) !== Object.prototype) {
      LibComposition.copy(_target, Object.getPrototypeOf(_source) as object);
    }
  }
}

export default LibComposition;
