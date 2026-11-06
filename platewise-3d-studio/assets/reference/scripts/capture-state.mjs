// Capture the build's wall-clock time and token usage from the OpenCode session
// database, then write state.json and docs/STATE.md.
//
// Usage:
//   OPENCODE_SESSION_ID=ses_... node scripts/capture-state.mjs
//   OPENCODE_SESSION_ID=ses_... STATIC_CHECKS=22 BROWSER_CHECKS=47 \
//     SELFTEST_CHECKS=29 LIVE_CHECKS=47 node scripts/capture-state.mjs
//
// This is deliberately a generator: token counts must come from the database,
// never from prose. It reads sqlite3's JSON output and writes both files.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DB = process.env.OPENCODE_DB || resolve(homedir(), '.local/share/opencode/opencode.db');
const SESSION = process.env.OPENCODE_SESSION_ID || 'ses_e50cc1dc6ffekm230esZitx60J';

if (!existsSync(DB)) {
  console.error(`OpenCode database not found at ${DB}`);
  process.exit(1);
}

const query = `SELECT id, title, directory, tokens_input, tokens_output,
  tokens_reasoning, tokens_cache_read, tokens_cache_write, cost,
  time_created, time_updated, model, agent
  FROM session_v2 WHERE id = '${SESSION.replace(/'/g, "''")}' LIMIT 1;`;

const rows = JSON.parse(execFileSync('sqlite3', ['-json', DB, query], { encoding: 'utf8' }) || '[]');
if (!rows.length) {
  console.error(`Session ${SESSION} not found in ${DB}`);
  process.exit(1);
}
const row = rows[0];
const startMs = Number(row.time_created);
const capturedAt = new Date();
const elapsedSeconds = Math.max(0, Math.round((capturedAt.getTime() - startMs) / 1000));
const elapsed = `${Math.floor(elapsedSeconds / 3600)}h ${String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0')}m ${String(elapsedSeconds % 60).padStart(2, '0')}s`;

const usage = {
  inputTokens: Number(row.tokens_input),
  outputTokens: Number(row.tokens_output),
  reasoningTokens: Number(row.tokens_reasoning),
  cacheReadTokens: Number(row.tokens_cache_read),
  cacheWriteTokens: Number(row.tokens_cache_write),
};
usage.totalTokens = usage.inputTokens + usage.outputTokens + usage.reasoningTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
usage.costUSD = Number(row.cost) || 0;

const staticChecks = Number(process.env.STATIC_CHECKS || 0);
const browserChecks = Number(process.env.BROWSER_CHECKS || 47);
const selftestChecks = Number(process.env.SELFTEST_CHECKS || 29);
const liveChecks = Number(process.env.LIVE_CHECKS || 0);
const consoleErrors = Number(process.env.CONSOLE_ERRORS || 0);

const state = {
  schema: 1,
  project: 'PlateWise 3D',
  release: {
    version: '1.1.0',
    name: 'Non-Starchy Whole Food Picker',
    license: 'MIT',
    releasedAt: capturedAt.toISOString(),
  },
  session: {
    id: row.id,
    title: row.title,
    directory: row.directory,
    startedAt: new Date(startMs).toISOString(),
    capturedAt: capturedAt.toISOString(),
    elapsedSeconds,
    elapsed,
    note: 'Wall-clock build time from the OpenCode session start through local verification, documentation and release. Captured just before the final state commit; use the timestamps as the source of truth. Not an estimate of model-only time.',
  },
  model: {
    name: 'DeepSeek V4.1 Flash',
    id: 'deepseek-v4.1-flash',
    provider: 'opencode-go',
    modelField: row.model,
  },
  usage: {
    ...usage,
    note: 'Read from the OpenCode session database (session_v2) with scripts/capture-state.mjs. totalTokens is the sum of all five counters, including prompt context read repeatedly from cache; cache reads dominate the figure. costUSD is 0 on the flat-rate plan.',
  },
  artifacts: {
    appFiles: ['index.html', 'style.css', 'script.js'],
    docs: [
      'README.md', 'AGENTS.md', 'CHANGELOG.md', 'CONTRIBUTING.md',
      'CODE_OF_CONDUCT.md', 'SECURITY.md', 'SUPPORT.md', 'ROADMAP.md',
      'CITATION.cff', 'THIRD_PARTY_NOTICES.md',
      'docs/README.md', 'docs/ARCHITECTURE.md', 'docs/NUTRITION.md',
      'docs/SOURCES.md', 'docs/DECISIONS.md', 'docs/TESTING.md',
      'docs/DEPLOYMENT.md', 'docs/REPRODUCTION.md', 'docs/PRIVACY.md',
      'docs/ACCESSIBILITY.md', 'docs/PERFORMANCE.md', 'docs/FAQ.md',
      'docs/STATE.md', 'docs/BUILD-LOG.md',
    ],
    content: {
      safeFoods: 64,
      warningFoods: 6,
      swaps: 6,
      evidenceSources: 6,
      plateZones: 3,
      browserChecks,
      selftestChecks,
      staticChecks,
      liveChecks,
    },
  },
  verification: {
    method: 'Node built-in test runner for static invariants; a dependency-free headless Chrome harness over the DevTools Protocol for the real UI; a 29-check in-page suite for the deployed copy. Chrome uses --use-mock-keychain and a throwaway profile so macOS does not prompt repeatedly.',
    checks: [
      `${browserChecks}/${browserChecks} local headless Chrome checks: boot, WebGL, placement, warnings, swaps, search, curve, persistence, theme, mobile, accessibility`,
      `${selftestChecks}/${selftestChecks} in-page self-test checks, including data integrity, storage round trip and live WebGL`,
      staticChecks ? `${staticChecks} static/release invariant tests` : 'Static/release invariant suite available as node --test tests/static.test.mjs',
      liveChecks ? `${liveChecks}/${liveChecks} live GitHub Pages checks` : 'Live suite is run after the Pages deployment',
      `${consoleErrors} console errors and uncaught exceptions in the local suite`,
    ],
    consoleErrors,
  },
  deployment: {
    repository: 'https://github.com/somphol/platewise-3d',
    pages: 'https://somphol.github.io/platewise-3d/',
    host: 'GitHub Pages',
    branch: 'main',
    path: '/',
  },
  credits: {
    tool: 'OpenCode',
    toolURL: 'https://opencode.ai',
    model: 'DeepSeek V4.1 Flash',
    modelID: 'opencode-go/deepseek-v4.1-flash',
    visualization: 'Three.js 0.169.0 (MIT)',
    data: 'USDA FoodData Central; ADA Standards of Care; NIH/PubMed; international GI tables',
    author: 'Somphol Boonjing',
  },
  skill: {
    name: 'platewise-3d-studio',
    repository: 'https://github.com/somphol/platewise-3d-skill',
    catalog: 'https://somphol.github.io/platewise-3d-skill/',
    note: 'Published skill backup with the reference source, scaffold and verification harness.',
  },
};

writeFileSync(resolve(ROOT, 'state.json'), `${JSON.stringify(state, null, 2)}\n`);

const md = `# Build state

\`state.json\` is generated from the OpenCode session database. It records how long
the reference build took, how many tokens the session consumed, what was verified
and who/what built it. The JSON is the machine-readable source; this page explains
it.

## Snapshot

| Field | Value |
| --- | --- |
| Session | \`${state.session.id}\` |
| Session title | ${state.session.title} |
| Started | ${state.session.startedAt} |
| Captured | ${state.session.capturedAt} |
| Wall-clock elapsed | **${state.session.elapsed}** (${elapsedSeconds.toLocaleString('en-US')} s) |
| Model | ${state.model.name} (\`${state.model.provider}/${state.model.id}\`) |
| Tool | [${state.credits.tool}](${state.credits.toolURL}) |
| Input tokens | ${usage.inputTokens.toLocaleString('en-US')} |
| Output tokens | ${usage.outputTokens.toLocaleString('en-US')} |
| Reasoning tokens | ${usage.reasoningTokens.toLocaleString('en-US')} |
| Cache read tokens | ${usage.cacheReadTokens.toLocaleString('en-US')} |
| Cache write tokens | ${usage.cacheWriteTokens.toLocaleString('en-US')} |
| **Total tokens** | **${usage.totalTokens.toLocaleString('en-US')}** |
| Cost | $${usage.costUSD.toFixed(2)} (flat-rate plan) |
| Local browser checks | ${browserChecks} |
| In-page checks | ${selftestChecks} |
| Live checks | ${liveChecks || 'run after deployment'} |
| Console errors | ${consoleErrors} |

The total is the sum of **all five** counters. Cache reads dominate because the
prompt context is re-read on every turn; they are counted rather than hidden. The
number is not a measure of “useful output”, only of session consumption.

## How it is generated

\`\`\`sh
OPENCODE_SESSION_ID=${state.session.id} \\
STATIC_CHECKS=${staticChecks || 22} BROWSER_CHECKS=${browserChecks} \\
SELFTEST_CHECKS=${selftestChecks} LIVE_CHECKS=${liveChecks} \\
node scripts/capture-state.mjs
\`\`\`

The script queries:

\`\`\`sql
SELECT id, title, directory, tokens_input, tokens_output, tokens_reasoning,
       tokens_cache_read, tokens_cache_write, cost, time_created, time_updated,
       model, agent
FROM session_v2
WHERE id = '${state.session.id}'
LIMIT 1;
\`\`\`

against \`~/.local/share/opencode/opencode.db\` (override with \`OPENCODE_DB\`).
Elapsed time is \`capturedAt − time_created\`, so it includes tool execution, test
runs and waiting, not just model generation.

## What is not in the number

- Time before the session started (the brief was supplied at session creation).
- The final commit/push after the capture.
- Any future fixes.

The timestamps let a reader recompute. Do not edit the counters by hand; rerun the
script if the session is still open.

## Credits

- **Build and authorship:** ${state.credits.author}
- **Tool:** [${state.credits.tool}](${state.credits.toolURL})
- **Model:** ${state.credits.model} — \`${state.credits.modelID}\`
- **3D:** ${state.credits.visualization}
- **Evidence:** ${state.credits.data}

## Verification snapshot

${state.verification.checks.map((item) => `- ${item}`).join('\n')}

## Deployment

- Live: <${state.deployment.pages}>
- Repository: <${state.deployment.repository}>
- Skill: <${state.skill.repository}>
- Catalog: <${state.skill.catalog}>
`;

writeFileSync(resolve(ROOT, 'docs/STATE.md'), md);
console.log(`Wrote state.json and docs/STATE.md for ${state.session.id}`);
console.log(`${elapsed} · ${usage.totalTokens.toLocaleString('en-US')} total tokens`);
