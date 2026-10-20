import { Github } from "honestui/logos";
// Reuse the package logo in the footer to emit its fixed clip-path ID only once.
export default function SiteShell({ active, children }) {
  return (
    <>
<header className="site-header"><div className="header-inner"><a className="header-logo" href="/" aria-label="Handwork home"><svg viewBox="0 0 520 520" aria-hidden="true"><g fill="currentColor"><rect x="12" y="8" width="146" height="504" rx="43" ry="43" /><rect x="362" y="8" width="146" height="504" rx="43" ry="43" /><path d="M 138 164 C 193 164, 226 160, 266 181 C 311 204, 316 246, 329 270 C 340 291, 349 298, 382 298 L 382 367 C 329 367, 293 349, 270 313 C 244 273, 235 231, 194 231 C 171 231, 153 238, 138 251 Z" /></g></svg></a><nav aria-label="Main navigation"><a href="/about/" aria-current={active === "about" ? "page" : undefined}>About</a><a href="/docs/" aria-current={active === "docs" ? "page" : undefined}>Docs</a></nav><div className="header-end"><a className="github-link" href="https://github.com/loveconnor/handwork" aria-label="Handwork on GitHub"><Github id="github-mark" aria-hidden="true" focusable="false" /></a><span className="maker">Made by <a href="https://connorlove.com">Connor Love</a></span></div></div></header>
{children}
<footer className="site-footer"><div className="footer-brand"><a className="wordmark" href="/">handwork</a><p>An AI coding agent for your projects.</p></div><nav className="footer-links" aria-label="Footer navigation"><a href="/docs/">Documentation</a><a className="github-link footer-github" href="https://github.com/loveconnor/handwork" aria-label="Handwork on GitHub"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#github-mark" /></svg></a><a href="https://connorlove.com">Made by Connor Love</a></nav></footer>
    </>
  );
}
