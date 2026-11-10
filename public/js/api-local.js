/* KM Box — демо-режим без сервера: данные в браузере (localStorage, иначе в памяти) */
(function () {
  'use strict';
  const KEY = 'kmbox.demo.v1';
  let mem = null;
  const uid = () => Math.random().toString(36).slice(2, 12);

  function seedDb() {
    const s = window.KM_SEED;
    const db = { users: [], sessions: {}, guests: [], brands: [], flavors: [], inventories: [], shifts: [], orders: [], settings: [], mixes: [] };
    db.users.push({ id: 'u1', login: 'admin', password: 'admin', firstName: 'Александр', lastName: 'Железной', role: 'admin' });
    db.users.push({ id: 'u2', login: 'km', password: 'km', firstName: 'Кальянный', lastName: 'Савенко', role: 'km' });
    db.guests = s.guests.map((g) => ({ ...g }));
    for (const [venue, c] of Object.entries(s.catalog)) {
      for (const b of c.brands) db.brands.push({ ...b, venue });
      for (const f of c.flavors) db.flavors.push({ ...f, venue });
    }
    db.inventories = s.inventories.map((i) => ({ ...i }));
    db.settings = [{ id: 'main', telegram: '', coverWeeks: 1.5, reserve: 30, minStep: 40 }];
    return db;
  }
  function load() {
    if (mem) return mem;
    try { const raw = localStorage.getItem(KEY); if (raw) { mem = JSON.parse(raw); return mem; } } catch (e) { /* noop */ }
    mem = seedDb();
    save();
    return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* в памяти */ } }
  const publicUser = (u) => u && ({ id: u.id, login: u.login, firstName: u.firstName, lastName: u.lastName, role: u.role });
  let current = null;
  const delay = (v) => new Promise((r) => setTimeout(() => r(v), 60));
  const fail = (m) => Promise.reject(new Error(m));
  const COLS = ['guests', 'brands', 'flavors', 'inventories', 'shifts', 'orders', 'settings', 'mixes'];

  window.API = {
    mode: 'demo',
    async login(login, password) {
      const u = load().users.find((x) => x.login.toLowerCase() === String(login).trim().toLowerCase() && x.password === password);
      if (!u) return fail('Неверный логин или пароль');
      current = u.id;
      try { sessionStorage.setItem(KEY + '.me', u.id); } catch (e) { /* noop */ }
      return delay(publicUser(u));
    },
    async logout() { current = null; try { sessionStorage.removeItem(KEY + '.me'); } catch (e) { /* noop */ } },
    async me() {
      if (!current) { try { current = sessionStorage.getItem(KEY + '.me'); } catch (e) { /* noop */ } }
      return publicUser(load().users.find((u) => u.id === current)) || null;
    },
    async changePassword(oldPassword, newPassword) {
      const u = load().users.find((x) => x.id === current);
      if (!u || u.password !== oldPassword) return fail('Текущий пароль неверный');
      u.password = newPassword; save(); return { ok: true };
    },
    async loadAll() {
      const db = load();
      return delay({
        settings: db.settings.find((s) => s.id === 'main') || {},
        guests: db.guests, brands: db.brands, flavors: db.flavors, inventories: db.inventories,
        shifts: db.shifts.slice(-50), orders: db.orders.slice(-50), mixes: db.mixes || [],
      });
    },
    async put(col, doc) {
      if (!COLS.includes(col)) return fail('Неизвестная коллекция');
      const db = load();
      db[col] = db[col] || [];
      const d = { ...doc, id: doc.id || uid(), updatedAt: new Date().toISOString() };
      const i = db[col].findIndex((x) => x.id === d.id);
      if (i >= 0) db[col][i] = d; else db[col].push(d);
      save(); return delay(d);
    },
    async del(col, id) { const db = load(); db[col] = (db[col] || []).filter((x) => x.id !== id); save(); return { ok: true }; },
    async listUsers() { return load().users.map(publicUser); },
    async saveUser(u) {
      const db = load();
      const me = db.users.find((x) => x.id === current);
      if (!me || me.role !== 'admin') return fail('Только для старшего КМ');
      if (!u.login || !u.lastName) return fail('Нужны логин и фамилия');
      if (db.users.some((x) => x.login.toLowerCase() === u.login.toLowerCase() && x.id !== u.id)) return fail('Такой логин уже есть');
      if (u.id) {
        const x = db.users.find((y) => y.id === u.id);
        Object.assign(x, { login: u.login, firstName: u.firstName, lastName: u.lastName, role: u.role });
        if (u.password) x.password = u.password;
      } else {
        if (!u.password) return fail('Задайте пароль');
        db.users.push({ id: uid(), login: u.login, password: u.password, firstName: u.firstName, lastName: u.lastName, role: u.role || 'km' });
      }
      save(); return { ok: true };
    },
    async deleteUser(id) { const db = load(); if (id === current) return fail('Нельзя удалить себя'); db.users = db.users.filter((u) => u.id !== id); save(); return { ok: true }; },
    resetDemo() { mem = seedDb(); save(); },
  };
})();
