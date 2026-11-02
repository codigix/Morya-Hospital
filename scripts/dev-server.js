// Local dev server with the same URL rewrites as web.config (Live Server cannot rewrite URLs).
// Usage: npm run dev   ->  http://localhost:5501/
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = process.env.PORT || 5501;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.xml': 'application/xml', '.txt': 'text/plain'
};

function slugs() {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'data/services.json'), 'utf8')).map(s => s.slug); }
  catch (e) { return []; }
}

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }

  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const m = p.match(/^\/([^\/]+)\.html$/);
    if (m && slugs().includes(m[1])) file = path.join(root, 'service-details.html');
    else if (/^\/blog\.html\/[^\/]+\.html$/.test(p)) file = path.join(root, 'blog-details.html');
    else { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Cannot GET ' + p); }
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log('Dev server: http://localhost:' + port));
