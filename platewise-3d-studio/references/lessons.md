# What regresses

These are the failures that actually happened in the reference build, plus the
ones a copy is most likely to reintroduce.

## 1. The plate list destructuring bug

`summarize().items` is:

```js
state.plate.map(entry => ({ ...entry, food, nutrition }))
```

It is **not** `{ entry, food, nutrition }`. The first implementation wrote:

```js
summary.items.map(({ entry, food, nutrition }) => ...)
```

`entry` was undefined, so `renderPlateList()` threw on the first add. The throw
happened after `state.plate.push` and `scene.add`, so the plate had one item and
the UI looked half-created. Fix:

```js
summary.items.map(({ uid, food, nutrition }) => ...)
```

Add a browser check that places at least two different foods and asserts the plate
list rows and scene item count. The self-test alone did not catch it because it
never exercised the full add → HUD → list path.

## 2. Screenshot coordinates

`Page.captureScreenshot` clips are document coordinates. If you scroll first and
pass `getBoundingClientRect()` without adding `scrollX/scrollY`, you capture the
wrong region, often blank. Use:

```js
{ x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }
```

and `captureBeyondViewport: true` for clipped shots. Hide the sticky header for
a clean analysis column. Force the light theme for marketing images.

## 3. Zone labels under food

Sprites at y=0.12 were buried by food meshes and invisible over brown almonds.
Move them to radius 2.62, give them a translucent pill background, `depthTest:
false`, renderOrder 3, and keep the HTML legend authoritative. Do not rely on a
brown label over brown nuts.

## 4. Selftest before the first frame

Running `runSelfTest` synchronously at the end of `boot()` fails “3D scene rendered
at least one frame”. Schedule it after `requestAnimationFrame` + a short timeout
when `?selftest` is present. On normal loads, a 900 ms delay is fine.

## 5. Native button styling

`.plate-row-main` looked like a dark native button because it only reset layout,
not `border`, `background`, `padding` or `color`. Reset every custom button. The
same class of bug can appear on log rows and new controls.

## 6. Chart edge labels

The last x-axis label “180 min” is centered at `width − 8`, so half of it is
clipped. Right-align the final label and left-align the first.

## 7. Theme default

The app follows `prefers-color-scheme`. On a dark-OS machine, the first
screenshot is dark. If you need deterministic marketing images, click the theme
button (or set the preference) before capturing; do not change the app default
just for screenshots.

## 8. Capacity ordering

Check the 12-serving total cap before the zone cap. The balanced sample has 8
servings; the caps allow 12 (veg 8, protein 4, fat 5). If the sample grows, adjust
the caps and the tests together.

## 9. The plate is not persisted

Reloading resets the plate. Saved meals survive. The browser test must save, save
again after adding a swap if needed, reload, then assert against the saved
record's food count, not a hardcoded 8. This exact mismatch appeared when the
test saved a 9-serving plate but expected 8.

## 10. Keychain and git

Do not run `git credential fill` before every push. Read the credential once,
store it in a mode-600 temp file for the session, and use an askpass helper. The
browser harness always uses `--use-mock-keychain` and
`--password-store=basic`. Delete the temp credential at the end.

## 11. Medical drift

It is easy for “educational” copy to become advice. Do not add phrases like “safe
for diabetics”, “prevents spikes” or “replaces medication”. Do not call the curve
a CGM. Do not remove the disclaimer to make the hero shorter.

## 12. Starch bypass

Adding an “add anyway” option destroys the product's core promise and the score's
meaning. Warning IDs must never enter `FOODS`. The swap is the intended path.

## 13. Unpinned Three.js

`three@latest` breaks add-on import paths and changes APIs. Pin `0.169.0` in both
the core and add-on URLs.

## 14. Docs drift

When a serving or formula changes, `docs/NUTRITION.md`, the in-app formula, the
README quick facts, the selftest and the static test all need updating. A stale
nutrition page is worse than no page.
