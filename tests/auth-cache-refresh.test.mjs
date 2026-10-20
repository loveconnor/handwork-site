import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function fixture() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'handwork-cache-publish-test-'));
  const site = path.join(base, 'site');
  const results = path.join(base, 'results');
  fs.mkdirSync(results);
  for (const name of ['public/app.js', 'app/page.jsx', 'README.md', 'scripts/refresh-auth-cache.mjs',
    'public/benchmarks/handwork-2026-10-19/summary.json', 'public/benchmarks/handwork-2026-10-19/REPORT.md']) {
    const target = path.join(site, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, name), target);
  }
  // Start from the retained four-task cohort even after the actual page has moved forward.
  const appPath = path.join(site, 'public/app.js');
  const sourceApp = fs.readFileSync(appPath, 'utf8');
  const match = sourceApp.match(/const datasets = (\{[\s\S]*?\n\});/);
  const data = JSON.parse(match[1]);
  const prior = JSON.parse(fs.readFileSync(path.join(site, 'public/benchmarks/handwork-2026-10-19/summary.json')));
  data.cache = prior.comparison.cache;
  const app = sourceApp.replace(match[0], `const datasets = ${JSON.stringify(data, null, 2)};`);
  fs.writeFileSync(appPath, app);
  const archivePath = path.join(site, 'public/benchmarks/handwork-2026-10-19/REPORT.md');
  const archive = fs.readFileSync(archivePath, 'utf8');
  const records = Array.from({ length: 5 }, (_, i) => ({ task: 'tenant-cache', attempt: i + 1,
    log: `tenant-cache-${i + 1}-handwork`, harness: 'handwork', reported_model: 'gpt-6-astra',
    success: i !== 0, duration_s: i + 1, input_tokens: 100 + i, output_tokens: 20 + i,
    tool_calls: i + 1, model_requests: i + 1, peak_rss_bytes: { harness: (i + 1) * 2 ** 20 },
    accounting: { eligible: true } }));
  const summary = { 'tenant-cache': { attempts: 5, successes: 4, median_success_seconds: 3.5,
    median_peak_mib: 3, mean_input_tokens: 102, mean_output_tokens: 22, mean_tool_calls: 3, mean_model_requests: 3 } };
  const write = (name, value) => fs.writeFileSync(path.join(results, name), JSON.stringify(value));
  write('state.json', { created: '2026-10-19T12:00:00-0400', model: 'gpt-6-astra', effort: 'low', build: 'ReleaseFast',
    binary_sha256: prior.method.binary_sha256, budgets: { 'tenant-cache': 600 }, chip: 'Apple M4 Pro',
    memory_bytes: 24 * 2 ** 30, macos: '26.5.2', node: 'v24.21.0' });
  write('attempts.json', records);
  write('summary.json', summary);
  for (const name of ['before', 'after']) write(`host-profile-${name}.json`, { settings: 'unchanged' });
  const command = () => spawnSync(process.execPath, [path.join(site, 'scripts/refresh-auth-cache.mjs'), results], { encoding: 'utf8' });
  return { site, results, records, summary, data, app, archive, archivePath, write, command,
    cleanup: () => fs.rmSync(base, { recursive: true, force: true }) };
}

test('cache update retains failures, all five token totals, every other row and the prior cohort', () => {
  const f = fixture();
  try {
    const result = f.command();
    assert.equal(result.status, 0, result.stderr);
    const app = fs.readFileSync(path.join(f.site, 'public/app.js'), 'utf8');
    const data = JSON.parse(app.match(/const datasets = (\{[\s\S]*?\n\});/)[1]);
    assert.deepEqual(data.cache.values[0], { attempts: 5, fixes: 4, time: 3.5, toolCalls: 3, inputTokens: 102, outputTokens: 22, rss: 3 });
    for (const key of Object.keys(data)) {
      if (key === 'cache') assert.deepEqual(data[key].values.slice(1), f.data[key].values.slice(1));
      else assert.deepEqual(data[key], f.data[key]);
    }
    assert.equal(fs.readFileSync(f.archivePath, 'utf8'), f.archive);
    const exported = JSON.parse(fs.readFileSync(path.join(f.site, 'public/benchmarks/handwork-auth-cache-2026-10-19/summary.json')));
    assert.equal(exported.attempts.length, 5);
    assert.equal(exported.attempts[0].success, false);
    assert.equal(exported.method.previous_cohort, 'handwork-2026-10-19');
    const report = fs.readFileSync(path.join(f.site, 'public/benchmarks/handwork-auth-cache-2026-10-19/REPORT.md'), 'utf8');
    assert.ok(report.includes('| 1 | No | 1 | 100 | 20 |'));
    const html = fs.readFileSync(path.join(f.site, 'app/page.jsx'), 'utf8');
    assert.ok(html.includes('separate complete five-attempt rerun'));
    assert.ok(!html.includes('unreported request usage'));
  } finally { f.cleanup(); }
});

for (const defect of ['missing-attempt', 'partial-usage', 'wrong-mean', 'changed-build']) {
  test(`${defect} cannot update the cache row`, () => {
    const f = fixture();
    try {
      if (defect === 'missing-attempt') f.write('attempts.json', f.records.slice(1));
      if (defect === 'partial-usage') { f.records[0].accounting.eligible = false; f.write('attempts.json', f.records); }
      if (defect === 'wrong-mean') { f.summary['tenant-cache'].mean_input_tokens = 103; f.write('summary.json', f.summary); }
      if (defect === 'changed-build') {
        const state = JSON.parse(fs.readFileSync(path.join(f.results, 'state.json')));
        state.binary_sha256 = '0'.repeat(64);
        f.write('state.json', state);
      }
      assert.notEqual(f.command().status, 0);
      assert.equal(fs.readFileSync(path.join(f.site, 'public/app.js'), 'utf8'), f.app);
      assert.equal(fs.existsSync(path.join(f.site, 'public/benchmarks/handwork-auth-cache-2026-10-19')), false);
    } finally { f.cleanup(); }
  });
}

test('a cache cohort cannot overwrite an existing export', () => {
  const f = fixture();
  try {
    assert.equal(f.command().status, 0);
    const before = fs.readFileSync(path.join(f.site, 'public/app.js'), 'utf8');
    assert.notEqual(f.command().status, 0);
    assert.equal(fs.readFileSync(path.join(f.site, 'public/app.js'), 'utf8'), before);
  } finally { f.cleanup(); }
});
