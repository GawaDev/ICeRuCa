import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import packageJson from './package.json' with { type: 'json' };

const port = Number.parseInt(process.env.PORT ?? '8787', 10);
const root = resolve('dist');
const origin = process.env.ICERUCA_PUBLIC_ORIGIN ?? 'https://iceruca.onrender.com';
const repository = 'https://github.com/GawaDev/ICeRuCa';
const types = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.geojson': 'application/geo+json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};
const headers = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://tile.openstreetmap.org; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; form-action 'self'; upgrade-insecure-requests",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
};

function json(response, status, value) {
  response.writeHead(status, { ...headers, 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

async function publicFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const file = resolve(root, `.${decoded === '/' ? '/index.html' : decoded}`);
  if (file !== root && !file.startsWith(`${root}${sep}`)) return null;
  try {
    return (await stat(file)).isFile() ? file : null;
  } catch {
    return extname(decoded) ? null : resolve(root, 'index.html');
  }
}

createServer(async (request, response) => {
  const method = request.method ?? 'GET';
  const url = new URL(request.url ?? '/', origin);
  if (url.pathname === '/health') {
    json(response, 200, { status: 'ok', name: 'ICeRuCa', version: packageJson.version, repository, publicOrigin: origin });
    return;
  }
  if (method !== 'GET' && method !== 'HEAD') {
    json(response, 405, { error: 'Method not allowed' });
    return;
  }
  let file;
  try { file = await publicFile(url.pathname); } catch { json(response, 400, { error: 'Invalid path' }); return; }
  if (!file) { json(response, 404, { error: 'Not found' }); return; }
  const extension = extname(file);
  response.writeHead(200, {
    ...headers,
    'Cache-Control': file.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache',
    'Content-Type': types[extension] ?? 'application/octet-stream',
  });
  if (method === 'HEAD') response.end();
  else createReadStream(file).pipe(response);
}).listen(port, '0.0.0.0', () => console.log(`ICeRuCa is listening on ${port}`));
