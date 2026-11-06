# Attribution

## Origin

This skill was distilled from a reference build commissioned by Somphol Boonjing
and produced in an OpenCode session with DeepSeek V4.1 Flash. The complete
reference implementation, docs, screenshots and build state are in
`assets/reference/`.

- Live app: <https://somphol.github.io/platewise-3d/>
- Source: <https://github.com/somphol/platewise-3d>
- Skill repository: <https://github.com/somphol/platewise-3d-skill>
- License: MIT (this skill and the reference code)

## Reused

- **Three.js 0.169.0** (MIT) for WebGL rendering and OrbitControls. It is loaded
  from a pinned jsDelivr URL, not vendored. See
  `assets/reference/THIRD_PARTY_NOTICES.md`.
- **Nutrition evidence** from USDA FoodData Central (public domain), the American
  Diabetes Association Standards of Care, the 2019 nutrition consensus report,
  and published GI tables. Cited, not bundled. See
  `assets/reference/docs/SOURCES.md`.
- The reference app's own design system, food meshes, prose, code and tests are
  original work for this project.
- The headless Chrome harness follows the dependency-free CDP pattern used in
  earlier OpenCode projects; it is small, generic infrastructure, included here
  under the same MIT terms.

## New in this skill

- The distillation: when to use, construction order, exact formulas, scene
  slots, verification commands, failure boundaries and the regression log.
- `scripts/new-project.mjs` — a scaffold that copies the complete reference.
- `scripts/verify-skill.mjs` — proves the shipped reference still passes.
- The reusable reference itself, with its docs and build state.

## Third-party software

Only Three.js is loaded by the app, from `cdn.jsdelivr.net` at version 0.169.0
(MIT). There is no npm dependency, no bundled font, no image library and no
analytics SDK. Emoji are rendered by the reader's system font.

## Medical content

The nutrition and clinical framing is educational. It is not medical advice and
is not endorsed by the ADA, USDA, NIH or any cited author. Do not represent it as
clinically validated. Keep the disclaimer and the “simulation, not a sensor”
language in any redistribution.
