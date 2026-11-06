# AGENTS.md

## What it is

The public catalog copy of the OpenCode skill **PlateWise 3D Studio**. It teaches
an agent to build or adapt a static, evidence-grounded Three.js non-starchy
whole-food plate picker. The complete reference app is in
`platewise-3d-studio/assets/reference/`. The live app is
<https://somphol.github.io/platewise-3d/>.

It is not the app itself and not a medical device.

## Commands

Run from the repository root.

| Task | Command |
| --- | --- |
| Validate the skill | `node ~/.config/opencode/skills/skill-publish/scripts/check-skill.mjs ./platewise-3d-studio` |
| Verify the reference (static) | `node platewise-3d-studio/scripts/verify-skill.mjs` |
| Verify with browser | `node platewise-3d-studio/scripts/verify-skill.mjs --browser` |
| Scaffold a project | `node platewise-3d-studio/scripts/new-project.mjs --out /tmp/platewise-try` |
| Test the scaffold | `cd /tmp/platewise-try && node --test tests/static.test.mjs` |
| Browser-test the scaffold | `cd /tmp/platewise-try && node tests/browser.test.mjs` |
| Rebuild the catalog | `node scripts/sync-index.mjs` |
| Serve the catalog | `python3 -m http.server 8000` |
| Deploy | `git push origin main`; Pages serves `main` / root |

## Layout

- `index.json` — catalog manifest; `version` is a SHA-256 content hash.
- `platewise-3d-studio/SKILL.md` — model-facing instructions.
- `platewise-3d-studio/references/` — method, nutrition, scene, verification,
  lessons, hosting, build log.
- `platewise-3d-studio/assets/reference/` — the complete v1.0.0 app, docs, tests,
  screenshots and state. `templates/github/` holds the CI and issue templates
  because GitHub Pages cannot serve `.github/`; the scaffold restores them.
- `platewise-3d-studio/scripts/new-project.mjs` — copies the reference; refuses a
  non-empty directory unless `--force`.
- `platewise-3d-studio/scripts/verify-skill.mjs` — static checks + Node tests;
  `--browser` adds 47 Chrome checks.
- `scripts/sync-index.mjs` — hashes every skill file and rewrites `index.json`.
- `docs/preview.png` — README preview (OG card).

## Constraints

- **The reference must remain runnable.** Do not edit
  `assets/reference` without running 22 static tests and, for visual changes, 47
  browser checks. Scaffold a clean copy and run them there too.
- **`index.json` must list every shipped file**, including `.nojekyll`,
  `.github/workflows/ci.yml` and `.gitignore`. A scaffold from the catalog must
  pass the static suite.
- **The version must change on every edit.** `node scripts/sync-index.mjs` handles
  it. Never hand-edit the hash.
- **Paths are relative to `<base>/platewise-3d-studio/`.** No `..`, no absolute
  URLs, no other hosts.
- **No secrets, tokens, credentials, emails or machine-specific paths.** The
  build log describes the credential method without a token.
- **No third-party brand marks or fonts.** All visuals are procedural or original;
  Three.js is loaded, not vendored.
- **Medical boundary.** No clinical claims, no CGM, no individualized advice.
  Starch is never placeable.
- **MIT.** Keep attribution and the Three.js notice.
- **Skills load unsandboxed.** Do not add scripts that exfiltrate data or write
  outside the requested output.

## Known issues

- The scaffold is a full copy, not a renamed generator. It prints a checklist;
  another agent must replace URLs, content, screenshots and `state.json`.
- The reference depends on the Three.js CDN for first load. Offline use requires
  vendoring, which is deliberately not done.
- The catalog has one skill. A second needs the same folder/hash pattern.
- `state.json` in the reference is the original build's snapshot, not yours.
- Pages caches `index.json`; the content hash is the cache-buster.
- Browser checks need Chrome and network; CI uses `ubuntu-latest`.

## Continuity

- Catalog: <https://somphol.github.io/platewise-3d-skill/>
- Repository: <https://github.com/somphol/platewise-3d-skill>
- Reference app: <https://github.com/somphol/platewise-3d>
- Live app: <https://somphol.github.io/platewise-3d/>
- Local skill source: `~/.config/opencode/skills/platewise-3d-studio`
