import { ArrowUpRight } from "honestui/icons";
import SiteShell from "../components/SiteShell";
import { pageMetadata, release } from "../site-config.mjs";

export const metadata = pageMetadata("about");

export default function About() {
  return (
    <SiteShell active="about">
      <main id="main" className="wrap about-page">
        <header className="about-hero">
          <p className="page-kicker">About</p>
          <h1>A coding agent you can use with your chosen model.</h1>
          <p className="about-lead">Handwork connects AI models to your project. Use it in your terminal or in the desktop app.</p>
        </header>

        <div className="about-columns">
          <section className="about-section" aria-labelledby="purpose-heading">
            <p className="section-number">01</p>
            <h2 id="purpose-heading">What it does</h2>
            <div className="about-copy">
              <p>Handwork gives the model tools to search your code, edit files, and run commands. Ask it to fix a bug, explain a project, or make a change and run the tests.</p>
              <p>Saved conversations, project instructions, skills, and MCP tools let you continue work across sessions.</p>
            </div>
          </section>
          <section className="about-section" aria-labelledby="motivation-heading">
            <p className="section-number">02</p>
            <h2 id="motivation-heading">Written in Zig</h2>
            <div className="about-copy">
              <p>The agent runtime and terminal interface use Zig. The goal is a small local memory footprint and a responsive terminal during long coding sessions.</p>
              <p>A JavaScript SDK lets other apps use the agent with their own interface and tools.</p>
            </div>
          </section>
          <section className="about-section" aria-labelledby="evidence-heading">
            <p className="section-number">03</p>
            <h2 id="evidence-heading">Check the results</h2>
            <div className="about-copy">
              <p>The <a href="/#benchmarks">coding task results</a> include failures, timings, token use, and local memory use. Models and run dates differ. Four tasks do not establish an overall ranking.</p>
            </div>
          </section>
          <section className="about-section" aria-labelledby="release-heading">
            <p className="section-number">04</p>
            <h2 id="release-heading">Before you start <span className="row-tag">{release}</span></h2>
            <div className="about-copy">
              <p>Connect a cloud provider or your Ollama server. Codex and Copilot adapters use those providers' own agent engines.</p>
              <p>Handwork can edit files and run programs. <a href="/docs/#permissions">Check permissions</a> before a task, then review the diff and test results.</p>
            </div>
          </section>
        </div>

        <section className="about-resources" aria-labelledby="resources-heading">
          <p className="section-number">05</p>
          <h2 id="resources-heading">Links</h2>
          
          <nav className="about-links" aria-label="About resources"><a href="https://github.com/loveconnor/handwork"><span>Source code</span><ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a><a href="https://github.com/loveconnor/handwork/issues"><span>Issues and feedback</span><ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a><a href="https://connorlove.com"><span>Connor Love</span><ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a></nav>
        </section>
      </main>

    </SiteShell>
  );
}
