// End-to-end checks in headless Chrome over the DevTools Protocol.
// Dependency-free: Node's WebSocket + the local static server in lib/harness.mjs.
//
//   node tests/browser.test.mjs
//   TEST_URL=https://somphol.github.io/platewise-3d/ node tests/browser.test.mjs
//
// Chrome is launched with --use-mock-keychain, --password-store=basic and a
// throwaway profile so macOS does not open Keychain prompts.

import { ROOT } from './lib/fixtures.mjs';
import { connect, launchBrowser, startServer } from './lib/harness.mjs';

const results = [];
const consoleErrors = [];
const LIVE = process.env.TEST_URL?.replace(/\/$/, '') || null;
let server;
let browser;
let cdp;

function check(name, condition, detail = '') {
  const ok = Boolean(condition);
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

async function evaluate(expression) {
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
  return result.value;
}

async function waitFor(expression, timeout = 20000) {
  return cdp.waitFor(expression, { timeout });
}

async function navigate(url) {
  const loaded = cdp.once('Page.loadEventFired');
  await cdp.send('Page.navigate', { url });
  await loaded;
  await sleep(700);
  await waitFor('document.body && document.body.dataset.ready === "true"', 30000);
  await sleep(500);
}

async function reload() {
  const loaded = cdp.once('Page.loadEventFired');
  await cdp.send('Page.reload');
  await loaded;
  await sleep(700);
  await waitFor('document.body && document.body.dataset.ready === "true"', 30000);
  await sleep(500);
}

async function typeSearch(value) {
  return evaluate(`(() => {
    const input = document.getElementById('food-search-input');
    input.value = ${JSON.stringify(value)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
}

try {
  server = LIVE ? null : await startServer(ROOT);
  const base = LIVE || server.url;
  browser = await launchBrowser({ width: 1600, height: 1000 });
  const target = await (await fetch(`http://127.0.0.1:${browser.port}/json/new?about:blank`, { method: 'PUT' })).json();
  cdp = await connect(target.webSocketDebuggerUrl);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  cdp.on('Runtime.consoleAPICalled', (payload) => {
    if (payload.type !== 'error') return;
    consoleErrors.push(payload.args.map((arg) => arg.description || arg.value).join(' '));
  });
  cdp.on('Runtime.exceptionThrown', (payload) => {
    consoleErrors.push(payload.exceptionDetails.exception?.description || payload.exceptionDetails.text);
  });

  await navigate(`${base}/`);
  await evaluate('window.localStorage.clear(); true');
  await reload();
  await waitFor('Boolean(window.__platewise)');

  const boot = await evaluate(`(() => ({
    ready: document.body.dataset.ready,
    scene: document.body.dataset.scene,
    title: document.title,
    foods: window.__platewise.foods.length,
    warnings: window.__platewise.warnings.length,
    swaps: window.__platewise.swaps.length,
    sources: window.__platewise.sources.length,
    summary: window.__platewise.getSummary(),
    sceneInfo: window.__platewise.sceneInfo(),
    canvas: (() => { const r = document.getElementById('scene').getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height) }; })(),
    hud: document.getElementById('hud-score').textContent
  }))()`);
  check('Page reaches ready state', boot.ready === 'true');
  check('Title names the product', /PlateWise 3D/.test(boot.title), boot.title);
  check('WebGL scene boots', boot.scene === 'ready' && boot.sceneInfo.webgl === true);
  check('18 safe foods, 6 warnings, 6 swaps', boot.foods === 18 && boot.warnings === 6 && boot.swaps === 6, `${boot.foods}/${boot.warnings}/${boot.swaps}`);
  check('Six evidence sources are bundled', boot.sources >= 6, String(boot.sources));
  check('Empty plate scores zero', boot.summary.score === 0 && boot.summary.servings === 0);
  check('3D canvas has usable dimensions', boot.canvas.width > 400 && boot.canvas.height > 300, `${boot.canvas.width}×${boot.canvas.height}`);
  check('At least one 3D frame was rendered', boot.sceneInfo.calls > 5, `${boot.sceneInfo.calls} calls`);

  // Click-to-place through the real pantry card.
  await evaluate(`document.querySelector('[data-food="broccoli"]').click(); true`);
  await sleep(450);
  let summary = await evaluate('window.__platewise.getSummary()');
  check('Clicking a pantry card places food', summary.servings === 1 && summary.items[0].food.id === 'broccoli');
  check('Net carbs and fiber update in real time', summary.totals.net > 3 && summary.totals.fiber > 2, `${summary.totals.net} g net / ${summary.totals.fiber} g fiber`);
  check('HUD mirrors the analyzer', await evaluate(`document.getElementById('hud-carbs').textContent === '3.7'`));

  // Add a protein and a fat, then check the 50/25/25 zone model.
  await evaluate(`window.__platewise.addFood('salmon'); window.__platewise.addFood('avocado'); true`);
  await sleep(500);
  summary = await evaluate('window.__platewise.getSummary()');
  check('Protein and fat zones register', summary.zoneCounts.veg === 1 && summary.zoneCounts.protein === 1 && summary.zoneCounts.fat === 1, JSON.stringify(summary.zoneCounts));
  check('Safety score rises for a complete plate', summary.score >= 70, String(summary.score));
  check('Scene contains three meshes', await evaluate('window.__platewise.sceneInfo().items === 3'));

  // Inspect a placed item.
  await evaluate(`document.querySelector('#plate-list [data-select]').click(); true`);
  await sleep(250);
  const selected = await evaluate(`({ visible: !document.getElementById('selected-card').hidden, name: document.getElementById('selected-name').textContent })`);
  check('Plate list opens item detail', selected.visible === true && selected.name.length > 2, selected.name);
  await evaluate(`document.getElementById('selected-close').click(); true`);

  // Warning modal and swap.
  await evaluate(`document.querySelector('#watchout-list [data-warning="white-rice"]').click(); true`);
  await sleep(300);
  const warning = await evaluate(`({
    open: document.getElementById('warning-dialog').open,
    title: document.getElementById('warning-title').textContent,
    stats: document.querySelectorAll('#warning-stats div').length,
    servings: window.__platewise.getSummary().servings
  })`);
  check('Starchy food opens a warning modal', warning.open === true && /White rice/.test(warning.title));
  check('Warning shows three risk metrics', warning.stats === 3);
  check('Warning food is not added to the plate', warning.servings === 3);
  await evaluate(`document.getElementById('warning-build-swap').click(); true`);
  await sleep(500);
  const afterSwap = await evaluate(`({
    open: document.getElementById('warning-dialog').open,
    foods: window.__platewise.getSummary().items.map(i => i.food.id)
  })`);
  check('Warning closes after building the swap', afterSwap.open === false);
  check('Swap adds cauliflower, not rice', afterSwap.foods.includes('cauliflower') && !afterSwap.foods.includes('white-rice'));

  // Search and category filters.
  await typeSearch('broccoli');
  await sleep(250);
  const search = await evaluate(`({
    cards: document.querySelectorAll('#food-grid [data-food]').length,
    name: document.querySelector('#food-grid .food-name')?.textContent,
    count: document.getElementById('food-count').textContent
  })`);
  check('Search narrows the pantry', search.cards === 1 && search.name === 'Broccoli', search.count);

  await typeSearch('rice');
  await sleep(250);
  const craving = await evaluate(`({ warningCards: document.querySelectorAll('#food-grid [data-warning]').length, empty: document.getElementById('empty-results').hidden })`);
  check('Search surfaces cravings with a warning', craving.warningCards === 1 && craving.empty === true);

  await typeSearch('zzzz');
  await sleep(200);
  check('Empty search state appears', await evaluate(`document.getElementById('empty-results').hidden === false`));
  await evaluate(`document.getElementById('search-clear').click(); true`);
  await sleep(200);

  await evaluate(`document.querySelector('.chip[data-filter="protein"]').click(); true`);
  await sleep(250);
  check('Category chip filters to proteins', await evaluate(`document.querySelectorAll('#food-grid [data-food]').length === 4`));
  await evaluate(`document.querySelector('.chip[data-filter="all"]').click(); true`);
  await sleep(200);

  // Balanced example, curve and swap engine.
  await evaluate(`window.__platewise.buildExample({silent:true}); true`);
  await sleep(700);
  const balanced = await evaluate(`(() => {
    const s = window.__platewise.getSummary();
    const safe = window.__platewise.getCurve();
    const ref = window.__platewise.getReferenceCurve();
    return { servings: s.servings, score: s.score, zones: s.zoneCounts, safePeak: safe.peak, refPeak: ref.peak, time: safe.peakTime };
  })()`);
  check('Balanced plate builds eight servings', balanced.servings === 8, String(balanced.servings));
  check('Balanced plate scores 85+', balanced.score >= 85, String(balanced.score));
  check('Curve is lower than the starchy reference', balanced.safePeak < balanced.refPeak - 40, `${balanced.safePeak} vs ${balanced.refPeak}`);
  check('Peak time is in a plausible window', balanced.time >= 35 && balanced.time <= 75, `${balanced.time} min`);

  const chartLabel = await evaluate(`document.getElementById('cgm-chart').getAttribute('aria-label')`);
  check('Chart exposes an accessible description', /Simulated glucose curve/.test(chartLabel || ''));
  check('Chart canvas has pixels', await evaluate(`(() => { const c = document.getElementById('cgm-chart'); return c.width > 200 && c.height > 100; })()`));

  await evaluate(`window.__platewise.buildSwap('rice'); true`);
  await sleep(250);
  check('Swap engine can add a safe alternative', await evaluate(`window.__platewise.getSummary().items.some(i => i.food.id === 'cauliflower')`));

  // Meal log persistence across a reload.
  const meal = await evaluate(`window.__platewise.saveMeal('Browser test meal')`);
  check('Save meal returns a record', Boolean(meal && meal.id));
  check('Meal log hits localStorage', await evaluate(`Boolean(localStorage.getItem('platewise.meals.v1'))`));
  await reload();
  await waitFor('Boolean(window.__platewise)');
  const persisted = await evaluate(`({ meals: window.__platewise.getMeals().length, rows: document.querySelectorAll('.log-row').length, name: window.__platewise.getMeals()[0]?.name })`);
  check('Saved meal survives a reload', persisted.meals === 1 && persisted.rows === 1 && persisted.name === 'Browser test meal');
  const savedCount = meal.foods.length;
  await evaluate(`window.__platewise.loadMeal(window.__platewise.getMeals()[0].id); true`);
  await sleep(500);
  check('Loading a saved meal restores the plate', await evaluate(`window.__platewise.getSummary().servings === ${savedCount}`), `${savedCount} servings`);

  // Theme preference persists.
  await evaluate(`document.getElementById('btn-theme').click(); true`);
  await sleep(350);
  const theme = await evaluate(`({ attr: document.documentElement.dataset.theme, stored: JSON.parse(localStorage.getItem('platewise.prefs.v1') || '{}').theme })`);
  check('Theme toggle applies and stores a preference', theme.attr === (theme.stored === 'dark' ? 'dark' : 'light') && Boolean(theme.stored), JSON.stringify(theme));
  await reload();
  await waitFor('Boolean(window.__platewise)');
  check('Theme survives a reload', await evaluate(`document.documentElement.dataset.theme === ${JSON.stringify(theme.attr)}`));

  // Remove and clear.
  await evaluate(`window.__platewise.clearPlate(); true`);
  await sleep(300);
  check('Clear plate empties the analyzer', await evaluate(`window.__platewise.getSummary().servings === 0`));

  // In-page self-test.
  await navigate(`${base}/?selftest`);
  await waitFor('Boolean(window.__platewise && window.__platewise.selftest)', 20000);
  const selftest = await evaluate(`window.__platewise.selftest`);
  check('In-page self-test passes every check', selftest.passed === selftest.total, `${selftest.passed}/${selftest.total}`);
  check('Self-test panel is visible', await evaluate(`!document.getElementById('selftest-panel').hidden`));

  // Mobile layout.
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await navigate(`${base}/`);
  await waitFor('Boolean(window.__platewise)');
  await evaluate(`window.__platewise.addFood('broccoli'); window.__platewise.addFood('salmon'); window.__platewise.addFood('avocado'); true`);
  await sleep(700);
  const mobile = await evaluate(`(() => {
    const stage = document.getElementById('scene').getBoundingClientRect();
    const dock = document.getElementById('mobile-dock');
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      stageWidth: Math.round(stage.width),
      stageHeight: Math.round(stage.height),
      dock: getComputedStyle(dock).display,
      nav: getComputedStyle(document.querySelector('.site-nav')).display,
      cards: document.querySelectorAll('#food-grid [data-food]').length,
      cols: getComputedStyle(document.getElementById('food-grid')).gridTemplateColumns.split(' ').length
    };
  })()`);
  check('Mobile layout has no horizontal overflow', mobile.overflow <= 1, `${mobile.overflow}px`);
  check('Mobile stage stays usable', mobile.stageWidth >= 360 && mobile.stageHeight >= 340, `${mobile.stageWidth}×${mobile.stageHeight}`);
  check('Mobile dock appears with a plate', mobile.dock === 'flex');
  check('Mobile pantry keeps all cards', mobile.cards === 18, String(mobile.cards));
  await cdp.send('Emulation.clearDeviceMetricsOverride');

  // Accessibility spot checks.
  await navigate(`${base}/`);
  await waitFor('Boolean(window.__platewise)');
  const a11y = await evaluate(`(() => {
    const buttons = [...document.querySelectorAll('button')];
    const unnamed = buttons.filter(b => !(b.textContent.trim() || b.getAttribute('aria-label')));
    const dialogs = [...document.querySelectorAll('dialog')];
    return {
      unnamed: unnamed.length,
      labelledDialogs: dialogs.filter(d => d.getAttribute('aria-labelledby')).length,
      dialogs: dialogs.length,
      skip: Boolean(document.querySelector('.skip-link')),
      lang: document.documentElement.lang
    };
  })()`);
  check('Every button has an accessible name', a11y.unnamed === 0, String(a11y.unnamed));
  check('Dialogs are labelled and a skip link exists', a11y.labelledDialogs === a11y.dialogs && a11y.skip && a11y.lang === 'en');

  check('No console errors or uncaught exceptions', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
} catch (error) {
  console.error('FATAL', error);
  results.push({ name: 'Suite completed', ok: false, detail: error.message });
} finally {
  if (browser) browser.proc.kill('SIGTERM');
  if (server) await server.close();
}

const passed = results.filter((item) => item.ok).length;
const failed = results.length - passed;
console.log(`\n${passed}/${results.length} checks passed${failed ? `, ${failed} failed` : ''}.`);
if (failed) process.exitCode = 1;
