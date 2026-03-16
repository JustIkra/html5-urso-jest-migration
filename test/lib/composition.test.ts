import LibComposition from '../../src/ts/lib/composition';

describe('LibComposition', () => {
  describe('inherit', () => {
    it('should create a class inheriting from multiple bases', () => {
      class Base1 {
        value1: number;
        constructor(v?: unknown) {
          this.value1 = (v as number) || 10;
        }
        getVal1(): number {
          return this.value1;
        }
      }

      class Base2 {
        value2: string;
        constructor(v?: unknown) {
          this.value2 = (v as string) || 'hello';
        }
        getVal2(): string {
          return this.value2;
        }
      }

      const Combined = LibComposition.inherit(Base1, Base2);
      const instance = new Combined(42, 'world') as Record<string, unknown>;
      expect(instance.value1).toBe(42);
      expect(instance.value2).toBe('world');
    });

    it('should copy methods from base prototypes', () => {
      class WithMethod {
        greet(): string {
          return 'hello';
        }
      }

      const Combined = LibComposition.inherit(WithMethod);
      const instance = new Combined() as Record<string, unknown>;
      expect(typeof instance.greet).toBe('function');
      expect((instance as { greet: () => string }).greet()).toBe('hello');
    });
  });

  describe('copy', () => {
    it('should copy properties from source to target', () => {
      const target: Record<string, unknown> = {};
      const source = { a: 1, b: 'text' };
      LibComposition.copy(target, source);
      expect(target.a).toBe(1);
      expect(target.b).toBe('text');
    });

    it('should not copy constructor or prototype from source', () => {
      class Source {
        static staticProp = 'val';
      }
      const target: Record<string, unknown> = {};
      LibComposition.copy(target, Source);
      // constructor/prototype are filtered out — target retains Object.prototype defaults
      expect(target.constructor).not.toBe(Source);
      expect(target.staticProp).toBe('val');
    });

    it('should copy prototype chain when protoFlag is true', () => {
      class Parent {
        parentMethod(): string {
          return 'parent';
        }
      }
      class Child extends Parent {
        childMethod(): string {
          return 'child';
        }
      }

      const target: Record<string, unknown> = {};
      LibComposition.copy(target, Child.prototype, true);
      expect(typeof target.childMethod).toBe('function');
      expect(typeof target.parentMethod).toBe('function');
    });
  });
});
