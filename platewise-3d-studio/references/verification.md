# Verification

## Commands

```sh
node --test tests/static.test.mjs
node tests/browser.test.mjs
node scripts/smoke.mjs
TEST_URL=https://<user>.github.io/platewise-3d/ node tests/browser.test.mjs
```

Expected: 22/22 static, 47/47 browser, 29/29 in-page, 0 console errors. The
reference build has the same counts.

## Static suite

Checks required files, docs, Three.js pin, no trackers/remote assets, no
credentials, local Markdown links, DOM IDs, 4 labelled dialogs, self-test API,
18/6/6 counts, nutrition formula terms, sources, AGENTS sections, screenshots,
state.json counters, canonical URL, CI, license, reduced motion and mobile CSS.

Add `docs/index.html` to the required release files. It makes `/docs/` work on
GitHub Pages.

GitHub Pages does not serve dot-directories. The catalog therefore ships the CI
workflow and GitHub templates under `templates/github/`; `new-project.mjs` copies
them to `.github/` after scaffolding. The static test accepts either location.

## Browser suite

One headless Chrome, one ephemeral local server, CDP over Node's built-in
WebSocket. Flags that matter:

```text
--headless=new --no-sandbox --disable-dev-shm-usage --enable-unsafe-swiftshader
--use-mock-keychain --password-store=basic --no-first-run --no-default-browser-check
--disable-background-networking --disable-component-update --disable-sync --mute-audio
--user-data-dir=<throwaway> --remote-debugging-port=<free> --window-size=...
```

The mock keychain flags prevent repeated macOS prompts. The suite:

1. clears local storage and reloads (clean start);
2. checks boot, title, 18/6/6, six sources, canvas, at least one frame;
3. clicks a real broccoli card and checks net carbs 3.7 / fiber 2.4;
4. adds salmon/avocado, checks zones/score/3 meshes;
5. opens item detail and closes it;
6. opens the white-rice warning, checks 3 metrics and that nothing was added;
7. clicks “Add Cauliflower rice”, checks the dialog closes and cauliflower, not
   rice, is present;
8. searches broccoli, searches rice (warning card), empty state, protein chip;
9. builds the balanced plate (8, score 96, curve 100.5 vs 177.6, peak 50);
10. checks chart aria-label and pixels; adds a swap;
11. saves a meal, reloads, checks localStorage/log/load;
12. toggles theme, reloads, checks persistence;
13. clears the plate;
14. opens `?selftest` and checks 29/29 and the panel;
15. emulates 390×844, adds 3 foods, checks no overflow, stage size, dock, 18 cards;
16. checks every button has a name, all dialogs labelled, skip link, `lang`;
17. fails on any console error or uncaught exception.

Do not replace the harness with Playwright unless the user accepts the added
dependency and download.

## Selftest

`?selftest` runs 29 checks and shows a panel. It writes
`window.__platewise.selftest = { passed, total, results }`. It is scheduled after
one animation frame, because the “rendered a frame” check needs a frame.

It covers counts, uniqueness, swap/warning integrity, non-negative data, GI range,
net ≤ carbs, score bounds, zone counting, fiber credit, curve length/order,
localStorage, HTTPS sources, duplicate DOM IDs, WebGL context/frame, chart size,
every food factory and warning sources.

## Screenshots

`node scripts/screenshot.mjs` regenerates studio, stage, analysis, glucose,
mobile and OG. Use:

- document-absolute clips with `captureBeyondViewport: true`;
- one Chrome with mock keychain;
- force the light theme for deterministic images;
- a separate `scripts/og-card.html` at 1200×630, not a crop;
- the mobile viewport at 390×844.

## Live checks

After Pages reports `built`, run `TEST_URL=... node tests/browser.test.mjs`.
Also `curl` `/`, `/docs/`, `/404.html`, `/sitemap.xml`, `/?selftest` and expect
200.

## When something fails

- `smoke.mjs` for a quick console read.
- `?selftest` in a real browser.
- If the first food works and later adds fail, suspect a render function, not the
  data. The reference had exactly that bug: `summary.items` entries are spread
  plate entries (`uid`), not a nested `entry`.
- If screenshots are blank, you are mixing viewport and document coordinates.
- If the selftest fails only the frame check, you ran it before a paint.
- If every button is unnamed, you removed a `textContent`/`aria-label`.
