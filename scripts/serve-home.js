const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = process.env.PORT || 4173;
const root = process.cwd();
const defaultFile = path.join(root, 'home', 'index.html');
const tickTickApiHost = 'api.ticktick.com';
const tickTickOpenStatus = 0;
const tickTickCacheTtlMs = 15 * 60 * 1000;
const tickTickCache = new Map();
const envPath = path.join(root, '.env');

function loadEnvFile() {
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!key || process.env[key] !== undefined) return;
    process.env[key] = value.replace(/^"|"$/g, '');
  });
}

loadEnvFile();

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

function getCached(key) {
  const entry = tickTickCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    tickTickCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value) {
  tickTickCache.set(key, { value, expiresAt: Date.now() + tickTickCacheTtlMs });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function fetchTickTickJson(pathname, accessToken) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: 'GET',
        hostname: tickTickApiHost,
        path: pathname,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`TickTick request failed with status ${res.statusCode}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function handleTickTickApi(req, res, url) {
  const accessToken = process.env.TICKTICK_ACCESS_TOKEN;
  const parts = url.pathname.split('/').filter(Boolean);
  const refresh = url.searchParams.get('refresh') === '1';

  if (parts.length === 3 && parts[2] === 'projects') {
    if (!accessToken) {
      sendJson(res, 200, { status: 'missing-token', projects: [] });
      return;
    }
    if (!refresh) {
      const cached = getCached('ticktick-projects');
      if (cached) {
        sendJson(res, 200, cached);
        return;
      }
    }
    if (refresh) tickTickCache.delete('ticktick-projects');
    try {
      const projects = await fetchTickTickJson('/open/v1/project', accessToken);
      const payload = {
        status: 'ready',
        projects: projects
          .map((project) => ({
            id: project.id,
            name: project.name,
            closed: Boolean(project.closed),
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      };
      setCached('ticktick-projects', payload);
      sendJson(res, 200, payload);
    } catch (err) {
      sendJson(res, 502, { status: 'error', projects: [] });
    }
    return;
  }

  if (parts.length === 5 && parts[2] === 'projects' && parts[4] === 'tasks') {
    const projectId = parts[3];
    if (!projectId) {
      sendJson(res, 400, { status: 'error', tasks: [] });
      return;
    }
    if (!accessToken) {
      sendJson(res, 200, { status: 'missing-token', tasks: [] });
      return;
    }
    const cacheKey = `ticktick-project-${projectId}`;
    if (!refresh) {
      const cached = getCached(cacheKey);
      if (cached) {
        sendJson(res, 200, cached);
        return;
      }
    }
    if (refresh) tickTickCache.delete(cacheKey);
    try {
      const projectData = await fetchTickTickJson(
        `/open/v1/project/${projectId}/data`,
        accessToken
      );
      const tasks = (projectData.tasks || [])
        .filter(
          (task) =>
            task.status === tickTickOpenStatus ||
            task.status === null ||
            task.status === undefined
        )
        .map((task) => ({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate || null,
          projectId: task.projectId || projectId,
          projectName: projectData.project?.name || null,
        }));
      const payload = { status: 'ready', tasks };
      setCached(cacheKey, payload);
      sendJson(res, 200, payload);
    } catch (err) {
      sendJson(res, 502, { status: 'error', tasks: [] });
    }
    return;
  }

  sendJson(res, 404, { status: 'error', message: 'Not found' });
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
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/ticktick')) {
    handleTickTickApi(req, res, url).catch(() => {
      sendJson(res, 500, { status: 'error', message: 'Unexpected error' });
    });
    return;
  }
  const requestPath =
    url.pathname === '/'
      ? '/home/index.html'
      : url.pathname === '/project.html'
        ? '/home/project.html'
        : url.pathname;
  const resolved = safePath(requestPath);
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
