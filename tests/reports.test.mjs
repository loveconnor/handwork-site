import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { reportNames, readReport } from '../app/benchmarks/reports.mjs';

test('every Markdown report exports a rendered page with its tables and source download', async () => {
  for (const name of await reportNames()) {
    const html = await readFile(new URL(`../dist/benchmarks/${name}/index.html`, import.meta.url), 'utf8');
    assert.match(html, /class="honest-prose report-prose"/);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
    assert.match(html, /<table>/);
    assert.ok(html.includes(`/benchmarks/${name}/REPORT.md`));
    assert.ok(html.includes('Download Markdown'));
  }
});

test('report rendering preserves source content and resolves archived reports to pages', async () => {
  const name = 'handwork-2026-10-19';
  const report = await readReport(name);
  const source = await readFile(new URL(`../public/benchmarks/${name}/REPORT.md`, import.meta.url), 'utf8');
  assert.equal(report.title, 'Handwork refresh — October 19, 2026');
  assert.equal(report.markdown.replace(/(\]\(\/benchmarks\/[\w-]+\/)\)/g, '$1REPORT.md)'), source);
  assert.equal(await readReport('../README'), null);
});
