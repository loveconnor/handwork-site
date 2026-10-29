import { ProseCodeBlock } from "./components/ai/prose-code-block";
import RecordingDemo from "./components/RecordingDemo";
import { ChevronDown, ArrowUpRight } from "honestui/icons";
import SiteShell from "./components/SiteShell";
import HeroAscii from "./components/HeroAscii";
import DownloadButton, { DownloadNote } from "./components/DownloadButton";
import DesktopDownloads from "./components/DesktopDownloads";
import ProviderMark from "./components/ProviderMark";
import { CtaLabel, CtaWell } from "./components/Cta";
import { ChangesMock, ReadMock, TestsMock, PermissionsMock, ModelsMock, SessionsMock } from "./components/AppMocks";
import BlurText from "./components/reactbits/BlurText";
import ScrollReveal from "./components/reactbits/ScrollReveal";
import CountUp from "./components/reactbits/CountUp";
import AnimatedContent from "./components/reactbits/AnimatedContent";
import { desktopVersion, desktopReleaseNotes } from "./downloads.mjs";
import { pageMetadata, release } from "./site-config.mjs";
import "./home.css";

export const metadata = pageMetadata("home");

const installLabels = { copy: "Copy install command", copied: "Install command copied.", copyFailed: "Copy unavailable. Select and copy the command above." };

// Providers from the Handwork README's native provider table. Grok models run through the xai provider.
const providers = ["OpenAI", "Anthropic", "Gemini", "xAI", "Mistral", "DeepSeek", "Grok", "OpenRouter", "Ollama"];

// Async search, peak agent RSS in MiB (summary.json, handwork-2026-10-19 and archived series).
const memory = [
  { agent: "Handwork", value: 24.4, ours: true },
  { agent: "Codex", value: 234.0 },
  { agent: "Claude Code", value: 275.2 },
  { agent: "OpenCode", value: 790.1 },
];
const memoryMax = Math.max(...memory.map((row) => row.value));

function Reveal({ children, delay = 0, className = "" }) {
  return <AnimatedContent distance={24} duration={1.1} ease="power3.out" blur={6} delay={delay} threshold={0.12} className={`lp-reveal ${className}`}>{children}</AnimatedContent>;
}

function Label({ children }) {
  return <p className="label">{children}</p>;
}

function Feature({ title, body, wide = false, delay = 0, children }) {
  return (
    <Reveal delay={delay} className={`lp-feature${wide ? " is-wide" : ""}`}>
      <div className="lp-feature-visual" aria-hidden="true">{children}</div>
      <div className="lp-feature-copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </Reveal>
  );
}

export default function Home() {
  return (
    <SiteShell active="home">
      <main id="main" className="lp">
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero-panel">
            <HeroAscii />
            <div className="lp-hero-inner">
              <p className="lp-hero-kicker"><span aria-hidden="true"></span>Handwork for macOS and Windows</p>
              <h1 id="hero-title" className="lp-title">
                <BlurText as="span" text="The coding agent" className="lp-title-line" delay={70} stepDuration={0.5} blur={14} distance={18} />
                <BlurText as="span" text="that does the handwork." className="lp-title-line" delay={70} stepDuration={0.5} blur={14} distance={18} />
              </h1>
              <p className="lp-lede">Tell Handwork what to fix or build. It reads your code, makes the change, and runs your tests, with the AI model you choose.</p>
              <div className="lp-hero-actions">
                <DownloadButton className="max-[620px]:w-full" />
                <a className="cta cta-glass has-well max-[620px]:w-full" href="#cli"><CtaLabel>Install the CLI</CtaLabel><CtaWell /></a>
              </div>
              <DownloadNote className="lp-download-note" />
            </div>
          </div>

          <div className="lp-product process-section" id="in-action">
            <Reveal delay={0.2} className="lp-window">
              <RecordingDemo />
            </Reveal>
            <h2 id="action-heading" className="sr-only">Handwork terminal and desktop demo</h2>
            <div className="run-result">
              <div><span>2</span><p>apps in action</p></div><div><span>4</span><p>CLI tests passed</p></div><div><span>5</span><p>desktop tests passed</p></div><div><span>0</span><p>test failures</p></div>
            </div>
            <details className="transcript"><summary><ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" focusable="false" /><span>About this recording</span></summary><p>Real Handwork CLI output and desktop app capture, sped up for clarity. In the terminal, Handwork fixes <code>slug.js</code> and passes four tests. In a separate desktop demo project, it creates a slugify function and passes five tests. The silent video loops every 24 seconds.</p></details>
          </div>
        </section>

        <section className="lp-providers" aria-labelledby="providers-heading">
          <p id="providers-heading" className="lp-providers-title">Works with the model you already pay for</p>
          <ul className="lp-providers-list">
            {providers.map((name) => <li key={name}><ProviderMark name={name} size={26} />{name}</li>)}
          </ul>
        </section>

        <section className="lp-statement" aria-label="How Handwork works">
          <Label>How it works</Label>
          <ScrollReveal containerClassName="lp-statement-text" textClassName="lp-statement-words" baseOpacity={0.12} enableBlur blurStrength={3} baseRotation={0} wordAnimationEnd="center center">
            You describe the change. Handwork finds the code involved, makes a focused edit, and runs your tests. You review the diff and decide what to keep.
          </ScrollReveal>
        </section>

        <section className="lp-section" id="features" aria-labelledby="features-heading">
          <div className="lp-split-head">
            <Reveal><Label>What you get</Label><h2 id="features-heading">Built to be checked.</h2></Reveal>
            <Reveal delay={0.1}><p>Handwork edits files and runs programs on your machine. Every part of it is designed so you can see and control what changes.</p></Reveal>
          </div>
          <div className="lp-features">
            <Feature wide title="Small, reviewable changes" body="Edits stay focused on the task. Every change shows up as a diff you can read, then commit or throw away.">
              <ChangesMock />
            </Feature>
            <Feature delay={0.08} title="Reads before it edits" body="It opens the files that matter and explains the problem before changing anything.">
              <ReadMock />
            </Feature>
            <Feature title="Runs your tests" body="It runs the commands you ask for and reports what passed and what failed.">
              <TestsMock />
            </Feature>
            <Feature wide delay={0.08} title="You set the permissions" body="Choose whether Handwork asks before each action, accepts edits on its own, lets a reviewer decide, or works without checks.">
              <PermissionsMock />
            </Feature>
            <Feature wide title="Your model, your account" body="Sign in with an API key or subscription, or run models locally through Ollama. Your provider handles access and billing.">
              <ModelsMock providers={providers} />
            </Feature>
            <Feature delay={0.08} title="Picks up where you stopped" body="Conversations are saved, so you can resume a task later with its full context.">
              <SessionsMock />
            </Feature>
          </div>
        </section>

        <section className="lp-section" id="benchmarks" aria-labelledby="benchmark-heading">
          <div className="lp-proof">
            <div className="lp-proof-copy">
              <Reveal>
                <Label>Benchmarks</Label>
                <h2 id="benchmark-heading">Light on memory.</h2>
                <p>The runtime is written in Zig. On the same async search task, Handwork peaked at 24.4 MiB of memory. The other agents used 234 to 790 MiB.</p>
              </Reveal>
              <div className="lp-proof-stats">
                <div><p className="lp-stat"><CountUp to={20} suffix=" / 20" duration={1.4} /></p><p>Attempts completed across four tasks, rerun October 19, 2026</p></div>
                <div><p className="lp-stat"><CountUp to={29} decimals={1} suffix=" s" duration={1.4} /></p><p>Median time to fix the async search task</p></div>
              </div>
            </div>
            <Reveal delay={0.1} className="lp-memory">
              <p className="lp-memory-caption">Peak agent memory, async search</p>
              <ul>
                {memory.map((row) => (
                  <li key={row.agent} className={row.ours ? "is-ours" : undefined}>
                    <span className="lp-memory-name">{row.agent}</span>
                    <span className="lp-memory-track" aria-hidden="true"><span style={{ "--w": `${Math.max(row.value / memoryMax, 0.02)}` }}></span></span>
                    <span className="lp-memory-value">{`${row.value.toFixed(1)} MiB`}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <p className="lp-fineprint">We kept every result, including failures. OpenCode and Codex ran on September 18-19 and Claude Code on October 4, 2026. Handwork, OpenCode, and Codex used GPT-6 Astra at low effort; Claude Code used Opus 5.5 at medium effort. Different models and run dates limit the comparison, and four tasks do not establish an overall ranking.</p>
          <a className="lp-link" href="/benchmarks/">See every task and metric <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" focusable="false" /></a>
        </section>

        <section className="lp-section lp-get" id="download" aria-labelledby="download-heading">
          <div className="lp-get-panel">
            <div className="lp-get-intro">
              <Label>Get Handwork</Label>
              <h2 id="download-heading">Start with one task.</h2>
              <p>The desktop app and the command line run the same agent. Install either, connect a model, and describe what you want changed.</p>
            </div>
            <div className="lp-desktop desktop-section" id="desktop">
              <div className="lp-get-head">
                <h3>Desktop app</h3>
                <span>v{desktopVersion}</span>
              </div>
              <p className="lp-get-copy">Open a folder, chat with Handwork, approve its actions, then review and commit the changes. The agent is built in.</p>
              <DesktopDownloads />
              <div className="lp-desktop-foot">
                <a className="lp-link" href={desktopReleaseNotes}>Release notes <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" focusable="false" /></a>
                <p className="desktop-platform-note">Not sure which Windows build? Check Settings &gt; System &gt; About.</p>
              </div>
            </div>
            <div className="lp-cli" id="cli">
              <div className="lp-get-head">
                <h3>Command line</h3>
                <span>v{release}</span>
              </div>
              <p className="lp-get-copy">Install with npm, open a project folder, and run <code>handwork</code>. Connect a model with <code>/provider</code>.</p>
              <ProseCodeBlock compact label="Install command" code="npm install -g handwork" className="install-code-block lp-install text-left" labels={installLabels} />
              <p className="lp-cli-note">macOS on Apple Silicon. Windows x64 and ARM64 are experimental.</p>
              <ol className="lp-steps">
                <li><span>01</span><p>Install the CLI with the command above.</p></li>
                <li><span>02</span><p>Open a project folder and run <code>handwork</code>.</p></li>
                <li><span>03</span><p>Connect a model with <code>/provider</code>, then describe the change.</p></li>
              </ol>
              <a className="lp-link" href="/docs/">Read the setup guide <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" focusable="false" /></a>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
