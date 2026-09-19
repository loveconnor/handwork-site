import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { root } from '../scripts/build.mjs';
const port = 14321;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['scripts/server.mjs'], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'inherit'] });
let browser;
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview readiness timeout')), 15000);
    server.stdout.on('data', data => { if (String(data).includes('http://')) { clearTimeout(timer); resolve(); } });
    server.once('error', error => { clearTimeout(timer); reject(error); });
    server.once('exit', code => { clearTimeout(timer); reject(new Error(`Preview exited ${code}`)); });
  });
  browser = await chromium.launch();
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await mkdir(new URL('../test-results/', import.meta.url), { recursive: true });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/docs/', '/about/']) {
      await page.goto(origin + route);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(255, 255, 255)');
      assert.match(await page.evaluate(() => getComputedStyle(document.body).fontFamily), /Geist Mono/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No page overflow: ${route} @ ${width}`);
      assert.ok(await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)), 'Images loaded');
      if (route === '/') {
        assert.equal(await page.locator('.hero-warp').getAttribute('data-renderer'), 'webgl', `Shape shader rendered @ ${width}`);
        await page.locator('.hero-warp[data-ready="true"][data-mask="ready"]').waitFor();
        assert.equal(await page.locator('.hero-warp canvas').count(), 1);
        assert.ok(await page.locator('.hero-warp canvas').evaluate(canvas => canvas.width > 0 && canvas.height > 0), 'Hero canvas is sized');
        assert.equal(await page.locator('.pixel-logo').evaluate(logo => getComputedStyle(logo).opacity), '0', 'Wordmark is rendered by the shader mask');
        const shaderBounds = await page.locator('.hero-warp').boundingBox();
        const marqueeBounds = await page.locator('.hero-marquee').boundingBox();
        const heroBounds = await page.locator('.hero').boundingBox();
        assert.equal(Math.round(shaderBounds.height), Math.round(marqueeBounds.height), 'Shader is confined to marquee');
        assert.ok(shaderBounds.height < heroBounds.height, 'Shader does not cover product copy');
        const brandGap = await page.evaluate(() => {
          const byline = document.querySelector('.welcome-line').getBoundingClientRect();
          const copy = document.querySelector('.hero-copy').getBoundingClientRect();
          return copy.top - byline.bottom;
        });
        assert.ok(brandGap <= 72, `Brand and product copy stay grouped: ${brandGap}px @ ${width}`);
      }
      const tinyLinks = await page.locator('header a').evaluateAll(links => links.filter(link => link.getClientRects().length > 0 && link.getBoundingClientRect().width === 0).length);
      assert.equal(tinyLinks, 0, 'Header links visible');
      if (width <= 390) {
        const headerTargets = await page.locator('header a').evaluateAll(links => links.filter(link => link.getClientRects().length > 0).map(link => {
          const bounds = link.getBoundingClientRect();
          return { label: link.getAttribute('aria-label') || link.textContent.trim(), width: bounds.width, height: bounds.height, fontSize: parseFloat(getComputedStyle(link).fontSize) };
        }));
        for (const target of headerTargets) {
          assert.ok(target.height >= 44, `${target.label} has a 44px mobile target`);
          assert.ok(target.fontSize >= 13, `${target.label} uses readable mobile text`);
        }
      }
      if (width === 1440 || width === 390) await page.screenshot({ path: new URL(`../test-results/${route === '/' ? 'home' : route.replaceAll('/', '')}-${width}.png`, import.meta.url).pathname, fullPage: true });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin);
  const footerTextLink = page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Documentation' });
  const footerRestingStyle = await footerTextLink.evaluate(link => ({ color: getComputedStyle(link).color, opacity: getComputedStyle(link).opacity }));
  assert.equal(footerRestingStyle.color, 'rgb(32, 32, 32)', 'Footer text link starts dark');
  await footerTextLink.hover();
  await page.waitForTimeout(150);
  assert.ok(Number(await footerTextLink.evaluate(link => getComputedStyle(link).opacity)) < Number(footerRestingStyle.opacity), 'Footer text link becomes lighter on hover');
  await page.getByRole('button', { name: 'Copy install command', exact: true }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'npm install -g handwork');
  await page.getByRole('button', { name: 'Play recording', exact: true }).click();
  assert.match(await page.locator('#inspect-panel img').getAttribute('src'), /\.gif$/);
  await page.getByRole('tab', { name: /Inspect/ }).focus();
  await page.evaluate(() => {
    window.__keyboardTabTransitions = [];
    document.querySelector('.demo-wrap').addEventListener('transitionrun', event => window.__keyboardTabTransitions.push(event.propertyName));
  });
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#verify-tab').getAttribute('aria-selected'), 'true');
  await page.locator('#inspect-panel').waitFor({ state: 'hidden' });
  await page.waitForTimeout(50);
  assert.deepEqual(await page.evaluate(() => window.__keyboardTabTransitions), [], 'Keyboard tab changes are immediate');
  assert.match(await page.locator('#verify-panel img').getAttribute('src'), /\.gif$/);
  await page.getByRole('button', { name: 'Pause recording' }).click();
  assert.match(await page.locator('#verify-panel img').getAttribute('src'), /\.png$/);
  assert.equal(await page.locator('#demo-open').getAttribute('target'), null, 'Full-size recording stays in the Handwork interface');
  await page.locator('#demo-open').click();
  assert.equal(await page.locator('#recording-viewer').getAttribute('open'), '', 'Full-size viewer opens');
  assert.equal(await page.locator('#recording-viewer-title').textContent(), 'Edit and test');
  assert.match(await page.locator('#recording-viewer-image').getAttribute('src'), /verify\.png$/);
  assert.equal(await page.evaluate(() => location.hash), '#recording');
  assert.equal(await page.evaluate(() => history.state?.handworkRecording?.step), 'verify');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'recording-viewer-close', 'Viewer focuses its close control');
  const recordingViewer = page.locator('#recording-viewer');
  await recordingViewer.getByRole('button', { name: 'Play recording', exact: true }).click();
  assert.match(await page.locator('#recording-viewer-image').getAttribute('src'), /verify\.gif$/);
  await recordingViewer.getByRole('button', { name: /01\s+Inspect/ }).click();
  assert.equal(await page.locator('#inspect-tab').getAttribute('aria-selected'), 'true', 'Viewer step selection stays in sync with the page');
  assert.match(await page.locator('#recording-viewer-image').getAttribute('src'), /inspect\.gif$/);
  await recordingViewer.getByRole('button', { name: 'Pause recording', exact: true }).click();
  assert.match(await page.locator('#recording-viewer-image').getAttribute('src'), /inspect\.png$/);
  await page.keyboard.press('Escape');
  await page.locator('#recording-viewer').waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => location.hash), '');
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'demo-open', 'Viewer restores focus to its opener');
  await page.locator('#demo-open').click();
  assert.equal(await page.locator('#recording-viewer').getAttribute('open'), '');
  await page.evaluate(() => history.back());
  await page.locator('#recording-viewer').waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'demo-open', 'Browser Back closes the viewer and restores focus');
  for (const [option, time, calls, input, output, memory, attempts, source] of [
    ['Pagination', '28.1 s', '5.7', '33,597', '496', '23.1 MiB', '3 attempts', 'fixed-budget'],
    ['Authorization and cache', '79.6 s', '9.3', '67,587', '2,036', '27.5 MiB', '3 attempts', 'tenant-cache'],
    ['Async search', '47.2 s', '7.7', '45,515', '1,078', '25.1 MiB', '3 attempts', 'async-search']
  ]) {
    await page.locator('#task-select').click();
    assert.equal(await page.locator('#task-select').getAttribute('aria-expanded'), 'true');
    await page.getByRole('option', { name: option, exact: true }).click();
    assert.equal(await page.locator('#task-select').getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#task-select-value').textContent(), option);
    const row = await page.locator('.handwork-row').textContent();
    for (const expected of [time, calls, input, output, memory]) assert.ok(row.includes(expected), `${option} includes ${expected}`);
    assert.ok((await page.locator('#benchmark-budget').textContent()).includes(attempts));
    assert.ok((await page.locator('#benchmark-source').getAttribute('href')).includes(source));
    const metricScales = await page.locator('.metric-cell').evaluateAll(cells => cells.reduce((groups, cell) => {
      (groups[cell.dataset.metric] ||= []).push(Number(getComputedStyle(cell.querySelector('.metric-bar')).getPropertyValue('--bar-scale')));
      return groups;
    }, {}));
    for (const metric of ['fixes', 'time', 'toolCalls', 'inputTokens', 'outputTokens', 'rss']) {
      assert.equal(metricScales[metric].length, 3, `${metric} compares all three agents`);
      assert.equal(Math.max(...metricScales[metric]), 1, `${metric} scales against its largest value`);
      assert.ok(metricScales[metric].every(scale => scale > 0 && scale <= 1), `${metric} bars stay within their tracks`);
    }
  }
  await page.locator('#task-select').focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('#task-select').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#task-select-value').textContent(), 'Authorization and cache');
  assert.equal(await page.locator('.metric-bar').first().evaluate(bar => getComputedStyle(bar, '::after').transitionProperty), 'transform', 'Metric bars animate with transform');
  await page.waitForTimeout(240);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#task-select').getAttribute('aria-expanded'), 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  assert.match(await page.locator('#inspect-panel img').getAttribute('src'), /\.png$/);
  assert.equal(await page.locator('.hero-warp').getAttribute('data-motion'), 'reduced');
  await page.goto(origin + '/docs/');
  await page.getByRole('navigation', { name: 'Documentation sections' }).getByRole('link', { name: 'Permissions and data' }).click();
  assert.ok(page.url().endsWith('#permissions'));
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true }).click();
  assert.equal(await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true }).getAttribute('aria-current'), 'page');
  const missingResponse = await context.request.get(origin + '/missing');
  assert.equal(missingResponse.status(), 404);
  assert.match(await missingResponse.text(), /That page does not exist/);
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto(origin + '/');
  assert.equal(await page.locator('.benchmark-table').evaluate(table => table.scrollWidth <= table.clientWidth), true, 'Mobile benchmark does not require horizontal scrolling');
  assert.equal(await page.locator('.capture-shell').evaluate(shell => shell.scrollWidth <= shell.clientWidth), true, 'Mobile recording preview does not require horizontal scrolling');
  assert.ok(await page.locator('#demo-open').evaluate(link => link.getBoundingClientRect().height >= 44), 'Full-size recording link has a 44px mobile target');
  await page.locator('#demo-open').click();
  assert.equal(await page.locator('#recording-viewer').evaluate(viewer => Math.round(viewer.getBoundingClientRect().height)), 1000, 'Mobile viewer fills the viewport');
  assert.equal(await page.locator('#recording-viewer-play').getAttribute('aria-pressed'), 'false', 'Reduced-motion viewer starts paused');
  assert.ok(await page.locator('#recording-viewer-content').evaluate(content => content.scrollWidth > content.clientWidth), 'Full-size mobile recording can be panned at its natural size');
  await page.locator('#recording-viewer-play').click();
  assert.match(await page.locator('#recording-viewer-image').getAttribute('src'), /\.gif$/);
  await page.getByRole('button', { name: 'Close full-size recording' }).click();
  await page.locator('#recording-viewer').waitFor({ state: 'hidden' });
  await page.locator('#task-select').click();
  for (const option of await page.getByRole('option').all()) assert.ok(await option.evaluate(item => item.getBoundingClientRect().height >= 44), 'Benchmark options have 44px mobile targets');
  await page.goto(origin + '/docs/');
  assert.equal(await page.locator('.docs-nav-heading').isHidden(), true, 'Static documentation heading is hidden on mobile');
  assert.equal(await page.locator('#docs-sections').isHidden(), true, 'Mobile documentation menu starts collapsed');
  await page.locator('#docs-nav-toggle').click();
  assert.equal(await page.locator('#docs-sections').isVisible(), true, 'Mobile documentation menu opens');
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJS.newPage();
  await staticPage.goto(origin);
  assert.ok((await staticPage.locator('table').textContent()).includes('25.1 MiB'));
  assert.ok(await staticPage.locator('#inspect-panel img').isVisible());
  assert.equal(await staticPage.locator('#demo-open').getAttribute('target'), null, 'No-JavaScript recording fallback stays in the same tab');
  assert.match(await staticPage.locator('#demo-open').getAttribute('href'), /inspect\.png$/);
  await noJS.close();
  assert.deepEqual(errors, []);
  console.log('PASS: 3 routes × 4 viewports; full-size viewer, GIF playback, browser Back, focus restoration, mobile panning, reduced motion, docs navigation, 404, and no-JS baseline. Screenshots in test-results/.');
} finally {
  await browser?.close();
  if (server.exitCode === null) { const exited = once(server, 'exit'); server.kill('SIGTERM'); await exited; }
}
