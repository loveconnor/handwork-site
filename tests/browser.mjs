import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { root } from '../scripts/prepare.mjs';
import { reportNames } from '../app/benchmarks/reports.mjs';
const claudeSummary = JSON.parse(await readFile(new URL('../public/benchmarks/claude-code/summary.json', import.meta.url), 'utf8'));
const handworkRefresh = JSON.parse(await readFile(new URL('../public/benchmarks/handwork-2026-10-19/summary.json', import.meta.url), 'utf8'));
const authCacheRefresh = JSON.parse(await readFile(new URL('../public/benchmarks/handwork-auth-cache-2026-10-19/summary.json', import.meta.url), 'utf8'));
const taskKeys = { 'Pagination': 'pagination', 'Authorization and cache': 'tenant-cache', 'Async search': 'search', 'BullMQ worker recovery': 'bullmq' };
const measuredHandwork = option => (option === 'Authorization and cache' ? authCacheRefresh : handworkRefresh).handwork[taskKeys[option]];
const port = 14321;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['scripts/server.mjs'], { cwd: root, env: { ...process.env, PORT: String(port), VERCEL_ENV: 'preview' }, stdio: ['ignore', 'pipe', 'inherit'] });
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
    for (const route of ['/', '/benchmarks/', '/docs/', '/about/']) {
      await page.goto(origin + route);
      await page.waitForLoadState('networkidle');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(244, 244, 242)');
      assert.match(await page.evaluate(() => getComputedStyle(document.body).fontFamily), /^"?Geist"?,/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No page overflow: ${route} @ ${width}`);
      assert.ok(await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth > 0)), 'Images loaded');
      if (route === '/') {
        const downloadBounds = await page.locator('.desktop-download-row .download-button').evaluateAll(buttons =>
          buttons.map(button => { const bounds = button.getBoundingClientRect(); return [bounds.x, bounds.width, bounds.height].map(Math.round); }));
        assert.equal(downloadBounds.length, 3);
        for (const bounds of downloadBounds) assert.deepEqual(bounds, downloadBounds[0], `Download buttons align and match sizes @ ${width}`);
        assert.equal(await page.locator('.hero-demo-video').count(), 1, 'Hero shows the combined demo video');
        assert.equal(await page.locator('.hero-demo-video').evaluate(video => video.getBoundingClientRect().width <= innerWidth), true, `Video fits @ ${width}`);

        assert.equal(await page.locator('.lp-ascii canvas').count(), 1, `ASCII shader mounted @ ${width}`);
        const silkBounds = await page.locator('.lp-ascii').boundingBox();
        const panelBounds = await page.locator('.lp-hero-panel').boundingBox();
        assert.equal(Math.round(silkBounds.height), Math.round(panelBounds.height), 'ASCII shader is confined to the hero panel');
        await expect(page.locator('.lp-title [aria-hidden="true"]').last()).toHaveCSS('opacity', '1', { timeout: 5000 });
        assert.match(await page.locator('.lp-title').evaluate(title => getComputedStyle(title).fontFamily), /^"?Geist"?,/, 'Display type uses Geist Sans');
        assert.equal(await page.locator('.lp-memory li').count(), 4, 'Memory comparison lists all four agents');
        await expect(page.locator('.lp-download')).not.toHaveAttribute('data-platform', 'unknown');
      }
      if (route === '/benchmarks/') {
        assert.equal(await page.locator('#task-select[data-slot="select-trigger"]').count(), 1, 'Benchmark picker uses Honest UI Select');
        if (width > 620) {
          const overflowingCells = await page.locator('.benchmark-table th, .benchmark-table td').evaluateAll(cells =>
            cells.filter(cell => cell.scrollWidth > cell.clientWidth + 1).map(cell => cell.textContent.trim()));
          assert.deepEqual(overflowingCells, [], `Benchmark cells remain readable without overlap @ ${width}`);
        }
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
  assert.equal(footerRestingStyle.color, 'rgb(11, 11, 13)', 'Footer text link starts dark');
  await footerTextLink.hover();
  await page.waitForTimeout(150);
  assert.ok(Number(await footerTextLink.evaluate(link => getComputedStyle(link).opacity)) < Number(footerRestingStyle.opacity), 'Footer text link becomes lighter on hover');
  const installCode = page.locator('[data-slot="prose-code-block"]');
  await expect(installCode.locator('pre code')).toHaveText('npm install -g handwork');
  await installCode.getByRole('button', { name: 'Copy install command', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(installCode.getByRole('status')).toHaveText('Install command copied.');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'npm install -g handwork');
  const heroVideo = page.locator('.hero-demo-video');
  await heroVideo.scrollIntoViewIfNeeded();
  await expect.poll(() => heroVideo.evaluate(video => video.readyState)).toBeGreaterThanOrEqual(2);
  assert.equal(await heroVideo.evaluate(video => video.duration), 24);
  assert.equal(await heroVideo.evaluate(video => video.muted && video.loop && video.controls && video.playsInline), true);
  await heroVideo.evaluate(video => video.play());
  await expect.poll(() => heroVideo.evaluate(video => video.currentTime)).toBeGreaterThan(0);
  await heroVideo.evaluate(video => video.pause());
  assert.equal(await heroVideo.evaluate(video => video.paused), true);
  await page.goto(origin + '/benchmarks/');
  assert.ok((await page.locator('.benchmark-heading').textContent()).includes('October 19, 2026'));
  assert.ok((await page.locator('.benchmark-notes').textContent()).includes('September 18-19'));
  const refreshCases = ['Pagination', 'Authorization and cache', 'BullMQ worker recovery', 'Async search'].map(option => {
    const measured = measuredHandwork(option);
    const value = (number, format) => number === null ? '—' : format(number);
    return [option, value(measured.median_success_seconds, n => `${n.toFixed(1)} s`),
      value(measured.mean_tool_calls, n => n.toFixed(1)),
      value(measured.mean_input_tokens, n => Math.round(n).toLocaleString('en-US')),
      value(measured.mean_output_tokens, n => Math.round(n).toLocaleString('en-US')),
      value(measured.median_peak_mib, n => `${n.toFixed(1)} MiB`),
      option === 'BullMQ worker recovery' ? '1800 second limit' : '5 attempts',
      option === 'Authorization and cache' ? 'handwork-auth-cache-2026-10-19' : 'handwork-2026-10-19'];
  });
  for (const [option, time, calls, input, output, memory, attempts, source] of refreshCases) {
    await page.locator('#task-select').click();
    await expect(page.locator('#task-select')).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('option', { name: option, exact: true }).click();
    await expect(page.locator('#task-select')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#task-select-value')).toHaveText(option);
    const row = await page.locator('.handwork-row').textContent();
    for (const expected of [time, calls, input, output, memory]) assert.ok(row.includes(expected), `${option} includes ${expected}`);
    assert.ok((await page.locator('#benchmark-budget').textContent()).includes(attempts));
    assert.ok((await page.locator('#benchmark-source').getAttribute('href')).includes(source));
    assert.ok((await page.locator('#benchmark-download').getAttribute('href')).includes(source));
    assert.equal((await context.request.get(origin + await page.locator('#benchmark-source').getAttribute('href'))).status(), 200);
    const metricScales = await page.locator('.metric-cell').evaluateAll(cells => cells.reduce((groups, cell) => {
      (groups[cell.dataset.metric] ||= []).push(Number(getComputedStyle(cell.querySelector('.metric-bar')).getPropertyValue('--bar-scale')));
      return groups;
    }, {}));
    const claude = claudeSummary[taskKeys[option]];
    const handwork = measuredHandwork(option);
    assert.deepEqual(metricScales.fixes, [handwork.successes / handwork.attempts, 1, 1, claude.successes / claude.attempts], 'Completion bars show the measured pass rates');
    const claudeRow = page.getByRole('row', { name: /Claude Code/ });
    const claudeText = await claudeRow.textContent();
    const expectedClaude = [
      `${claude.successes} / ${claude.attempts}`,
      claude.median_success_seconds === null ? '—' : `${claude.median_success_seconds.toFixed(1)} s`,
      claude.mean_tool_calls.toFixed(1),
      Math.round(claude.mean_input_tokens).toLocaleString('en-US'),
      Math.round(claude.mean_output_tokens).toLocaleString('en-US'),
      `${claude.median_peak_mib.toFixed(1)} MiB`
    ];
    for (const expected of expectedClaude) assert.ok(claudeText.includes(expected), `${option}: Claude Code includes ${expected}`);
    for (const metric of ['fixes', 'time', 'toolCalls', 'inputTokens', 'outputTokens', 'rss']) {
      assert.equal(metricScales[metric].length, 4, `${metric} compares all four agents`);
      assert.equal(Math.max(...metricScales[metric]), 1, `${metric} scales against its largest value`);
      assert.ok(metricScales[metric].every(scale => scale >= 0 && scale <= 1), `${metric} bars stay within their tracks`);
    }
  }
  await page.locator('#task-select').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#task-select')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('option', { name: 'Async search', exact: true })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('option', { name: 'BullMQ worker recovery', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#task-select-value')).toHaveText('BullMQ worker recovery');
  assert.equal(await page.locator('.metric-bar').first().evaluate(bar => getComputedStyle(bar, '::after').transitionProperty), 'transform', 'Metric bars animate with transform');
  await page.waitForTimeout(240);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(page.locator('#task-select')).toHaveAttribute('aria-expanded', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin + '/');
  assert.equal(await page.locator('.hero-demo-video').evaluate(video => video.paused), true);
  await expect(page.locator('.lp-reveal').first()).toHaveCSS('visibility', 'visible');
  await page.goto(origin + '/docs/');
  const examples = page.locator('.docs-content [data-slot="prose-code-block"]');
  await expect(examples).toHaveCount(9);
  for (const example of await examples.all()) {
    const code = await example.locator('pre code').textContent();
    await example.getByRole('button').focus();
    await page.keyboard.press('Enter');
    await expect(example.getByRole('status')).toHaveText('Copied');
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), code, 'Copy includes the complete example');
  }
  await page.getByRole('navigation', { name: 'Documentation sections' }).getByRole('link', { name: 'Permissions and data' }).click();
  assert.ok(page.url().endsWith('#permissions'));
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true }).click();
  assert.equal(await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About', exact: true }).getAttribute('aria-current'), 'page');
  const missingResponse = await context.request.get(origin + '/missing');
  assert.equal(missingResponse.status(), 404);
  assert.match(await missingResponse.text(), /That page does not exist/);
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto(origin + '/');
  const mobileVideo = page.locator('.hero-demo-video');
  assert.equal(await mobileVideo.evaluate(video => video.getBoundingClientRect().width <= innerWidth), true, 'Mobile video fits the viewport');
  assert.equal(await mobileVideo.evaluate(video => video.paused), true, 'Reduced-motion video starts paused');
  await mobileVideo.evaluate(video => video.play());
  await expect.poll(() => mobileVideo.evaluate(video => video.currentTime)).toBeGreaterThan(0);
  await mobileVideo.evaluate(video => video.pause());
  await page.goto(origin + '/benchmarks/');
  assert.equal(await page.locator('.benchmark-table').evaluate(table => table.scrollWidth <= table.clientWidth), true, 'Mobile benchmark does not require horizontal scrolling');
  await page.locator('#task-select').click();
  await expect(page.getByRole('option')).toHaveCount(4);
  for (const option of await page.getByRole('option').all()) assert.ok(await option.evaluate(item => item.getBoundingClientRect().height >= 44), 'Benchmark options have 44px mobile targets');
  await page.goto(origin + '/docs/');
  assert.equal(await page.locator('.docs-nav-heading').isHidden(), true, 'Static documentation heading is hidden on mobile');
  assert.equal(await page.locator('#docs-sections').isHidden(), true, 'Mobile documentation menu starts collapsed');
  await page.locator('#docs-nav-toggle').click();
  assert.equal(await page.locator('#docs-sections').isVisible(), true, 'Mobile documentation menu opens');
  for (const report of await reportNames()) {
    const response = await page.goto(`${origin}/benchmarks/${report}/`);
    assert.equal(response.status(), 200);
    await expect(page.locator('.honest-prose h1')).toHaveCount(1);
    assert.ok(await page.locator('[data-slot="markdown-table"]').count() > 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${report}: tables stay inside the mobile page`);
    await expect(page.getByRole('link', { name: 'Download Markdown' })).toHaveAttribute('href', `/benchmarks/${report}/REPORT.md`);
  }
  await page.goto(`${origin}/benchmarks/handwork-2026-10-19/`);
  await page.getByRole('link', { name: 'September comparison and previous Handwork figures', exact: true }).click();
  await expect(page).toHaveURL(`${origin}/benchmarks/fair-comparison/`);
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJS.newPage();
  await staticPage.goto(origin + '/benchmarks/');
  assert.ok((await staticPage.locator('table').textContent()).includes(`${handworkRefresh.handwork.search.median_peak_mib.toFixed(1)} MiB`));
  await staticPage.goto(origin);
  assert.ok(await staticPage.locator('.lp-reveal').first().isVisible(), 'Reveal content is visible without JavaScript');
  assert.ok((await staticPage.locator('.lp-memory').textContent()).includes(`${handworkRefresh.handwork.search.median_peak_mib.toFixed(1)} MiB`));
  assert.ok(await staticPage.locator('.hero-demo-video').isVisible());
  assert.equal(await staticPage.locator('.hero-demo-video').evaluate(video => video.controls && video.paused), true, 'Native controls remain available without JavaScript');
  assert.match(await staticPage.locator('.hero-demo-video').getAttribute('poster'), /handwork-hero-poster\.jpg$/);
  await staticPage.goto(`${origin}/benchmarks/handwork-2026-10-19/`);
  await expect(staticPage.locator('.honest-prose h1')).toHaveText('Handwork refresh — October 19, 2026');
  await expect(staticPage.locator('.honest-prose table')).toHaveCount(3);
  await noJS.close();
  const platformCases = [
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'win-x64', /Setup-[\d.]+-x64\.exe$/],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', 'mobile', /#download$/],
  ];
  for (const [userAgent, platform, href] of platformCases) {
    const platformContext = await browser.newContext({ userAgent });
    const platformPage = await platformContext.newPage();
    await platformPage.goto(origin);
    await expect(platformPage.locator('.lp-download')).toHaveAttribute('data-platform', platform);
    assert.match(await platformPage.locator('.lp-download a').getAttribute('href'), href, `${platform}: hero links to the matching download`);
    assert.equal(await platformPage.locator('.desktop-download-row[data-match]').count(), platform === 'mobile' ? 0 : 1, `${platform}: one download is marked for this device`);
    await platformContext.close();
  }
  const analyticsContext = await browser.newContext();
  const analyticsPage = await analyticsContext.newPage();
  let analyticsRequests = 0;
  await analyticsPage.route('**/_vercel/insights/script.js', async route => {
    analyticsRequests++;
    await route.fulfill({ contentType: 'application/javascript', body: 'window.analyticsLoaded = true;' });
  });
  await analyticsPage.goto(origin + '/about/');
  assert.equal(await analyticsPage.locator('script[src="/analytics.js"]').count(), 0, 'Preview pages do not load analytics');
  assert.equal(analyticsRequests, 0);
  await analyticsPage.evaluate(() => import('/analytics.js'));
  await analyticsPage.waitForFunction(() => window.analyticsLoaded === true);
  assert.equal(analyticsRequests, 1, 'SDK loads the same-origin Vercel production endpoint');
  const sanitized = await analyticsPage.evaluate(() => {
    const beforeSend = window.vaq.find(([name]) => name === 'beforeSend')[1];
    return beforeSend({ type: 'pageview', url: location.origin + '/docs/?email=private@example.com#secret' });
  });
  assert.deepEqual(sanitized, { type: 'pageview', url: origin + '/docs/' });
  await analyticsPage.reload();
  await analyticsPage.evaluate(async () => {
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });
    await import('/analytics.js');
  });
  assert.equal(analyticsRequests, 1, 'Global Privacy Control prevents tracking');
  await analyticsPage.reload();
  await analyticsPage.evaluate(async () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    await import('/analytics.js');
  });
  assert.equal(analyticsRequests, 1, 'Do Not Track prevents tracking');
  await analyticsContext.close();
  assert.deepEqual(errors, []);
  console.log('PASS: 4 routes × 4 viewports; hero video playback, mobile video layout, reduced motion, docs navigation, 404, rendered benchmark reports, archived-report navigation, and no-JS baseline. Screenshots in test-results/.');
} finally {
  await browser?.close();
  if (server.exitCode === null) { const exited = once(server, 'exit'); server.kill('SIGTERM'); await exited; }
}
