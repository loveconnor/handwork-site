import { notFound } from 'next/navigation';
import { Markdown } from 'honestui/ai/markdown';
import SiteShell from '../../components/SiteShell';
import { siteUrl } from '../../site-config.mjs';
import { readReport, reportNames } from '../reports.mjs';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await reportNames()).map(report => ({ report }));
}

export async function generateMetadata({ params }) {
  const { report } = await params;
  const data = await readReport(report);
  if (!data) notFound();
  const title = `${data.title} | Handwork`;
  const description = 'Benchmark results, scored attempts, methodology, and limits from the Handwork project.';
  const url = siteUrl && `${siteUrl}/benchmarks/${report}/`;
  return { title, description, ...(url && { alternates: { canonical: url } }), openGraph: { title, description, type: 'article', ...(url && { url }) } };
}

export default async function BenchmarkReport({ params }) {
  const { report } = await params;
  const data = await readReport(report);
  if (!data) notFound();
  return (
    <SiteShell>
      <main id="main" className="wrap benchmark-report">
        <nav className="report-navigation" aria-label="Report navigation">
          <a href="/#benchmarks">Back to benchmarks</a>
          <a href={`/benchmarks/${report}/REPORT.md`} download>Download Markdown</a>
        </nav>
        <article aria-label={data.title}>
          <Markdown className="report-prose" syntaxHighlighting={false}>{data.markdown}</Markdown>
        </article>
      </main>
    </SiteShell>
  );
}
