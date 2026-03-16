# Phase 2: Complete TypeScript Typization

## Summary

Phase 2 adds full type coverage to the `window.Urso` global namespace, replacing all 36 local `declare const Urso` blocks with a single ambient declaration in `globals.ts`.

## Decisions

| Decision | Choice |
|----------|--------|
| All interfaces in `types.ts` | No `.d.ts` files |
| Ambient globals via `declare global` | `globals.ts` declares `Urso`, `UrsoUtils`, `PIXI` |
| Helper methods are generic | `mergeObjectsRecursive<T>`, `recursiveSet(..., object)` — no cast pollution |
| gsap stays local declare | Module conflict prevents global declaration — 3 files keep `declare const gsap: GsapGlobal` |
| pixiPatch.ts keeps local PIXI | Prototype access not modeled in global PixiGlobal |
| Typed emit/addListener | Overloaded: `UrsoEvent` path → type-checked payload; `string` path → legacy |
| TemplateModel.components is `unknown[]` | Runtime type is heterogeneous (strings during config, instances after parse) |

---

## Architecture

### globals.ts

```
UrsoNamespace {
  events: typeof UrsoEvent
  config: ConfigMainType
  observer: { add, remove, fire, setPrefix, clearAllLocal, clear }
  helper: { recursiveGet, mergeObjectsRecursive<T>, ... }  // generic methods
  logger, math, time, device, localData, types
  cache: LibCacheFacade
  loader: LibLoaderFacade
  tween: LibTweenFacade
  objects: ObjectsControllerFacade
  scenes: ScenesControllerFacade
  template: TemplateControllerFacade
  assets: AssetsControllerFacade
  statesManager: StatesManagerControllerFacade
  transport: TransportControllerFacade
  soundManager: SoundManagerControllerFacade
  i18n: I18nControllerFacade
  logic: LogicControllerFacade
  browserEvents: BrowserEventsFacade
  setTimeout, clearTimeout, getInstance, getByPath, ...
}
```

### types.ts sections (~1000 lines)

1. **Enums** — UrsoEvent, ObjectTypeId, AssetTypeId, ScreenOrientation, etc.
2. **Geometry** — Point
3. **Observer** — ObserverCallback, ObserverMap
4. **UrsoInstance** — overloaded emit/addListener/removeListener
5. **Objects** — ObjectModelParams, ObjectBaseModel, selectors
6. **Assets** — AssetModelParams, asset types
7. **Template** — TemplateModel, TemplateTypesList
8. **Transport** — TransportConfig, ConnectionParams
9. **Event Payload Map** — 40 events mapped to payload types
10. **Config** — ConfigMainType, FpsConfig
11. **Lib Facades** — LibCacheFacade, LibLoaderFacade, LibTweenFacade
12. **Module Facades** — Objects, Scenes, Template, Assets, StatesManager, Transport, SoundManager, I18n, Logic, BrowserEvents
13. **Global Library Types** — GsapTween, GsapGlobal, HowlInstance, UrsoUtilsNamespace, PixiGlobal

### EventPayloadMap

```ts
interface EventPayloadMap {
  [UrsoEvent.MODULES_OBJECTS_BUTTON_PRESS]: ButtonPressPayload;
  [UrsoEvent.MODULES_SCENES_UPDATE]: number;
  [UrsoEvent.EXTRA_BROWSEREVENTS_WINDOW_RESIZE]: undefined;
  // ... 40 events total
}
```

Typed overloads on `emit`/`addListener`:
```ts
emit: {
  <E extends UrsoEvent>(event: E, params?: EventPayloadMap[E], delay?: number): void;
  (event: string, params?: unknown, delay?: number): void;  // legacy
};
```

---

## Blocks Completed

| Block | Description | Files |
|-------|-------------|-------|
| 0 | EventPayloadMap | types.ts |
| 1 | Lib facades (cache, loader, tween) | types.ts, globals.ts |
| 2 | Core module facades (objects, scenes, template, assets) | types.ts, globals.ts |
| 3 | Remaining facades + UrsoUtils + gsap globals | types.ts, globals.ts |
| 4 | ConfigMainType | types.ts, globals.ts, config/main.ts |
| 5 | Remove declares: components (19 files) | components/*, extra/browserEvents.ts |
| 6 | Remove declares: modules (14 files) | modules/* |
| 7 | Remove declares: bootstrap (3 files) | app.ts, config/load.ts, index.ts |
| 8 | Typed emit/addListener overloads | types.ts |
| 9 | Cleanup: remove `as string` casts | 9 object model files |
| 10 | Documentation | CLAUDE.md, docs, memory |

---

## Verification

- `npm run typecheck` — 0 errors
- `npm run test:both` — 1588/1588 (JS + TS)
- 0 `declare const Urso` in source files
- 0 `unknown` facade types in globals.ts
- 3 `declare const gsap: GsapGlobal` (expected)
- 1 `declare const PIXI` in pixiPatch.ts (expected)
