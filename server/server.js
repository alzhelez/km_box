/* KM Box — сервер без внешних зависимостей: Node.js 22.13+ (node:http + node:sqlite) */
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = +process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'kmbox.db');
const PUBLIC = path.join(__dirname, '..', 'public');
const SEED = path.join(__dirname, 'seed.json');
const SESSION_DAYS = 30;
const COLLECTIONS = new Set(['guests', 'brands', 'flavors', 'inventories', 'shifts', 'orders', 'settings']);
const ADMIN_ONLY_WRITE = new Set(['settings', 'brands']);

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, login TEXT UNIQUE COLLATE NOCASE, hash TEXT, first_name TEXT, last_name TEXT, role TEXT);
  CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT, expires INTEGER);
  CREATE TABLE IF NOT EXISTS docs (col TEXT, id TEXT, data TEXT, updated_at TEXT, updated_by TEXT, PRIMARY KEY (col, id));
`);

// ---------- пароли ----------
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(pw, salt, 64).toString('hex');
}
function checkPassword(pw, stored) {
  const [salt, h] = String(stored).split(':');
  if (!salt || !h) return false;
  const a = Buffer.from(h, 'hex'), b = crypto.scryptSync(pw, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const newId = () => crypto.randomBytes(6).toString('hex');

// ---------- первичное наполнение ----------
function seed() {
  const users = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (!users) {
    const pw = process.env.ADMIN_PASSWORD || 'admin';
    db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?)').run('u1', process.env.ADMIN_LOGIN || 'admin', hashPassword(pw), 'Старший', 'КМ', 'admin');
    console.log(`Создан админ: ${process.env.ADMIN_LOGIN || 'admin'} / ${process.env.ADMIN_PASSWORD ? '(из ADMIN_PASSWORD)' : 'admin — СМЕНИТЕ ПАРОЛЬ!'}`);
  }
  const docs = db.prepare('SELECT COUNT(*) AS n FROM docs').get().n;
  if (!docs && fs.existsSync(SEED)) {
    const s = JSON.parse(fs.readFileSync(SEED, 'utf8'));
    const ins = db.prepare('INSERT OR REPLACE INTO docs VALUES (?,?,?,?,?)');
    const now = new Date().toISOString();
    db.exec('BEGIN');
    for (const g of s.guests) ins.run('guests', g.id, JSON.stringify(g), now, 'seed');
    for (const [venue, c] of Object.entries(s.catalog)) {
      for (const b of c.brands) ins.run('brands', b.id, JSON.stringify({ ...b, venue }), now, 'seed');
      for (const f of c.flavors) ins.run('flavors', f.id, JSON.stringify({ ...f, venue }), now, 'seed');
    }
    for (const i of s.inventories) ins.run('inventories', i.id, JSON.stringify(i), now, 'seed');
    ins.run('settings', 'main', JSON.stringify({ id: 'main', telegram: '', coverWeeks: 1.5, reserve: 30, minStep: 40 }), now, 'seed');
    db.exec('COMMIT');
    console.log('Данные импортированы из seed.json');
  }
}
seed();

// ---------- http-утилиты ----------
function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > 5e6) { reject(new Error('too big')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}
const userRow = (u) => u && ({ id: u.id, login: u.login, firstName: u.first_name, lastName: u.last_name, role: u.role });
function auth(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  if (!m) return null;
  const s = db.prepare('SELECT * FROM sessions WHERE token = ?').get(m[1]);
  if (!s || s.expires < Date.now()) return null;
  return db.prepare('SELECT * FROM users WHERE id = ?').get(s.user_id) || null;
}
const loginAttempts = new Map();

// ---------- статика ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.json': 'application/json' };
function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': p === '/index.html' ? 'no-cache' : 'public, max-age=300' });
    res.end(buf);
  });
}

// ---------- API ----------
async function api(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean).slice(1); // без 'api'
  const method = req.method;

  if (parts[0] === 'auth' && parts[1] === 'login' && method === 'POST') {
    const ip = req.socket.remoteAddress;
    const a = loginAttempts.get(ip) || { n: 0, t: Date.now() };
    if (Date.now() - a.t > 15 * 60000) { a.n = 0; a.t = Date.now(); }
    if (a.n >= 10) return send(res, 429, { error: 'Слишком много попыток, подождите 15 минут' });
    const { login, password } = await readBody(req);
    const u = db.prepare('SELECT * FROM users WHERE login = ?').get(String(login || '').trim());
    if (!u || !checkPassword(String(password || ''), u.hash)) { a.n++; loginAttempts.set(ip, a); return send(res, 401, { error: 'Неверный логин или пароль' }); }
    loginAttempts.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(token, u.id, Date.now() + SESSION_DAYS * 864e5);
    db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
    return send(res, 200, { token, user: userRow(u) });
  }

  const me = auth(req);
  if (!me) return send(res, 401, { error: 'Нужно войти' });
  const isAdmin = me.role === 'admin';

  if (parts[0] === 'auth') {
    if (parts[1] === 'me') return send(res, 200, userRow(me));
    if (parts[1] === 'logout') { db.prepare('DELETE FROM sessions WHERE token = ?').run(req.headers.authorization.slice(7)); return send(res, 200, { ok: true }); }
    if (parts[1] === 'password' && method === 'POST') {
      const { oldPassword, newPassword } = await readBody(req);
      if (!checkPassword(String(oldPassword || ''), me.hash)) return send(res, 400, { error: 'Текущий пароль неверный' });
      if (String(newPassword || '').length < 4) return send(res, 400, { error: 'Пароль слишком короткий' });
      db.prepare('UPDATE users SET hash = ? WHERE id = ?').run(hashPassword(newPassword), me.id);
      return send(res, 200, { ok: true });
    }
  }

  if (parts[0] === 'all' && method === 'GET') {
    const out = { settings: {}, guests: [], brands: [], flavors: [], inventories: [], shifts: [], orders: [] };
    for (const r of db.prepare("SELECT col, data FROM docs WHERE col IN ('guests','brands','flavors','inventories','settings')").all()) {
      const d = JSON.parse(r.data);
      if (r.col === 'settings') { if (d.id === 'main') out.settings = d; } else out[r.col].push(d);
    }
    const since = new Date(Date.now() - 3 * 864e5).toISOString();
    for (const col of ['shifts', 'orders']) out[col] = db.prepare('SELECT data FROM docs WHERE col = ? AND updated_at > ? ORDER BY updated_at').all(col, since).map((r) => JSON.parse(r.data));
    return send(res, 200, out);
  }

  if (parts[0] === 'c' && COLLECTIONS.has(parts[1])) {
    const col = parts[1];
    let id = parts[2] ? decodeURIComponent(parts[2]) : '';
    if (method === 'GET') return send(res, 200, db.prepare('SELECT data FROM docs WHERE col = ?').all(col).map((r) => JSON.parse(r.data)));
    if (ADMIN_ONLY_WRITE.has(col) && !isAdmin) return send(res, 403, { error: 'Только для старшего КМ' });
    if (method === 'PUT') {
      const doc = await readBody(req);
      if (!id || id === 'new') id = doc.id || newId();
      if (!/^[\w.-]{1,64}$/.test(id)) return send(res, 400, { error: 'Неверный id' });
      const now = new Date().toISOString();
      const data = { ...doc, id, updatedAt: now };
      db.prepare('INSERT OR REPLACE INTO docs VALUES (?,?,?,?,?)').run(col, id, JSON.stringify(data), now, me.id);
      return send(res, 200, data);
    }
    if (method === 'DELETE') {
      if (['inventories', 'settings'].includes(col) && !isAdmin) return send(res, 403, { error: 'Только для старшего КМ' });
      db.prepare('DELETE FROM docs WHERE col = ? AND id = ?').run(col, id);
      return send(res, 200, { ok: true });
    }
  }

  if (parts[0] === 'users') {
    if (!isAdmin) return send(res, 403, { error: 'Только для старшего КМ' });
    if (method === 'GET') return send(res, 200, db.prepare('SELECT * FROM users ORDER BY last_name').all().map(userRow));
    if (method === 'POST' || method === 'PUT') {
      const u = await readBody(req);
      const login = String(u.login || '').trim();
      if (!login || !String(u.lastName || '').trim()) return send(res, 400, { error: 'Нужны логин и фамилия' });
      const clash = db.prepare('SELECT id FROM users WHERE login = ?').get(login);
      const id = method === 'PUT' ? parts[1] : newId();
      if (clash && clash.id !== id) return send(res, 400, { error: 'Такой логин уже есть' });
      const role = u.role === 'admin' ? 'admin' : 'km';
      if (method === 'POST') {
        if (String(u.password || '').length < 4) return send(res, 400, { error: 'Пароль от 4 символов' });
        db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?)').run(id, login, hashPassword(u.password), u.firstName || '', u.lastName, role);
      } else {
        db.prepare('UPDATE users SET login=?, first_name=?, last_name=?, role=? WHERE id=?').run(login, u.firstName || '', u.lastName, role, id);
        if (u.password) db.prepare('UPDATE users SET hash=? WHERE id=?').run(hashPassword(u.password), id);
      }
      return send(res, 200, { ok: true, id });
    }
    if (method === 'DELETE') {
      if (parts[1] === me.id) return send(res, 400, { error: 'Нельзя удалить себя' });
      db.prepare('DELETE FROM users WHERE id = ?').run(parts[1]);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(parts[1]);
      return send(res, 200, { ok: true });
    }
  }
  return send(res, 404, { error: 'Не найдено' });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
    serveStatic(req, res);
  } catch (e) {
    console.error(e);
    send(res, 500, { error: 'Ошибка сервера' });
  }
}).listen(PORT, () => console.log(`KM Box: http://localhost:${PORT}`));
