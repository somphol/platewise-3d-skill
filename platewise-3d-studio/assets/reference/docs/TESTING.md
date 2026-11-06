# Testing

PlateWise uses three independent layers. None of them requires npm packages.

## 1. Static and release invariants

```sh
node --test tests/static.test.mjs
```

This reads the repository and checks:

- all required release files and documentation pages exist;
- Three.js is pinned to 0.169.0 and only local script/style/image assets ship;
- no analytics, trackers, remote fonts or beacon calls;
- no credentials, private keys or obvious token patterns;
- local Markdown links resolve;
- every DOM ID the script needs exists exactly once;
- four labelled native dialogs and a skip link exist;
- the self-test API and boot contract are present;
- 64 foods, 6 warnings, 6 swaps, and both sample plate constants are present;
- the nutrition page contains every food and the formula terms;
- the source page cites ADA, USDA and NIH/PubMed;
- `AGENTS.md` has the handoff sections;
- screenshots are real PNGs and README links resolve;
- `state.json` counters add up and the model/tool credits are present;
- deployment metadata, CI, MIT license, reduced-motion and mobile contracts.

It does not launch a browser.

## 2. Headless browser suite

```sh
node tests/browser.test.mjs
```

The harness (`tests/lib/harness.mjs`) does four things:

1. serves the repository on an ephemeral localhost port with `no-store`;
2. launches **one** headless Chrome with `--headless=new`,
   `--enable-unsafe-swiftshader`, `--use-mock-keychain`,
   `--password-store=basic` and a throwaway `--user-data-dir`;
3. opens a DevTools Protocol WebSocket and creates a target;
4. drives the real page, captures console errors and evaluates assertions.

The 47 checks cover:

- boot, title, WebGL context, canvas size, at least one rendered frame;
- 64/6/6 data counts and six sources;
- click-to-place from a real pantry card, HUD sync, real-time net carbs/fiber;
- protein/fat zone registration and score for a complete plate;
- item inspection, removal and clear;
- the warning modal: opens, shows three metrics, does **not** add the food,
  closes, and adds the safe swap instead;
- search (including a craving warning), empty state, category filters;
- balanced example (8 servings, score 96), curve below reference, peak time;
- chart accessible label and non-zero pixels;
- swap engine;
- save, `localStorage` persistence, reload, load meal;
- theme toggle, preference persistence across reload;
- in-page self-test 29/29 and its panel;
- 390 px layout: no horizontal overflow, stage size, mobile dock, 64 cards;
- button accessible names, labelled dialogs, skip link and `lang`;
- zero console errors and uncaught exceptions.

The Chrome flags are deliberate: `--use-mock-keychain` and
`--password-store=basic` keep macOS from opening repeated Keychain prompts.

### Verify the live deployment

```sh
TEST_URL=https://somphol.github.io/platewise-3d/ node tests/browser.test.mjs
```

Run this after the Pages build has finished. The suite is read-only; it does not
push or modify the deployment.

### Requirements

- Chrome or Chromium. Set `CHROME` if the harness cannot find it.
- Network access for the pinned Three.js CDN.
- Node 20+ (developed on Node 26; the WebSocket global is required).

### If a check fails

- The harness prints the failing name and detail; a FATAL line includes the
  exception.
- Run `node scripts/smoke.mjs` first for a quick boot and console-error read.
- Use `?selftest` in a real browser to see the 29 in-page checks.
- Screenshot failures are usually stale CDN/cache or a layout change; inspect
  `assets/*.png` after `node scripts/screenshot.mjs`.

## 3. In-page self-test

<http://localhost:8000/?selftest> or the footer link in production.

The 29 checks are deliberately data- and integration-oriented:

- counts, unique IDs, referential integrity for swaps/warnings;
- non-negative macros, GI range, net carbs ≤ total carbs;
- empty score, balanced score, zone counting, fiber credit;
- curve sample count and peak ordering;
- local-storage round trip;
- HTTPS source links and six sources;
- duplicate DOM IDs;
- live WebGL context and rendered frame;
- chart canvas dimensions;
- score bounds under a ten-serving stress plate;
- every food builds a non-empty 3D mesh;
- every warning has a source note.

`window.__platewise.selftest` contains the results;
`window.__platewise.selftestPassed` is a boolean.

## Smoke and screenshots

```sh
node scripts/smoke.mjs        # boot + console errors + counts
node scripts/screenshot.mjs   # regenerate assets/studio.png, stage, analysis, glucose, mobile, og
```

Screenshots use the same Chrome flags and a document-absolute clip. The OG card
is a purpose-built page (`scripts/og-card.html`) at 1200 × 630, not a crop of the
app.

## What is not tested

- A formal WCAG audit with assistive technology; the DOM checks are necessary but
  not sufficient.
- Safari/Firefox rendering of the 3D scene; only Chrome is automated.
- Nutrition accuracy against a clinical dataset; the values are checked for
  shape and bounds, not re-derived from FDC at test time.
- GitHub Pages propagation; the live suite is run manually.

## CI

`.github/workflows/ci.yml` runs the static suite and the browser suite on
`ubuntu-latest` with Node 22, setting `CHROME` to the runner's Chrome if needed.
The browser job needs network access to jsDelivr.
