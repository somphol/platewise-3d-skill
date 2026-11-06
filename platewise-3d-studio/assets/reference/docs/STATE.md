# Build state

`state.json` is generated from the OpenCode session database. It records how long
the reference build took, how many tokens the session consumed, what was verified
and who/what built it. The JSON is the machine-readable source; this page explains
it.

## Snapshot

| Field | Value |
| --- | --- |
| Session | `ses_e50cc1dc6ffekm230esZitx60J` |
| Session title | PlateWise 3D food picker project |
| Started | 2026-11-06T04:52:55.509Z |
| Captured | 2026-11-06T06:34:06.168Z |
| Wall-clock elapsed | **1h 41m 11s** (6,071 s) |
| Model | DeepSeek V4.1 Flash (`opencode-go/deepseek-v4.1-flash`) |
| Tool | [OpenCode](https://opencode.ai) |
| Input tokens | 497,239 |
| Output tokens | 205,514 |
| Reasoning tokens | 113,633 |
| Cache read tokens | 66,089,728 |
| Cache write tokens | 1,408 |
| **Total tokens** | **66,907,522** |
| Cost | $0.00 (flat-rate plan) |
| Local browser checks | 47 |
| In-page checks | 29 |
| Live checks | 47 |
| Console errors | 0 |

The total is the sum of **all five** counters. Cache reads dominate because the
prompt context is re-read on every turn; they are counted rather than hidden. The
number is not a measure of “useful output”, only of session consumption.

## How it is generated

```sh
OPENCODE_SESSION_ID=ses_e50cc1dc6ffekm230esZitx60J \
STATIC_CHECKS=22 BROWSER_CHECKS=47 \
SELFTEST_CHECKS=29 LIVE_CHECKS=47 \
node scripts/capture-state.mjs
```

The script queries:

```sql
SELECT id, title, directory, tokens_input, tokens_output, tokens_reasoning,
       tokens_cache_read, tokens_cache_write, cost, time_created, time_updated,
       model, agent
FROM session_v2
WHERE id = 'ses_e50cc1dc6ffekm230esZitx60J'
LIMIT 1;
```

against `~/.local/share/opencode/opencode.db` (override with `OPENCODE_DB`).
Elapsed time is `capturedAt − time_created`, so it includes tool execution, test
runs and waiting, not just model generation.

## What is not in the number

- Time before the session started (the brief was supplied at session creation).
- The final commit/push after the capture.
- Any future fixes.

The timestamps let a reader recompute. Do not edit the counters by hand; rerun the
script if the session is still open.

## Credits

- **Build and authorship:** Somphol Boonjing
- **Tool:** [OpenCode](https://opencode.ai)
- **Model:** DeepSeek V4.1 Flash — `opencode-go/deepseek-v4.1-flash`
- **3D:** Three.js 0.169.0 (MIT)
- **Evidence:** USDA FoodData Central; ADA Standards of Care; NIH/PubMed; international GI tables

## Verification snapshot

- 47/47 local headless Chrome checks: boot, WebGL, placement, warnings, swaps, search, curve, persistence, theme, mobile, accessibility
- 29/29 in-page self-test checks, including data integrity, storage round trip and live WebGL
- 22 static/release invariant tests
- 47/47 live GitHub Pages checks
- 0 console errors and uncaught exceptions in the local suite

## Deployment

- Live: <https://somphol.github.io/platewise-3d/>
- Repository: <https://github.com/somphol/platewise-3d>
- Skill: <https://github.com/somphol/platewise-3d-skill>
- Catalog: <https://somphol.github.io/platewise-3d-skill/>
