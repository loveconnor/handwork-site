import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "../components/ui/table";
import BenchmarkTaskSelect from "../components/BenchmarkTaskSelect";
import { ArrowUpRight } from "honestui/icons";
import { OpenAI, ClaudeAI } from "honestui/logos";
import SiteShell from "../components/SiteShell";
import { pageMetadata } from "../site-config.mjs";

export const metadata = pageMetadata("benchmarks");

// scripts/refresh-*.mjs rewrite this markup in place; keep the table and note structure stable.
export default function Benchmarks() {
  return (
    <SiteShell active="benchmarks">
        <main id="main" className="wrap benchmark-section benchmark-page" aria-labelledby="benchmark-heading">
          <div className="section-heading benchmark-heading"><div><p className="page-kicker">Benchmarks</p><h1 id="benchmark-heading">Coding task results</h1><p>Four coding tasks, five attempts per task. Handwork was rerun on October 19, 2026. Other agents use earlier results.</p></div></div>
          <div className="bench-card">
          <div className="benchmark-toolbar">
            <BenchmarkTaskSelect />
            <span id="benchmark-budget">5 attempts per agent, 600 second limit per attempt</span>
          </div>
            <Table className="benchmark-table" containerProps={{ role: "region", "aria-label": "Coding task benchmark results", tabIndex: 0 }}>
              <TableCaption className="sr-only" id="benchmark-caption">Async search</TableCaption>
              <TableHeader><TableRow><TableHead scope="col">Agent</TableHead><TableHead scope="col">Complete fixes</TableHead><TableHead scope="col">Median time</TableHead><TableHead scope="col">Tool calls</TableHead><TableHead scope="col">Input tokens</TableHead><TableHead scope="col">Output tokens</TableHead><TableHead scope="col">Peak agent RSS</TableHead></TableRow></TableHeader>
              <TableBody id="benchmark-rows">
                <TableRow className="handwork-row">
                  <TableHead scope="row"><span className="agent-label"><img className="agent-logo" src="/favicon.svg" alt="" width="18" height="18" /><span>handwork</span></span> <span className="row-tag">ReleaseFast</span></TableHead>
                  <TableCell className="metric-cell" data-label="Complete fixes" data-metric="fixes"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "1"}} aria-hidden="true"></span><span className="metric-value">5 / 5</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Median time" data-metric="time"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.525049"}} aria-hidden="true"></span><span className="metric-value">29.0 s</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean tool calls" data-metric="toolCalls"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.316456"}} aria-hidden="true"></span><span className="metric-value">5.0</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean input tokens" data-metric="inputTokens"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.371451"}} aria-hidden="true"></span><span className="metric-value">30,741</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean output tokens" data-metric="outputTokens"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.483061"}} aria-hidden="true"></span><span className="metric-value">1,012</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Peak agent RSS" data-metric="rss"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.030931"}} aria-hidden="true"></span><span className="metric-value">24.4 MiB</span></span></TableCell>
                </TableRow>
                <TableRow>
                  <TableHead scope="row"><span className="agent-label"><img className="agent-logo" src="/media/logos/opencode.svg" alt="" width="18" height="18" /><span>OpenCode</span></span></TableHead>
                  <TableCell className="metric-cell" data-label="Complete fixes" data-metric="fixes"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "1"}} aria-hidden="true"></span><span className="metric-value">5 / 5</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Median time" data-metric="time"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "1"}} aria-hidden="true"></span><span className="metric-value">55.2 s</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean tool calls" data-metric="toolCalls"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "1"}} aria-hidden="true"></span><span className="metric-value">15.8</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean input tokens" data-metric="inputTokens"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.951944"}} aria-hidden="true"></span><span className="metric-value">78,781</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean output tokens" data-metric="outputTokens"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.543372"}} aria-hidden="true"></span><span className="metric-value">1,139</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Peak agent RSS" data-metric="rss"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "1"}} aria-hidden="true"></span><span className="metric-value">790.1 MiB</span></span></TableCell>
                </TableRow>
                <TableRow>
                  <TableHead scope="row"><span className="agent-label"><OpenAI className="agent-logo" size={18} aria-hidden="true" focusable="false" /><span>Codex</span></span></TableHead>
                  <TableCell className="metric-cell" data-label="Complete fixes" data-metric="fixes"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "1"}} aria-hidden="true"></span><span className="metric-value">5 / 5</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Median time" data-metric="time"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.595474"}} aria-hidden="true"></span><span className="metric-value">32.8 s</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean tool calls" data-metric="toolCalls"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.265823"}} aria-hidden="true"></span><span className="metric-value">4.2</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean input tokens" data-metric="inputTokens"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "1"}} aria-hidden="true"></span><span className="metric-value">82,758</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean output tokens" data-metric="outputTokens"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.364252"}} aria-hidden="true"></span><span className="metric-value">763</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Peak agent RSS" data-metric="rss"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.296199"}} aria-hidden="true"></span><span className="metric-value">234.0 MiB</span></span></TableCell>
                </TableRow>
                <TableRow>
                  <TableHead scope="row"><span className="agent-label"><ClaudeAI className="agent-logo" size={18} aria-hidden="true" focusable="false" /><span>Claude Code</span></span></TableHead>
                  <TableCell className="metric-cell" data-label="Complete fixes" data-metric="fixes"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "1"}} aria-hidden="true"></span><span className="metric-value">5 / 5</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Median time" data-metric="time"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.385161"}} aria-hidden="true"></span><span className="metric-value">21.2 s</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean tool calls" data-metric="toolCalls"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.189873"}} aria-hidden="true"></span><span className="metric-value">3.0</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean input tokens" data-metric="inputTokens"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.456718"}} aria-hidden="true"></span><span className="metric-value">37,797</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Mean output tokens" data-metric="outputTokens"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "1"}} aria-hidden="true"></span><span className="metric-value">2,096</span></span></TableCell>
                  <TableCell className="metric-cell" data-label="Peak agent RSS" data-metric="rss"><span className="metric-content"><span className="metric-bar" style={{"--bar-scale": "0.34837"}} aria-hidden="true"></span><span className="metric-value">275.2 MiB</span></span></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p className="benchmark-scale-note">Fix bars show pass rates. Other bars scale to the largest value in each column. Tokens and tool calls are means per attempt. Bar length shows magnitude, not an overall score.</p>
          <div className="benchmark-notes"><p>We kept every result, including failures. OpenCode and Codex ran on September 18-19, and Claude Code on October 4, 2026. The older Handwork results remain in the archived reports. Cache results use a separate complete five-attempt rerun on October 19, 2026.</p><p>Handwork, OpenCode, and Codex used GPT-6 Astra at low effort. Claude Code used Opus 5.5 at medium effort. Different models and run dates limit the comparison. These four tasks do not establish an overall ranking.</p></div>
          <div className="benchmark-links">
            <a id="benchmark-source" className="text-link" href="/benchmarks/handwork-2026-10-19/">Read the method and results <ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a>
            <a id="benchmark-download" className="text-link" href="/benchmarks/handwork-2026-10-19/summary.json">Download the results</a>
          </div>
          <noscript><p>Read the <a href="/benchmarks/handwork-2026-10-19/">dated report for all four tasks</a>, including links to the archived series. Authorization/cache has a <a href="/benchmarks/handwork-auth-cache-2026-10-19/">separate five-attempt rerun</a>.</p></noscript>
        </main>
    </SiteShell>
  );
}
