// Quick load smoke: boot the app in headless Chrome, print state, fail on console errors.
// Usage: node scripts/smoke.mjs
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect, launchBrowser, startServer } from '../tests/lib/harness.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

const server = await startServer(ROOT);
const browser = await launchBrowser({ width: 1600, height: 1000 });
const errors = [];
try {
  const target = await (await fetch(`http://127.0.0.1:${browser.port}/json/new?about:blank`, { method: 'PUT' })).json();
  const cdp = await connect(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  cdp.on('Runtime.consoleAPICalled', (payload) => {
    if (payload.type === 'error') errors.push(payload.args.map((arg) => arg.description || arg.value).join(' '));
  });
  cdp.on('Runtime.exceptionThrown', (payload) => errors.push(payload.exceptionDetails.exception?.description || payload.exceptionDetails.text));
  const loaded = cdp.once('Page.loadEventFired');
  await cdp.send('Page.navigate', { url: server.url });
  await loaded;
  await sleep(1400);
  const info = await cdp.send('Runtime.evaluate', {
    expression: `(() => ({
      ready: document.body.dataset.ready,
      scene: document.body.dataset.scene,
      title: document.title,
      foods: window.__platewise?.foods.length,
      summary: window.__platewise?.getSummary(),
      sceneInfo: window.__platewise?.sceneInfo(),
      selftest: window.__platewise?.selftest,
      canvas: (() => { const c = document.getElementById('scene').getBoundingClientRect(); return { w: Math.round(c.width), h: Math.round(c.height) }; })()
    }))()`,
    returnByValue: true,
  });
  console.log(JSON.stringify(info.result.value, null, 2));
  console.log('console errors:', errors.length);
  if (errors.length) console.log(errors.join('\n'));
  cdp.close();
} finally {
  browser.proc.kill('SIGTERM');
  await server.close();
}
if (errors.length) process.exitCode = 1;
