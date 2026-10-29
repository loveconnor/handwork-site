import { ArrowUpRight } from "honestui/icons";
import SiteShell from "../components/SiteShell";
import { pageMetadata, release } from "../site-config.mjs";
export const metadata = pageMetadata("about");

const sections = [
  {
    id: "purpose-heading",
    title: "What it does",
    body: [
      "Handwork gives an AI model the tools to work on a real project: search the code, edit files, and run commands. Ask it to fix a bug, explain how something works, or make a change and run the tests.",
      "Saved conversations, project instructions, skills, and MCP tools let you pick up work across sessions.",
    ],
  },
  {
    id: "motivation-heading",
    title: "Why Zig",
    body: [
      "The agent runtime and terminal interface are written in Zig. The goal is a small memory footprint and a terminal that stays responsive during long sessions.",
      "A JavaScript SDK lets other apps use the same agent with their own interface and tools.",
    ],
  },
  {
    id: "evidence-heading",
    title: "Results you can check",
    body: [
      <>The <a href="/benchmarks/">benchmark results</a> include every attempt, including failures, with timing, token use, and memory. Models and run dates differ between agents, and four tasks do not establish an overall ranking.</>,
    ],
  },
  {
    id: "release-heading",
    title: "Before you start",
    tag: release,
    body: [
      "Connect a cloud provider with an API key or subscription, or point Handwork at your own Ollama server. The Codex and Copilot adapters run those providers' own agent engines.",
      <>Handwork can edit files and run programs. <a href="/docs/#permissions">Set permissions</a> before your first task, then review the diff and test results.</>,
    ],
  },
];

export default function About() {
  return (
    <SiteShell active="about">
      <main id="main" className="wrap about-page">
        <header className="about-hero">
          <p className="page-kicker">About</p>
          <h1>An AI coding agent that works with the model you choose.</h1>
          <p className="about-lead">Handwork connects AI models to your project, in your terminal or in a desktop app. It is built by Connor Love.</p>
        </header>
        <div className="about-columns">
          {sections.map((section, index) => (
            <section className="about-section" aria-labelledby={section.id} key={section.id}>
              <div>
                <p className="section-number">{String(index + 1).padStart(2, "0")}</p>
                <h2 id={section.id}>{section.title}{section.tag && <span className="row-tag">{section.tag}</span>}</h2>
              </div>
              <div className="about-copy">
                {section.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
        <section className="about-resources" aria-labelledby="resources-heading">
          <p className="section-number">Links</p>
          <h2 id="resources-heading">Source, feedback, and the person behind it.</h2>
          <nav className="about-links" aria-label="About resources">
            <a href="https://github.com/loveconnor/handwork"><span>Source code</span><ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a>
            <a href="https://github.com/loveconnor/handwork/issues"><span>Issues and feedback</span><ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a>
            <a href="https://connorlove.com"><span>Connor Love</span><ArrowUpRight className="external-link-icon" strokeWidth={1.5} aria-hidden="true" focusable="false" /></a>
          </nav>
        </section>
      </main>
    </SiteShell>
  );
}
