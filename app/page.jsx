import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "./components/ui/table";
import { ProseCodeBlock } from "./components/ai/prose-code-block";
import BenchmarkTaskSelect from "./components/BenchmarkTaskSelect";
import RecordingDemo from "./components/RecordingDemo";
import { Button } from "./components/ui/button";
import { X, ChevronDown, ArrowUpRight } from "honestui/icons";
import { OpenAI, ClaudeAI } from "honestui/logos";
import PlaybackIcons from "./components/PlaybackIcons";
import SiteShell from "./components/SiteShell";
import { pageMetadata, release } from "./site-config.mjs";

export const metadata = pageMetadata("home");

export default function Home() {
  return (
    <SiteShell active="home">
      <main id="main">
        <section className="hero">
          <div className="hero-marquee">
            <div className="hero-warp" aria-hidden="true"></div>
            <div className="wrap hero-brand">
          <h1 className="sr-only">Handwork, an AI coding agent</h1>
          <svg className="pixel-logo" viewBox="0 0 68 9.08" aria-hidden="true" focusable="false"><path transform="scale(1 1.8)" d="M0 0h2v1.04H0z M5 0h2v1.04H5z M9 0h5v1.04H9z M16 0h3v1.04h-3z M23 0h2v1.04h-2z M26 0h6v1.04h-6z M34 0h2v1.04h-2z M41 0h2v1.04h-2z M45 0h6v1.04h-6z M53 0h6v1.04h-6z M61 0h2v1.04h-2z M66 0h2v1.04h-2z M0 1h2v1.04H0z M5 1h2v1.04H5z M8 1h2v1.04H8z M13 1h2v1.04h-2z M16 1h4v1.04h-4z M23 1h2v1.04h-2z M26 1h2v1.04h-2z M31 1h2v1.04h-2z M34 1h2v1.04h-2z M41 1h2v1.04h-2z M44 1h2v1.04h-2z M50 1h2v1.04h-2z M53 1h2v1.04h-2z M58 1h2v1.04h-2z M61 1h2v1.04h-2z M65 1h2v1.04h-2z M0 2h7v1.04H0z M8 2h7v1.04H8z M16 2h2v1.04h-2z M19 2h2v1.04h-2z M23 2h2v1.04h-2z M26 2h2v1.04h-2z M31 2h2v1.04h-2z M34 2h2v1.04h-2z M38 2h1v1.04h-1z M41 2h2v1.04h-2z M44 2h2v1.04h-2z M50 2h2v1.04h-2z M53 2h6v1.04h-6z M61 2h5v1.04h-5z M0 3h2v1.04H0z M5 3h2v1.04H5z M8 3h2v1.04H8z M13 3h2v1.04h-2z M16 3h2v1.04h-2z M20 3h2v1.04h-2z M23 3h2v1.04h-2z M26 3h2v1.04h-2z M31 3h2v1.04h-2z M34 3h2v1.04h-2z M37 3h3v1.04h-3z M41 3h2v1.04h-2z M44 3h2v1.04h-2z M50 3h2v1.04h-2z M53 3h2v1.04h-2z M58 3h2v1.04h-2z M61 3h2v1.04h-2z M65 3h2v1.04h-2z M0 4h2v1.04H0z M5 4h2v1.04H5z M8 4h2v1.04H8z M13 4h2v1.04h-2z M16 4h2v1.04h-2z M21 4h4v1.04h-4z M26 4h6v1.04h-6z M35 4h3v1.04h-3z M39 4h3v1.04h-3z M45 4h6v1.04h-6z M53 4h2v1.04h-2z M58 4h2v1.04h-2z M61 4h2v1.04h-2z M66 4h2v1.04h-2z" /></svg>
          <p className="welcome-line">v{release} <span>·</span> made by <a href="https://connorlove.com">Connor Love</a></p>
            </div>
          </div>
          <div className="wrap hero-inner">
          <div className="hero-copy">
            <p>An AI coding agent for your terminal and desktop.</p>
            <p>Ask Handwork to fix a bug or build a feature. It reads your project, edits files, and runs tests with your chosen model.</p>
          </div>
          <div className="hero-actions">
            <ProseCodeBlock compact label="Install command" code="npm install -g handwork" className="install-code-block max-w-[320px] text-left" labels={{ copy: "Copy install command", copied: "Install command copied.", copyFailed: "Copy unavailable. Select and copy the command above." }} />
            <Button asChild variant="outline" className="no-underline"><a href="/docs/">Get started</a></Button>
          </div>
          <p className="install-note">Bring a supported subscription, an API key, or your own Ollama server.</p>
          <p className="install-note">The CLI supports macOS Apple Silicon and Windows x64 or ARM64. Windows support is experimental.</p>
          </div>
        </section>

        <section className="process-section" id="in-action" aria-labelledby="action-heading">
          <div className="wrap process-intro">
            <div className="section-heading"><h2 id="action-heading"><span aria-hidden="true">&gt;</span> Watch it fix a bug</h2><p>Watch Handwork 0.0.9 fix a function and pass both tests.</p></div>
            <ol className="process-steps">
              <li><span>01</span><div><strong>Ask for a change</strong><p>Describe the bug and the test to run.</p></div></li>
              <li><span>02</span><div><strong>Inspect the change</strong><p>Handwork finds the bug and edits one line.</p></div></li>
              <li><span>03</span><div><strong>Check the result</strong><p>Both tests pass after the fix.</p></div></li>
            </ol>
          </div>

          <RecordingDemo />

          <dialog className="recording-viewer" id="recording-viewer" aria-labelledby="recording-viewer-title" aria-describedby="recording-viewer-help">
            <div className="recording-viewer-shell">
              <header className="recording-viewer-header">
                <div className="recording-viewer-heading"><p>Recorded task</p><h2 id="recording-viewer-title">Inspect</h2></div>
                <div className="recording-viewer-actions"><Button variant="outline" className="motion-toggle recording-viewer-play" id="recording-viewer-play" type="button" aria-pressed="false"><PlaybackIcons /><span className="motion-label">Play recording</span></Button><Button variant="link" size="icon" className="recording-viewer-close size-11" id="recording-viewer-close" type="button" aria-label="Close full-size recording"><X size={16} strokeWidth={1.5} aria-hidden="true" focusable="false" /></Button></div>
              </header>
              <div className="recording-viewer-tabs" role="group" aria-label="Recording step"><Button variant="link" type="button" data-viewer-demo="inspect" aria-pressed="true"><span>01</span> Inspect</Button><Button variant="link" type="button" data-viewer-demo="verify" aria-pressed="false"><span>02</span> Edit and test</Button></div>
              <div className="recording-viewer-content" id="recording-viewer-content" role="region" aria-label="Full-size terminal recording" tabIndex="0"><img className="recording-viewer-image" id="recording-viewer-image" src="/media/inspect.png" width="1100" height="650" alt="A recording of the Handwork terminal app. The user enters a task. Handwork reads slug.js and test.js, then explains the bug." /></div>
              <p className="recording-viewer-help" id="recording-viewer-help">Scroll to inspect the recording at full size.</p>
            </div>
          </dialog>

          <div className="wrap run-result">
            <div><span>1</span><p>file changed</p></div><div><span>5</span><p>tool calls</p></div><div><span>2</span><p>tests passed</p></div><div><span>0</span><p>test exit code</p></div>
          </div>
          <details className="wrap transcript"><summary><ChevronDown size={20} strokeWidth={1.75} aria-hidden="true" focusable="false" /><span>Read the task and result</span></summary><p>Handwork fixed <code>slug.js</code> to trim and lowercase text and replace spaces with a hyphen. It ran <code>node test.js</code>. Both tests passed.</p></details>
        </section>

        <section className="wrap benchmark-section" id="benchmarks" aria-labelledby="benchmark-heading">
          <div className="section-heading benchmark-heading"><p className="section-number">02</p><div><h2 id="benchmark-heading">Coding task results</h2><p>Four coding tasks, five attempts per task. Handwork was rerun on October 19, 2026. Other agents use earlier results.</p></div></div>
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
          <p className="benchmark-scale-note">Fix bars show pass rates. Other bars scale to the largest value in each column. Tokens and tool calls are means per attempt. Bar length shows magnitude, not an overall score.</p>
          <div className="benchmark-notes"><p>We kept every result, including failures. OpenCode and Codex ran on September 18-19, and Claude Code on October 4, 2026. The older Handwork results remain in the archived reports. Cache results use a separate complete five-attempt rerun on October 19, 2026.</p><p>Handwork, OpenCode, and Codex used GPT-6 Astra at low effort. Claude Code used Opus 5.5 at medium effort. Different models and run dates limit the comparison. These four tasks do not establish an overall ranking.</p></div>
          <div className="benchmark-links">
            <a id="benchmark-source" className="text-link" href="/benchmarks/handwork-2026-10-19/">Read the method and results <ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a>
            <a id="benchmark-download" className="text-link" href="/benchmarks/handwork-2026-10-19/summary.json">Download the results</a>
          </div>
          <noscript><p>Read the <a href="/benchmarks/handwork-2026-10-19/">dated report for all four tasks</a>, including links to the archived series. Authorization/cache has a <a href="/benchmarks/handwork-auth-cache-2026-10-19/">separate five-attempt rerun</a>.</p></noscript>
        </section>

        <section className="wrap desktop-section" id="desktop" aria-labelledby="desktop-heading">
          <div className="desktop-copy">
            <h2 id="desktop-heading">Handwork desktop app</h2>
            <p>Open a project, attach files, and work with Handwork in a desktop window.</p>
            <p>The app includes the coding agent. Install it and connect a provider in Settings.</p>
            
          </div>
          <div className="desktop-downloads">
            <p className="desktop-release">Desktop downloads <span>v0.1.47</span></p>
            <div className="desktop-download-row">
              <div><h3>macOS Apple Silicon</h3><p>For Macs with an M-series chip.</p></div>
              <Button asChild className="download-button min-h-11 px-5 no-underline"><a  href="https://github.com/loveconnor/handwork/releases/download/desktop-v0.1.47/Handwork-0.1.47-arm64.dmg" aria-label="Download Handwork for macOS Apple Silicon">Download macOS</a></Button>
            </div>
            <p className="desktop-platform-note">Signed with Developer ID and notarized by Apple.</p>
            <div className="desktop-download-row">
              <div><h3>Windows x64</h3><p>For Intel and AMD PCs.</p></div>
              <Button asChild className="download-button min-h-11 px-5 no-underline"><a  href="https://github.com/loveconnor/handwork/releases/download/desktop-v0.1.47/Handwork-Setup-0.1.47-x64.exe" aria-label="Download Handwork for Windows x64">Download x64</a></Button>
            </div>
            <div className="desktop-download-row">
              <div><h3>Windows ARM64</h3><p>For ARM PCs, including Snapdragon.</p></div>
              <Button asChild className="download-button min-h-11 px-5 no-underline"><a  href="https://github.com/loveconnor/handwork/releases/download/desktop-v0.1.47/Handwork-Setup-0.1.47-arm64.exe" aria-label="Download Handwork for Windows ARM64">Download ARM64</a></Button>
            </div>
            <p className="desktop-platform-note">Find your PC type in Settings &gt; System &gt; About.</p>
            <a className="text-link" href="https://github.com/loveconnor/handwork/releases/tag/desktop-v0.1.47">Release notes</a>
          </div>
        </section>

        <section className="wrap closing"><div><h2>Start with your project.</h2><p>Install the CLI, connect a model, and describe the change you want.</p></div><Button asChild className="download-button min-h-11 px-5 no-underline"><a  href="/docs/">Set up Handwork</a></Button></section>
      </main>


    </SiteShell>
  );
}
