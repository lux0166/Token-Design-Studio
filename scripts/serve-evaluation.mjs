import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve, relative, extname, isAbsolute } from 'node:path';
const root = resolve(process.env.EVAL_ROOT || 'output/evaluations/matrix'), port = Number(process.env.EVAL_PORT || 14489);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid EVAL_PORT');
createServer((req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname); if (path.endsWith('/')) path += 'index.html';
    const file = resolve(root, '.' + path), rel = relative(root, file);
    if (rel.startsWith('..') || isAbsolute(rel)) throw new Error('Invalid path');
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
    const type = types[extname(file)]; if (!type) throw new Error('Unsupported file');
    res.writeHead(200, { 'Content-Type': type, 'Content-Security-Policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; form-action 'none'", 'Cache-Control': 'no-store' }); res.end(readFileSync(file));
  } catch { if (!res.headersSent) res.writeHead(404); res.end('Fixture not generated or unavailable.'); }
}).listen(port, '127.0.0.1', () => console.log(`Evaluation fixtures: http://127.0.0.1:${port}`));
