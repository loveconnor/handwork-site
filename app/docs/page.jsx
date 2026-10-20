import { ProseCodeBlock } from "../components/ai/prose-code-block";
import { Button } from "../components/ui/button";
import { ChevronDown, ArrowUpRight } from "honestui/icons";
import SiteShell from "../components/SiteShell";
import { pageMetadata } from "../site-config.mjs";

export const metadata = pageMetadata("docs");

export default function Docs() {
  return (
    <SiteShell active="docs">
      <main id="main" className="wrap docs-page">
        <header className="docs-hero">
          <p className="page-kicker">Documentation</p>
          <h1>Start using Handwork.</h1>
          <p className="page-lead">You need npm and a model provider for the CLI. It supports macOS Apple Silicon and Windows x64 or ARM64. Windows support is experimental.</p>
        </header>

        <div className="docs-layout">
          <aside className="docs-sidebar"><p className="docs-nav-heading">On this page</p><Button variant="outline" className="docs-nav-toggle w-full justify-between" id="docs-nav-toggle" type="button" aria-expanded="true" aria-controls="docs-sections"><span>On this page</span><ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" focusable="false" /></Button><nav id="docs-sections" aria-label="Documentation sections"><a href="#quick-start">Quick start</a><a href="#providers">Model providers</a><a href="#first-task">First task</a><a href="#permissions">Permissions and data</a><a href="#commands">Commands</a><a href="#sessions">Saved sessions</a><a href="#images-and-diagrams">Images and diagrams</a><a href="#source">Build from source</a></nav><a className="docs-repo" href="https://github.com/loveconnor/handwork#readme">Open the full reference <ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a></aside>

          <div className="docs-content">
            <section id="quick-start" className="doc-section honest-prose"><h2><span>01</span>Quick start</h2><ProseCodeBlock label="Install and launch" code={"# Install Handwork\nnpm install -g handwork\n\n# Open a project\ncd /path/to/your/project\nhandwork"} labels={{ copy: "Copy install and launch" }} /><p>Connect a provider with <code>/provider</code>, then choose a model with <code>/model</code>.</p><p><a href="https://github.com/loveconnor/handwork/blob/main/docs/windows-support.md">Check Windows limitations</a>. Windows x64 runs in CI. ARM64 is cross-compiled.</p><div className="note"><strong>Check permissions first.</strong><p>Run <code>/permissions</code>. The default <code>auto</code> mode can approve file changes and commands. Use <code>ask</code> to prompt for sensitive actions that no rule has approved.</p></div></section>

            <section id="providers" className="doc-section honest-prose"><h2><span>02</span>Model providers</h2><p>Connect a cloud provider or an Ollama server. Providers include OpenAI, Anthropic, Gemini, and OpenRouter.</p><p>Use <code>/provider</code> to choose a provider and enter its key. Enter saves and connects. Escape cancels. Ollama servers can connect without a key.</p><p>Your provider controls model access and billing. Codex and Copilot adapters use their own agent engines, tools, sessions, and permissions.</p><a className="text-link" href="https://github.com/loveconnor/handwork#providers-and-authentication">See all providers and sign-in options <ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a></section>

            <section id="first-task" className="doc-section honest-prose"><h2><span>03</span>First task</h2><p>Describe the change and the checks to run.</p><ProseCodeBlock label="Example task" code={"Fix the failing parser test. Keep the change focused.\nRun the parser tests and report the result."} labels={{ copy: "Copy example task" }} /><p>Run a single request from your shell with <code>ask</code>.</p><ProseCodeBlock label="Run a request" code={"handwork ask \"Explain this project's entry points\"\nhandwork ask --json \"Review the current changes without editing files\""} labels={{ copy: "Copy run a request" }} /><p>A prompt to avoid edits does not change permissions. Review the diff and test results after each task.</p></section>

            <section id="permissions" className="doc-section honest-prose"><h2><span>04</span>Permissions and data</h2><div className="prose-scroll" tabIndex={0} role="region" aria-label="Scrollable reference table"><table><thead><tr><th scope="col">Mode</th><th scope="col">Behavior</th></tr></thead><tbody><tr><th scope="row"><code>ask</code></th><td>Prompts before sensitive actions that no rule has approved.</td></tr><tr><th scope="row"><code>auto</code></th><td>Reviews sensitive actions that no rule has approved. This is the default.</td></tr><tr><th scope="row"><code>full-access</code></th><td>Turns off Handwork's permission checks.</td></tr></tbody></table></div><p>Run <code>/permissions ask</code> to require prompts. Use <code>/allowlist</code> to manage saved rules. If auto mode returns a caution, Handwork holds the action instead of opening a prompt.</p><div className="note"><strong>Cloud providers receive task data.</strong><p>A request can include your prompt, code excerpts, tool results, and conversation history. Read the provider's data policy before sending private code. Handwork stores native API keys in files that only your account can read. It does not encrypt them at rest.</p></div><p>Permission checks do not isolate the process from the operating system. They also do not prove that generated code is correct.</p></section>

            <section id="commands" className="doc-section honest-prose"><h2><span>05</span>Commands</h2><div className="prose-scroll" tabIndex={0} role="region" aria-label="Scrollable reference table"><table><thead><tr><th scope="col">Command</th><th scope="col">Action</th></tr></thead><tbody><tr><th scope="row"><code>/help</code></th><td>Lists commands.</td></tr><tr><th scope="row"><code>/provider</code></th><td>Connects or switches providers.</td></tr><tr><th scope="row"><code>/model</code></th><td>Chooses a model and reasoning effort.</td></tr><tr><th scope="row"><code>/new</code></th><td>Starts a session.</td></tr><tr><th scope="row"><code>/resume</code></th><td>Opens a saved session.</td></tr><tr><th scope="row"><code>/compact</code></th><td>Summarizes the conversation in a new context window.</td></tr><tr><th scope="row"><code>/skills</code></th><td>Lists and manages skills.</td></tr><tr><th scope="row"><code>/mcp</code></th><td>Manages MCP servers and project trust.</td></tr><tr><th scope="row"><code>/quit</code></th><td>Exits Handwork.</td></tr></tbody></table></div><p>Use <code>handwork --help</code> for all commands, <code>handwork doctor</code> to check setup, and <code>handwork update</code> to update the CLI. Restart after updating.</p></section>

            <section id="sessions" className="doc-section honest-prose"><h2><span>06</span>Saved sessions</h2><ProseCodeBlock label="Resume a session" code={"handwork sessions\nhandwork session resume last"} labels={{ copy: "Copy resume a session" }} /><p>Native sessions live in <code>~/.handwork/sessions</code>. Resuming restores the conversation, not files or running programs. Check your workspace after an interrupted task.</p><p>Run <code>handwork ask --no-save "Your task"</code> when you do not want to save the request. Provider runtime sessions use the provider's storage.</p></section>

            <section id="images-and-diagrams" className="doc-section honest-prose">
              <h2><span>07</span>Images and diagrams</h2>
              <p>Handwork displays local images, SVG, and supported Mermaid diagrams. Image quality depends on your terminal.</p>
              <h3>Try a diagram</h3>
              <p>Ask for a fenced <code>mermaid</code> or <code>svg</code> block.</p>
              <ProseCodeBlock label="Diagram prompt" code={"Return only a fenced mermaid block, without tools or explanation.\nCreate a flowchart: Open project -> Run tests -> Tests pass?\nIf yes, finish. If no, fix the code and run tests again."} labels={{ copy: "Copy diagram prompt" }} />
              <p>Handwork renders flowcharts, state diagrams, sequence diagrams, and pie charts. Other types stay as code. Its renderer may produce a different layout than Mermaid in a browser.</p>
              <h3>Show a local image</h3>
              <p>Ask for a Markdown image on its own line:</p>
              <ProseCodeBlock label="Markdown image" code={"![Test results](out/results.png)"} labels={{ copy: "Copy markdown image" }} />
              <p>Use an existing PNG, JPEG, GIF, or WebP file. Relative paths start where you launched Handwork. Animated images show their first frame.</p>
              <h3>Choose a terminal</h3>
              <div className="prose-scroll" tabIndex={0} role="region" aria-label="Scrollable reference table"><table><caption>How Handwork displays visual output</caption><thead><tr><th scope="col">Terminal</th><th scope="col">What to expect</th></tr></thead><tbody>
                <tr><th scope="row">Kitty, Ghostty</th><td>Inline graphics using the Kitty graphics protocol.</td></tr>
                <tr><th scope="row">iTerm2, WezTerm</th><td>Inline graphics using the iTerm2 image protocol.</td></tr>
                <tr><th scope="row">VS Code</th><td>Inline graphics using SIXEL when terminal images and GPU acceleration are enabled.</td></tr>
                <tr><th scope="row">Windows Terminal and other SIXEL terminals</th><td>Inline graphics when SIXEL support and cell pixel dimensions are detected.</td></tr>
                <tr><th scope="row">Apple Terminal</th><td>Readable text equivalents for supported Mermaid diagrams. SVG blocks keep their source. Raster images use coarse colored character previews.</td></tr>
                <tr><th scope="row">tmux, screen</th><td>Text diagrams and character previews. Graphics passthrough is not supported.</td></tr>
              </tbody></table></div>
              <div className="note"><strong>Apple Terminal does not display full-resolution inline images.</strong><p>SVG stays as source. Use a terminal with graphics support to see the drawing.</p></div>
              <h3>Enable images in VS Code</h3>
              <p>Add these settings, then open a new VS Code terminal and restart Handwork:</p>
              <ProseCodeBlock label="VS Code settings" code={"{\n  \"terminal.integrated.enableImages\": true,\n  \"terminal.integrated.gpuAcceleration\": \"auto\"\n}"} labels={{ copy: "Copy vs code settings" }} />
              <p>See <a href="https://code.visualstudio.com/docs/terminal/advanced#_image-support">VS Code's terminal image documentation</a> for host requirements.</p>
              <h3>Controls and limits</h3>
              <p>Press Control-O to open the conversation viewer. Use the trackpad or Page Up / Page Down to scroll. In Apple Terminal, enable View &gt; Allow Mouse Reporting for trackpad scrolling.</p>
              <p>To keep image labels and diagram source as text, start Handwork with:</p>
              <ProseCodeBlock label="Disable images" code={"HANDWORK_IMAGES=off handwork"} labels={{ copy: "Copy disable images" }} />
              <p>Remote image URLs are off by default. SVG supports common shapes, paths, gradients, and text, but not every browser feature: masks, filters, clipping paths, patterns, and embedded images are not drawn. SVG text uses Handwork's stroke font rather than the font named in the file.</p>
              <a className="text-link" href="https://github.com/loveconnor/handwork/blob/main/docs/inline-images.md">Read the full image rendering reference <ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a>
            </section>

            <section id="source" className="doc-section honest-prose"><h2><span>08</span>Build from source</h2><p>The repository uses Zig 0.16.0.</p><ProseCodeBlock label="Build from source" code={"git clone https://github.com/loveconnor/handwork.git\ncd handwork\nzig build\n./zig-out/bin/handwork --help"} labels={{ copy: "Copy build from source" }} /><p>For Codex or Copilot adapters, also run <code>npm ci</code>. They require Node.js 22.12 or newer, or 20.19 or newer.</p><a className="text-link" href="https://github.com/loveconnor/handwork#development-and-verification">Read the development reference <ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a></section>
          </div>
        </div>
      </main>

    </SiteShell>
  );
}
