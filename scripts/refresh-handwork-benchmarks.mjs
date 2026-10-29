import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultPath = path.resolve(process.argv[2]);
const state = JSON.parse(fs.readFileSync(path.join(resultPath, 'state.json'), 'utf8'));
const records = JSON.parse(fs.readFileSync(path.join(resultPath, 'attempts.json'), 'utf8'));
const summary = JSON.parse(fs.readFileSync(path.join(resultPath, 'summary.json'), 'utf8'));
const timingPath = path.join(resultPath, 'host-pause-review.json');
const timingReview = fs.existsSync(timingPath) ? JSON.parse(fs.readFileSync(timingPath, 'utf8')) : { gaps: [] };
const date = state.created.slice(0, 10);
assert.match(date, /^\d{4}-\d{2}-\d{2}$/, 'Invalid cohort date');
assert.match(state.binary_sha256, /^[a-f0-9]{64}$/, 'Missing frozen binary identity');
const source = `handwork-${date}`;
const destination = path.join(site, 'public/benchmarks', source);
assert.equal(fs.existsSync(destination), false, 'Preserve existing published cohorts');
const tasks = { search: 'search', pagination: 'pagination', cache: 'tenant-cache', bullmq: 'bullmq' };
const keys = ['fixes', 'time', 'toolCalls', 'inputTokens', 'outputTokens', 'rss'];
assert.equal(records.length, 20, 'Require all 20 outcomes, including failures');
assert.equal(new Set(records.map(row => row.log)).size, 20, 'Duplicate attempts');
assert.equal(state.model, 'gpt-6-astra');
assert.equal(state.effort, 'low');
assert.deepEqual(JSON.parse(fs.readFileSync(path.join(resultPath, 'host-profile-before.json'))),
  JSON.parse(fs.readFileSync(path.join(resultPath, 'host-profile-after.json'))), 'Host profile changed');
const read = name => fs.readFileSync(path.join(site, name), 'utf8');
let app = read('public/app.js');
const match = app.match(/const datasets = (\{[\s\S]*?\n\});/);
assert.ok(match, 'Missing benchmark datasets');
const datasets = JSON.parse(match[1]);
const historical = structuredClone(datasets);
const median = values => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const mean = values => values.some(value => value === null || value === undefined) ? null
  : values.reduce((sum, value) => sum + value, 0) / values.length;
for (const [key, task] of Object.entries(tasks)) {
  const attempts = records.filter(row => row.task === task);
  assert.deepEqual(attempts.map(row => row.attempt).sort(), [1, 2, 3, 4, 5], `${task} must retain exactly five attempts`);
  const measured = summary[task];
  assert.equal(measured.attempts, 5);
  assert.equal(measured.successes, attempts.filter(row => row.success).length);
  assert.equal(measured.median_success_seconds, median(attempts.filter(row => row.success).map(row => row.duration_s)));
  assert.equal(measured.median_peak_mib, median(attempts.map(row => row.peak_rss_bytes.harness / 2 ** 20)));
  for (const metric of ['input_tokens', 'output_tokens', 'tool_calls', 'model_requests']) {
    assert.equal(measured[`mean_${metric}`], mean(attempts.map(row => row[metric])), `Recompute ${task} ${metric} across all attempts`);
  }
  for (const row of attempts) {
    assert.equal(row.harness, 'handwork');
    if (row.reported_model != null) assert.equal(row.reported_model, state.model);
    else assert.equal(row.success, false, 'Successful completion must identify its model');
    if (!row.accounting?.eligible) {
      assert.equal(row.input_tokens, null, 'Unavailable accounting cannot become a partial input total');
      assert.equal(row.output_tokens, null, 'Unavailable accounting cannot become a partial output total');
    }
  }
  datasets[key].source = source;
  datasets[key].values[0] = {
    attempts: measured.attempts, fixes: measured.successes, time: measured.median_success_seconds,
    toolCalls: measured.mean_tool_calls, inputTokens: measured.mean_input_tokens,
    outputTokens: measured.mean_output_tokens, rss: measured.median_peak_mib
  };
  assert.deepEqual(datasets[key].values.slice(1), historical[key].values.slice(1), 'Historical competitor values changed');
}
function formatted(row) {
  const number = (value, format) => value === null ? '—' : format(value);
  return { fixes: `${row.fixes} / ${row.attempts}`, time: number(row.time, n => `${n.toFixed(1)} s`),
    toolCalls: number(row.toolCalls, n => n.toFixed(1)), inputTokens: number(row.inputTokens, n => Math.round(n).toLocaleString('en-US')),
    outputTokens: number(row.outputTokens, n => Math.round(n).toLocaleString('en-US')), rss: number(row.rss, n => `${n.toFixed(1)} MiB`) };
}
const displayDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
app = app.replace(match[0], `const datasets = ${JSON.stringify(datasets, null, 2)};`);
app = app.replace("toolCalls: agent.toolCalls.toFixed(1),", "toolCalls: agent.toolCalls === null ? '—' : agent.toolCalls.toFixed(1),")
  .replace("inputTokens: Math.round(agent.inputTokens).toLocaleString('en-US'),", "inputTokens: agent.inputTokens === null ? '—' : Math.round(agent.inputTokens).toLocaleString('en-US'),")
  .replace("outputTokens: Math.round(agent.outputTokens).toLocaleString('en-US'),", "outputTokens: agent.outputTokens === null ? '—' : Math.round(agent.outputTokens).toLocaleString('en-US'),")
  .replace('rss: `${agent.rss.toFixed(1)} MiB`', "rss: agent.rss === null ? '—' : `${agent.rss.toFixed(1)} MiB`");
let html = read('app/benchmarks/page.jsx');
html = html.replace(/(<h[12] id="benchmark-heading">[^<]+<\/h[12]><p>)[\s\S]*?(<\/p>)/,
  (_, open, close) => open + `Four coding tasks, five attempts per task. Handwork was rerun on ${displayDate}. Other agents use earlier results.` + close);
html = html.replace(/(<TableBody id="benchmark-rows">)([\s\S]*?)(<\/TableBody>)/, (_, open, body, close) => {
  let index = 0;
  const data = datasets.search;
  return open + body.replace(/<TableRow\b[\s\S]*?<\/TableRow>/g, row => {
    const agent = data.values[index++];
    const values = formatted(agent);
    for (const key of keys) {
      const max = Math.max(...data.values.map(v => v[key] ?? 0));
      const scale = key === 'fixes' ? agent.fixes / agent.attempts : (agent[key] ?? 0) / (max || 1);
      const re = new RegExp('(data-metric="' + key + '"[^\\n]*?"--bar-scale": ")[^"]+("[^\\n]*?className="metric-value">)[^<]+');
      assert.ok(re.test(row), `Missing static ${key} cell`);
      row = row.replace(re, (_, before, middle) => before + Number(scale.toFixed(6)) + middle + values[key]);
    }
    return row;
  }) + close;
});
html = html.replace(/(<div className="benchmark-notes"><p>)[\s\S]*?(<\/p>)/,
  (_, open, close) => open + `We kept every result, including failures. OpenCode and Codex ran on September 18-19, and Claude Code on October 4, 2026. The older Handwork results remain in the archived reports.` + close);
html = html.replace('Handwork, OpenCode, and Codex used GPT-6 Astra with low reasoning and a 272,000 token context limit.',
  'Handwork, OpenCode, and Codex used GPT-6 Astra with low reasoning. Recorded configurations and context settings are in the linked method reports.');
html = html.replace('Read the fresh comparison report ', 'Read the dated comparison report ');
const unavailable = Object.values(tasks).map(task => ({ task,
  attempts: records.filter(row => row.task === task && !row.accounting?.eligible).length
})).filter(row => row.attempts > 0);
const unavailableNote = ' A dash means unavailable: at least one retained Handwork attempt had unreported request usage, so its all-attempt token means are unavailable.';
const pauseNote = ' A retained attempt coincided with host sleep; see timing details in the method report.';
html = html.replaceAll(unavailableNote, '').replaceAll(pauseNote, '');
if (unavailable.length) {
  html = html.replace('Bar length shows magnitude, not an overall score.',
    'Bar length shows magnitude, not an overall score.' + unavailableNote);
}
if (timingReview.gaps.length) {
  html = html.replace('Bar length shows magnitude, not an overall score.',
    'Bar length shows magnitude, not an overall score.' + pauseNote);
}
html = html.replace(/(id="benchmark-source"[^>]*href=")[^"]+/, `$1/benchmarks/${source}/`);
html = html.replace(/(id="benchmark-download"[^>]*href=")[^"]+/, `$1/benchmarks/${source}/summary.json`);
html = html.replace(/<noscript><p>Open the <a href="\/benchmarks\/fair-comparison\/REPORT.md">fresh comparison report<\/a> for the other small tasks or the <a href="\/benchmarks\/bullmq-recovery\/REPORT.md">BullMQ worker recovery report<\/a>\.<\/p><\/noscript>/,
  `<noscript><p>Read the <a href="/benchmarks/${source}/">dated report for all four tasks</a>, including the latest Handwork attempts and links to the archived series.</p></noscript>`);

const lines = [`# Handwork refresh — ${displayDate}`, '',
  `Five fresh Handwork attempts on each original landing-page task. Build: ${state.build}, SHA-256 \`${state.binary_sha256}\`. Model: ${state.model}; reasoning: ${state.effort}.`, '',
  'Only Handwork was rerun. OpenCode and Codex remain from September 18-19, 2026; Claude Code remains from October 4 with Opus 5.5 at medium effort. Models, dates, and harnesses differ. These small local samples do not isolate harness performance or establish a general ranking.', '',
  '## Refreshed Handwork results', '',
  '| Task | Complete fixes | Median successful time | Mean tool calls | Mean input tokens | Mean output tokens | Median peak agent RSS |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
for (const [key] of Object.entries(tasks)) lines.push(`| ${datasets[key].label} | ${Object.values(formatted(datasets[key].values[0])).join(' | ')} |`);
lines.push('', '## Every scored attempt', '', '| Task | Attempt | Complete fix | Agent time (s) | Input tokens | Output tokens |', '| --- | ---: | --- | ---: | ---: | ---: |');
for (const r of records) lines.push(`| ${r.task} | ${r.attempt} | ${r.success ? 'Yes' : 'No'} | ${r.duration_s} | ${r.input_tokens ?? 'Unavailable'} | ${r.output_tokens ?? 'Unavailable'} |`);
lines.push('', '## Method and limits', '',
  `The run used ${state.chip}, ${state.memory_bytes / 2 ** 30} GiB RAM, macOS ${state.macos}, and Node ${state.node}. Runs were serial with fresh Git workspaces and the same frozen executable. Pagination, async search and authorization/cache retain their original fixture, prompt and private-verifier hashes, five attempts, and 600-second budget. BullMQ retains upstream revision \`${state.tasks.find(t => t.task === 'bullmq').upstream_commit}\`, recorded mutation and private-verifier hashes, five attempts, and a 1,800-second budget. Broken and known-correct controls passed before scoring; the known-correct BullMQ seed passed all 268 selected existing tests.`, '',
  'Success requires completing within budget, zero process exit status, unchanged protected files, the existing tests and all independent checks. BullMQ source is rebuilt and graded in a separate checkout with trusted dependencies and isolated Redis. Native read/edit/shell preflight and filesystem denial probes passed before scoring. Every scheduled outcome is retained; failed attempts are not replaced.', '',
  'The original no-save execution policy is retained, so the persistent subagent host is unavailable. The current default bounded parent operating policy is active; this series does not exercise saved-session child delegation. Small tasks retain the current Handwork managed skills; BullMQ blocks personal instructions and skills. The earlier native tool and process-memory definitions are reused. BullMQ uses the original model-only egress proxy and local Redis boundary; small tasks retain the original outbound-network policy.', '',
  'Model and effort are selected through a private execution profile because the current build ignores these keys in project-local settings. Temporary native credential files stay outside retained artifacts and are removed after each invocation; the original host settings and credential hashes are unchanged. No experiment overrides, new request/token limits, source tuning, or task changes were applied during scoring.', '',
  'Time includes the agent, inference, transport and its own tools/tests, but excludes setup and independent grading. Time is the median across successful attempts; input/output and native tool calls are means across every attempt. Input includes cached input once. Native JSON usage is reconciled against the complete request trace; unavailable usage remains unavailable and makes the relevant mean unavailable. Memory is median sampled peak local agent RSS, excluding tools/tests, Redis, the proxy and hosted inference. Transport retries and provider failures remain in the retained run.', '',
  'These tasks informed prior Handwork development and are regression coverage, not an independent holdout. Different run dates, cache state, personal context and model variability limit comparisons. Raw logs, source snapshots, workspaces and failed setup evidence are retained locally; this public export contains aggregate figures and outcome records only.', '',
  '## Archived comparisons', '',
  '- [September comparison and previous Handwork figures](/benchmarks/fair-comparison/REPORT.md)',
  '- [September BullMQ comparison and previous Handwork figures](/benchmarks/bullmq-recovery/REPORT.md)',
  '- [October 4 Claude Code method and attempts](/benchmarks/claude-code/REPORT.md)', '');
if (unavailable.length) {
  lines.push('## Unavailable token means', '',
    'Some completed fixes include failed provider requests with unavailable usage. These attempts remain in the correctness and timing results. Their all-attempt token means are unavailable; known partial totals are not substituted.', '',
    ...unavailable.map(row => `- ${row.task}: ${row.attempts} of 5 retained attempts have unavailable request accounting.`), '');
}
if (timingReview.gaps.length) {
  lines.push('## Host interruption and timing', '',
    'The original monotonic process stopwatch is retained, matching the earlier measurement code. A retained attempt coincided with confirmed macOS clamshell sleep. Its stopwatch excludes some suspended time; the start-record to ungraded-artifact interval below includes the interruption and a small amount of post-run recording overhead. These are separate observations, not interchangeable timing definitions. The raw record is unchanged, and no replacement attempt was selected.', '',
    '| Task | Attempt | Recorded stopwatch (s) | Start-to-artifact interval (s) |',
    '| --- | ---: | ---: | ---: |');
  for (const gap of timingReview.gaps) {
    const row = records.find(r => r.log === gap.id);
    assert.ok(row && row.duration_s === gap.stopwatch_s, 'Timing review must match the retained attempt');
    lines.push(`| ${row.task} | ${row.attempt} | ${gap.stopwatch_s} | ${gap.artifact_interval_s} |`);
  }
  lines.push('', 'The interruption and provider transport failures limit interpretation of the affected task. This series is a dated descriptive record, not a controlled claim of latency improvement.', '');
}

const exported = { schema_version: 1, date, comparison_order: ['handwork', 'opencode', 'codex', 'claude'],
  handwork: summary, method: { model: state.model, effort: state.effort,
  binary_sha256: state.binary_sha256, attempts_per_task: 5, budgets: state.budgets,
  historical_dates: { opencode: '2026-09-18/2026-09-19', codex: '2026-09-18/2026-09-19', claude: '2026-10-04' } },
  unavailable_accounting: unavailable,
  timing_notes: timingReview.gaps,
  attempts: records.map(r => ({ task: r.task, attempt: r.attempt, success: r.success, duration_s: r.duration_s,
    accounting_available: r.accounting?.eligible === true,
    input_tokens: r.input_tokens, output_tokens: r.output_tokens, tool_calls: r.tool_calls })),
  comparison: datasets };
fs.mkdirSync(destination, { recursive: true });
fs.writeFileSync(path.join(destination, 'REPORT.md'), lines.join('\n'));
fs.writeFileSync(path.join(destination, 'summary.json'), JSON.stringify(exported, null, 2) + '\n');
fs.writeFileSync(path.join(site, 'public/app.js'), app);
fs.writeFileSync(path.join(site, 'app/benchmarks/page.jsx'), html);
const readme = read('README.md').replace('Benchmark values come from a fresh five-attempt series', 'Archived September benchmark values came from a five-attempt series');
fs.writeFileSync(path.join(site, 'README.md'), readme + `\nHandwork alone was refreshed on ${displayDate} using the current ReleaseFast build, five attempts on each original task. The original prompts, fixtures, verifiers and budgets are retained. Competitor figures and archived reports are unchanged; dates and methodological differences are visible on the page. The new aggregate export and method are in \`public/benchmarks/${source}/\`. Regenerate only from a complete retained series with \`node scripts/refresh-handwork-benchmarks.mjs /absolute/new-results-directory\`.\n`);
console.log(`Updated Handwork from all ${records.length} retained attempts; historical competitor values and reports preserved.`);
