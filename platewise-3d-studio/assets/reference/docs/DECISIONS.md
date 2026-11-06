# Decisions and constraints

This is the short architecture decision record for PlateWise 3D. Each entry says
what was chosen, why, and what must not be changed casually.

## D1. Three files, no build

**Decision:** Ship `index.html`, `style.css` and `script.js` as the whole app.

**Why:** The brief asked for three self-contained blocks, and a reviewer can read
the project without installing anything. GitHub Pages serves the root directly.
There is no dependency drift from a lockfile, no CSS pipeline and no bundle to
rebuild.

**Constraint:** Do not introduce a framework or bundler without rewriting the
documentation, tests, CI and deployment. If a module split becomes necessary,
keep the three entry points and document the new layer.

## D2. Pin Three.js 0.169.0

**Decision:** An import map pins `three` and `three/addons/` to jsDelivr at
`0.169.0`.

**Why:** Add-on paths and APIs move between releases. An unpinned CDN is a
supply-chain and breakage risk. `three@latest` is forbidden.

**Constraint:** Changing the version requires re-running the browser suite and
re-checking `OrbitControls`, `CapsuleGeometry`, `SRGBColorSpace`, tone mapping and
shadow behavior.

## D3. No external visual assets

**Decision:** All food meshes, plate zones, labels, favicon, screenshots and the
social card are authored here. No image, font, icon pack or audio request is made
by the app.

**Why:** Fewer network dependencies, no licensing surprises and a distinctive
look. It also keeps the page deterministic in headless Chrome.

**Constraint:** Do not replace procedural meshes with external models or textures
without updating `THIRD_PARTY_NOTICES.md`, privacy text and tests.

## D4. Starch is excluded, not merely warned

**Decision:** Warning foods are not in `FOODS`. `addFood('white-rice')` opens the
warning modal and returns `false`. There is no “add anyway” path.

**Why:** The product promise is a *safe* pantry. Allowing starch after a warning
would make the plate score meaningless and turn the app into a generic tracker.

**Constraint:** Do not add a bypass, hidden ID or “advanced” toggle. The warning
modal's swap button is the designed escape hatch.

## D5. Net carbs, not total carbs

**Decision:** Use US-labeling net carbs (`carbohydrate − fiber`). The score and
curve consume net carbs.

**Why:** The audience is carbohydrate-aware, and fiber is the main brake the app
is trying to make visible. The convention is stated in the UI and docs.

**Constraint:** If you change the convention, change it everywhere: data,
formula, labels, tests, NUTRITION.md and the medical copy. Do not mix conventions.

## D6. A teaching score, not a clinical index

**Decision:** The Glycemic Safety Score is a transparent weighted formula. It is
labelled as teaching, shows its formula in a disclosure, and becomes “Plate needs
balance” when a zone is missing.

**Why:** A black-box “health score” would be dishonest and hard to reproduce. The
formula can be checked by hand, which is why NUTRITION.md includes worked
arithmetic.

**Constraint:** Never present the score as a diagnosis, a CGM prediction or an
ADA metric. Keep the formula visible.

## D7. A deterministic, illustrative curve

**Decision:** The curve is a closed-form gamma response with a fixed baseline and
a fixed starchy reference. It has no random noise and no personal data.

**Why:** Reproducible comparisons are useful; fake personalization is not. The UI
repeats “simulation, not a sensor”.

**Constraint:** Do not add a fake CGM connection or claim accuracy against a real
sensor. If the model changes, update the chart, tests and NUTRITION.md together.

## D8. Native dialogs

**Decision:** Use `<dialog>` and `showModal()` for warnings, the guide, sources
and save.

**Why:** Native focus trapping, Escape handling and backdrop behavior without a
custom library.

**Constraint:** Do not replace with a div overlay unless you also implement a
focus trap, focus restore, Escape handling and inertness. Keep `aria-labelledby`.

## D9. Local-only log

**Decision:** Meals live in `localStorage` under `platewise.meals.v1`; the current
plate is not persisted. Export is a local JSON download.

**Why:** No account, no server, no privacy surface. Explicit saves make the log
intentional, and the current plate stays a scratch space.

**Constraint:** Do not add network sync without a privacy review, a consent flow,
authentication and a retention policy. Do not silently upload.

## D10. Accessible by construction

**Decision:** Every action has a DOM control; the canvas is an enhancement. Food
placement, removal, selection, search, save, load, swaps and warnings all work
without the 3D pointer. There is a skip link, a live announcer, reduced-motion
handling and labelled dialogs.

**Why:** A 3D canvas is not screen-reader friendly. The plate is a visual aid, not
the only interface.

**Constraint:** A new feature that only exists as a canvas gesture is not
finished.

## D11. Mobile order: stage, pantry, analysis

**Decision:** On narrow screens the 3D plate comes first, then the pantry, then
the analysis column. A fixed dock shows score and net carbs with a “View plate”
button.

**Why:** The plate is the product; the pantry is the next action. The analysis is
long and would otherwise push the plate far below the fold.

**Constraint:** Keep the no-horizontal-overflow invariant at 390 px. Test the
dock with a non-empty plate.

## D12. Honest build metadata

**Decision:** `state.json` is generated from the OpenCode session database, not
written by hand.

**Why:** Build-time and token claims are easy to inflate. The session IDs and
counters are auditable.

**Constraint:** Never edit token counts to look better. If the session database is
unavailable, say so and omit the number rather than inventing one.

## D13. One verification path, three layers

**Decision:** Static invariants, 47 browser checks and 29 in-page checks.

**Why:** The data and release metadata can be checked without a browser; the
interactions need Chrome; the self-test lets a reader verify the deployed copy.

**Constraint:** Keep the browser suite dependency-free (Node's WebSocket + CDP).
Do not add Playwright or Puppeteer unless the size trade-off is explicitly
accepted.
