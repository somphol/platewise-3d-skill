# Build log

This is the reference build's honest narrative, including the mistakes. Times are
Pacific time on 2026-11-05. The exact elapsed seconds and token totals are in
[`state.json`](../state.json) and [STATE.md](STATE.md), read from the OpenCode
session database rather than estimated.

## 20:52 — Session and repository

- Working directory `~/Projects`; created `platewise-3d` with `git init -b main`.
- Started with a three-file constraint: `index.html`, `style.css`, `script.js`.
- Chose a research/design direction before code: warm “market kitchen” cream and
  deep green, an editorial serif headline, a white ceramic plate, procedural food
  that reads at a glance, and a dark theme that is not an afterthought.

## 20:56 — Data and shell

- Wrote the 18-food dataset with USDA per-100 g records, explicit serving weights
  and typical GI values. Warnings and swaps were defined as separate data.
- Built the page shell: header, intro, three-column builder, principles band,
  evidence band, disclaimer, four native dialogs, mobile dock, selftest panel.
- Built the CSS design system and responsive rules in one pass. The first
  desktop render was too dark for marketing screenshots because the machine's OS
  prefers dark; the app correctly followed the OS, but the screenshot script now
  forces light explicitly.

## 21:00 — Three.js scene

- One `PlateScene` with a single renderer/camera/controls.
- Plate: cylinder, torus rim, three ring sectors, divider lines, canvas label
  sprites, procedural cutlery.
- The original 18 hand-built factories, later joined by 22 reusable form families for the 64-food pantry. The first pass was over-lit and pastel;
  reduced exposure, lowered key light, made zone sectors unlit, and scaled food
  up by 18%.
- Labels were initially buried by food. Moved them to the rim and gave them
  translucent pills (`depthTest:false`, renderOrder 3).
- The salmon's first “skin” strip looked like a wooden plank and was removed.
  The egg was reworked into a sunny-side-up so the yolk is visible from above.

## 21:05 — Engine and UI

- Nutrition cache, `summarize`, score bands, incomplete-plate override.
- Deterministic gamma curve and the 2D chart with target band, dashed reference,
  fill and peak markers.
- Search, filters, warnings, swaps, log, export, theme and keyboard wiring.
- Added the 29-check self-test and `window.__platewise` test surface.

## 21:09 — First browser run and the expensive bug

The first headless run showed 29/29 selftest but `buildExample` stopped after one
food. Root cause: `renderPlateList` destructured `{ entry, food, nutrition }` from
`summary.items`, but those items are spread plate entries with `uid` and `food`,
not a nested `entry`. The throw aborted `addFood` after state mutation, so the
plate had one item and the UI looked half-built. Fixed by destructuring `uid`
directly. This is the single most important bug for a reimplementation to avoid.

## 21:10–21:14 — Visual pass

- Reduced the hero height and compacted the stat strip so the builder starts
  higher on a 1600 × 1000 screen.
- Captured stage/analysis/mobile screenshots. The analysis clip was blank because
  CDP clips were being passed viewport coordinates after a scroll. Switched to
  document-absolute clips and `captureBeyondViewport: true`.
- Reworked the social card into its own 1200 × 630 page using the stage capture,
  rather than cropping the 1600-wide screenshot.
- Fixed native button styling leaking dark `buttonface` backgrounds into plate
  rows.

## 21:15–21:20 — Tests and release files

- Browser suite grew to 47 checks and passed.
- Added static/release invariants, CI, issue/PR templates, robots, sitemap,
  favicon, 404, license, citation, notices.
- Keychain strategy: the browser harness always uses
  `--use-mock-keychain`/`--password-store=basic`; git publishing uses a single
  credential read for the session and an askpass helper, so repeated pushes do
  not re-prompt.

## 21:20–21:30 — Documentation

- README, AGENTS, architecture, nutrition, sources, decisions, testing,
  deployment, reproduction, privacy, accessibility, performance, FAQ, this log.
- Nutrition numbers cross-checked against the running app: balanced sample is
  17.7 g net, 16.4 g fiber, 40.6 g protein, 37.3 g fat, 600 kcal, GL 4.0,
  score 96.
- Reproduction notes include the exact scene angles, slots, score and curve
  formulas, and the mistakes above.

## 21:33 — Published and verified

- Created `somphol/platewise-3d`, pushed `main`, enabled Pages on `main` / root.
- `/`, `/docs/`, `/404.html` and `/sitemap.xml` return 200.
- Ran the live suite against the Pages URL: **47/47**, zero console errors.
- Tagged `v1.0.0` and created a release.
- Captured the first state snapshot from the OpenCode database (see
  `docs/STATE.md` for the current numbers; they were captured before the skill
  work, then refreshed at the very end).
- Added a real `docs/index.html` because GitHub Pages does not render Markdown
  directories.

## 21:36 — Skill package

- Created `platewise-3d-studio` with SKILL.md, method, nutrition, scene,
  verification, lessons, hosting and this build log.
- Copied the complete reference into `assets/reference/`.
- Wrote `scripts/new-project.mjs` and `scripts/verify-skill.mjs`; scaffolded a
  clean copy and passed 22 static + 47 browser checks there.
- Published `somphol/platewise-3d-skill`, enabled Pages and rebuilt `index.json`
  with a content hash.
- Found that GitHub Pages will not serve `.github/` from a catalog. Moved the CI
  and issue templates to `templates/github/` and made the scaffold restore
  `.github/`; the static suite accepts either location.
- Downloaded all 68 catalog files over HTTPS, ran the static and browser suites
  against the downloaded reference, then scaffolded from the catalog and ran
  both suites again. All passed.
- Refreshed `state.json` after the skill work so the recorded time and tokens
  cover the whole reference build, not just the app.

## Lessons for the next agent

1. Run the real add flow early. The self-test checked data and factories but not
   `updateHUD` after a second add, which let a trivial destructuring bug survive.
2. Use document-absolute screenshot clips.
3. Force the theme for deterministic screenshots.
4. Do not trust a single food mesh at small scale: render a crowded plate and all
   64 foods before calling the visual pass done.
5. Keep the medical boundary visible in the copy, not only in the docs.
6. Treat `state.json` as generated data, not prose.

## 1.1.0 — Pantry expansion and the mirrored zones

- Expanded the pantry from 18 to 64 whole foods: 30 non-starchy vegetables,
  3 berries, 14 proteins and 17 fats/nuts/seeds/oils.
- Added 22 reusable procedural form families instead of 46 one-off factories.
  Every food record carries `form`, `color` and `accent`; the original 18 keep
  their dedicated factories. The selftest now builds every mesh, not just checks
  that a key exists.
- Split the pantry filters into **Nuts & seeds** and **Fats & oils**, bringing
  the chip row to eight options.
- Found and fixed a long-standing geometry bug: `RingGeometry` is rotated onto
  the XZ plane, which mirrors z, so the painted veg zone was behind the food
  slots and the 50% VEG label. The zones are now theta-mapped intentionally
  (veg `π…2π`, protein `π/2…π`, fat `0…π/2`) so the visible colour matches the
  slots and labels. Always verify a render, not just the angle constants.
- Rebuilt the screenshots, the 64-row nutrition table, the source-description
  table, the static counts, the browser counts, the skill reference and the
  catalog.
