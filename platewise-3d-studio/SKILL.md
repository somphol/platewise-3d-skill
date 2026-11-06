---
name: PlateWise 3D Studio
description: Build a release-grade static Three.js non-starchy whole-food plate picker: 64 whole foods, a 50/25/25 plate, live net carbs/fiber/glycemic load and safety score, six starch warnings and swaps, a simulated glucose curve, a local meal log, documentation, three verification layers and GitHub Pages.
version: 1.1.0
---

# PlateWise 3D Studio

Build a single-page, static 3D plate studio for carbohydrate-aware eating. The
reference app is `assets/reference/` — a complete, working, verified project. Your
job is to copy it, adapt the content and palette if asked, and ship it without
losing the product's safety boundaries or its verification.

## When to use

- A user asks for a 3D meal builder, low-GI or non-starchy food picker, diabetes
  education visualizer, plate-method teaching tool, or a “what can I eat?” app.
- A user wants a static Three.js health visualizer with real nutrition math, not a
  generic CRUD app.
- A user wants a polished GitHub Pages release with docs, screenshots, tests and a
  transparent build-state file.

**Not for:** medical devices, CGM integrations, individualized medical advice,
calorie/weight-loss coaching, restaurant ordering backends, account/cloud apps,
or a generic recipe manager. Recommend a clinician-reviewed product for those.

## Output contract

Ship exactly these at the repository root:

```text
index.html      UI shell, import map, dialogs, metadata
style.css       tokens, layout, themes, responsive rules
script.js       data + nutrition + Three.js + UI + self-test
assets/         favicon, screenshots, social card
docs/           architecture, nutrition, sources, decisions, testing, reproduction
tests/          static.test.mjs, browser.test.mjs, lib/harness.mjs
scripts/        smoke.mjs, screenshot.mjs, capture-state.mjs
state.json      measured time, tokens, verification, credits
AGENTS.md       one-minute handoff
```

No build step, no framework, no bundler, no runtime npm dependency, no backend.
Three.js **0.169.0**, pinned in an import map, is the only external runtime.

## Workflow

### 1. Scaffold

```sh
node scripts/new-project.mjs --out ~/Projects/platewise-3d
cd ~/Projects/platewise-3d
python3 -m http.server 8000        # http://localhost:8000/
```

Refuse a non-empty directory unless `--force`. The reference already contains a
working `state.json`; do not present its numbers as your session's.

### 2. Read the reference in this order

1. `assets/reference/AGENTS.md` — commands, constraints, known issues.
2. `assets/reference/docs/REPRODUCTION.md` — build order and pitfalls.
3. `assets/reference/docs/ARCHITECTURE.md` — state, scene, chart, events.
4. `assets/reference/docs/NUTRITION.md` — every number and formula.
5. `assets/reference/script.js` — the actual implementation.

### 3. Adapt, don't rewrite

- Keep the three-file split and the pinned import map.
- Keep the 64-food pantry shape (30 vegetables, 3 berries, 14 proteins, 17 fats/nuts/seeds/oils), 6 warnings, 6 swaps and the sample plate.
- If changing a food, use USDA per-100 g data, an explicit `servingG`, a typical
  GI, a USDA source string and a 3D factory. Update `docs/NUTRITION.md`.
- If changing the score or curve, update the formula in the UI, the docs, and the
  selftest/browser checks.

### 4. Verify before publishing

```sh
node --test tests/static.test.mjs     # 22 release invariants
node tests/browser.test.mjs           # 47 headless Chrome checks
node scripts/smoke.mjs                # boot + 29/29 in-page self-test
```

The balanced sample must remain: 8 servings, 17.7 g net carbs, 16.4 g fiber,
score 96, curve peak ≈100.5 mg/dL at ~50 min, reference ≈177.6 mg/dL.

### 5. Publish

```sh
git init -b main && git add -A && git commit -m "Release PlateWise 3D 1.0.0"
# create the repo and push; enable Pages on main / root
TEST_URL=https://<user>.github.io/platewise-3d/ node tests/browser.test.mjs
```

Use `--use-mock-keychain` and `--password-store=basic` for Chrome; read the git
credential once per session and use an askpass helper for multiple pushes. Never
echo a token.

### 6. Capture state honestly

```sh
OPENCODE_SESSION_ID=ses_... STATIC_CHECKS=22 BROWSER_CHECKS=47 \
SELFTEST_CHECKS=29 LIVE_CHECKS=47 node scripts/capture-state.mjs
```

It reads `~/.local/share/opencode/opencode.db` (`session_v2`), sums all five token
counters, writes `state.json` and `docs/STATE.md`. Never invent numbers.

## Module map

| Path | What it owns |
| --- | --- |
| `assets/reference/script.js` | `FOODS`, `WARNINGS`, `SWAPS`, `SOURCES`; `nutritionFor`, `summarize`, `glucoseCurve`; `PlateScene`; `GlucoseChart`; render functions; events; `runSelfTest`; `boot` |
| `assets/reference/index.html` | import map; pantry; stage overlays; analysis; dialogs; mobile dock; test panel |
| `assets/reference/style.css` | light/dark tokens; 3-column grid; sticky panels; 390 px layout; native dialog styles |
| `assets/reference/tests/browser.test.mjs` | 47-check real-UI suite |
| `assets/reference/tests/static.test.mjs` | 22 release invariants |
| `assets/reference/scripts/capture-state.mjs` | audited build state |
| `references/method.md` | construction order and invariants |
| `references/nutrition-model.md` | data + formulas + curve |
| `references/three-scene.md` | plate, slots, factories, interaction |
| `references/verification.md` | exact commands and expected counts |
| `references/lessons.md` | what regressed and why |
| `references/hosting.md` | Pages, catalog, credential safety |
| `references/build-log.md` | the reference build narrative |

## The three recipes that are hard to infer

### Plate zones and slots

Angles: veg `0…π` (front half), protein `π…3π/2`, fat `3π/2…2π`. Slots are
`[radius, degrees]` arrays (8 veg, 5 protein, 5 fat). Count earlier entries in the
same zone, pick that slot; overflow shifts inward and by 7°. `PLATE_TOP = 0.06`.

### Score

```text
96 − 1.7·GL − 0.45·net + min(8, 0.55·fiber)
   + min(6, 0.08·protein) + 8·vegShare
```

clamp 0–100. Missing a zone changes the band to “Plate needs balance”, not the
numeric score. Show the formula in the UI.

### Curve

```text
baseline 92; rawRise 3 + 2.05·GL; fiberBrake 1 − min(.4, .5·fiber/(fiber+18))
rise = clamp(rawRise, 3, 96)·brake
peakTime = 34 + min(34, net·0.9)   // reference 66
shape = x^1.6·e^(1.6(1−x)); glucose = 92 + rise·shape
```

37 samples, 0–180 by 5. Reference GL 46/fiber 5/net 58. Never call it a CGM.

## Failure boundaries

- **Do not make starch placeable.** `addFood` refuses warning IDs. The modal's
  swap is the only path.
- **Do not claim clinical validity or ADA endorsement.** Cite sources; keep the
  disclaimer and “simulation, not a sensor”.
- **Do not add analytics, accounts, cloud sync, trackers or a second renderer.**
- **Do not remove the accessibility surface.** Pantry, plate list, search, save,
  load and swaps must work without the canvas.
- **Do not use `three@latest`.** Add-on paths break between versions.
- **Do not hand-edit token counts or elapsed time.**
- **Do not publish a state.json from the reference as your own.**
- If the user asks for a backend, CGM, or personalized medical advice, stop and
  explain that this skill is the wrong tool.

## What “done” looks like

- `http://localhost:8000/` shows the plate; the balanced plate scores 96.
- `?selftest` reports 29/29.
- `node --test tests/static.test.mjs` passes 22/22.
- `node tests/browser.test.mjs` passes 47/47 with 0 console errors.
- The live Pages copy passes the same 47 checks.
- README, AGENTS, docs and `state.json` are current.
- The mobile layout has no horizontal overflow at 390 px.
