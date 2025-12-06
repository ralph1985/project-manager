const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const root = process.cwd();
const defaultFile = path.join(root, 'home', 'index.html');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function safePath(requestPath) {
  const rawPath = requestPath.split('?')[0];
  const cleaned = rawPath.replace(/^\/+/, '');
  const resolved = path.normalize(path.join(root, cleaned));
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const resolved = safePath(req.url === '/' ? '/home/index.html' : req.url);
  if (!resolved) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad request');
    return;
  }
  let target = resolved;
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    target = path.join(resolved, 'index.html');
  }
  serveFile(res, target);
}).listen(PORT, () => {
  console.log(`Home dashboard running at http://localhost:${PORT}`);
  console.log(`Serving ${defaultFile}`);
});
