import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { build, root } from './build.mjs';
await build();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.png': 'image/png', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };
const base = path.join(root, 'dist');
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; img-src 'self' blob: data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const normalized = pathname === '/docs' || pathname === '/about' ? `${pathname}/` : pathname;
    const file = path.resolve(base, '.' + normalized + (normalized.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(base + path.sep)) throw new Error('Invalid path');
    const data = await readFile(file);
    res.writeHead(200, { ...securityHeaders, 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    const data = await readFile(path.join(base, '404.html'));
    res.writeHead(404, { ...securityHeaders, 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  }
});
server.listen(Number(process.env.PORT || 4321), '127.0.0.1', () => console.log(`Handwork site → http://127.0.0.1:${server.address().port}`));
