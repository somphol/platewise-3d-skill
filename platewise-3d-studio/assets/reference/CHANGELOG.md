# Changelog

All notable changes are documented here. The format follows Keep a Changelog;
the project follows Semantic Versioning for its own code.

## [1.1.0] — 2026-11-05

### Added

- Expanded the pantry from 18 to **64 whole foods**: 30 non-starchy vegetables,
  three low-GI berries, 14 proteins and 17 fats, nuts, seeds and oils.
- Added leafy greens (kale, arugula, romaine, chard, collards, bok choy,
  watercress), more cruciferous vegetables, cucumber, celery, green beans, snap
  peas, okra, eggplant, tomato, mushrooms, artichoke, fennel, radishes, onion,
  leek, garlic and hearts of palm.
- Added seafood and lean proteins (shrimp, tuna, cod, sardines, trout, turkey,
  sirloin, pork tenderloin, tempeh, Greek yogurt).
- Added nuts, seeds and oils (pecans, pistachios, macadamia, pine nuts, cashews,
  flax, hemp, pumpkin, sunflower, sesame, olives, avocado oil).
- Added 22 reusable procedural form families so every new food has a 3D mesh
  without duplicating a factory per item.
- Split the pantry into **Nuts & seeds** and **Fats & oils** filters.

### Fixed

- The painted plate sectors were mirrored relative to the food slots and zone
  labels. Veg now occupies the front 50% as labelled, protein the back-left and
  fats the back-right.

## [1.0.0] — 2026-11-05

### Added

- Interactive Three.js dinner plate divided 50% non-starchy veg / 25% protein /
  25% healthy fats, with orbit, zoom, pan, reset, fullscreen and auto-rotate.
- 18 procedurally modelled whole foods across vegetables, protein, fats/seeds
  and low-GI berries. Click-to-place, click-to-inspect, per-item removal.
- Real-time analyzer: net carbs, fiber, protein, fat, energy, glycemic load and
  a 0–100 Glycemic Safety Score with a visible formula.
- Six starch/processed warnings with GI, GL, net carbs, a plain-language risk
  explanation and a safe swap.
- Six craving-to-whole-food swaps with saved-net-carb comparisons.
- 180-minute simulated glucose curve with a fixed starchy reference, peak
  markers and an accessible live description.
- Local meal log (`localStorage`), load/delete, JSON export, theme persistence.
- Light/dark themes, responsive layout at 390 px, reduced-motion support,
  keyboard shortcuts and a mobile live dock.
- 29-check in-page self-test (`?selftest`), 47-check headless Chrome suite,
  static release tests, smoke script and screenshot generator.
- Full release documentation: architecture, nutrition methodology, sources,
  decisions, reproduction blueprint, privacy, accessibility, performance, FAQ.
- GitHub Pages deployment at <https://somphol.github.io/platewise-3d/>.
- Published skill backup at <https://github.com/somphol/platewise-3d-skill>.

### Fixed during the build

- Plate list rendering destructured a non-existent `entry` property, which
  aborted every add after the first. Now uses the spread entry's `uid` directly.
- Zone labels were buried under food; moved to the rim and given translucent
  pill backgrounds.
- Screenshot captures used viewport coordinates after scrolling; now use
  document-absolute clips with `captureBeyondViewport`.

### Notes

- The glucose curve is illustrative, not a CGM prediction.
- Nutrition values are rounded from USDA FoodData Central; GI values are
  population approximations. See `docs/NUTRITION.md`.
