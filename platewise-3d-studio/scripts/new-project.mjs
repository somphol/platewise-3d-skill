#!/usr/bin/env node
// Scaffolds a fresh PlateWise 3D project from the shipped reference.
//
//   node scripts/new-project.mjs --out ~/Projects/my-platewise [--force]
//
// The reference is complete and static: no npm install, no build step.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REFERENCE = join(HERE, '..', 'assets', 'reference');
const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const out = outIndex >= 0 ? args[outIndex + 1] : '';
const force = args.includes('--force');

if (!out) {
  console.error('Usage: node scripts/new-project.mjs --out <directory> [--force]');
  process.exit(2);
}
if (!existsSync(join(REFERENCE, 'index.html'))) {
  console.error(`Reference is missing or incomplete: ${REFERENCE}`);
  process.exit(2);
}

const target = resolve(out.replace(/^~(?=$|\/)/, process.env.HOME || '~'));
if (existsSync(target) && readdirSync(target).length && !force) {
  console.error(`${target} is not empty. Pass --force to copy into it anyway.`);
  process.exit(2);
}
mkdirSync(target, { recursive: true });
cpSync(REFERENCE, target, {
  recursive: true,
  filter: (source) => !source.split('/').includes('.git'),
});

// GitHub Pages cannot serve dot-directories, so the catalog ships the CI and
// issue templates under templates/github/. Restore them for the real repo.
const githubTemplate = join(target, 'templates', 'github');
if (existsSync(githubTemplate)) {
  cpSync(githubTemplate, join(target, '.github'), { recursive: true });
}

const state = JSON.parse(readFileSync(join(target, 'state.json'), 'utf8'));
console.log(`Scaffolded ${state.project} v${state.release.version} into ${target}`);
console.log(`
Next:
  cd ${target}
  python3 -m http.server 8000          # http://localhost:8000/
  node --test tests/static.test.mjs    # 22 release invariants
  node tests/browser.test.mjs          # 47 checks; Chrome + Three.js CDN
  node scripts/smoke.mjs               # boot + 29/29 in-page selftest

Before publishing:
  1. Replace the canonical/OG/GitHub URLs with your own.
  2. Change foods, servings or the score only with USDA/clinical sources;
     update docs/NUTRITION.md and the in-app formula together.
  3. Re-generate screenshots after any visual change.
  4. Re-capture state.json from your own session; do not reuse the reference's
     elapsed time or tokens as your own.
  5. Keep the starch-is-not-placeable rule, the medical disclaimer and the
     "simulation, not a sensor" label.
  6. Keep the 50/25/25 plate, the three-file split and the pinned Three.js.

The reference ships its own build state and screenshots. They are provenance,
not a template for false claims.
`);
