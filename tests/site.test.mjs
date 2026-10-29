import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { root } from '../scripts/prepare.mjs';
import { spawnSync } from 'node:child_process';
const dist = path.join(root, 'dist');
const pages = ['index.html', 'benchmarks/index.html', 'docs/index.html', 'about/index.html'];
for (const page of pages) {
  test(`${page}: metadata, landmarks, links and assets`, async () => {
    const html = await readFile(path.join(dist, page), 'utf8');
    assert.match(html, /<html lang="en"[^>]*>/);
    assert.match(html, /name="description"/);
    assert.match(html, /name="viewport"/);
    assert.match(html, /name="color-scheme" content="light"/);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.equal((html.match(/<main[ >]/g) || []).length, 1);
    assert.match(html, /https:\/\/connorlove.com/);
    assert.match(html, /https:\/\/github.com\/loveconnor\/handwork/);
    assert.match(html, /class="header-logo"[^>]+aria-label="Handwork home"><svg viewBox="0 0 520 520"/, 'header uses the Handwork logo mark');
    assert.match(html, /class="github-link footer-github"[^>]+aria-label="Handwork on GitHub"><svg/, 'footer GitHub link uses the shared icon');
    assert.doesNotMatch(html, /coming soon|revolution|supercharge|unlock your|additionally|crucial|delve|enhance|showcase|tapestry|testament|underscore|vibrant|serves as|stands as|boasts|in order to|it is important to note/i);
    assert.doesNotMatch(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''), /[—–’“”]/);
    assert.doesNotMatch(html, /<select[ >]/, 'native selects are not used');
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, 'unique IDs');
    for (const [, link] of html.matchAll(/(?:href|src)="([^" ]+)"/g)) {
      if (!link.startsWith('/') && !link.startsWith('#')) continue;
      const [pathname, fragment] = link.split('#');
      const target = pathname ? path.join(dist, pathname, pathname.endsWith('/') ? 'index.html' : '') : path.join(dist, page);
      assert.ok((await stat(target)).isFile(), `${page}: ${link}`);
      if (fragment) assert.ok((await readFile(target, 'utf8')).includes(`id="${fragment}"`), `fragment ${link}`);
    }
  });
}
test('production metadata, crawler files and custom error page are available', async () => {
  const buildSource = await readFile(path.join(root, 'scripts', 'build.mjs'), 'utf8');
  assert.match(buildSource, /process\.env\.SITE_URL/);
  assert.match(buildSource, /SITE_URL is required for a production build/);
  assert.match(buildSource, /--production/);
  const home = await readFile(path.join(dist, 'index.html'), 'utf8');
  assert.match(home, /property="og:title"/);
  assert.match(buildSource, /sitemap\.xml/);
  assert.ok((await stat(path.join(dist, 'og.png'))).size > 10000);
  assert.ok((await stat(path.join(dist, 'apple-touch-icon.png'))).size > 100);
  assert.ok((await stat(path.join(dist, 'favicon-32.png'))).size > 100);
  const favicon = await readFile(path.join(dist, 'favicon.svg'), 'utf8');
  assert.match(favicon, /viewBox="0 0 520 520"/);
  assert.match(favicon, /<rect x="12" y="8" width="146" height="504"/);
  const notFound = await readFile(path.join(dist, '404.html'), 'utf8');
  assert.match(notFound, /That page does not exist/);
  assert.match(notFound, /name="robots" content="noindex"/);
});
test('site typography matches the Handwork terminal app font', async () => {
  const css = await readFile(path.join(root, 'public', 'style.css'), 'utf8');
  assert.match(css, /font-family:\s*"Geist Mono"/);
  assert.match(css, /GeistMono-Variable\.woff2/);
  assert.match(css, /--mono:\s*"Geist Mono"/);
  assert.match(css, /--body-font:\s*var\(--sans\)/);
  assert.match(css, /--sans:\s*"Geist"/);
  assert.match(css, /Geist-Variable\.woff2/);
  assert.ok((await stat(path.join(root, 'public', 'fonts', 'GeistMono-Variable.woff2'))).size > 50000);
});
test('home hero uses React Bits motion with accessible fallbacks', async () => {
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  assert.match(html, /<h1 id="hero-title" class="lp-title">/);
  assert.match(html, /The coding agent/);
  assert.match(html, /class="lp-ascii" aria-hidden="true"/, 'ASCII shader is decorative');
  assert.match(html, /<noscript><style>[^<]*\.lp-reveal\{visibility:visible!important\}/, 'reveal content stays visible without JavaScript');
  assert.match(html, /href="\/benchmarks\/"/, 'home links to the full benchmark tables');
  for (const value of ['24.4 MiB', '234.0 MiB', '275.2 MiB', '790.1 MiB', 'Different models and run dates limit the comparison']) assert.ok(html.includes(value), value);
  assert.ok((await stat(path.join(root, 'public', 'fonts', 'Geist-Variable.woff2'))).size > 50000);
  const license = await readFile(path.join(root, 'app/components/reactbits/LICENSE'), 'utf8');
  assert.match(license, /React Bits/);
});
test('GIF assets come from the recorded terminal stream', async () => {
  for (const name of ['inspect', 'verify']) {
    const gif = await readFile(path.join(dist, 'media', `${name}.gif`));
    assert.equal(gif.subarray(0, 6).toString(), 'GIF89a');
    assert.ok(gif.includes(Buffer.from('NETSCAPE2.0')));
    assert.ok((await stat(path.join(dist, 'media', `${name}.png`))).size > 1000);
  }
  const data = JSON.parse(await readFile(path.join(root, 'content/actual-run.json'), 'utf8'));
  assert.equal(data.app, 'Handwork 0.0.9');
  assert.equal(data.result.test_output, '2 tests passed');
  assert.ok((await stat(path.join(root, 'content/actual-run.script'))).size > 1000);
});
test('benchmark data and method are rendered without JavaScript', async () => {
  const html = await readFile(path.join(dist, 'benchmarks', 'index.html'), 'utf8');
  const refresh = JSON.parse(await readFile(path.join(root, 'public/benchmarks/handwork-2026-10-19/summary.json'), 'utf8'));
  for (const value of [`${refresh.handwork.search.median_success_seconds.toFixed(1)} s`, `${refresh.handwork.search.median_peak_mib.toFixed(1)} MiB`, "55.2 s","790.1 MiB","32.8 s","234.0 MiB","five attempts per task","kept every result", 'October 19, 2026', 'September 18-19']) assert.ok(html.toLowerCase().includes(value.toLowerCase()), value);
  assert.equal((html.match(/data-metric="fixes"/g) || []).length, 4, 'every completed-fixes value has a comparison bar');
  assert.equal((html.match(/data-metric="time"/g) || []).length, 4, 'every median-time value has a comparison bar');
  assert.equal((html.match(/data-metric="toolCalls"/g) || []).length, 4, 'every tool-call value has a comparison bar');
  assert.equal((html.match(/data-metric="inputTokens"/g) || []).length, 4, 'every input-token value has a comparison bar');
  assert.equal((html.match(/data-metric="outputTokens"/g) || []).length, 4, 'every output-token value has a comparison bar');
  assert.equal((html.match(/data-metric="rss"/g) || []).length, 4, 'every memory value has a comparison bar');
  assert.ok(html.includes('Claude Code') && html.includes('Opus 5.5 at medium effort'));
  assert.ok(html.includes('Different models and run dates limit the comparison.'));
  assert.match(html, /class="agent-logo" src="\/favicon\.svg" alt=""/, 'Handwork row uses the local mark');
  assert.match(html, /class="agent-logo" src="\/media\/logos\/opencode\.svg" alt=""/, 'OpenCode row uses its official mark');
  assert.match(html, /<svg[^>]+class="agent-logo"[^>]+aria-hidden="true"[^>]*>[\s\S]*?<\/svg><span>Codex<\/span>/, 'Codex uses a decorative inline provider logo');
  assert.match(html, /<svg[^>]+class="agent-logo"[^>]+aria-hidden="true"[^>]*>[\s\S]*?<\/svg><span>Claude Code<\/span>/, 'Claude Code uses a decorative inline provider logo');
  for (const name of ['opencode.svg']) assert.ok((await stat(path.join(dist, 'media', 'logos', name))).size > 500, name);
});

test('analytics build selection preserves production and privacy behavior', () => {
  for (const [environment, explicitProduction, expected] of [
    ['', '0', false], ['', '1', true], ['production', '0', true], ['preview', '1', false],
  ]) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e',
      "import { analyticsEnabled } from './app/site-config.mjs'; console.log(analyticsEnabled)"], {
      cwd: root,
      env: { ...process.env, VERCEL_ENV: environment, HANDWORK_PRODUCTION_BUILD: explicitProduction },
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), String(expected));
  }
});

test('production build requires an explicit site origin', () => {
  const result = spawnSync(process.execPath, ['scripts/build.mjs', '--production'], {
    cwd: root, env: { ...process.env, SITE_URL: '' }, encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SITE_URL is required/);
});
