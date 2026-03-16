## Phase 3 (future)

### Direct imports migration

Replace `window.Urso` global namespace with direct ES imports:
- Remove `globals.ts`
- Remove `config/load.ts` (namespace assembler)
- Replace all `Urso.xxx` calls with direct imports
- Replace all `this.getInstance('Path')` with direct class imports
- Remove `modules/instances/controller.ts`

### Type-safe `getInstance` registry

Define `interface InstanceMap { 'Lib.Helper': LibHelper; ... }` so `getInstance<'Lib.Helper'>` resolves return type automatically, eliminating manual generics.

### Arrow functions replacing `bind()` pattern

Replace `this._method = this._method.bind(this)` with arrow function class properties (`private _onFinish = (): void => { ... }`) where safe. Must verify no case relies on prototype-level method definition.

### Replace global `log()` with imported logger

Replace bare `log(...)` calls with `Urso.logger.debug(...)` or direct import.

### `recursiveGet` to nullish coalescing in model `setupParams()`

Refactor model setup to `this.fontFamily = params.fontFamily ?? 'Arial'` (idiomatic TS, eliminates indirection).

### `pixiPatch.ts` removal

Remove entirely once confirmed no game-level code depends on legacy PixiJS v5 patches.
