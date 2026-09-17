import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export const root = fileURLToPath(new URL('../', import.meta.url));
const github = 'https://github.com/loveconnor/handwork';
export async function build() {
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
  const productionBuild = process.argv.includes('--production');
  if (productionBuild && !siteUrl) throw new Error('SITE_URL is required for a production build.');
  const release = process.env.HANDWORK_VERSION || '0.0.9';
  const pages = [
    ['index', '/', 'Handwork | Coding agent for the terminal', 'Handwork is a coding agent for the terminal, written in Zig. It reads code, edits files, and runs tests.'],
    ['docs', '/docs/', 'Documentation | Handwork', 'Install Handwork, connect a model provider, set permissions, and run a task.'],
    ['about', '/about/', 'About | Handwork', 'Why Connor Love built Handwork, a native coding harness focused on low local memory use and a responsive terminal.'],
    ['404', '/404.html', 'Page not found | Handwork', 'The requested Handwork page could not be found.']
  ];
  await mkdir(path.join(root, 'dist'), { recursive: true });
  for (const [page, pathname, title, description] of pages) {
    const content = (await readFile(path.join(root, 'src', `${page}.html`), 'utf8')).replaceAll('{{HANDWORK_VERSION}}', release);
    const active = (name) => page === name ? ' aria-current="page"' : '';
    const canonical = siteUrl && page !== '404' ? `<link rel="canonical" href="${siteUrl}${pathname}"><meta property="og:url" content="${siteUrl}${pathname}">` : '';
    const social = siteUrl && page !== '404' ? `<meta property="og:image" content="${siteUrl}/og.png"><meta property="og:image:width" content="1672"><meta property="og:image:height" content="941"><meta property="og:image:alt" content="Handwork. A coding agent for the terminal, written in Zig."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${siteUrl}/og.png">` : '';
    const robots = page === '404' ? '<meta name="robots" content="noindex">' : '';
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="theme-color" content="#ffffff"><meta name="description" content="${description}">${robots}<meta property="og:site_name" content="Handwork"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:type" content="website">${canonical}${social}<title>${title}</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="preload" href="/fonts/GeistMono-Variable.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/style.css"><script src="/app.js" defer></script></head>
<body><a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="header-inner"><a class="header-logo" href="/" aria-label="Handwork home"><svg viewBox="0 0 520 520" aria-hidden="true"><g fill="currentColor"><rect x="12" y="8" width="146" height="504" rx="43" ry="43"/><rect x="362" y="8" width="146" height="504" rx="43" ry="43"/><path d="M 138 164 C 193 164, 226 160, 266 181 C 311 204, 316 246, 329 270 C 340 291, 349 298, 382 298 L 382 367 C 329 367, 293 349, 270 313 C 244 273, 235 231, 194 231 C 171 231, 153 238, 138 251 Z"/></g></svg></a><nav aria-label="Main navigation"><a href="/about/"${active('about')}>About</a><a href="/docs/"${active('docs')}>Docs</a></nav><div class="header-end"><a class="github-link" href="${github}" aria-label="Handwork on GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.24c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z"/></svg></a><span class="maker">Made by <a href="https://connorlove.com">Connor Love</a></span></div></div></header>
${content}
<footer class="site-footer"><div class="footer-brand"><a class="wordmark" href="/">handwork</a><p>A coding agent for the terminal.</p></div><nav class="footer-links" aria-label="Footer navigation"><a href="/docs/">Documentation</a><a class="github-link footer-github" href="${github}" aria-label="Handwork on GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.24c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z"/></svg></a><a href="https://connorlove.com">Made by Connor Love</a></nav></footer>
</body></html>`;
    const dir = page === 'index' || page === '404' ? path.join(root, 'dist') : path.join(root, 'dist', page);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, page === '404' ? '404.html' : 'index.html'), html);
  }
  await cp(path.join(root, 'public'), path.join(root, 'dist'), { recursive: true });
  if (siteUrl) {
    const sitemap = pages.filter(([page]) => page !== '404').map(([, pathname]) => `  <url><loc>${siteUrl}${pathname}</loc></url>`).join('\n');
    await writeFile(path.join(root, 'dist', 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`);
    await writeFile(path.join(root, 'dist', 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  } else {
    await rm(path.join(root, 'dist', 'sitemap.xml'), { force: true });
  }
  console.log('Built /, /docs/, /about/, and /404.html to dist');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await build();
