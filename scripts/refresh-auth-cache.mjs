import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results = path.resolve(process.argv[2]);
const readResult = name => JSON.parse(fs.readFileSync(path.join(results, name), 'utf8'));
const state = readResult('state.json');
const attempts = readResult('attempts.json');
const summary = readResult('summary.json');
const measured = summary['tenant-cache'];
const date = state.created.slice(0, 10);
assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
const source = `handwork-auth-cache-${date}`;
const destination = path.join(site, 'public/benchmarks', source);
assert.equal(fs.existsSync(destination), false, 'Preserve every published cohort');
assert.equal(state.model, 'gpt-6-astra');
assert.equal(state.effort, 'low');
assert.equal(state.build, 'ReleaseFast');
assert.match(state.binary_sha256, /^[a-f0-9]{64}$/);
assert.equal(state.budgets['tenant-cache'], 600);
assert.equal(attempts.length, 5, 'Require the complete scheduled cohort');
assert.deepEqual(attempts.map(r => r.attempt).sort(), [1, 2, 3, 4, 5]);
assert.equal(new Set(attempts.map(r => r.log)).size, 5);
assert.deepEqual(readResult('host-profile-before.json'), readResult('host-profile-after.json'));
const median = values => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
for (const r of attempts) {
  assert.equal(r.task, 'tenant-cache');
  assert.equal(r.harness, 'handwork');
  assert.equal(r.reported_model, state.model);
  assert.equal(typeof r.success, 'boolean');
  assert.equal(r.accounting?.eligible, true, 'Do not publish partial usage');
  for (const key of ['duration_s', 'input_tokens', 'output_tokens', 'tool_calls', 'model_requests']) {
    assert.ok(Number.isFinite(r[key]) && r[key] >= 0, `Invalid ${key}`);
  }
  assert.ok(Number.isFinite(r.peak_rss_bytes.harness) && r.peak_rss_bytes.harness >= 0);
}
assert.equal(measured.attempts, 5);
assert.equal(measured.successes, attempts.filter(r => r.success).length);
assert.equal(measured.median_success_seconds, median(attempts.filter(r => r.success).map(r => r.duration_s)));
assert.equal(measured.median_peak_mib, median(attempts.map(r => r.peak_rss_bytes.harness / 2 ** 20)));
for (const key of ['input_tokens', 'output_tokens', 'tool_calls', 'model_requests']) {
  assert.equal(measured[`mean_${key}`], attempts.reduce((sum, r) => sum + r[key], 0) / 5, `Recompute ${key} over every attempt`);
}
const appPath = path.join(site, 'public/app.js');
const app = fs.readFileSync(appPath, 'utf8');
const match = app.match(/const datasets = (\{[\s\S]*?\n\});/);
assert.ok(match);
const data = JSON.parse(match[1]);
const previousSource = data.cache.source;
const prior = JSON.parse(fs.readFileSync(path.join(site, 'public/benchmarks', previousSource, 'summary.json'), 'utf8'));
assert.equal(prior.method.binary_sha256, state.binary_sha256, 'Rerun must retain the frozen build');
const before = structuredClone(data);
data.cache.source = source;
data.cache.values[0] = { attempts: 5, fixes: measured.successes, time: measured.median_success_seconds,
  toolCalls: measured.mean_tool_calls, inputTokens: measured.mean_input_tokens,
  outputTokens: measured.mean_output_tokens, rss: measured.median_peak_mib };
for (const key of Object.keys(data)) {
  if (key === 'cache') assert.deepEqual(data[key].values.slice(1), before[key].values.slice(1));
  else assert.deepEqual(data[key], before[key]);
}
const displayDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(`${date}T00:00:00Z`));
const htmlPath = path.join(site, 'app/page.jsx');
let html = fs.readFileSync(htmlPath, 'utf8');
// The interrupted cohort remains in its report; it no longer supplies the displayed cache row.
assert.ok(Object.values(data).every(task => task.values[0].inputTokens !== null && task.values[0].outputTokens !== null));
html = html.replace(' A dash means unavailable: at least one retained Handwork attempt had unreported request usage, so its all-attempt token means are unavailable.', '')
  .replace(' A retained attempt coincided with host sleep; see timing details in the method report.', '')
  .replace(/ Cache results use a separate complete five-attempt rerun on [^.]+\./g, '');
const note = ` Cache results use a separate complete five-attempt rerun on ${displayDate}.`;
assert.ok(html.includes('The older Handwork results remain in the archived reports.'));
html = html.replace('The older Handwork results remain in the archived reports.', 'The older Handwork results remain in the archived reports.' + note);
html = html.replace('including the latest Handwork attempts and links to the archived series.</p></noscript>',
  `including links to the archived series. Authorization/cache has a <a href="/benchmarks/${source}/">separate five-attempt rerun</a>.</p></noscript>`);
const safe = attempts.map(r => ({ task: r.task, attempt: r.attempt, success: r.success, duration_s: r.duration_s,
  input_tokens: r.input_tokens, output_tokens: r.output_tokens, tool_calls: r.tool_calls, accounting_available: true }));
const exported = { schema_version: 1, date, handwork: summary, attempts: safe,
  method: { model: state.model, effort: state.effort, binary_sha256: state.binary_sha256,
    attempts_per_task: 5, budgets: state.budgets, previous_cohort: previousSource },
  comparison: { cache: data.cache } };
const fmt = n => Math.round(n).toLocaleString('en-US');
const report = [
  `# Authorization and cache — ${displayDate}`, '',
  `A separate complete cohort of five Handwork attempts, using the same ReleaseFast executable (SHA-256 \`${state.binary_sha256}\`), original task prompt, fixture, private verifier, existing tests and 600-second budget. Model: ${state.model}; reasoning: ${state.effort}.`, '',
  `This cohort supplies every Handwork metric in the authorization/cache row. No figures are pooled with the [earlier complete four-task series](/benchmarks/${previousSource}/REPORT.md), which remains unchanged, including the interrupted attempt and its unavailable usage. Other tasks and all competitor results are unchanged.`, '',
  '| Complete fixes | Median successful time | Mean tool calls | Mean input tokens | Mean output tokens | Median peak agent RSS |',
  '| ---: | ---: | ---: | ---: | ---: | ---: |',
  `| ${measured.successes} / 5 | ${measured.median_success_seconds?.toFixed(1) ?? 'Unavailable'} s | ${measured.mean_tool_calls.toFixed(1)} | ${fmt(measured.mean_input_tokens)} | ${fmt(measured.mean_output_tokens)} | ${measured.median_peak_mib.toFixed(1)} MiB |`, '',
  '## Every scored attempt', '',
  '| Attempt | Complete fix | Agent time (s) | Input tokens | Output tokens |',
  '| ---: | --- | ---: | ---: | ---: |',
  ...safe.map(r => `| ${r.attempt} | ${r.success ? 'Yes' : 'No'} | ${r.duration_s} | ${r.input_tokens} | ${r.output_tokens} |`), '',
  '## Method and limits', '',
  `Runs were serial on ${state.chip}, ${state.memory_bytes / 2 ** 30} GiB RAM, macOS ${state.macos}, Node ${state.node}. The parent ran under caffeinate to prevent idle sleep. Each invocation used a fresh Git workspace and the same frozen binary. Broken and known-correct controls, native read/edit/shell preflight and filesystem-denial probes passed before scoring. No source tuning, task changes or experiment overrides were applied during scoring.`, '',
  'The original no-save policy and current default bounded parent policy remain active. Persistent child delegation is unavailable under this policy. Small-task managed skills and native model/effort settings match the earlier series. Private temporary credential copies are removed after each invocation, and original settings/credential hashes remain unchanged. Raw evidence stays local; this export contains safe metrics and outcome records.', '',
  'Every scheduled outcome counts, including failures. Complete fixes require finishing within budget with zero exit status, unchanged protected files, no dependency changes, passing existing tests and all independent checks. Time uses the original process stopwatch and is the median of successful attempts; setup and independent grading are excluded. Input/output and tool calls are means across all five attempts. Input includes cached input once. Native JSON usage is reconciled against complete request traces for every attempt. Memory is the median sampled peak local agent RSS, excluding tools/tests and hosted inference.', '',
  'The new cohort was requested to obtain complete usage after provider transport failures left usage unavailable in the earlier cohort. It was not selected for favorable timing or token values. All prior results and every new outcome are retained. These development tasks are regression coverage; five attempts, cache state, model variability, different dates and competitor models limit comparisons. This is descriptive evidence, not a controlled claim of general performance improvement.', ''
].join('\n');
fs.mkdirSync(destination);
fs.writeFileSync(path.join(destination, 'REPORT.md'), report);
fs.writeFileSync(path.join(destination, 'summary.json'), JSON.stringify(exported, null, 2) + '\n');
fs.writeFileSync(appPath, app.replace(match[0], `const datasets = ${JSON.stringify(data, null, 2)};`));
fs.writeFileSync(htmlPath, html);
fs.appendFileSync(path.join(site, 'README.md'), `\nAuthorization/cache now uses the separate complete five-attempt cohort in \`public/benchmarks/${source}/\`. All metrics in that row come from this cohort; the earlier four-task series remains unchanged. Regenerate into a new cohort with \`node scripts/refresh-auth-cache.mjs /absolute/new-results-directory\`.\n`);
console.log('Updated authorization/cache from all five retained attempts; every prior report and other row preserved.');
