import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import { spawn } from 'child_process';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';

const PORT = 3000;
const DIST = new URL('../dist', import.meta.url).pathname;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
const INJECT = '<script>new WebSocket(`ws://${location.host}`).onmessage=()=>location.reload()</script>';

const server = http.createServer((req, res) => {
  let p = join(DIST, req.url === '/' ? 'index.html' : req.url);
  if (!existsSync(p)) p = join(DIST, req.url, 'index.html');
  if (!existsSync(p)) { res.writeHead(404); return res.end('Not found'); }
  const mime = MIME[extname(p)] || 'text/plain';
  let body = readFileSync(p);
  if (extname(p) === '.html') body = Buffer.from(body.toString().replace('</body>', INJECT + '</body>'));
  res.writeHead(200, { 'Content-Type': mime });
  res.end(body);
});

const wss = new WebSocketServer({ server });

function rebuild() {
  const proc = spawn('make', { stdio: 'inherit' });
  proc.on('close', code => {
    if (code === 0) wss.clients.forEach(c => c.readyState === 1 && c.send('reload'));
  });
}

chokidar.watch(['content', 'src', 'templates', 'scripts'], { ignoreInitial: true }).on('all', rebuild);

server.listen(PORT, () => process.stdout.write(`dev server: http://localhost:${PORT}\n`));
