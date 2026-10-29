import { CtaLabel, CtaWell } from "./components/Cta";
import SiteShell from "./components/SiteShell";

export const metadata = {
  title: 'Page not found | Handwork',
  description: 'The requested Handwork page could not be found.',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SiteShell active="notFound">
      <main id="main" className="wrap error-page">
        <p className="page-kicker">404</p>
        <h1>That page does not exist.</h1>
        <p>The address may be wrong, or the page may have moved.</p>
        <div className="error-actions"><a className="cta cta-dark has-well" href="/"><CtaLabel>Return home</CtaLabel><CtaWell /></a><a className="cta cta-outline" href="/docs/"><CtaLabel>Open the documentation</CtaLabel></a></div>
      </main>

    </SiteShell>
  );
}
