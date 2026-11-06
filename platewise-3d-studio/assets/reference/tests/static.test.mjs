// Repository and release invariants. No browser, no network, no dependencies.
//
//   node --test tests/static.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const html = read('index.html');
const css = read('style.css');
const js = read('script.js');
const readme = read('README.md');

const docs = [
  'README.md',
  'ARCHITECTURE.md',
  'NUTRITION.md',
  'SOURCES.md',
  'DECISIONS.md',
  'TESTING.md',
  'DEPLOYMENT.md',
  'REPRODUCTION.md',
  'PRIVACY.md',
  'ACCESSIBILITY.md',
  'PERFORMANCE.md',
  'FAQ.md',
  'STATE.md',
  'BUILD-LOG.md',
];

test('required release files exist', () => {
  const files = [
    'index.html', 'style.css', 'script.js', 'README.md', 'AGENTS.md', 'LICENSE',
    'CHANGELOG.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md',
    'SUPPORT.md', 'ROADMAP.md', 'CITATION.cff', 'THIRD_PARTY_NOTICES.md',
    'state.json', '.nojekyll', 'robots.txt', 'sitemap.xml', '404.html', 'docs/index.html',
    'tests/browser.test.mjs', 'tests/static.test.mjs',
    'scripts/smoke.mjs', 'scripts/screenshot.mjs', 'assets/favicon.svg',
    'assets/studio.png', 'assets/stage.png', 'assets/analysis.png',
    'assets/glucose.png', 'assets/mobile.png', 'assets/og.png',
  ];
  for (const file of files) assert.ok(existsSync(join(ROOT, file)), `missing ${file}`);
});

test('every documentation page exists and is non-trivial', () => {
  for (const file of docs) {
    const path = join(ROOT, 'docs', file);
    assert.ok(existsSync(path), `missing docs/${file}`);
    assert.ok(statSync(path).size > 700, `docs/${file} is too thin`);
  }
});

test('Three.js is pinned and no other app asset is remote', () => {
  assert.match(html, /three@0\.169\.0\/build\/three\.module\.js/);
  assert.match(html, /three@0\.169\.0\/examples\/jsm\//);
  assert.doesNotMatch(html, /three@latest/);
  const scriptSources = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(scriptSources, ['script.js']);
  const styles = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(styles, ['style.css']);
  const images = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(images.every((src) => !/^https?:/.test(src)), 'app images must be local');
});

test('the app does not phone home', () => {
  const appSource = `${html}\n${css}\n${js}`;
  const forbidden = [
    'google-analytics', 'googletagmanager', 'gtag(', 'plausible.io',
    'mixpanel', 'segment.io', 'sentry.io', 'hotjar', 'facebook.net',
    'connect.facebook', 'matomo', 'clarity.ms', 'fonts.googleapis.com',
    'fonts.gstatic.com', 'unpkg.com', 'cdnjs.cloudflare.com',
  ];
  for (const term of forbidden) assert.ok(!appSource.toLowerCase().includes(term.toLowerCase()), `found ${term}`);
  assert.ok(!/navigator\.sendBeacon/.test(appSource));
});

test('no credentials or private keys are committed', () => {
  const candidates = ['index.html', 'style.css', 'script.js', 'README.md', 'AGENTS.md', 'state.json'];
  const patterns = [/ghp_[A-Za-z0-9]{20,}/, /github_pat_[A-Za-z0-9_]{20,}/, /sk-[A-Za-z0-9]{20,}/, /AKIA[0-9A-Z]{16}/, /BEGIN (RSA|OPENSSH|EC) PRIVATE KEY/, /xox[baprs]-[A-Za-z0-9-]{10,}/];
  for (const file of candidates) {
    const source = read(file);
    for (const pattern of patterns) assert.ok(!pattern.test(source), `${file} matches ${pattern}`);
  }
});

test('local Markdown links resolve', () => {
  const markdown = docs.map((file) => [`docs/${file}`, read(`docs/${file}`)]).concat([['README.md', readme], ['AGENTS.md', read('AGENTS.md')]]);
  for (const [file, source] of markdown) {
    const links = [...source.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
    for (const link of links) {
      if (/^(https?:|mailto:|#|\?)/.test(link)) continue;
      const clean = link.split('#')[0];
      if (!clean || clean.endsWith('/')) continue;
      const target = resolve(ROOT, dirname(file), clean);
      assert.ok(existsSync(target), `${file} links to missing ${link}`);
    }
  }
});

test('HTML references all IDs the script expects', () => {
  const ids = [
    'scene', 'food-grid', 'food-count', 'food-search-input', 'empty-results',
    'watchout-list', 'swap-list', 'plate-list', 'plate-list-empty', 'selected-card',
    'score-number', 'score-band', 'score-advice', 'ring-value', 'hud-score',
    'hud-carbs', 'hud-fiber', 'hud-gl', 'balance-veg', 'balance-protein',
    'balance-fat', 'plate-count', 'plate-empty', 'stage-wrap', 'stage-loading',
    'cgm-chart', 'cgm-safe-peak', 'cgm-starch-peak', 'cgm-rise', 'cgm-time',
    'cgm-load', 'cgm-note', 'log-list', 'warning-dialog', 'warning-title',
    'warning-stats', 'warning-why', 'warning-swap-list', 'warning-source',
    'save-dialog', 'save-name', 'save-form', 'guide-dialog', 'sources-dialog',
    'source-list', 'toast-region', 'mobile-dock', 'dock-score', 'dock-carbs',
    'dock-view', 'selftest-panel', 'selftest-list', 'selftest-summary',
  ];
  for (const id of ids) assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  assert.equal(new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1])).size, [...html.matchAll(/id="([^"]+)"/g)].length, 'duplicate HTML IDs');
});

test('dialogs, skip link and landmark structure are present', () => {
  assert.match(html, /<a class="skip-link" href="#plate-builder">/);
  assert.match(html, /<main>/);
  assert.match(html, /<dialog[^>]+aria-labelledby="/);
  const dialogs = [...html.matchAll(/<dialog\b/g)].length;
  const labelled = [...html.matchAll(/<dialog[^>]+aria-labelledby="/g)].length;
  assert.equal(dialogs, 4);
  assert.equal(labelled, dialogs);
  assert.match(html, /aria-live="polite"/);
});

test('the self-test API and boot contract are present', () => {
  assert.match(js, /window\.__platewise\s*=/);
  assert.match(js, /document\.body\.dataset\.ready = 'true'/);
  assert.match(js, /runSelfTest/);
  assert.match(js, /selftestPassed/);
  assert.match(js, /new PlateScene/);
  assert.match(js, /new GlucoseChart/);
});

test('the data contains 64 foods, 6 warnings and 6 swaps', () => {
  assert.equal((js.match(/per100:/g) || []).length, 64);
  assert.equal((js.match(/swapId:/g) || []).length, 6);
  assert.equal((js.match(/warningId: '/g) || []).length, 6);
  assert.equal((js.match(/addIds:/g) || []).length, 6);
  assert.match(js, /const BALANCED_PLATE = (SAMPLE_PLATE|\[)/);
  assert.match(js, /const SAMPLE_PLATE = \[/);
});

test('nutrition methodology documents the formula and all foods', () => {
  const nutrition = read('docs/NUTRITION.md');
  for (const term of ['Glycemic load', 'netCarbs', 'vegShare', 'fiberBrake', 'peakTime', '0.55', '1.7']) {
    assert.ok(nutrition.includes(term), `NUTRITION.md missing ${term}`);
  }
  for (const food of ['Broccoli', 'Spinach', 'Cauliflower', 'Zucchini', 'Bell pepper', 'Asparagus', 'Wild salmon', 'Egg', 'Chicken breast', 'Firm tofu', 'Avocado', 'Almonds', 'Walnuts', 'Olive oil', 'Chia seeds', 'Strawberries', 'Raspberries', 'Blueberries']) {
    assert.ok(nutrition.includes(food), `NUTRITION.md missing ${food}`);
  }
});

test('sources include ADA, USDA and NIH/PubMed', () => {
  const sources = read('docs/SOURCES.md');
  assert.match(sources, /American Diabetes Association/);
  assert.match(sources, /USDA FoodData Central/);
  assert.match(sources, /PubMed|NIH/);
  assert.match(sources, /diabetesjournals\.org/);
  assert.match(sources, /fdc\.nal\.usda\.gov/);
  assert.match(sources, /10\.2337\/dci19-0014/);
});

test('AGENTS.md has the required handoff sections', () => {
  const agents = read('AGENTS.md');
  for (const section of ['## What it is', '## Commands', '## Architecture', '## Decisions and constraints', '## Known issues', '## Continuity']) {
    assert.ok(agents.includes(section), `AGENTS.md missing ${section}`);
  }
  assert.match(agents, /platewise-3d/);
});

test('README links screenshots that exist and names the credits', () => {
  for (const image of ['assets/studio.png', 'assets/stage.png', 'assets/analysis.png', 'assets/glucose.png', 'assets/mobile.png']) {
    assert.ok(readme.includes(image), `README missing ${image}`);
    assert.ok(existsSync(join(ROOT, image)), `missing ${image}`);
  }
  assert.match(readme, /OpenCode/);
  assert.match(readme, /DeepSeek V4\.1 Flash/);
  assert.match(readme, /not a medical device|Not medical advice/i);
});

test('state.json has the audit fields and honest counters', () => {
  const state = JSON.parse(read('state.json'));
  assert.equal(state.schema, 1);
  assert.ok(state.project);
  assert.ok(state.session.startedAt && state.session.capturedAt);
  assert.ok(state.session.elapsedSeconds > 60, 'elapsed time missing');
  assert.match(state.model.name, /DeepSeek/);
  assert.match(state.credits.tool, /OpenCode/);
  const usage = state.usage;
  const sum = usage.inputTokens + usage.outputTokens + usage.reasoningTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
  assert.equal(usage.totalTokens, sum);
  assert.ok(usage.totalTokens > 0);
});

test('deployment metadata points at the canonical Pages URL', () => {
  const canonical = 'https://somphol.github.io/platewise-3d/';
  assert.ok(html.includes(canonical));
  assert.ok(read('sitemap.xml').includes(canonical));
  assert.ok(read('robots.txt').includes(canonical));
  assert.ok(read('README.md').includes(canonical));
});

test('GitHub Pages and CI plumbing are present', () => {
  assert.ok(existsSync(join(ROOT, '.nojekyll')));
  const ciPath = existsSync(join(ROOT, '.github/workflows/ci.yml'))
    ? '.github/workflows/ci.yml'
    : 'templates/github/workflows/ci.yml';
  assert.ok(existsSync(join(ROOT, ciPath)), 'no CI workflow or catalog-safe template');
  const workflow = read(ciPath);
  assert.match(workflow, /node --test tests\/static\.test\.mjs/);
  assert.match(workflow, /tests\/browser\.test\.mjs/);
  assert.match(workflow, /actions\/checkout/);
  assert.match(workflow, /setup-node/);
});

test('LICENSE is MIT and names the author', () => {
  const license = read('LICENSE');
  assert.match(license, /MIT License/);
  assert.match(license, /Somphol Boonjing/);
  assert.match(read('CITATION.cff'), /cff-version: 1\.2\.0/);
  assert.match(read('CITATION.cff'), /license: MIT/);
});

test('screenshots are real PNG files', () => {
  for (const file of ['studio.png', 'stage.png', 'analysis.png', 'glucose.png', 'mobile.png', 'og.png']) {
    const bytes = readFileSync(join(ROOT, 'assets', file));
    assert.equal(bytes[0], 0x89);
    assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
    assert.ok(bytes.length > 10_000, `${file} too small`);
  }
});

test('no stray build artefacts or TODO markers in the app', () => {
  assert.ok(!existsSync(join(ROOT, 'node_modules')));
  assert.ok(!existsSync(join(ROOT, 'package-lock.json')));
  assert.ok(!existsSync(join(ROOT, 'package.json')));
  assert.doesNotMatch(js, /\b(TODO|FIXME)\b/);
  assert.doesNotMatch(html, /\b(TODO|FIXME)\b/);
});

test('the mobile and reduced-motion contracts are in the stylesheet', () => {
  assert.match(css, /@media \(max-width: 390px\)|@media \(max-width: 520px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\[hidden\] \{ display: none !important; \}/);
  assert.match(css, /\.mobile-dock/);
});

test('the import map is before the module script', () => {
  assert.ok(html.indexOf('type="importmap"') < html.indexOf('type="module" src="script.js"'));
});
