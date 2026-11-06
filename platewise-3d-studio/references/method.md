# Method

## 1. Order of construction

1. **Decide the three-file shell.** `index.html`, `style.css`, `script.js`. No
   package.json.
2. **Pin Three.js 0.169.0** in an import map before the module script.
3. **Write the data** (`FOODS`, `WARNINGS`, `SWAPS`, `SOURCES`) with USDA
   per-100 g records, serving weights, GI, visual scale, ring radius, tags and
   source strings. Build the ID maps.
4. **Write the nutrition functions** (`nutritionFor`, `summarize`,
   `glucoseCurve`) and freeze the reference curve.
5. **Write the state/storage layer.** `platewise.meals.v1` and
   `platewise.prefs.v1`. The current plate is in memory only.
6. **Write the DOM shell and CSS.** Three-column desktop, stage-first mobile,
   native dialogs, mobile dock. Build the design tokens and dark theme early.
7. **Write the Three.js scene.** Renderer, camera, lights, table, plate, zones,
   labels, cutlery, selection ring, pointer handling, food factories, add/remove
   animations. Do not add a second renderer.
8. **Write the chart** (2D canvas) and its accessible label.
9. **Write the render layer** (`updateHUD` is the single recompute entry point)
   and all events.
10. **Write the self-test and test API**, then `boot()`.
11. **Write the static/browser tests** and make them pass.
12. **Write the docs, screenshots and state**, publish, rerun live checks.
13. **Package the skill**, scaffold it clean and verify again.

## 2. Invariants

- The score is exactly the published formula. If a constant changes, the UI
  formula, docs and tests change together.
- Net carbs = total carbohydrate − fiber. Do not mix conventions.
- The curve is deterministic and fixed-reference. It is not personalized.
- Warning IDs are not in `FOODS`. `addFood` opens the modal and returns false.
- Every food has a 3D factory. The selftest fails if one is missing.
- The balanced sample must score 96 and contain 8 servings.
- The chart has 37 samples (0…180 by 5).
- Zone counts: veg `0…π`, protein `π…3π/2`, fat `3π/2…2π`.
- All interactive actions exist in the DOM, not only on the canvas.
- There is no network request except the pinned Three.js CDN.
- Local storage failures are non-fatal and are surfaced to the user.
- `document.body.dataset.ready = "true"` only after render + wiring.
- `window.__platewise` is the test surface; keep it stable.
- Mobile width 390 px has no horizontal overflow and the dock appears only with
  a non-empty plate.

## 3. Data values

The reference pantry has **64 foods**: 30 non-starchy vegetables, 3 berries,
14 proteins and 17 fats/nuts/seeds/oils. The canonical per-serving table is
`assets/reference/docs/NUTRITION.md`. The original 18 are shown below for
orientation; every new food follows the same shape and needs a USDA source,
serving weight, GI, `form` and colour.

| Food | Serving | Net | Fiber | GI |
| --- | --- | ---: | ---: | ---: |
| Broccoli | 1 cup (91 g) | 3.67 | 2.37 | 15 |
| Spinach | 2 cups (60 g) | 0.86 | 1.32 | 15 |
| Cauliflower | 1 cup (107 g) | 3.18 | 2.14 | 15 |
| Zucchini | 1 cup (124 g) | 2.62 | 1.24 | 15 |
| Bell pepper | 1 cup (119 g) | 5.41 | 2.50 | 15 |
| Asparagus | 1 cup (134 g) | 2.39 | 2.81 | 15 |
| Wild salmon | 3.5 oz (100 g) | 0.00 | 0.00 | 0 |
| Egg | 1 large (50 g) | 0.36 | 0.00 | 0 |
| Chicken breast | 3.5 oz (100 g) | 0.00 | 0.00 | 0 |
| Firm tofu | 3 oz (85 g) | 0.93 | 1.02 | 0 |
| Avocado | ½ small (75 g) | 1.37 | 5.03 | 10 |
| Almonds | 1 oz (28 g) | 2.53 | 3.50 | 15 |
| Walnuts | 1 oz (28 g) | 1.96 | 1.88 | 15 |
| Olive oil | 1 tbsp (14 g) | 0.00 | 0.00 | 0 |
| Chia | 2 tbsp (24 g) | 1.85 | 8.26 | 15 |
| Strawberries | 1 cup (100 g) | 5.68 | 2.00 | 40 |
| Raspberries | 1 cup (100 g) | 5.44 | 6.50 | 32 |
| Blueberries | ½ cup (75 g) | 9.07 | 1.80 | 53 |

Warnings: white rice, baked potato, French fries, white bread, white pasta,
sugary cereal. Use per-serving values directly, not per-100 g.

## 4. Acceptance

```sh
node --test tests/static.test.mjs
node tests/browser.test.mjs
node scripts/smoke.mjs
TEST_URL=https://<user>.github.io/platewise-3d/ node tests/browser.test.mjs
```

- 22/22 static
- 47/47 browser
- 29/29 selftest
- 0 console errors
- balanced plate score 96
- curve peak ~100.5 vs reference 177.6
- live URL 200, docs 200, 404 200, sitemap 200

## 5. If adapting the visual identity

Keep the information architecture and contrast. If you change the hue, update
the CSS tokens and the Three.js zone colors together. Re-render the three
screenshots and the OG card. Verify the 390 px layout and dark theme before
publishing. Do not replace the procedural 3D food with external images or
models; the zero-asset constraint is intentional.
