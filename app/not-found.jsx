import { Button } from "./components/ui/button";
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
        <div className="error-actions"><Button asChild className="download-button min-h-11 px-5 no-underline"><a  href="/">Return home</a></Button><a className="text-link" href="/docs/">Open the documentation</a></div>
      </main>

    </SiteShell>
  );
}
