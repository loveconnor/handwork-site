import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function fixture({ failure = false } = {}) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'handwork-site-refresh-test-'));
  const site = path.join(base, 'site');
  const results = path.join(base, 'results');
  fs.mkdirSync(results, { recursive: true });
  for (const name of ['public/app.js', 'app/benchmarks/page.jsx', 'README.md', 'scripts/refresh-handwork-benchmarks.mjs']) {
    const target = path.join(site, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, name), target);
  }
  const originalApp = fs.readFileSync(path.join(site, 'public/app.js'), 'utf8');
  const originalDatasets = JSON.parse(originalApp.match(/const datasets = (\{[\s\S]*?\n\});/)[1]);
  const records = [];
  const summary = {};
  for (const task of ['search', 'pagination', 'tenant-cache', 'bullmq']) {
    for (let attempt = 1; attempt <= 5; attempt++) records.push({ task, attempt,
      log: `${task}-${attempt}-handwork`, harness: 'handwork', reported_model: 'gpt-6-astra',
      success: true, duration_s: attempt, input_tokens: 100 + attempt, output_tokens: 20 + attempt,
      tool_calls: attempt, model_requests: attempt, peak_rss_bytes: { harness: attempt * 2 ** 20 },
      accounting: { eligible: true } });
    summary[task] = { attempts: 5, successes: 5, median_success_seconds: 3, median_peak_mib: 3,
      mean_input_tokens: 103, mean_output_tokens: 23, mean_tool_calls: 3, mean_model_requests: 3 };
  }
  if (failure) {
    Object.assign(records[0], { success: false, duration_s: 600, reported_model: undefined,
      input_tokens: null, output_tokens: null, accounting: { eligible: false } });
    Object.assign(summary.search, { successes: 4, median_success_seconds: 3.5,
      mean_input_tokens: null, mean_output_tokens: null });
  }
  const write = (name, value) => fs.writeFileSync(path.join(results, name), JSON.stringify(value));
  write('state.json', { created: '2026-10-19T12:00:00-0400', model: 'gpt-6-astra', effort: 'low',
    binary_sha256: 'a'.repeat(64), build: 'ReleaseFast', chip: 'Apple M4 Pro', memory_bytes: 24 * 2 ** 30,
    macos: '26.5.2', node: 'v24.21.0', tasks: [{ task: 'bullmq', upstream_commit: 'recorded-revision' }],
    budgets: { search: 600, pagination: 600, 'tenant-cache': 600, bullmq: 1800 } });
  write('attempts.json', records);
  write('summary.json', summary);
  write('host-profile-before.json', { settings: 'unchanged' });
  write('host-profile-after.json', { settings: 'unchanged' });
  const command = () => spawnSync(process.execPath, [path.join(site, 'scripts/refresh-handwork-benchmarks.mjs'), results], { encoding: 'utf8' });
  return { site, results, originalApp, originalDatasets, records, summary, write, command,
    cleanup: () => fs.rmSync(base, { recursive: true, force: true }) };
}

test('refresh retains failures, unavailable usage and every historical competitor value', () => {
  const f = fixture({ failure: true });
  try {
    const result = f.command();
    assert.equal(result.status, 0, result.stderr);
    const exported = JSON.parse(fs.readFileSync(path.join(f.site, 'public/benchmarks/handwork-2026-10-19/summary.json')));
    assert.equal(exported.attempts.length, 20);
    assert.equal(exported.handwork.search.successes, 4);
    assert.equal(exported.handwork.search.mean_input_tokens, null);
    for (const key of Object.keys(f.originalDatasets)) {
      assert.deepEqual(exported.comparison[key].values.slice(1), f.originalDatasets[key].values.slice(1));
    }
    const html = fs.readFileSync(path.join(f.site, 'app/benchmarks/page.jsx'), 'utf8');
    const handwork = html.match(/<TableRow className="handwork-row">[\s\S]*?<\/TableRow>/)[0];
    for (const text of ['4 / 5', '3.5 s', '—']) assert.ok(handwork.includes(text));
    assert.ok(html.includes('October 19, 2026') && html.includes('September 18-19'));
    assert.ok(html.includes('/benchmarks/handwork-2026-10-19/'));
    const report = fs.readFileSync(path.join(f.site, 'public/benchmarks/handwork-2026-10-19/REPORT.md'), 'utf8');
    assert.ok(report.includes('| search | 1 | No | 600 | Unavailable | Unavailable |'));
  } finally { f.cleanup(); }
});

test('incomplete series cannot change the page', () => {
  const f = fixture();
  try {
    f.write('attempts.json', f.records.slice(1));
    assert.notEqual(f.command().status, 0);
    assert.equal(fs.readFileSync(path.join(f.site, 'public/app.js'), 'utf8'), f.originalApp);
    assert.equal(fs.existsSync(path.join(f.site, 'public/benchmarks/handwork-2026-10-19')), false);
  } finally { f.cleanup(); }
});

test('wrong aggregate metrics are rejected rather than published', () => {
  const f = fixture();
  try {
    f.summary.pagination.mean_input_tokens = 1;
    f.write('summary.json', f.summary);
    assert.notEqual(f.command().status, 0);
    assert.equal(fs.readFileSync(path.join(f.site, 'public/app.js'), 'utf8'), f.originalApp);
  } finally { f.cleanup(); }
});

test('published cohorts cannot be overwritten', () => {
  const f = fixture();
  try {
    assert.equal(f.command().status, 0);
    const before = fs.readFileSync(path.join(f.site, 'public/app.js'), 'utf8');
    const html = fs.readFileSync(path.join(f.site, 'app/benchmarks/page.jsx'), 'utf8');
    assert.ok(!html.includes('unreported request usage'), 'A later fully accounted series clears the old unavailable notice');
    assert.ok(!html.includes('coincided with host sleep'), 'A later uninterrupted series clears the old sleep notice');
    assert.notEqual(f.command().status, 0);
    assert.equal(fs.readFileSync(path.join(f.site, 'public/app.js'), 'utf8'), before);
  } finally { f.cleanup(); }
});

test('host interruption is disclosed without replacing the original timer record', () => {
  const f = fixture();
  try {
    f.write('host-pause-review.json', { gaps: [{ id: 'tenant-cache-1-handwork', stopwatch_s: 1, artifact_interval_s: 101 }] });
    const result = f.command();
    assert.equal(result.status, 0, result.stderr);
    const html = fs.readFileSync(path.join(f.site, 'app/benchmarks/page.jsx'), 'utf8');
    assert.ok(html.includes('coincided with host sleep'));
    const report = fs.readFileSync(path.join(f.site, 'public/benchmarks/handwork-2026-10-19/REPORT.md'), 'utf8');
    assert.ok(report.includes('| tenant-cache | 1 | 1 | 101 |'));
    assert.equal(JSON.parse(fs.readFileSync(path.join(f.results, 'attempts.json'))).find(r => r.log === 'tenant-cache-1-handwork').duration_s, 1);
  } finally { f.cleanup(); }
});
