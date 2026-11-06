#!/usr/bin/env node
// Proves the shipped reference still satisfies the release gates.
//
//   node scripts/verify-skill.mjs [--browser]
//
// Static checks run by default. --browser adds the 47-check headless Chrome
// suite (Chrome + network for the pinned Three.js CDN; mock keychain flags).

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REF = join(HERE, '..', 'assets', 'reference');
const failures = [];
const requireFile = (relative) => {
  if (!existsSync(join(REF, relative))) failures.push(`missing ${relative}`);
};

for (const file of [
  'index.html', 'style.css', 'script.js',
  'tests/static.test.mjs', 'tests/browser.test.mjs', 'tests/lib/harness.mjs',
  'scripts/smoke.mjs', 'scripts/screenshot.mjs', 'scripts/capture-state.mjs',
  'state.json', 'AGENTS.md', 'README.md',
  'docs/NUTRITION.md', 'docs/SOURCES.md', 'docs/ARCHITECTURE.md',
  'docs/REPRODUCTION.md', 'docs/STATE.md', 'docs/index.html',
  'assets/favicon.svg', 'assets/studio.png', 'assets/og.png',
]) requireFile(file);

if (!failures.length) {
  const state = JSON.parse(readFileSync(join(REF, 'state.json'), 'utf8'));
  if (state.project !== 'PlateWise 3D') failures.push('state.json project name changed');
  if (!state.usage || state.usage.totalTokens <= 0) failures.push('state.json usage missing');
  if (state.credits?.tool !== 'OpenCode') failures.push('state.json credits missing OpenCode');
  const script = readFileSync(join(REF, 'script.js'), 'utf8');
  if ((script.match(/per100:/g) || []).length !== 18) failures.push('expected 18 foods');
  if ((script.match(/swapId: '/g) || []).length !== 6) failures.push('expected 6 warnings');
  if ((script.match(/addIds:/g) || []).length !== 6) failures.push('expected 6 swaps');
  if (!script.includes('three@0.169.0') && !readFileSync(join(REF, 'index.html'), 'utf8').includes('three@0.169.0')) {
    failures.push('Three.js pin missing');
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}

try {
  execFileSync(process.execPath, ['--test', 'tests/static.test.mjs'], { cwd: REF, stdio: 'inherit' });
} catch {
  process.exit(1);
}

if (process.argv.includes('--browser')) {
  try {
    execFileSync(process.execPath, ['tests/browser.test.mjs'], { cwd: REF, stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
}

console.log('\nReference verified: 22 static' + (process.argv.includes('--browser') ? ' + 47 browser' : '') + ' checks.');
