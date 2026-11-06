# Roadmap

This is a direction, not a promise. The 1.0 release is intentionally small and
static. Anything that adds a backend, an account or a medical claim needs a
separate design and privacy review.

## Now (shipped in 1.0)

- 3D 50/25/25 plate with 64 whole foods.
- Live net carbs, fiber, protein, calories, glycemic load and safety score.
- Six starch warnings and six swaps.
- Simulated glucose curve with a starchy reference.
- Local meal log, JSON export, themes, keyboard shortcuts, mobile dock.
- Three verification layers and a documented release.

## Next

- **Plate image export** as a transparent PNG for sharing, generated from the
  existing renderer without adding a second scene.
- **Undo removal** in the plate list, so an accidental tap is recoverable.
- **Accessible food list view** that mirrors the plate as a table for screen
  readers and print.
- **Serving stepper** (½, 1, 2) instead of only whole servings, with the score
  and curve updating proportionally.
- **More whole foods** with USDA citations, especially herbs, mushrooms, okra,
  cabbage, Brussels sprouts and sardines.

## Later (needs a decision)

- A Thai-language interface, reviewed by a native speaker, not machine-only.
- An offline-first service-worker cache of the pinned Three.js module.
- A “compare two plates” view with side-by-side curves.
- A shareable read-only plate encoded in the URL hash (no server, size-limited).
- Optional personal targets for carbs/fiber, stored locally and clearly labelled
  as user-set, not medical advice.

## Explicitly out of scope

- Accounts, cloud sync or a social feed.
- A real CGM integration or a claim of personal glucose prediction.
- Calorie counting, weight-loss coaching or medication advice.
- Ads, affiliate links or selling nutrition data.
- A native app before the web app is fully accessible and offline-capable.
