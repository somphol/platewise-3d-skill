# Contributing

Thanks for improving PlateWise 3D. The project is deliberately small: three app
files, no build, no framework and no backend.

## Before you change anything

Read [AGENTS.md](AGENTS.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The
short version:

- `index.html` is the UI shell; `style.css` is the design system; `script.js` is
  data + math + Three.js + UI.
- Pin Three.js 0.169.0. Do not use `three@latest`.
- No new runtime dependency, tracker, web font or external image without a
  documented decision.
- Warnings are never placeable. Do not add an “add anyway” path.

## Nutrition and medical changes

Any change to a food, serving, GI value, score or curve must:

1. cite a source (USDA FDC description, GI table, or peer-reviewed paper);
2. update `docs/NUTRITION.md`, including the per-serving table and a worked
   number if the formula changes;
3. keep the “not medical advice” language and the “simulation, not a sensor”
   label;
4. pass the self-test and browser suite.

Do not add claims that the app diagnoses, treats or predicts an individual's
glucose response.

## Local workflow

```sh
python3 -m http.server 8000
node --test tests/static.test.mjs
node tests/browser.test.mjs
node scripts/smoke.mjs
```

Regenerate screenshots only when the visual change is intentional:

```sh
node scripts/screenshot.mjs
```

## Pull requests

- Keep a change focused; describe the user-visible effect.
- Include before/after notes for visual changes.
- Update `CHANGELOG.md` under an unreleased or next-version heading.
- If you add a food, add its 3D factory, USDA description, docs row and test
  coverage.
- If you add a control, give it an accessible name and keyboard path.
- If you change a storage key or schema, add a migration or explicitly accept
  the reset and document it.

## Code style

- Vanilla ES modules, two-space indentation, single quotes in JS.
- No semicolon-free style, no framework idioms.
- DOM text from user input must go through `escapeHtml`.
- Prefer named helpers over comments that restate code.
- Keep the browser suite dependency-free (Node's built-in WebSocket and CDP).

## Reporting

- Bugs and feature ideas: GitHub Issues.
- Security: see [SECURITY.md](SECURITY.md).
- Conduct: see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- Medical questions: not here. Talk to a clinician.
