# Handwork refresh — October 19, 2026

Five fresh Handwork attempts on each original landing-page task. Build: ReleaseFast, SHA-256 `a740e3644e5c26cf34017041072dd4e17fc812fb0eada28c142ac56ae0904835`. Model: gpt-6-astra; reasoning: low.

Only Handwork was rerun. OpenCode and Codex remain from September 18–19, 2026; Claude Code remains from October 4 with Opus 5.5 at medium effort. Models, dates, and harnesses differ. These small local samples do not isolate harness performance or establish a general ranking.

## Refreshed Handwork results

| Task | Complete fixes | Median successful time | Mean tool calls | Mean input tokens | Mean output tokens | Median peak agent RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Async search | 5 / 5 | 29.0 s | 5.0 | 30,741 | 1,012 | 24.4 MiB |
| Pagination | 5 / 5 | 20.2 s | 5.0 | 25,233 | 464 | 24.4 MiB |
| Authorization and cache isolation | 5 / 5 | 66.7 s | 8.4 | — | — | 27.1 MiB |
| BullMQ worker recovery | 5 / 5 | 232.1 s | 20.8 | 321,875 | 3,318 | 23.3 MiB |

## Every scored attempt

| Task | Attempt | Complete fix | Agent time (s) | Input tokens | Output tokens |
| --- | ---: | --- | ---: | ---: | ---: |
| pagination | 1 | Yes | 23.408 | 25205 | 477 |
| search | 1 | Yes | 28.957 | 30812 | 1014 |
| tenant-cache | 1 | Yes | 66.693 | 72085 | 2104 |
| bullmq | 1 | Yes | 221.104 | 250512 | 3116 |
| pagination | 2 | Yes | 19.678 | 25220 | 478 |
| search | 2 | Yes | 32.139 | 30911 | 1076 |
| tenant-cache | 2 | Yes | 80.407 | 83103 | 1874 |
| bullmq | 2 | Yes | 235.705 | 436143 | 3199 |
| pagination | 3 | Yes | 18.771 | 25271 | 453 |
| search | 3 | Yes | 28.549 | 30814 | 996 |
| tenant-cache | 3 | Yes | 200.62 | Unavailable | Unavailable |
| bullmq | 3 | Yes | 219.19 | 269148 | 2674 |
| pagination | 4 | Yes | 23.204 | 25270 | 454 |
| search | 4 | Yes | 27.237 | 30364 | 969 |
| tenant-cache | 4 | Yes | 55.583 | 70931 | 1923 |
| bullmq | 4 | Yes | 256.71 | 336308 | 4498 |
| pagination | 5 | Yes | 20.222 | 25200 | 458 |
| search | 5 | Yes | 28.997 | 30802 | 1007 |
| tenant-cache | 5 | Yes | 58.299 | 60718 | 1883 |
| bullmq | 5 | Yes | 232.136 | 317265 | 3102 |

## Method and limits

The run used Apple M4 Pro, 24 GiB RAM, macOS 26.5.2, and Node v24.21.0. Runs were serial with fresh Git workspaces and the same frozen executable. Pagination, async search and authorization/cache retain their original fixture, prompt and private-verifier hashes, five attempts, and 600-second budget. BullMQ retains upstream revision `0b85d6b94d9eaf0e05a6453ee05f6737cd2cde39`, recorded mutation and private-verifier hashes, five attempts, and a 1,800-second budget. Broken and known-correct controls passed before scoring; the known-correct BullMQ seed passed all 268 selected existing tests.

Success requires completing within budget, zero process exit status, unchanged protected files, the existing tests and all independent checks. BullMQ source is rebuilt and graded in a separate checkout with trusted dependencies and isolated Redis. Native read/edit/shell preflight and filesystem denial probes passed before scoring. Every scheduled outcome is retained; failed attempts are not replaced.

The original no-save execution policy is retained, so the persistent subagent host is unavailable. The current default bounded parent operating policy is active; this series does not exercise saved-session child delegation. Small tasks retain the current Handwork managed skills; BullMQ blocks personal instructions and skills. The earlier native tool and process-memory definitions are reused. BullMQ uses the original model-only egress proxy and local Redis boundary; small tasks retain the original outbound-network policy.

Model and effort are selected through a private execution profile because the current build ignores these keys in project-local settings. Temporary native credential files stay outside retained artifacts and are removed after each invocation; the original host settings and credential hashes are unchanged. No experiment overrides, new request/token limits, source tuning, or task changes were applied during scoring.

Time includes the agent, inference, transport and its own tools/tests, but excludes setup and independent grading. Time is the median across successful attempts; input/output and native tool calls are means across every attempt. Input includes cached input once. Native JSON usage is reconciled against the complete request trace; unavailable usage remains unavailable and makes the relevant mean unavailable. Memory is median sampled peak local agent RSS, excluding tools/tests, Redis, the proxy and hosted inference. Transport retries and provider failures remain in the retained run.

These tasks informed prior Handwork development and are regression coverage, not an independent holdout. Different run dates, cache state, personal context and model variability limit comparisons. Raw logs, source snapshots, workspaces and failed setup evidence are retained locally; this public export contains aggregate figures and outcome records only.

## Archived comparisons

- [September comparison and previous Handwork figures](/benchmarks/fair-comparison/REPORT.md)
- [September BullMQ comparison and previous Handwork figures](/benchmarks/bullmq-recovery/REPORT.md)
- [October 4 Claude Code method and attempts](/benchmarks/claude-code/REPORT.md)

## Unavailable token means

Some completed fixes include failed provider requests with unavailable usage. These attempts remain in the correctness and timing results. Their all-attempt token means are unavailable; known partial totals are not substituted.

- tenant-cache: 1 of 5 retained attempts have unavailable request accounting.

## Host interruption and timing

The original monotonic process stopwatch is retained, matching the earlier measurement code. A retained attempt coincided with confirmed macOS clamshell sleep. Its stopwatch excludes some suspended time; the start-record to ungraded-artifact interval below includes the interruption and a small amount of post-run recording overhead. These are separate observations, not interchangeable timing definitions. The raw record is unchanged, and no replacement attempt was selected.

| Task | Attempt | Recorded stopwatch (s) | Start-to-artifact interval (s) |
| --- | ---: | ---: | ---: |
| tenant-cache | 3 | 200.62 | 360.28988 |

The interruption and provider transport failures limit interpretation of the affected task. This series is a dated descriptive record, not a controlled claim of latency improvement.
