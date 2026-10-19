# Authorization and cache — October 19, 2026

A separate complete cohort of five Handwork attempts, using the same ReleaseFast executable (SHA-256 `a740e3644e5c26cf34017041072dd4e17fc812fb0eada28c142ac56ae0904835`), original task prompt, fixture, private verifier, existing tests and 600-second budget. Model: gpt-6-astra; reasoning: low.

This cohort supplies every Handwork metric in the authorization/cache row. No figures are pooled with the [earlier complete four-task series](/benchmarks/handwork-2026-10-19/REPORT.md), which remains unchanged, including the interrupted attempt and its unavailable usage. Other tasks and all competitor results are unchanged.

| Complete fixes | Median successful time | Mean tool calls | Mean input tokens | Mean output tokens | Median peak agent RSS |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 5 / 5 | 50.3 s | 8.2 | 58,932 | 1,931 | 28.1 MiB |

## Every scored attempt

| Attempt | Complete fix | Agent time (s) | Input tokens | Output tokens |
| ---: | --- | ---: | ---: | ---: |
| 1 | Yes | 57.557 | 71512 | 2023 |
| 2 | Yes | 49.513 | 58926 | 1798 |
| 3 | Yes | 55.151 | 57797 | 2073 |
| 4 | Yes | 50.298 | 59007 | 1860 |
| 5 | Yes | 47.629 | 47419 | 1900 |

## Method and limits

Runs were serial on Apple M4 Pro, 24 GiB RAM, macOS 26.5.2, Node v24.21.0. The parent ran under caffeinate to prevent idle sleep. Each invocation used a fresh Git workspace and the same frozen binary. Broken and known-correct controls, native read/edit/shell preflight and filesystem-denial probes passed before scoring. No source tuning, task changes or experiment overrides were applied during scoring.

The original no-save policy and current default bounded parent policy remain active. Persistent child delegation is unavailable under this policy. Small-task managed skills and native model/effort settings match the earlier series. Private temporary credential copies are removed after each invocation, and original settings/credential hashes remain unchanged. Raw evidence stays local; this export contains safe metrics and outcome records.

Every scheduled outcome counts, including failures. Complete fixes require finishing within budget with zero exit status, unchanged protected files, no dependency changes, passing existing tests and all independent checks. Time uses the original process stopwatch and is the median of successful attempts; setup and independent grading are excluded. Input/output and tool calls are means across all five attempts. Input includes cached input once. Native JSON usage is reconciled against complete request traces for every attempt. Memory is the median sampled peak local agent RSS, excluding tools/tests and hosted inference.

The new cohort was requested to obtain complete usage after provider transport failures left usage unavailable in the earlier cohort. It was not selected for favorable timing or token values. All prior results and every new outcome are retained. These development tasks are regression coverage; five attempts, cache state, model variability, different dates and competitor models limit comparisons. This is descriptive evidence, not a controlled claim of general performance improvement.
