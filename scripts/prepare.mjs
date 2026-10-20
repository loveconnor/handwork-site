import { mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));

export async function prepare() {
  const analyticsModule = fileURLToPath(import.meta.resolve('@vercel/analytics'));
  const vendorDir = path.join(root, 'public', 'vendor');
  await mkdir(vendorDir, { recursive: true });
  await cp(analyticsModule, path.join(vendorDir, 'vercel-analytics.js'));
  await cp(path.resolve(path.dirname(analyticsModule), '../LICENSE'), path.join(vendorDir, 'vercel-analytics-LICENSE.txt'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await prepare();
