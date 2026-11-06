# Architecture

PlateWise 3D is a three-file static application. There is no build, no framework
and no server. Everything below refers to the repository root.

## 1. File responsibilities

| File | Owns | Must not |
| --- | --- | --- |
| `index.html` | Semantic structure, import map, all controls/dialogs, SEO and OG metadata, inline SVG mark | Contain application logic or a second renderer |
| `style.css` | Tokens, light/dark themes, layout, component styles, responsive breakpoints, reduced motion | Load external fonts or images |
| `script.js` | Reference data, nutrition math, Three.js scene, chart, DOM rendering, events, self-test, boot | Depend on a bundler or npm runtime package |
| `tests/lib/harness.mjs` | Static file server, Chrome launch, CDP client | Ship to the app |
| `tests/*.mjs` | Verification | Mutate the deployed files |
| `scripts/*.mjs` | Smoke, screenshots | Be required at runtime |
| `docs/*` | Reproducibility, methodology, operations | Be required at runtime |

The only external runtime request is the pinned Three.js module and its
`OrbitControls` add-on from jsDelivr. Everything else is in the repository.

## 2. Data model

All reference data is a plain constant in `script.js`.

```js
{ id, name, emoji, category, zone, serving, servingG, gi, scale, ring,
  per100: { kcal, carbs, fiber, protein, fat },
  blurb, tags: [..], source }
```

- `category` drives the filter chips: `leafy`, `cruciferous`, `veg`, `protein`,
  `fat`, `berry`.
- `zone` drives the plate: `veg`, `protein`, `fat`. Berries are `veg` because
  they occupy the plant half of the plate.
- `per100` is USDA per-100 g edible portion. `servingG` converts it.
- `gi` is a typical published glycemic index. `0` means no glycemic response
  (protein, oil).
- `scale` and `ring` are visual, not nutritional.
- `tags` participate in search only.

Warnings (`WARNINGS`) use per-serving values directly (`net`, `fiber`, `gi`,
`gl`), because they are never scaled or placed. Each has a `swapId`.

Swaps (`SWAPS`) map a craving to one or more pantry IDs:

```js
{ id, craving, title, warningId, addIds: [foodId], note }
```

`FOOD_BY_ID`, `WARNING_BY_ID` and `SWAP_BY_ID` are `Map`s built once at module
evaluation.

## 3. Nutrition pipeline

```
FOODS (per 100 g) ──servingG/100──> nutritionFor() ──> per-serving macros + GL
                                         │
state.plate ──> summarize() ─────────────┴──> totals + zone counts + score + band
                                         │
                                         └──> glucoseCurve() ──> chart + copy
```

`nutritionFor` caches by food ID. Net carbs are `max(0, carbs − fiber)`. GL is
`gi × net / 100`. `summarize` accumulates totals, determines shares, computes the
score, then applies an incomplete-plate override. The full formulas, including
worked numbers, are in [NUTRITION.md](NUTRITION.md).

The model is deliberately deterministic. No randomness, time-of-day or user
biometrics enter the score or curve. This makes screenshots, tests and the
self-test reproducible. Only meal IDs and timestamps use time/randomness.

## 4. State and storage

```js
state = {
  plate: [{ uid, foodId }],
  selected: uid | null,
  filter: 'all',
  query: '',
  theme: 'light' | 'dark',
  autoRotate: boolean,
  meals: [meal],
  warningId: string | null,
  seq: number,
}
```

| Key | Shape | Persisted |
| --- | --- | --- |
| `platewise.meals.v1` | array of meal records, newest first, max 30 | yes |
| `platewise.prefs.v1` | `{ theme, autoRotate }` | yes |
| current plate | `state.plate` | **no** — explicit save required |

Meal record:

```js
{
  id: "meal-<timestamp>-<rand>",
  name: string,               // trimmed, max 60 chars
  createdAt: ISO string,
  foods: [foodId],            // one entry per serving
  summary: { net, fiber, protein, kcal, gl, score, servings, peak }
}
```

`readJSON`/`writeJSON` catch malformed JSON, private-mode and quota errors.
The save dialog, log row, load and delete actions all operate through these
helpers. Export builds a `Blob` with `{ schema: 1, app, version, exportedAt,
meals }` and downloads it with an object URL.

## 5. DOM rendering

`updateHUD()` is the single recompute entry point after any plate change. It:

1. calls `summarize()`;
2. writes the score, band, advice, ring dasharray and HUD numbers;
3. writes macros and zone-share bars;
4. toggles the empty overlay and mobile dock;
5. calls `renderPlateList()`, `updateCGM()`, `renderPalette()`, `renderSwaps()`.

`renderPalette()` reconstructs the pantry grid from `state.filter` and
`state.query`. It preserves the grid's `scrollTop` and re-focuses the food card
that had focus, so keyboard placement does not lose position. Warning matches
appear above safe matches when the query matches a craving.

`renderPlateList()` renders `summary.items`, each carrying `{ uid, food,
nutrition }` (spread from the plate entry). The selected row gets a highlight;
the detail card is rendered by `renderSelected()`.

`renderLog()` renders saved meals; dates use `Intl.DateTimeFormat`. User names
are escaped with `escapeHtml` before insertion.

## 6. Three.js scene

`PlateScene` is constructed with the single `<canvas id="scene">`.

### Camera and renderer

- `PerspectiveCamera(40)`, position `(0, 7.4, 8.8)`, target `(0, 0.35, 0)`.
- `OrbitControls`: damping, distance 7–18, polar 0.32–1.36, auto-rotate 0.55.
- Renderer: antialias, ACES filmic tone mapping, sRGB output, PCF soft shadows,
  DPR capped at 2.
- Lights: hemisphere, key directional with 2048² shadows, cool fill, warm rim
  point light.
- Table at y = −0.26, cloth at y = −0.255, plate base top at y ≈ 0.
- A CSS radial vignette sits over the canvas; it does not affect the scene.

### Plate

- Base cylinder radius 3.4, rim torus radius 3.3.
- Three `RingGeometry` sectors, unlit transparent materials at opacity 0.32:
  - veg: `0 … π` (front half), `#7ac142`
  - protein: `π … 3π/2` (back left), `#d77b62`
  - fat: `3π/2 … 2π` (back right), `#e2b45a`
- Thin white divider lines and three canvas-texture sprites with rounded pill
  backgrounds. Sprites use `depthTest: false` and `renderOrder: 3`; the HTML
  legend remains the authoritative description.
- Procedural fork and knife on the table.

### Food placement

`SLOTS` contains eight veg positions, five protein and five fat positions, each
`[radius, angleDegrees]`. `targetFor(entry, plate)` counts earlier entries in the
same zone and picks the same index; overflow shifts radius inward and angle by
7°. Y is `PLATE_TOP = 0.06`. Foods spawn 1.1 units above the target, scale in
over 520 ms with a cubic ease, bob subtly, and scale out over 260 ms. Removed
groups dispose their geometries and materials after the animation.

Every factory returns a group whose base is at local y=0. `group.userData`
stores `servingUid`, `baseScale`, `phase`, `born`, `removing`, `foodId` and
`target`.

### Pointer interaction

`pointerdown` records position/time. `pointerup` ignores drags over 7 px, then
raycasts. A hit walks up the parent chain to the group with `servingUid`; the
callback selects or deselects. Hover raycasts (throttled) show a small name +
net-carb tooltip. OrbitControls continues to receive drag events.

### Selection

A gold torus at the plate surface follows the selected group and pulses. Selection
is shared with the DOM plate list: clicking a row selects the mesh; clicking the
mesh selects the row.

### Theme

`setTheme()` replaces the background gradient texture, fog, table/cloth colors
and key-light intensity. The plate and foods keep their material identity.

## 7. Glucose chart

`GlucoseChart` owns a 2D canvas. It resizes to the container with DPR capped at 2.

- Domains: x 0–180 min, y 60–200 mg/dL.
- Target band 70–140, grid at 70/100/140/180, baseline at 92.
- Reference curve: dashed orange, fixed GL 46 / fiber 5 / net 58 meal.
- User curve: filled green with a draw-in animation.
- Peak dots and “+rise” labels.
- Prefix sums? No — the curve is a closed-form gamma shape:
  `y = 92 + rise · x^1.6 · e^(1.6(1−x))`, `x = minute / peakTime`.
- The canvas's `aria-label` is rewritten with live peak/time values.

## 8. Events

| Interaction | Handler | Effect |
| --- | --- | --- |
| Click food card | delegated on `#food-grid` | `addFood(id)` |
| Click warning card | delegated | `openWarning(id)` |
| Search input | `input` | `state.query`, `renderPalette` |
| Chip | click | `state.filter`, `renderPalette` |
| Plate row | delegated | select or remove |
| Clear / example / surprise | buttons | clear, `buildExample` |
| Save | dialog form | `saveMeal(name)` |
| Load / delete log | delegated | `loadMeal` / `deleteMeal` |
| Swap add | delegated | `buildSwap(id)` |
| Warning build swap | button | `buildSwap(food.swapId, {close:true})` |
| Rotate / reset / fullscreen | stage tools | scene methods |
| Theme | header button | `applyTheme(next, persist)` |
| Keyboard | document | `/`, `r`, `g`/`?`, `Esc`, `1`–`7` |
| Backdrop / close | dialogs | native `close()` |

Keyboard shortcuts are ignored while an input, textarea, select or
contenteditable element is focused.

## 9. Self-test and test API

`runSelfTest()` contains 29 synchronous checks:

- data counts and uniqueness;
- swap/warning referential integrity;
- non-negative macros and GI range;
- net carbs ≤ total carbs;
- score bounds and zone behavior;
- curve sample count and peak ordering;
- local-storage round trip;
- source URL protocol;
- duplicate DOM IDs;
- WebGL context and at least one rendered frame;
- chart canvas size;
- every food has a 3D factory.

It writes `window.__platewise.selftest = { passed, total, results }`, sets
`selftestPassed`, renders the panel and is run automatically at 900 ms (or after
the first frame when `?selftest` is present).

`window.__platewise` is the stable test surface. It exposes data, actions and
inspection helpers; it is not a public API for third-party integrations.

## 10. Extension recipes

**Add a food**
1. Add an entry to `FOODS` with USDA per-100 g data and a serving weight.
2. Add a factory to `FOOD_FACTORIES` returning a group with base at y=0.
3. Keep the ID unique; add tags that a user would search.
4. Run the self-test and browser suite. The self-test fails if the factory is
   missing.

**Change a serving**
Update `serving` and `servingG`. The per-serving macros, GL, score and curve
follow. Update the table in `docs/NUTRITION.md` and verify the displayed numbers.

**Add a warning**
Add a warning with per-serving values and a `swapId`, then add the matching swap
and at least one pantry alternative. Warnings must never be added to `FOODS`.

**Add a swap**
Add to `SWAPS` with `addIds` that exist in `FOODS`. The UI computes the saved net
carbs from the warning and the alternatives.

**Change the score**
Update `summarize()`, the formula text in `index.html`, the method copy in
`docs/NUTRITION.md`, and the tests that assert bounds. Never silently change it.

**Change the curve**
Update `glucoseCurve()`, the reference constants, the chart labels, the copy and
the docs. Keep the sample count at 37 (0…180 by 5) unless the tests are updated.

## 11. Failure behavior

If WebGL construction throws, `boot()` catches it, replaces the loading message,
sets `document.body.dataset.scene = "fallback"` and still exposes the pantry,
score, chart, log and self-test. The stage remains a static explanatory panel.
This keeps the educational content usable on locked-down browsers.
