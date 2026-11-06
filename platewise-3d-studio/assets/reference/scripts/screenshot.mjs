// Regenerate README screenshots and the social card in headless Chrome.
// Usage: node scripts/screenshot.mjs
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect, launchBrowser, startServer } from '../tests/lib/harness.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'assets');
const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

const server = await startServer(ROOT);
const browser = await launchBrowser({ width: 1600, height: 1200 });
try {
  const target = await (await fetch(`http://127.0.0.1:${browser.port}/json/new?about:blank`, { method: 'PUT' })).json();
  const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const navigate = async (url, app = true) => {
    const loaded = cdp.once('Page.loadEventFired');
    await cdp.send('Page.navigate', { url });
    await loaded;
    if (app) await cdp.waitFor('Boolean(window.__platewise && document.body.dataset.ready === "true")', { timeout: 30000 });
    await sleep(800);
  };
  const evaluate = async (expression) => {
    const { result } = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return result.value;
  };
  const scrollTo = async (selector, delta = -90) => {
    const top = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); return el.getBoundingClientRect().top + window.scrollY; })()`);
    await evaluate(`document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, Math.max(0, ${top} + ${delta}));`);
    await sleep(500);
  };
  const clipOf = async (selector, maxHeight = 1000) => {
    return evaluate(`(() => {
      const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
      return { x: Math.max(0, Math.round(r.x + window.scrollX)), y: Math.max(0, Math.round(r.top + window.scrollY)), width: Math.round(r.width), height: Math.min(${maxHeight}, Math.round(r.height)) };
    })()`);
  };
  const shot = async (file, clip) => {
    const params = { format: 'png', fromSurface: true, captureBeyondViewport: Boolean(clip) };
    if (clip) params.clip = { ...clip, scale: 1 };
    const { data } = await cdp.send('Page.captureScreenshot', params);
    writeFileSync(resolve(OUT, file), Buffer.from(data, 'base64'));
    console.log('wrote', file);
  };

  // Desktop studio and focused stage.
  await navigate(server.url);
  await evaluate(`if (document.documentElement.dataset.theme === 'dark') document.getElementById('btn-theme').click();`);
  await sleep(250);
  await evaluate('window.__platewise.buildExample({silent:true})');
  await sleep(1200);
  await shot('studio.png');
  await shot('stage.png', await clipOf('.stage-wrap', 900));

  // Analysis column with the score, macros and curve. Hide the sticky chrome
  // so the capture is the column, not the header.
  await evaluate(`document.querySelector('.site-header').style.display = 'none'`);
  await sleep(300);
  await shot('analysis.png', await clipOf('.insights', 1080));

  // Chart detail.
  await shot('glucose.png', await clipOf('.cgm-card', 380));
  await evaluate(`document.querySelector('.site-header').style.display = ''`);

  // Mobile, scrolled to the plate so the 3D view and dock are visible.
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await navigate(server.url);
  await evaluate('window.__platewise.buildExample({silent:true})');
  await sleep(1100);
  await scrollTo('.stage-column', -72);
  await sleep(500);
  await shot('mobile.png');
  await cdp.send('Emulation.clearDeviceMetricsOverride');

  // Social card from a purpose-built 1200 × 630 page.
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
  await navigate(`${server.url}/scripts/og-card.html`, false);
  await sleep(500);
  await shot('og.png');
  await cdp.send('Emulation.clearDeviceMetricsOverride');
  cdp.close();
} finally {
  browser.proc.kill('SIGTERM');
  await server.close();
}
