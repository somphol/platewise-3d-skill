# AGENTS.md

## What it is

PlateWise 3D is a static, single-page non-starchy whole-food plate builder. A
procedural Three.js plate is divided 50/25/25 into veg, protein and fat zones.
Sixty-four whole foods can be placed, removed and inspected; a live analyzer shows
net carbs, fiber, glycemic load, protein, calories and a 0–100 teaching score. A
180-minute simulated glucose curve compares the plate with a reference starchy
meal. Six craving swaps and six starch warnings redirect common high-glycemic
foods. Meal plates are saved in `localStorage` and can be exported as JSON.

It is **not** a medical device, CGM, calorie tracker or account-based service.
There is no backend, build step, package manager, framework, analytics or
server-side code. The deployed artifact is the repository root on GitHub Pages.

Read [README.md](README.md) for the product view and
[docs/README.md](docs/README.md) for the documentation index.

## Commands

Run from the repository root.

| Task | Command |
| --- | --- |
| Serve locally | `python3 -m http.server 8000` → <http://localhost:8000/> |
| Static/release tests | `node --test tests/static.test.mjs` |
| Browser suite (47 checks) | `node tests/browser.test.mjs` |
| Verify the live deployment | `TEST_URL=https://somphol.github.io/platewise-3d/ node tests/browser.test.mjs` |
| Quick boot smoke | `node scripts/smoke.mjs` |
| In-page self-test | <http://localhost:8000/?selftest> |
| Regenerate screenshots | `node scripts/screenshot.mjs` |
| Deploy | `git push origin main`; Pages serves `main` / root |

The browser harness launches one headless Chrome with `--use-mock-keychain`,
`--password-store=basic` and a throwaway profile, so macOS does not open repeated
Keychain prompts. Set `CHROME` if Chrome is not in the
default macOS location. Network access is required for the pinned Three.js CDN.

## Architecture

Three files, three layers:

1. **`index.html`** — semantic shell, pantry, stage overlays, analysis panel,
   dialogs, import map (pinned Three.js 0.169.0), SEO/OG metadata.
2. **`style.css`** — design tokens, light/dark themes, 3-column desktop grid,
   sticky pantry and stage, single-column mobile, modal and self-test styles.
3. **`script.js`** — in order: reference data (`FOODS`, `WARNINGS`, `SWAPS`,
   `SOURCES`) → nutrition/curve math → state and storage → `PlateScene` →
   `GlucoseChart` → render functions → interactions → self-test → `boot()`.

**Boot order.** `applyTheme` → `new PlateScene` → `new GlucoseChart` → create
`#sr-announcer` → render pantry/watch-outs/swaps/sources/log → `updateHUD` →
wire events → hide loading → expose `window.__platewise` → set
`document.body.dataset.ready = "true"`. Tests wait for that attribute.

**State.** `state.plate` is an array of `{uid, foodId}`; `state.meals` mirrors
`localStorage` key `platewise.meals.v1`; `state.theme` and `autoRotate` live in
`platewise.prefs.v1`. The plate itself is intentionally **not** persisted across
reloads — only saved meals are.

**3D scene.** One renderer, one camera, one `OrbitControls`. The plate is built
from cylinders, rings and a torus. Food factories return a `THREE.Group` with
its base at local y=0. Zones use fixed angular ranges: veg `0…π`, protein `π…3π/2`,
fat `3π/2…2π`; slots are listed in `SLOTS`. `PlateScene.add/remove/layout` animate
scale/position; `targetFor` chooses a slot within the food's zone. Clicking uses
raycasting; `scene.selectedUid` drives a gold torus highlight.

**Score.** `summarize()` returns totals, zone counts, score, band, advice and
items. `bandFor()` plus an incomplete-plate override labels a one-zone plate
“Plate needs balance” even when its glycemic load is low. The exact formula is in
[docs/NUTRITION.md](docs/NUTRITION.md).

**Testing API.** `window.__platewise` exposes data, `addFood`, `removeFood`,
`clearPlate`, `buildExample`, `buildSwap`, `openWarning`, `getSummary`,
`getCurve`, `getReferenceCurve`, `saveMeal`, `getMeals`, `loadMeal`, dialogs,
`sceneInfo`, `runSelfTest` and `selftest`. Do not remove it; the browser suite
and the in-page self-test depend on it.

## Decisions and constraints

- **Pin Three.js `0.169.0`** in the import map. Add-on paths move between
  versions. Do not use `three@latest`.
- **No framework, no bundler, no npm runtime dependency.** `script.js` is an ES
  module served directly.
- **No external assets in the app** beyond the Three.js CDN. No web fonts,
  images, icon packs, audio or tracking pixels. Every mesh, texture gradient and
  label is procedural. Emoji use the system font.
- **Starch is never placeable.** Warning cards only open the modal. `addFood()`
  refuses warning IDs by design; do not add a bypass.
- **Net carbs = carbs − fiber** using the app's per-serving values. Do not switch
  to “total carbs” or add sugar alcohols without updating the docs and score.
- **The curve is illustrative**, with a fixed baseline, a gamma shape and a
  fixed reference meal. Never label it a CGM or a prediction.
- **Serving sizes are explicit** and drive the conversion from USDA per-100 g
  data. Changing a serving changes the score and the curve.
- **`localStorage` failures are non-fatal.** Storage helpers swallow quota/privacy
  errors and the UI reports that saving failed.
- **Dialogs are native `<dialog>`** for focus management. Close on backdrop and
  `[data-close-dialog]`; do not replace with custom focus traps.
- **Mobile order is stage → pantry → analysis**, and a fixed mobile dock shows
  score/net carbs when the plate is non-empty.
- **`[hidden] { display: none !important; }`** is deliberate, because several
  components set explicit display values.
- **`state.json` is generated from the OpenCode session database** at the end of
  the build. Do not invent token counts or elapsed time.
- **Accessibility is part of the contract.** Keep button names, dialog labels,
  the skip link, the live announcer and reduced-motion handling.

## Known issues

- The Three.js CDN is required on first load. The repository is not a fully
  offline bundle; a browser cache may help afterwards but the CDN is the source
  of truth.
- The browser suite requires Chrome and network access. CI runs it on
  `ubuntu-latest`; if the runner's Chrome path changes, set `CHROME`.
- Glycemic index values are population approximations and some are debated
  (e.g. potato preparation, pasta cooking). The UI says so.
- The 3D zone labels can sit under food meshes when the plate is crowded. The
  HTML zone legend is authoritative.
- The simulated curve is a single-compartment teaching model, not a
  physiological simulator. It does not model medication, activity, sleep or
  individual insulin sensitivity.
- The app does not persist the current plate across reloads. Saved meals must be
  explicitly added to the log.
- `docs/*.md` links are served as plain text by GitHub Pages. That is acceptable
  for a documentation folder; use the GitHub rendering for reading.

## Continuity

- Live: <https://somphol.github.io/platewise-3d/>
- Repository: <https://github.com/somphol/platewise-3d>
- Local checkout: `~/Projects/platewise-3d`
- Skill backup: <https://github.com/somphol/platewise-3d-skill>
- Build state: [`state.json`](state.json) · [`docs/STATE.md`](docs/STATE.md)
