# Reproduction blueprint

This is the shortest honest path to rebuild **PlateWise 3D** from an empty
directory. It assumes an agent that can write files, run Node and Chrome, and
push to GitHub. It deliberately describes the *decisions* as well as the files,
because the visual result is easy to get subtly wrong.

## 0. Target and acceptance

Build a static single-page 3D non-starchy whole-food plate picker with:

- one Three.js plate divided 50% veg / 25% protein / 25% fats;
- 64 whole foods, each a procedural mesh, click-to-place;
- live net carbs, fiber, protein, calories, GL and a 0–100 score;
- 6 starch/processed warnings that cannot be placed, each with a swap;
- 6 swaps that add whole-food alternatives;
- a 180-minute illustrative glucose curve with a starchy reference;
- a local meal log, theme, keyboard support and a mobile dock;
- **three app files**: `index.html`, `style.css`, `script.js`;
- docs, tests, screenshots, `state.json` and a published skill.

### Done means

```sh
node --test tests/static.test.mjs          # all static checks pass
node tests/browser.test.mjs               # 47/47, zero console errors
node scripts/smoke.mjs                     # boot, WebGL, 29/29 selftest
TEST_URL=https://<user>.github.io/platewise-3d/ node tests/browser.test.mjs
```

The page reports `document.body.dataset.ready === "true"`, the balanced sample
scores **96**, its modeled curve peaks near **100.5 mg/dL at ~50 min**, and the
fixed starchy reference peaks near **177.6 mg/dL**. The in-page `?selftest` is
**29/29**.

## 1. Scaffold

```sh
mkdir -p platewise-3d/{docs,tests/lib,scripts,assets,.github/workflows}
cd platewise-3d
git init -b main
```

Create the three app files plus `tests/lib/harness.mjs`, `tests/static.test.mjs`,
`tests/browser.test.mjs`, the scripts and the docs. Do not create a package.json;
the project intentionally has no npm runtime dependency.

## 2. Pin Three.js before the module script

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"
  }
}
</script>
...
<script type="module" src="script.js"></script>
```

The import map must come **before** the module. `OrbitControls` is imported from
`three/addons/controls/OrbitControls.js`. Do not use `three@latest`.

## 3. Build the nutrition data

Use the table in [NUTRITION.md](NUTRITION.md) verbatim. The shape is:

```js
{
  id: 'broccoli', name: 'Broccoli', emoji: '🥦',
  category: 'cruciferous', zone: 'veg',
  serving: '1 cup, chopped', servingG: 91, gi: 15,
  scale: 0.92, ring: 0.55,
  per100: { kcal: 34, carbs: 6.64, fiber: 2.6, protein: 2.82, fat: 0.37 },
  blurb: '...', tags: ['green', 'rice swap'], source: 'USDA FoodData Central: Broccoli, raw'
}
```

The 64 foods by zone:

- 30 non-starchy vegetables: broccoli, spinach, cauliflower, zucchini, bell pepper, asparagus, kale, arugula, romaine, Swiss chard, collard greens, bok choy, watercress, Brussels sprouts, red cabbage, cucumber, celery, green beans, snap peas, okra, eggplant, tomato, cremini mushrooms, artichoke hearts, fennel, radishes, red onion, leek, garlic, hearts of palm
- 14 proteins: wild salmon, egg, chicken breast, firm tofu, shrimp, tuna, cod, sardines, trout, turkey breast, beef sirloin, pork tenderloin, tempeh, Greek yogurt
- 17 fats, nuts, seeds and oils: avocado, almonds, walnuts, olive oil, chia, pecans, pistachios, macadamia, pine nuts, cashews, flaxseed, hemp hearts, pumpkin seeds, sunflower seeds, sesame seeds, black olives, avocado oil
- 3 berries (zone veg): strawberries, raspberries, blueberries

Warnings use per-serving values (`net`, `fiber`, `gi`, `gl`) plus `swapId`.
Swaps use `addIds` that exist in the pantry. The 6/6 counts are part of the
product contract.

Compute per serving in one function and cache it:

```js
const factor = servingG / 100;
const carbs = per100.carbs * factor;
const fiber = per100.fiber * factor;
const net = Math.max(0, carbs - fiber);
const gl = gi * net / 100;
// protein, fat, kcal scale the same way
```

## 4. Build the page shell

Order in `index.html`:

1. SEO/OG/canonical/JSON-LD and the import map.
2. Header: brand mark, section nav, theme, guide, evidence.
3. Intro: headline, one-paragraph lede, two CTAs, four compact stats.
4. Builder grid:
   - left `aside.palette`: search, seven chips (All, Leafy, Cruciferous,
     Veggies, Proteins, Nuts & seeds, Fats & oils, Berries), 64 cards, watch-outs details, note;
   - centre `.stage-column`: canvas + loading + HUD + tools + empty prompt +
     zone legend + hint + actions;
   - right `aside.insights`: score ring, four macros, balance bars, method
     disclosure, plate list, CGM card, swaps, meal log.
5. Principles, sources band, disclaimer, footer.
6. Four native `<dialog>`s: warning, guide, sources, save.
7. Mobile dock, toast region, self-test panel, noscript.

Required IDs are listed in `tests/static.test.mjs`; use that list as a contract.
Every dialog needs `aria-labelledby`, every icon-only button an `aria-label`, and
the skip link must point at `#plate-builder`.

## 5. Style it

Design tokens (light):

```css
--bg:#f4f0e5; --surface:#fffdf7; --ink:#15251d; --muted:#6f7f75;
--green:#2f6b47; --green-bright:#7ac142; --protein:#c96a52;
--fat:#d8a23c; --warn:#c4502f; --line:#ddd5c3;
--radius:20px; --display: "Iowan Old Style", Palatino, Georgia, serif;
```

A dark theme overrides the tokens under `[data-theme="dark"]`. Use system fonts
only. The desktop grid is `316px minmax(0,1fr) 384px`; the palette and stage are
sticky under the 76 px header; the page uses a subtle dot grain.

Mobile breakpoints:

- ≤1180: two columns, insights moved below as a two-column grid.
- ≤900: intro stacks, stats 4-up, nav hidden.
- ≤760: stage → pantry → analysis, pantry 3 columns, mobile dock visible.
- ≤520: pantry 2 columns, compact HUD, hero scale down, dock full-width.

Always keep `overflow-x: hidden` an invariant and test 390 px. Add
`[hidden]{display:none!important}` because components set explicit display.

## 6. Build the plate scene

One renderer, one camera, one `OrbitControls`. Do not add a second renderer.

- Camera `(0, 7.4, 8.8)`, target `(0, 0.35, 0)`, fov 40.
- Distance 7–18, polar 0.32–1.36, damping, auto-rotate 0.55.
- Renderer: antialias, sRGB, ACES tone mapping, shadows, DPR cap 2.
- Lights: hemisphere 1.15, key directional 2.0 with 2048² shadows, cool fill,
  warm rim point.
- Table radius 18 at y=−0.26; cloth plane at y=−0.255.
- Plate: cylinder radius 3.4, torus rim 3.3, white well.
- Zones: ring geometries `thetaStart/thetaLength`:
  veg `0…π`, protein `π…3π/2`, fat `3π/2…2π`; unlit transparent colors at 0.32.
- Labels: canvas-texture sprites at radius 2.62 with translucent pills,
  `depthTest:false`, renderOrder 3. HTML legend is the source of truth.
- Cutlery: simple boxes/cylinders at x=±4.35.

Food factories: each returns a group with base at local y=0. Build them from
spheres, cylinders, cones, capsules, boxes, torus and icosahedra. Key look:

- broccoli: green stalk + icosahedron florets;
- spinach: flat scaled spheres + stems;
- cauliflower: cream icosahedron head + bumps + leaves;
- zucchini: horizontal cylinder + end caps + pale top strip;
- pepper: three-lobed red body + green stem + half-torus creases;
- asparagus: five leaning cylinders + cone tips;
- salmon: pink capsule, pale stripes at y≈0.345, dark skin at the base;
- egg: sunny-side-up white + yolk hemisphere;
- chicken: beige capsule + char lines;
- tofu: three ivory cubes with edge lines;
- avocado: dark hemisphere shell + green flesh + brown pit;
- almonds: scattered flat ellipsoids, lighter/darker tan;
- walnuts: lumpy browned icosahedra;
- olive oil: green glass bottle + oil + cork + label;
- chia: small bowl + 22 tiny seeds;
- strawberry: upside-down red cone + seeds + green calyx;
- raspberry: 9 pink drupes + leaves;
- blueberries: 7 dusty blue spheres.

Placement: `SLOTS` has 8 veg, 5 protein, 5 fat positions `[radius, degrees]`.
Count earlier entries in the same zone to choose the slot; overflow shifts inward
and by 7°. `PLATE_TOP = 0.06`. Spawn 1.1 units above, scale-in 520 ms, bob,
scale-out 260 ms, dispose geometry/material on removal.

Interaction: raycast on pointerup if movement <7 px. Walk parents to the group
with `userData.servingUid`. Gold selection torus. Hover tooltip with name and net
carbs. Do not steal OrbitControls drags.

## 7. Build the analyzer and curve

```text
net = carbs − fiber
GL  = GI × net / 100
vegShare = vegServingCount / servings

score = 96 − 1.7·GL − 0.45·net + min(8, 0.55·fiber)
        + min(6, 0.08·protein) + 8·vegShare
clamp to 0…100, round
```

If a zone is empty, replace the band with **Plate needs balance** and name the
missing component. The numeric score still describes the glycemic math.

Curve:

```text
baseline = 92
rawRise = 3 + 2.05·GL
brake = 1 − min(0.4, 0.5·fiber/(fiber+18))
rise = clamp(rawRise, 3, 96) · brake
peakTime = 34 + min(34, net·0.9)     // reference: 66
shape = x^1.6 · e^(1.6(1−x)), x = t/peakTime
glucose(t) = 92 + rise·shape
```

Sample every 5 min, 0…180 (37 points). Reference: GL 46, fiber 5, net 58. The
chart is 2D canvas: target band 70–140, grid, dashed reference, filled green user
curve, peak dots and `+rise`, an aria-label with live numbers.

## 8. Build interactions

- Pantry cards call `addFood`; preserve food-grid scroll and focus across renders.
- Caps: 12 total, veg 8, protein 4, fat 5. Refuse with a toast, never silently.
- Warnings: `openWarning` fills title, three metrics, explanation, swap list,
  source; the build-swap button adds `addIds` and closes. Warning foods are not
  in `FOODS`, so `addFood` cannot place them.
- Swaps: add the alternatives, toast, update.
- Plate list: select (highlight mesh) and remove.
- Save: require at least one item; store a meal record and render the log.
- Load: clear the plate, add the saved IDs (respecting caps), update.
- Log: delete one, delete all (confirm), export JSON.
- Theme: persist `{theme, autoRotate}` in `platewise.prefs.v1`; update the scene.
- Keyboard: `/` search, `r` rotate, `g`/`?` guide, `1–7` filters, `Esc` clear
  selection; ignore while typing.
- Dialogs: native `showModal`, backdrop click and `[data-close-dialog]`.

## 9. Add the self-test

Run 29 synchronous checks; expose:

```js
window.__platewise = {
  foods, warnings, swaps, sources, state,
  addFood, removeFood, clearPlate, buildExample, buildSwap, selectFood,
  openWarning, getSummary, getCurve, getReferenceCurve,
  saveMeal, getMeals, loadMeal, deleteMeal, clearMeals, exportMeals,
  openDialog, closeDialog, runSelfTest, selftest, sceneInfo,
};
```

Set `document.body.dataset.ready = "true"` only after the first render is wired.
On `?selftest`, wait one animation frame then run, because the “rendered a frame”
check needs a frame. On a normal load, run it after 900 ms for diagnostics.

## 10. Verify

```sh
node scripts/smoke.mjs
node --test tests/static.test.mjs
node tests/browser.test.mjs
TEST_URL=https://<user>.github.io/platewise-3d/ node tests/browser.test.mjs
```

Use headless Chrome with `--use-mock-keychain --password-store=basic` and a
throwaway profile so macOS never prompts for the keychain repeatedly.

Screenshots: use document-absolute clips with `captureBeyondViewport: true`, not
viewport coordinates after a scroll. Hide the sticky header for a clean analysis
column. Build the OG card as its own 1200×630 page.

## 11. Publish

- Create the GitHub repository, push `main`.
- Set Pages to `main` / root; wait for the deployment; run the live suite.
- Add repository description, homepage and topics.
- Verify `/`, `/docs/`, `/404.html`, `/sitemap.xml` and `?selftest`.
- Tag `v1.1.0` and create a release with the CHANGELOG notes.

## 12. Capture honest build state

Find the session in the OpenCode SQLite database (usually
`~/.local/share/opencode/opencode.db`):

```sql
SELECT id, title, directory, tokens_input, tokens_output, tokens_reasoning,
       tokens_cache_read, tokens_cache_write, cost, time_created, time_updated
FROM session_v2
WHERE title LIKE 'PlateWise%'
ORDER BY time_created DESC LIMIT 1;
```

Write `state.json` with `schema`, `project`, `release`, `session`, `model`,
`usage`, `artifacts`, `verification`, `deployment`, `credits` and `skill`.
`totalTokens` is the sum of all five counters. Do not hand-wave or inflate.
Document the exact SQL in `docs/STATE.md`.

## 13. Publish the skill

Create `skills/platewise-3d-studio/` with `SKILL.md`, references, a scaffold
script and a template copy of the three app files. Publish it as a second
repository and a Pages catalog. Prove it by scaffolding a fresh directory and
running the tests there.

## Pitfalls that cost time

1. **`renderPlateList` destructuring.** `summary.items` entries are the spread
   plate entries (`{...entry, food, nutrition}`), not `{entry}`. Destructuring
   `entry` throws on the first add and stops `buildExample` after one item.
2. **Sticky header + screenshot clips.** Use absolute document coordinates, or
   you capture blank page above the target.
3. **Sprite labels get buried.** Put them near the rim, add a pill background,
   and treat the HTML legend as authoritative.
4. **Theme default.** The app follows `prefers-color-scheme`; marketing
   screenshots must explicitly switch to light to be deterministic.
5. **Selftest frame count.** Running it synchronously at boot fails the “rendered
   a frame” check; wait one `requestAnimationFrame`.
6. **Native button styles.** Reset border/background on `.plate-row-main`; other
   custom buttons already set their own.
7. **Cap ordering.** Check total cap before zone cap; the sample plate has 8
   servings but the caps allow 12.
8. **Chart edge labels.** Right-align the final “180 min” label; otherwise it is
   clipped by the canvas.
9. **Keychain.** Do not run repeated git credential lookups. Read the credential
   once per session and use an askpass helper, or rely on the keychain helper for
   a single push. Chrome tests always use `--use-mock-keychain`.
10. **The plate is not persisted.** Reloading resets the plate, not the meal log.
    Tests must save before reload and load explicitly.

## Estimate

An experienced agent with this blueprint can produce the three files in roughly
4–6 hours of focused work, plus 1–2 hours for docs, screenshots, tests and
release. The reference build's exact wall-clock time and token totals are
generated into `state.json`; read the current values there rather than copying a
stale number.
