/* Собирает однофайловую демо-версию (без сервера) в dist/kmbox-demo.html */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const safe = (s) => s.replace(/<\/script/gi, '<\\/script');

let html = read('public/index.html');
html = html.replace(/<link rel="manifest"[^>]*>\n?/, '');
html = html.replace('href="icon.svg"', 'href="data:image/svg+xml,' + encodeURIComponent(read('public/icon.svg').trim()) + '"');
html = html.replace('<link rel="stylesheet" href="css/styles.css">', `<style>\n${read('public/css/styles.css')}\n</style>`);
const scripts = [
  `window.KM_SEED = ${safe(read('server/seed.json'))};`,
  read('public/js/logic.js'),
  read('public/js/api-local.js'),
  read('public/js/app.js'),
].map((s) => `<script>\n${safe(s)}\n</script>`).join('\n');
html = html.replace(/<!--SCRIPTS-->[\s\S]*<!--\/SCRIPTS-->/, scripts);
html = html.replace('<title>KM Box — помощник кальянного мастера</title>', '<title>KM Box — помощник кальянного мастера (демо)</title>');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'kmbox-demo.html'), html);
console.log('dist/kmbox-demo.html', (html.length / 1024).toFixed(0), 'KB');
