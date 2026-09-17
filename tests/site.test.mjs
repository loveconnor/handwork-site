import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { build, root } from '../scripts/build.mjs';
await build();
const dist = path.join(root, 'dist');
const pages = ['index.html', 'docs/index.html', 'about/index.html'];
for (const page of pages) {
  test(`${page}: metadata, landmarks, links and assets`, async () => {
    const html = await readFile(path.join(dist, page), 'utf8');
    assert.match(html, /<html lang="en">/);
    assert.match(html, /name="description"/);
    assert.match(html, /name="viewport"/);
    assert.match(html, /name="color-scheme" content="light"/);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.equal((html.match(/<main[ >]/g) || []).length, 1);
    assert.match(html, /https:\/\/connorlove.com/);
    assert.match(html, /https:\/\/github.com\/loveconnor\/handwork/);
    assert.match(html, /class="header-logo"[^>]+aria-label="Handwork home"><svg viewBox="0 0 520 520"/, 'header uses the Handwork logo mark');
    assert.match(html, /class="github-link footer-github"[^>]+aria-label="Handwork on GitHub"><svg/, 'footer GitHub link uses the shared icon');
    assert.doesNotMatch(html, /desktop app|coming soon|revolution|supercharge|unlock your|additionally|crucial|delve|enhance|showcase|tapestry|testament|underscore|vibrant|serves as|stands as|boasts|in order to|it is important to note/i);
    assert.doesNotMatch(html, /[—–’“”]/);
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
  assert.match(buildSource, /rel="canonical"/);
  assert.match(buildSource, /og:image/);
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
  assert.match(css, /--body-font:\s*var\(--mono\)/);
  assert.ok((await stat(path.join(root, 'public', 'fonts', 'GeistMono-Variable.woff2'))).size > 50000);
});
test('home confines an accessible light-mode shape shader to the brand marquee', async () => {
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  assert.match(html, /class="hero-marquee">[\s\S]*class="hero-warp" aria-hidden="true"[\s\S]*class="wrap hero-brand"/);
  assert.match(html, /<\/div>\s*<div class="wrap hero-inner">\s*<div class="hero-copy">/);
  assert.match(html, /src="\/hero-warp\.js"/);
  const shader = await readFile(path.join(dist, 'hero-warp.js'), 'utf8');
  assert.match(shader, /uniform sampler2D uLogoMask/);
  assert.match(shader, /classList|dataset\.mask = 'ready'/);
  assert.match(shader, /bounds\?\.height \?\? container\.clientHeight\) - y/, 'pointer y is converted to the WebGL bottom origin');
  assert.match(shader, /hover: hover.*pointer: fine/, 'pointer ripples are limited to fine pointers');
  assert.ok((await stat(path.join(dist, 'hero-warp.js'))).size > 1000);
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
test('benchmark baseline and limitations are rendered without JavaScript', async () => {
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  for (const value of ['58.7 s', '41.8 MiB', '79.9 s', '757.2 MiB', '32.9 s', '227.5 MiB', 'frozen builds', 'do not rank agents']) assert.ok(html.toLowerCase().includes(value.toLowerCase()), value);
  assert.equal((html.match(/data-metric="fixes"/g) || []).length, 3, 'every completed-fixes value has a comparison bar');
  assert.equal((html.match(/data-metric="time"/g) || []).length, 3, 'every median-time value has a comparison bar');
  assert.equal((html.match(/data-metric="toolCalls"/g) || []).length, 3, 'every tool-call value has a comparison bar');
  assert.equal((html.match(/data-metric="inputTokens"/g) || []).length, 3, 'every input-token value has a comparison bar');
  assert.equal((html.match(/data-metric="outputTokens"/g) || []).length, 3, 'every output-token value has a comparison bar');
  assert.equal((html.match(/data-metric="rss"/g) || []).length, 3, 'every memory value has a comparison bar');
  assert.match(html, /class="agent-logo" src="\/favicon\.svg" alt=""/, 'Handwork row uses the local mark');
  assert.match(html, /class="agent-logo" src="\/media\/logos\/opencode\.svg" alt=""/, 'OpenCode row uses its official mark');
  assert.match(html, /class="agent-logo" src="\/media\/logos\/openai\.svg" alt=""/, 'Codex row uses the official OpenAI mark');
  for (const name of ['opencode.svg', 'openai.svg']) assert.ok((await stat(path.join(dist, 'media', 'logos', name))).size > 500, name);
});
