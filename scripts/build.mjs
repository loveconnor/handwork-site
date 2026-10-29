import { readFile, writeFile, readdir, rm, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { prepare, root } from './prepare.mjs';
import { reportNames } from '../app/benchmarks/reports.mjs';
export { root } from './prepare.mjs';

export async function build() {
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
  const productionBuild = process.argv.includes('--production');
  if (productionBuild && !siteUrl) throw new Error('SITE_URL is required for a production build.');
  await prepare();
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [fileURLToPath(import.meta.resolve('next/dist/bin/next')), 'build'], {
      cwd: root,
      env: { ...process.env, HANDWORK_PRODUCTION_BUILD: productionBuild ? '1' : '0' },
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Next.js build exited ${code}`)));
  });
  const output = path.join(root, 'out');
  if (siteUrl) {
    const routes = ['/', '/docs/', '/about/', '/benchmarks/', ...(await reportNames()).map(name => `/benchmarks/${name}/`)];
    const urls = routes.map(route => `  <url><loc>${siteUrl}${route}</loc></url>`).join('\n');
    await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
    await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  }
  // Static Next.js pages contain inline bootstrap data. Allow only the exact
  // exported scripts, rather than weakening the site's policy to unsafe-inline.
  const hashes = new Set();
  async function collectHashes(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await collectHashes(file);
      else if (entry.name.endsWith('.html')) {
        const html = await readFile(file, 'utf8');
        for (const [, attrs, content] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
          if (!/\bsrc=/.test(attrs)) hashes.add(`'sha256-${createHash('sha256').update(content).digest('base64')}'`);
        }
      }
    }
  }
  await collectHashes(output);
  const headers = (await readFile(path.join(root, 'public/_headers'), 'utf8'))
    .replace("script-src 'self'", `script-src 'self' ${[...hashes].join(' ')}`);
  await writeFile(path.join(output, '_headers'), headers);
  await rm(path.join(root, 'dist'), { recursive: true, force: true });
  await rename(output, path.join(root, 'dist'));
  console.log('Next.js exported the site, benchmark reports, and /404.html to dist');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await build();
