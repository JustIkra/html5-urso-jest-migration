# @urso/core TypeScript Migration -- Testing Strategy & QA Scenarios

---

## 1. Phase 0 Verification Criteria

Phase 0 is "infrastructure only" -- no source files are converted yet. The following must pass before Block 1 begins:

### 1.1 TypeScript Compiler

| Check | Command | Expected |
|-------|---------|----------|
| tsconfig.json exists and is valid | `npx tsc --showConfig` | Exits 0, prints resolved config |
| `src/ts/types.ts` compiles | `npx tsc --noEmit` | Exit 0, zero errors |
| `src/ts/globals.ts` compiles | `npx tsc --noEmit` | Exit 0, zero errors |
| No `any` in types.ts | `grep -c '\bany\b' src/ts/types.ts` | 0 matches |
| `strict: true` is active | `npx tsc --showConfig \| grep strict` | `"strict": true` |

### 1.2 Vitest Runner

| Check | Command | Expected |
|-------|---------|----------|
| `npm run test` executes | `npm run test` | Exit 0, "no test files found" or green pass |
| `npm run test:watch` starts | `npm run test:watch` | Process starts, prints "waiting for file changes" |
| `npm run test:coverage` runs | `npm run test:coverage` | Exit 0, prints coverage summary (0 files covered is OK) |
| jsdom environment active | Create `test/smoke.test.ts` with `expect(typeof document).toBe('object')` | Passes |
| Global `describe`/`it`/`expect` available | `test/smoke.test.ts` uses them without imports | Passes |

### 1.3 Mock Aliases

| Check | Expected |
|-------|----------|
| `import { Container } from 'pixi.js'` in a test file resolves to `test/__mocks__/pixi.ts` | No import error, `Container` is a mock class |
| `import gsap from 'gsap'` resolves to `test/__mocks__/gsap.ts` | `gsap.to` is a `vi.fn()` |
| `import { Howl, Howler } from 'howler'` resolves to `test/__mocks__/howler.ts` | `Howl` is a mock class, `Howler.codecs` is a `vi.fn()` |

### 1.4 test/setup.ts

| Check | Expected |
|-------|----------|
| `createMockUrso()` is globally available in tests | Can be called in any test file without import |
| The mock provides `observer`, `helper`, `logger`, `math`, `time`, `cache`, `config` | Each property exists and is callable |
| `window.Urso` is set by setup.ts | `typeof window.Urso !== 'undefined'` in test |
| `window.log` is set (noop) | `typeof window.log === 'function'` |

### 1.5 Smoke Test

A `test/smoke.test.ts` file must exist and pass with:
- At least one test using `createMockUrso()`
- At least one test importing from each mock (`pixi.ts`, `gsap.ts`, `howler.ts`)
- At least one test importing from `types.ts`

### 1.6 Existing Build Unbroken

| Check | Command | Expected |
|-------|---------|----------|
| JS build still works | `npm run build:prod` | Exit 0, `build/` directory contains output |
| Dev server still works | `npm run dev` | Starts without error |

---

## 2. Mock Requirements

### 2.1 `test/__mocks__/pixi.ts` -- PIXI Mock

Based on actual usage in the codebase:

**Classes needed** (from `baseModel.js`, `scenes/`, `objects/models/`):

| Class | Methods/Properties to Mock | Source Reference |
|-------|---------------------------|-----------------|
| `Container` | `addChild`, `removeChild`, `destroy`, `toGlobal`, `toLocal`, `sortChildren`, `children`, `scale` (getter: `{x,y}`), `transform`, `width`, `height`, `visible`, `alpha`, `position`, `parent` | `baseModel.js:80,166-188,206` |
| `Sprite` | extends Container + `texture`, `anchor` (`{set(x,y)}`) | `objects/models/image.js` |
| `Text` | extends Container + `text`, `style`, `resolution` | `objects/models/text.js` |
| `Graphics` | extends Container + `beginFill`, `drawRect`, `drawCircle`, `endFill`, `clear`, `lineStyle` | `objects/models/graphics.js` |
| `BitmapText` | extends Container + `text`, `font` | `objects/models/bitmapText.js` |
| `NineSlicePlane` | extends Container + `leftWidth`, `rightWidth`, `topHeight`, `bottomHeight` | `objects/models/nineSlicePlane.js` |
| `Texture` | `from` (static), `EMPTY` (static), `width`, `height`, `baseTexture` | `baseModel.js:196` |
| `Application` | `renderer` (with `generateTexture`), `stage`, `ticker` (`add`, `remove`), `screen` | `scenes/pixiWrapper.js` |
| `Assets` | `load` (static, returns Promise) | `lib/loader.js:166` |

**Implementation pattern:**
```ts
export class Container {
  children: Container[] = [];
  scale = { x: 1, y: 1 };
  position = { x: 0, y: 0 };
  visible = true;
  alpha = 1;
  width = 0;
  height = 0;
  parent: Container | null = null;
  transform = {};

  addChild = vi.fn((child) => { this.children.push(child); return child; });
  removeChild = vi.fn();
  destroy = vi.fn();
  toGlobal = vi.fn(() => ({ x: 0, y: 0 }));
  toLocal = vi.fn(() => ({ x: 0, y: 0 }));
  sortChildren = vi.fn();
}
```

All classes should use `vi.fn()` for methods so tests can assert call counts, arguments, etc.

### 2.2 `test/__mocks__/gsap.ts` -- GSAP Mock

Based on actual usage in `lib/tween.js:217` (SoundSprite uses `gsap.to`) and indirectly via `Urso.setTimeout`/`Urso.clearTimeout`:

| Export | Methods/Properties | Source Reference |
|--------|-------------------|-----------------|
| `gsap` (default) | `to(target, duration, vars)`, `from(...)`, `fromTo(...)`, `killTweensOf(target)`, `timeline()` | `soundSprite.js:217`, general GSAP usage |
| `Tween` (type) | `kill()`, `ratio` (number), `progress()`, `pause()`, `resume()` | `soundSprite.js:202-204` |

**Implementation pattern:**
```ts
const mockTween = {
  kill: vi.fn(),
  ratio: 0,
  progress: vi.fn(() => 0),
  pause: vi.fn(),
  resume: vi.fn(),
};

const gsap = {
  to: vi.fn(() => ({ ...mockTween })),
  from: vi.fn(() => ({ ...mockTween })),
  fromTo: vi.fn(() => ({ ...mockTween })),
  killTweensOf: vi.fn(),
  timeline: vi.fn(() => ({ to: vi.fn(), from: vi.fn() })),
};

export default gsap;
export { gsap };
```

### 2.3 `test/__mocks__/howler.ts` -- Howler Mock

Based on actual usage in `soundManager/controller.js:18` and `soundManager/soundSprite.js`:

| Export | Methods/Properties | Source Reference |
|--------|-------------------|-----------------|
| `Howl` (class) | `play(sprite?)`, `stop(id?)`, `pause(id?)`, `volume(vol?, id?)`, `loop(loop?, id?)`, `mute(muted?, id?)`, `on(event, fn)`, `playing(id?)`, `unload()`, `_volume` | `soundSprite.js:113,128,132,151,168,180,186,191` |
| `Howler` (object) | `codecs(ext)` returns boolean, `_audioUnlocked` (boolean) | `soundManager/controller.js:18`, `soundSprite.js:80` |

**Implementation pattern:**
```ts
export class Howl {
  _volume = 1;
  play = vi.fn(() => 1);        // returns sound ID
  stop = vi.fn();
  pause = vi.fn();
  volume = vi.fn();
  loop = vi.fn();
  mute = vi.fn();
  playing = vi.fn(() => false);
  on = vi.fn();
  unload = vi.fn();

  constructor(_opts: Record<string, unknown>) {}
}

export const Howler = {
  codecs: vi.fn(() => true),
  _audioUnlocked: true,
};
```

Note: `soundSprite.js` also references `UrsoUtils.Howl` and `UrsoUtils.Howler` -- the TS migration should standardize to direct `howler` imports. The mock alias in vite config handles this.

---

## 3. `createMockUrso()` Specification

Based on how `Urso` is used across the entire codebase, `createMockUrso()` must provide:

### 3.1 Required Properties

| Property | Type | Rationale |
|----------|------|-----------|
| `Urso.helper` | Real `LibHelper` instance | Pure logic, no dependencies, used everywhere (`recursiveGet` in baseModel.js:27-58, `stringReplace` in selector.js:124, `objectClone` in tween.js:179, `getObjectSize` in observer/controller.js:119) |
| `Urso.math` | Real `LibMath` instance | Pure logic (`intMakeBetween` used in helper.js:533, soundManager/controller.js:77) |
| `Urso.time` | Mock with `get: vi.fn(() => Date.now())` | Used in objectPool.js:162 and statesManager/action.js:39 |
| `Urso.logger` | `{ error: vi.fn(), warn: vi.fn(), log: vi.fn(), info: vi.fn() }` | Called in observer/controller.js:11,43,112, statesManager/controller.js:66, many modules |
| `Urso.observer` | Mock observer with `add/remove/fire` that track callbacks | Used by all controllers via `this.addListener`/`this.emit` |
| `Urso.cache` | Mock with `vi.fn()` for each add*/get* method | Used in loader.js:53-93, cache.js everywhere |
| `Urso.config` | `{ defaultLogLevel: '0,1,2,3', gamePath: '/', useBinPath: false, appVersion: '1.0' }` | Used in logger.js:53, loader.js:37-47 |
| `Urso.objects` | Mock with `destroy`, `addChild`, `removeChild`, `getWorld`, `refreshStyles`, etc. | Used in baseModel.js:70-162 |
| `Urso.scenes` | Mock with `generateTexture: vi.fn()`, `timeScale: 1`, `display: vi.fn()` | Used in baseModel.js:196, tween.js:19 |
| `Urso.statesManager` | Mock with `runAction`, `terminateAction` | Used in statesManager/action.js:26,64 |
| `Urso.localData` | Mock with `get: vi.fn()`, `set: vi.fn()` | Used in soundManager/controller.js:49 |
| `Urso.device` | Mock with `{ iOS: false, desktop: true, ... }` | Used in soundSprite.js:294, helper.js:447 |
| `Urso.events` | Real `UrsoEvent` enum values | Used as event name constants everywhere |
| `Urso.types` | `{ assets: AssetTypeId, objects: ObjectTypeId }` | Used in loader.js:59-91 |
| `Urso.getInstance` | `vi.fn()` returning mock singletons | Used by controllers (observer/controller.js:4, statesManager/controller.js:14-17) |
| `Urso.getByPath` | `vi.fn()` returning mock classes | Used by instances controller |

### 3.2 `getInstance` / `getByPath` Pattern

Many classes call `this.getInstance(...)` -- this is injected by the `ModulesInstancesController`. In tests, either:
- Provide `getInstance` as a method on the class prototype before construction
- Or pass it via `createMockUrso()` on `window.Urso`

Recommended: `createMockUrso()` should also export a helper `mockGetInstance(map)` where map is `{ 'ClassName': mockInstance }`.

### 3.3 `addListener` / `removeListener` / `emit` Pattern

Controllers use `this.addListener(event, callback, global)` -- these are mixins injected during initialization. In tests:
- `createMockUrso()` should provide `addListener`, `removeListener`, `emit` as `vi.fn()` stubs on the prototype
- Or a helper `injectObserverMethods(instance, mockObserver)` that wires them to a real tracking observer

### 3.4 Return Shape

```ts
interface MockUrso {
  helper: LibHelper;          // real instance
  math: LibMath;              // real instance
  time: { get: Mock };
  logger: { error: Mock; warn: Mock; log: Mock; info: Mock };
  observer: MockObserver;
  cache: MockCache;
  config: Record<string, unknown>;
  objects: MockObjects;
  scenes: MockScenes;
  statesManager: MockStatesManager;
  localData: { get: Mock; set: Mock };
  device: Partial<DeviceCapabilities>;
  events: typeof UrsoEvent;
  types: { assets: typeof AssetTypeId; objects: typeof ObjectTypeId };
  getInstance: Mock;
  getByPath: Mock;
}
```

---

## 4. Test Scenarios for Block 1 (Utilities)

### 4.1 `lib/helper.ts` -- 30 public methods

| Method | Test Cases |
|--------|-----------|
| `parseGetParams(name?)` | 1. No query string -> empty object. 2. `?foo=bar` -> `{foo:'bar'}`. 3. `?a=1&b=2` -> two params. 4. `?flag` (no value) -> `{flag:''}`. 5. Named param `parseGetParams('foo')` -> returns value. 6. Named param missing -> returns `undefined`. |
| `waitForDomElement(selector)` | 1. Element already exists -> resolves immediately. 2. Element added after call -> resolves when added. (jsdom + MutationObserver) |
| `arraysGetUniqElements(a, b)` | 1. `[1,2,3], [2,3,4]` -> `[1,4]`. 2. No overlap -> all elements. 3. Complete overlap -> empty. 4. Empty arrays -> empty. |
| `stringReplace(needle, replacement, haystack)` | 1. Single occurrence. 2. Multiple occurrences. 3. No match -> unchanged. 4. Empty needle. |
| `capitaliseFirstLetter(str)` | 1. `"hello"` -> `"Hello"`. 2. Already capitalized. 3. Single char. 4. Empty string. |
| `initial(array)` | 1. `[1,2,3]` -> `[1,2]`. 2. Single element -> `[]`. 3. **NOTE: mutates input** (verify this). |
| `ldgZero(num, count)` | 1. `(5, 3)` -> `"005"`. 2. Already long enough -> no padding. 3. `(0, 2)` -> `"00"`. |
| `mergeArrays(a, b)` | 1. No duplicates -> concatenated. 2. Overlapping elements -> no duplicates. 3. Empty arrays. |
| `objectFlip(obj)` | 1. `{a:1, b:2}` -> `{1:'a', 2:'b'}`. 2. Empty object. |
| `recursiveSet(key, value, object)` | 1. Simple key. 2. Dot-path `"a.b.c"`. 3. Creates intermediary objects. 4. Returns `true`. |
| `recursiveGet(key, object, default)` | 1. Simple key exists. 2. Dot-path `"a.b.c"`. 3. Key missing -> returns default. 4. Object is `undefined` -> returns default. 5. Array key format. |
| `recursiveDelete(key, obj)` | 1. Key exists -> deleted, returns `true`. 2. Key missing -> returns `false`. 3. Dot-path deletion. |
| `rowsToCols(matrix)` | 1. 2x3 matrix -> 3x2. 2. Single row. |
| `transpose(matrix)` | 1. Same as rowsToCols (verify equivalence). |
| `mergeObjectsRecursive(obj1, obj2, mergeInFirst)` | 1. Shallow merge. 2. Deep nested merge. 3. `mergeInFirstFlag=true` mutates obj1. 4. `mergeInFirstFlag=false` returns new object. |
| `renameObjectsKey(obj, old, new)` | 1. Key renamed. 2. Old key deleted. 3. Same key -> no-op. |
| `objectClone(obj, recursiveCalls)` | 1. Shallow clone. 2. Deep nested clone. 3. Array cloning. 4. `imageSrc` property preserved as reference. 5. Recursion limit -> `'[object Object]'`. 6. Non-object input -> returned as-is. |
| `getObjectSize(obj)` | 1. `{a:1, b:2}` -> 2. 2. Empty -> 0. |
| `objectApply(from, to, recursiveCalls)` | 1. Applies missing keys. 2. Overwrites existing keys. 3. Recursion for nested objects. 4. Recursion limit. |
| `checkDeepEqual(obj1, obj2)` | 1. Equal objects -> `true`. 2. Different objects -> `false`. 3. Nested equality. |
| `checkEqual(obj1, obj2)` | 1. Same keys, different order -> `true`. 2. Different values -> `false`. |
| `checkArraysPartialEntry(main, partial)` | 1. Partial is subset -> `true`. 2. Not subset -> `false`. 3. Null inputs -> `false`. |
| `mobileAndTabletCheck()` | 1. Desktop UA -> `false`. 2. Mobile UA -> `true`. (Requires mocking `navigator.userAgent`) |
| `isIpadOS()` | 1. iPad conditions met -> `true`. 2. Not iPad -> `false`. |
| `reactive(target, key, callback)` | 1. Setting value triggers callback. 2. Getter still works. 3. No descriptor -> returns `false`. |
| `getLengthBy2Points(p1, p2)` | 1. `{x:0,y:0}, {x:3,y:4}` -> `5`. 2. Same point -> `0`. |
| `getAngleBy3Points(p1, p2, p3)` | 1. Right angle -> `Math.PI/2`. 2. Collinear points -> `0`. (Requires `Urso.math.intMakeBetween`) |
| `getRadian(angle)` | 1. `180` -> `Math.PI`. 2. `0` -> `0`. |
| `getAngle(radian)` | 1. `Math.PI` -> `180`. 2. `0` -> `0`. |
| `interpolate(string, params)` | 1. `'Hello ${name}'` with `{name:'World'}` -> `'Hello World'`. 2. Multiple params. 3. No matching params -> unchanged placeholders. |
| `getRGB(color)` | 1. Known color values (white, red, green, blue). 2. Alpha channel for 32-bit colors. |
| `getColor32(a, r, g, b)` | 1. Known ARGB -> correct 32-bit. 2. Roundtrip with `getRGB`. |
| `interpolateColor32(start, target, step)` | 1. Step 0 -> start color. 2. Step 1 -> target color. 3. Same color -> same color returned. |
| `interpolateColorRGB(start, target, step)` | 1. Step 0.5 -> midpoint. 2. Boundary values. |
| `logicBlocksDo(entity, funcName, ...)` | 1. Creates instances on first call. 2. Calls function on each block. 3. Returns results array. (Requires mock entity with `_logicBlocks` and `getInstance`) |

**Total: ~70+ individual test cases**

### 4.2 `lib/math.ts` -- 11 methods (2 private)

| Method | Test Cases |
|--------|-----------|
| `intMakeBetween(num, min, max)` | 1. In range -> unchanged. 2. Below min -> min. 3. Above max -> max. 4. Equal to boundary. |
| `getRandomInt(max)` | 1. Returns integer in range [0, max]. 2. Multiple calls produce valid range (statistical). |
| `getRandomIntBetween(min, max)` | 1. Range [0, 0] -> 0. 2. Range [5, 10] -> within range. 3. Multiple calls stay in range. |
| `roundToDigits(num, digits)` | 1. `(1.2345, 2)` -> `1.23`. 2. `(NaN, 2)` -> `false`. 3. Integer input. |
| `isInt(n)` | 1. `5` -> `true`. 2. `5.5` -> `false`. 3. `0` -> `true`. 4. String -> `false`. |
| `isFloat(n)` | 1. `5.5` -> `true`. 2. `5` -> `false`. 3. `0.0` -> `false` (JS treats as int). |
| `getDecimalsLength(number)` | 1. `1.23` -> `2`. 2. `5` -> `0`. 3. `0.12345` -> `5`. |
| `multiplyFloats(numsArray)` | 1. `[0.1, 0.2]` -> `0.02` (not `0.020000000000000004`). 2. All integers -> normal multiply. |
| `addFloats(numsArray)` | 1. `[0.1, 0.2]` -> `0.3` (not `0.30000000000000004`). 2. Mixed int/float. |
| `subtractFloats(numsArray)` | 1. `[0.3, 0.1]` -> `0.2`. 2. Negative results. |
| `getMaxDecimalsLength(numsArray)` | 1. `[1.23, 4.5678]` -> `4`. 2. All integers -> `0`. 3. Array with falsy values. |

**Total: ~30 test cases**

### 4.3 `lib/time.ts` -- 2 methods

| Method | Test Cases |
|--------|-----------|
| `get(date?)` | 1. No arg -> returns current timestamp (within 100ms of `Date.now()`). 2. Specific date -> returns that timestamp. |
| `getUnixtime(date?)` | 1. No arg -> current unix timestamp (seconds). 2. Specific date -> correct seconds. |

**Total: ~4 test cases**

### 4.4 `lib/logger.ts` -- 4 public methods

| Method | Test Cases |
|--------|-----------|
| Constructor | 1. Parses logLevel from URL params. 2. Falls back to `Urso.config.defaultLogLevel`. 3. Sets `window.log`. |
| `log(...)` | 1. When LOG level enabled -> calls `console.log`. 2. When disabled -> no-op. |
| `warn(...)` | 1. When WARNING level enabled -> calls `console.warn`. 2. When disabled -> no-op. |
| `error(...)` | 1. When ERROR level enabled -> calls `console.error`. 2. When disabled -> no-op. |
| `info(...)` | 1. When INFO level enabled -> calls `console.info`. 2. When disabled -> no-op. |

**Requires:** Mock `Urso.helper.parseGetParams` and `Urso.config.defaultLogLevel`.

**Total: ~10 test cases**

### 4.5 `lib/cache.ts` -- ~26 methods

| Method Group | Test Cases |
|-------------|-----------|
| `addX(key, data)` / `getX(key)` for each asset type | 1. Add then get returns same data. 2. Get nonexistent returns `undefined`. 3. Duplicate key logs warning. |
| `addTexture(key, data)` | 1. Strips file extension from key (`"image.png"` -> stored as `"image"`). |
| `addAtlas(key, data)` | 1. Clears `_globalAtlas` on add. |
| `clearGlobalAtlas()` | 1. Sets `_globalAtlas` to null. |
| `globalAtlas` getter | 1. Creates on first access. 2. Returns cached on subsequent access. |

**Note:** `_createGlobalAtlas()` depends on `@esotericsoftware/spine-pixi-v8` -- this is complex and should be tested with a simplified mock of the spine module. Focus on the caching behavior, not the atlas creation internals.

**Total: ~35 test cases**

### 4.6 `lib/objectPool.ts` -- 7 public-facing methods

| Method | Test Cases |
|--------|-----------|
| Constructor | 1. Creates with constructorFunction/resetFunction. 2. `initialSize` pre-populates pool. 3. `maxSize` is stored. |
| `getElement(key, additionalArgs)` | 1. Empty pool -> creates new element. 2. Freed element -> reuses it. 3. Different keys -> separate branches. 4. Returns `ObjectPoolMember` with `data`, `key`, `branchKey`. |
| `putElement(element)` | 1. Marks element as free. 2. Calls resetFunction. 3. Adds to `_putTimeCache` when maxSize set. |
| `_checkMaxSize()` | 1. Below max -> no removal. 2. Above max -> removes oldest inactive element. |
| `_removeOldestInactiveElement()` | 1. Removes from pool and putTimeCache. 2. Calls removeFunction. |
| `_getPoolSize()` | 1. Returns total count across all branches. |
| `_debugGetPoolData()` | 1. Returns internal pool state. |

**Requires:** Mock `Urso.time.get()` to control branch keys.

**Total: ~18 test cases**

### 4.7 `lib/localData.ts` -- 2 methods

| Method | Test Cases |
|--------|-----------|
| `get(name)` | 1. Existing key -> returns value. 2. Missing key -> returns `undefined`. 3. Dot-path key. |
| `set(key, value)` | 1. Simple key. 2. Dot-path creates nested structure. 3. Returns `true`. |

**Requires:** Real `Urso.helper` (for `recursiveGet`/`recursiveSet`).

**Total: ~6 test cases**

### 4.8 `lib/composition.ts` -- 2 static methods

| Method | Test Cases |
|--------|-----------|
| `inherit(...bases)` | 1. Single base class -> properties/methods copied. 2. Two base classes -> both mixed in. 3. Constructor args forwarded. 4. Prototype methods available. |
| `copy(target, source, protoFlag)` | 1. Copies own properties. 2. Skips `constructor`, `prototype`, `name`. 3. `protoFlag=true` copies prototype chain. |

**Total: ~8 test cases**

### 4.9 `lib/tween.ts` -- Custom tween manager

| Method | Test Cases |
|--------|-----------|
| Constructor | 1. Initializes empty `_tweens`. 2. `globalTimeScale` getter reads from `Urso.scenes.timeScale`. |
| `add(object)` | 1. Returns tween with correct structure. 2. Tween has `to`, `start`, `pause`, `resume`, `stop` methods. 3. `onComplete.add`/`addOnce` register callbacks. 4. `onStart.add`/`addOnce` register callbacks. |
| `_to(propsTo, duration, easing, autostart, startDelay)` | 1. Records `propsFrom` from current target values. 2. Pushes point. 3. Autostart calls `start()`. |
| `_start()` | 1. Sets `isRunning = true`. 2. Fires onStart callbacks. 3. Does nothing if already running. |
| `_pause()` / `_resume()` | 1. Pause stops running. 2. Resume adjusts timeStart. |
| `_stop()` | 1. Sets `_complete = true`. 2. Removes from manager. |
| `_update()` | 1. Processes active tweens. 2. Skips paused tweens. 3. Removes completed tweens. |
| `_calcStep(tween)` | 1. Applies progress to target properties. 2. Progress=1 triggers completion callbacks. 3. Multi-point transitions advance. |
| `timeScale` setter | 1. Adjusts remaining duration. 2. No-op if same value. |
| `removeAll()` | 1. Calls stop on all tweens. |

**Note:** Tween depends on `this.addListener` (for scene update event) -- must inject mock. The tween system is custom (not GSAP) -- this is the engine's own tween implementation.

**Total: ~25 test cases**

### 4.10 `lib/device.ts` -- Singleton with detection

| Area | Test Cases |
|------|-----------|
| `whenReady(callback)` | 1. If already ready -> callback invoked immediately. 2. If not ready -> queued. |
| `canPlayAudio(type)` | 1. Returns true for supported types. 2. Returns false for unsupported. |
| `canPlayVideo(type)` | 1. Returns true for supported types. 2. Returns false for unsupported. |
| `_initialize()` (internal) | Test indirectly through `whenReady`. Set up jsdom with specific userAgent and verify detected properties. |
| `isAndroidStockBrowser()` | 1. Android stock UA -> `true`. 2. Chrome UA -> `false`. |
| `isConsoleOpen()` | 1. Basic test with mocked console. |

**Note:** Device.js is a singleton immediately instantiated (`new LibDevice()`). This makes testing tricky -- the TS version should allow constructor injection or test the detection functions independently. Consider testing the detection functions as pure functions that receive `navigator`/`window` as arguments.

**Total: ~15 test cases**

### 4.11 `lib/loader.ts` -- Asset loader

| Method | Test Cases |
|--------|-----------|
| `isRunning()` | 1. Initially false. 2. True during load. |
| `addAsset(asset)` | 1. Pushes to queue. |
| `_getLoadPath(asset)` | 1. Absolute URL -> returns as-is. 2. Relative path -> prepends gamePath. 3. `useBinPath=true` -> bin path with quality. |
| `_storeAsset(asset, resource)` | 1. Routes each asset type to correct cache method. 2. Error resource -> logs warning. |
| `start(callback)` | 1. Empty queue -> calls callback immediately. 2. Already running -> returns false. 3. Loads assets and calls callback. |
| `_getJsonDataFromJsonAtlases(key)` | 1. Found in atlas -> returns data. 2. Not found -> returns null. |
| `_onError(error)` | 1. Resets loader. 2. Schedules retry. |

**Requires:** Mock `PIXI.Assets`, `Urso.cache`, `Urso.config`, `Urso.getInstance`.

**Total: ~15 test cases**

---

## 5. Definition of Done (DoD) Checklist Template

Use this checklist for each block:

### Block N: [Name]

- [ ] **All source files converted** -- every `.js` file in the block has a corresponding `.ts` file in `src/ts/`
- [ ] **All test files created** -- every `.ts` source file has a corresponding `.test.ts` in `test/`
- [ ] **TypeScript compiles** -- `npm run typecheck` exits 0 with zero errors
- [ ] **Zero `any`** -- `grep -r '\bany\b' src/ts/[block-path]/` returns 0 matches (excluding comments)
- [ ] **All tests pass** -- `npm run test` exits 0
- [ ] **No test skips** -- no `it.skip` or `describe.skip` in committed tests
- [ ] **Coverage meets thresholds** -- `npm run test:coverage` for block files meets:
  - Statements >= 80%
  - Branches >= 70%
  - Functions >= 80%
  - Lines >= 80%
- [ ] **No regressions** -- all previously passing tests still pass
- [ ] **JS build unbroken** -- `npm run build:prod` still succeeds (JS entry point unchanged until Block 10)
- [ ] **Null over false (Phase 2 only)** -- in Phase 1, `false | null` union types are acceptable and runtime defaults remain unchanged. Full `null`-only conversion is deferred to Phase 2.
- [ ] **Private/protected correct** -- `_` prefixed members are `private` or `protected` (protected only if overridden in subclass)

---

## 6. Coverage Strategy Assessment

### Proposed thresholds: 80/70/80/80

| Threshold | Value | Assessment |
|-----------|-------|-----------|
| Statements | 80% | **Appropriate.** Most lib/module code is straightforward logic that can be covered. The 20% gap accommodates error paths in device detection, Spine atlas creation, and edge cases in browser-specific code. |
| Branches | 70% | **Appropriate.** This is the right choice because: (a) `device.ts` has ~50 browser/OS detection branches that are hard to test without real browsers, (b) `loader.ts` has commented-out FIXME branches, (c) `soundSprite.ts` has branches depending on audio codec availability. 70% allows these to be partially covered. |
| Functions | 80% | **Appropriate.** Some private/internal functions (like `_checkCSS3D`, `_checkIsUint8ClampedImageData` in device.ts) are difficult to exercise in jsdom. 80% accounts for these. |
| Lines | 80% | **Appropriate.** Consistent with statements threshold. |

### Per-Category Expected Coverage

| Category | Expected Coverage | Notes |
|----------|------------------|-------|
| Pure logic (helper, math, time, objectPool, selector, functionsStorage) | 90-95% | Fully testable, no external dependencies |
| Observer | 85-90% | Straightforward event bus logic |
| Object models (baseModel + 20 models) | 75-85% | PIXI integration complicates some paths. `toGlobal`/`toLocal` depend on PIXI coordinate transforms. |
| StatesManager (action, race, all, sequence) | 85-90% | Logic-heavy, well-structured inheritance chain |
| Device detection | 50-60% | Browser-specific branches, jsdom limitations. **This is the biggest drag on overall branches coverage.** |
| Sound manager | 70-80% | Howler integration, audio unlock flow, codec detection |
| Loader | 65-75% | Async loading, PIXI.Assets, many commented-out code paths |
| Components | 75-85% | Lifecycle hooks testable, but some depend on full scene setup |

### Recommendation

**The 80/70/80/80 thresholds are well-calibrated for this codebase.** The branch threshold of 70% is especially important because `device.ts` alone contains ~100 browser-specific branches. Attempting 80% branches would require unreasonable effort mocking every browser variant. The thresholds should be enforced per-file in CI to prevent easy files inflating the average while hard files have no coverage.

---

## 7. Risk Areas

### 7.1 HIGH RISK: `lib/device.ts` (Hardest to Test)

**Why:** The file is a singleton that self-instantiates (`LibDevice = new LibDevice()`). The `_initialize` function runs browser detection using `navigator.userAgent`, `document.createElement`, and many DOM APIs. In jsdom:
- `canvas.getContext('webgl')` returns null
- `videoElement.canPlayType()` may not work correctly
- CSS3D detection requires computed styles
- The webP test uses an `Image()` with async onload

**Mitigation:** Refactor during TS conversion to extract detection functions as pure functions that accept `navigator` and `document` as parameters. Test the detection logic separately from the singleton initialization. Accept ~50-60% coverage for this file.

### 7.2 HIGH RISK: `lib/tween.ts` (Custom Tween Engine)

**Why:** The tween system has complex time-dependent logic (`_calcStep`, `_applyDelta`, `timeScale` interactions) and depends on the scene update loop (`this.addListener(MODULES_SCENES_UPDATE, ...)`). The `_update` method uses `new Date().getTime()` directly, making deterministic testing difficult.

**Mitigation:**
- Use `vi.useFakeTimers()` and `vi.setSystemTime()` for deterministic time control
- Inject the update loop manually in tests rather than relying on event subscription
- Test `_calcStep` and `_applyDelta` in isolation with known time values

### 7.3 MEDIUM RISK: `modules/objects/baseModel.ts` (Heavy Urso Coupling)

**Why:** Nearly every method calls `Urso.helper`, `Urso.objects`, `Urso.scenes`, or `Urso.cache`. Methods like `toGlobal()` and `toLocal()` depend on PIXI coordinate transforms and the existence of a "world" object with `_baseObject.scale`.

**Mitigation:** Comprehensive `createMockUrso()` with properly mocked `Urso.objects.getWorld()` returning an object with `_baseObject.scale = {x:1, y:1}`. Test `setupParams` thoroughly (it is pure data mapping). Accept limited coverage on `toGlobal`/`toLocal`.

### 7.4 MEDIUM RISK: `modules/soundManager/` (External Library + Async)

**Why:** `soundSprite.ts` depends on `Howl`, `Howler`, `FileReader`, `Blob`, and `gsap.to()`. The audio unlock flow is asynchronous and event-driven. The `playDummy()` method creates real `Howl` instances with base64 audio data.

**Mitigation:** Mock `Howl`/`Howler` completely. Mock `FileReader` with synchronous `onloadend`. Test the state machine logic (`_soundsState`) independently from the audio playback.

### 7.5 MEDIUM RISK: `modules/statesManager/controller.ts` (Iterator + Recursion)

**Why:** The `_nextState` method calls itself recursively when a guard fails. The `_iteratorConstructor` uses closures and `this._configStates`. The `start()` method triggers an immediate cascade of state transitions.

**Mitigation:** Test the iterator independently with known config. Use `vi.fn()` for `getInstance('Helper').getActionByConfig` to return controlled action mocks. Test guard/run/terminate functions independently via the `FunctionsStorage` interface.

### 7.6 LOW RISK: `lib/cache.ts` (Spine Dependency)

**Why:** `_createGlobalAtlas()` creates a `spine.TextureAtlas` with `TextureAtlasPage` and `TextureAtlasRegion` objects. This is complex but isolated behind the `globalAtlas` getter.

**Mitigation:** Mock `@esotericsoftware/spine-pixi-v8` entirely. Test the caching behavior (add/get/clear) separately from the atlas creation. The atlas creation can have a dedicated integration test later.

### 7.7 LOW RISK: `this.getInstance()` / `this.getByPath()` Coupling

**Why:** Most controller constructors call `this.getInstance(...)` (e.g., observer/controller.js:4, statesManager/controller.js:14-17). This is a runtime dependency injection that must be replicated in tests.

**Mitigation:** `createMockUrso()` should provide a `mockInstanceResolver` that maps class names to mock instances. Apply it to prototypes before construction. Document the pattern clearly in `test/setup.ts`.

---

## Summary

| Item | Count |
|------|-------|
| Block 1 test files | 11 |
| Block 1 total test cases (estimated) | ~240 |
| Mock files | 3 (pixi, gsap, howler) |
| High-risk modules | 2 (device, tween) |
| Medium-risk modules | 3 (baseModel, soundManager, statesManager controller) |
| Coverage thresholds | 80% statements / 70% branches / 80% functions / 80% lines |
