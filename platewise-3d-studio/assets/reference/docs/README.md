# Documentation

Start here. The product README is at the repository root; this folder is the
durable handoff for developers, agents and reviewers.

## If you have 2 minutes

- [README](../README.md) — what it is, screenshots, quick start.
- [FAQ](FAQ.md) — the short answers, including “is this medical advice?”.
- [Nutrition methodology](NUTRITION.md) — every number and formula.
- [Sources](SOURCES.md) — ADA, USDA, NIH/PubMed, GI tables.

## If you are rebuilding it

1. [REPRODUCTION.md](REPRODUCTION.md) — the build blueprint and pitfalls.
2. [ARCHITECTURE.md](ARCHITECTURE.md) — state, scene, chart, events, extension
   recipes.
3. [DECISIONS.md](DECISIONS.md) — why three files, why no starch, why the curve
   is deterministic.
4. [TESTING.md](TESTING.md) — three verification layers and expected counts.
5. [STATE.md](STATE.md) — the build-state file, its SQL source and credits.
6. [BUILD-LOG.md](BUILD-LOG.md) — what happened in the reference build,
   including the bugs that cost time.

## If you are releasing or operating it

- [DEPLOYMENT.md](DEPLOYMENT.md) — GitHub Pages, custom domain, rollback.
- [PRIVACY.md](PRIVACY.md) — storage keys, the one CDN request, export.
- [ACCESSIBILITY.md](ACCESSIBILITY.md) — what is implemented and what is not.
- [PERFORMANCE.md](PERFORMANCE.md) — size, draw calls, techniques.
- [SECURITY.md](../SECURITY.md), [SUPPORT.md](../SUPPORT.md),
  [CONTRIBUTING.md](../CONTRIBUTING.md), [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md).
- [AGENTS.md](../AGENTS.md) — the one-minute handoff for the next agent.
- [CHANGELOG.md](../CHANGELOG.md), [ROADMAP.md](../ROADMAP.md).

## Quick facts

| Fact | Value |
| --- | --- |
| App files | `index.html`, `style.css`, `script.js` |
| Runtime dependency | Three.js 0.169.0 via pinned CDN |
| Safe foods | 64 |
| Warnings / swaps | 6 / 6 |
| Balanced sample | 8 servings, 17.7 g net carbs, 16.4 g fiber, score 96 |
| Curve | 0–180 min, 37 samples, reference peak ≈178 mg/dL |
| Storage | `platewise.meals.v1`, `platewise.prefs.v1` |
| Browser checks | 47 |
| In-page checks | 29 |
| Live | <https://somphol.github.io/platewise-3d/> |
| Repository | <https://github.com/somphol/platewise-3d> |
| Skill backup | <https://github.com/somphol/platewise-3d-skill> |

## Documentation conventions

- Every number in a doc should be reproducible from `script.js` or the cited
  source.
- “Net carbs” always means total carbohydrate − fiber.
- “The curve” is always the illustrative model, never a CGM.
- Do not add a claim that the project is clinically validated.
- When a code change makes a doc stale, update the doc in the same commit. The
  static test checks that pages exist and key terms are present, not that every
  sentence is current.

## Not medical advice

The documentation is not a clinical protocol. See the disclaimer in the root
README and in the app.
