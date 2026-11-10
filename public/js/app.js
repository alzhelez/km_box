/* KM Box — интерфейс */
(function () {
  'use strict';
  const KM = window.KM, API = window.API;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = {
    get(k, d) { try { const v = localStorage.getItem('kmbox.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('kmbox.' + k, JSON.stringify(v)); } catch (e) { /* noop */ } },
    del(k) { try { localStorage.removeItem('kmbox.' + k); } catch (e) { /* noop */ } },
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const fmtG = (n) => (n == null || isNaN(n) ? '—' : Math.round(n) + '');

  // ---------------- иконки ----------------
  const I = {
    logo: '<svg viewBox="0 0 48 52" width="34" height="37" fill="none"><path d="M24 2 45 14v24L24 50 3 38V14z" stroke="#f9a01e" stroke-width="4"/><path d="M17 16c-4 5 4 8 0 13s4 8 0 11M24 14c-4 5 4 8 0 13s4 8 0 11M31 16c-4 5 4 8 0 13s4 8 0 11" stroke="#f9a01e" stroke-width="3" stroke-linecap="round"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11 12 4l9 7v9H5v-9"/><path d="M10 20v-6h4v6"/></svg>',
    shift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 11l2 2 4-4M9 17h6"/></svg>',
    order: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3c-2 3 2 4 0 7M13 3c-2 3 2 4 0 7"/><path d="M5 12h14l-2 5H7z"/><path d="M12 17v4M8 21h8"/></svg>',
    guests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.2 2.4 3.6 5.2"/></svg>',
    stock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16v13H4zM4 7l2-4h12l2 4M9 11h6"/></svg>',
    admin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.7 4.6V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    chev: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 6 6 6-6 6"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>',
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    tg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6 13.5l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.5 3c.9-.3 1.7.2 1.4 1.3z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.2 4 4 7.3 4c2 0 3.6 1.1 4.7 2.7C13.1 5.1 14.7 4 16.7 4 20 4 22.4 7.2 21.2 10.7 19.5 15.4 12 20 12 20z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
  };

  // ---------------- состояние ----------------
  const S = {
    user: null, data: null, venue: ls.get('venue', 'Авиатор'), route: 'home',
    shift: null, ord: null, mix: null, inv: null, invStep: 'fill',
    stockQ: '', stockLow: false, mixQ: '', mixVenue: 'cur', guestQ: '', guestVenue: 'all',
    timers: ls.get('timers', []),
  };
  const isAdmin = () => S.user && S.user.role === 'admin';
  const fullName = (u) => [u.firstName, u.lastName].filter(Boolean).join(' ');
  const settings = () => (S.data && S.data.settings) || {};

  // ---------------- утилиты UI ----------------
  let toastT;
  function toast(msg, kind) {
    let el = $('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.className = 'toast ' + (kind || '');
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(toastT);
    toastT = setTimeout(() => { el.style.display = 'none'; }, 3200);
  }
  function modal(html, onMount) {
    closeModal();
    const w = document.createElement('div');
    w.className = 'modal-wrap';
    w.id = 'modal';
    w.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    w.addEventListener('click', (e) => { if (e.target === w) closeModal(); });
    document.body.appendChild(w);
    if (onMount) onMount(w);
    return w;
  }
  function closeModal() { const m = $('#modal'); if (m) m.remove(); }
  function confirmBox(text, okLabel) {
    return new Promise((resolve) => {
      const w = modal(`<div class="mh"><h3>${esc(text)}</h3></div><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-x="no">Отмена</button><button class="btn primary" data-x="yes">${esc(okLabel || 'Да')}</button></div>`);
      w.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (!b) return; closeModal(); resolve(b.dataset.x === 'yes'); });
    });
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      try {
        const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy'); ta.remove(); return ok;
      } catch (e2) { return false; }
    }
  }

  // ---------------- данные ----------------
  function venueBrands(venue) { return S.data.brands.filter((b) => b.venue === (venue || S.venue)); }
  function venueFlavors(venue) {
    const ids = new Set(venueBrands(venue).map((b) => b.id));
    return S.data.flavors.filter((f) => ids.has(f.brandId));
  }
  function stockMap(venue) { return KM.currentStock(S.data.inventories, venue || S.venue); }
  function lastInv(venue) { const c = KM.sortedInv(S.data.inventories, venue || S.venue); return c[c.length - 1]; }
  async function save(col, doc) {
    const saved = await API.put(col, doc);
    const arr = S.data[col];
    if (Array.isArray(arr)) { const i = arr.findIndex((x) => x.id === saved.id); if (i >= 0) arr[i] = saved; else arr.push(saved); }
    return saved;
  }
  async function remove(col, id) { await API.del(col, id); S.data[col] = S.data[col].filter((x) => x.id !== id); }

  // ---------------- маршрутизация ----------------
  const ROUTES = ['home', 'shift', 'order', 'mixes', 'guests', 'stock', 'inventory', 'admin'];
  function go(r) { if (location.hash !== '#' + r) location.hash = r; else render(); }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  function currentRoute() { const h = location.hash.replace('#', ''); return ROUTES.includes(h) ? h : 'home'; }

  // ---------------- вход ----------------
  function renderLogin(err) {
    document.getElementById('app').innerHTML = `
      <div class="login"><form class="box" id="loginForm" autocomplete="on">
        <div class="logo">${I.logo.replace('width="34" height="37"', 'width="56" height="61"')}<div><h1>KM <span class="accent">Box</span></h1><div class="muted small">помощник кальянного мастера · H-Box</div></div></div>
        <div class="stripes" style="margin-bottom:22px"></div>
        <div class="stack">
          <label class="f"><span>Логин</span><input class="input" name="login" autocomplete="username" required autocapitalize="none"></label>
          <label class="f"><span>Пароль</span><input class="input" name="password" type="password" autocomplete="current-password" required></label>
          ${err ? `<div class="badge red">${esc(err)}</div>` : ''}
          <button class="btn primary block" type="submit">Войти</button>
          ${API.mode === 'demo' ? '<div class="hint">Демо-доступ: <b>admin / admin</b> (старший КМ) или <b>km / km</b>. Данные демо хранятся только в этом браузере.</div>' : ''}
        </div>
      </form></div>`;
    $('#loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try { S.user = await API.login(fd.get('login'), fd.get('password')); await boot(); } catch (er) { renderLogin(er.message); }
    });
  }

  async function boot() {
    S.user = S.user || await API.me();
    if (!S.user) return renderLogin();
    S.data = await API.loadAll();
    S.data.settings = S.data.settings || {};
    S.data.mixes = S.data.mixes || [];
    render();
    checkSunday();
  }

  // ---------------- каркас ----------------
  const NAV = [['home', 'Главная', I.home], ['shift', 'Смена', I.shift], ['order', 'Заказ', I.order], ['mixes', 'Миксы', I.heart], ['guests', 'Гости', I.guests], ['stock', 'Остатки', I.stock]];
  function shell(content) {
    const r = S.route === 'inventory' ? 'stock' : S.route;
    const nav = NAV.map(([k, t, ic]) => `<a class="nav ${r === k ? 'on' : ''}" href="#${k}">${ic}<span>${t}</span></a>`).join('');
    return `
    <div class="shell">
      <aside class="side">
        <a class="brand" href="#home">${I.logo}<span class="name">KM <b>BOX</b></span></a>
        ${nav}
        <a class="nav ${r === 'admin' ? 'on' : ''}" href="#admin">${I.admin}<span>Настройки</span></a>
        <div class="foot muted small">${esc(fullName(S.user))}<br>${isAdmin() ? 'старший КМ' : 'кальянный мастер'}${API.mode === 'demo' ? ' · демо' : ''}</div>
      </aside>
      <main class="main">
        <div class="topbar">
          <a class="brand" href="#home">${I.logo}<span class="name">KM <b>BOX</b></span></a>
          <div class="spacer"></div>
          <div class="venue-switch">${KM.VENUES.map((v) => `<button data-venue="${v}" class="${S.venue === v ? 'on' : ''}">${v}</button>`).join('')}</div>
          <a class="iconbtn" href="#admin" title="Настройки" style="${''}">${I.admin.replace('<svg ', '<svg width="18" height="18" ')}</a>
          ${timerPill()}
        </div>
        ${content}
      </main>
      <nav class="bottomnav">${NAV.map(([k, t, ic]) => `<a class="${r === k ? 'on' : ''}" href="#${k}">${ic}<span>${t}</span></a>`).join('')}</nav>
    </div>`;
  }

  function render() {
    if (!S.user || !S.data) return;
    S.route = currentRoute();
    const views = { home: vHome, shift: vShift, order: vOrder, mixes: vMixes, guests: vGuests, stock: vStock, inventory: vInventory, admin: vAdmin };
    document.getElementById('app').innerHTML = shell(views[S.route]());
    const after = { shift: afterShift, order: afterOrder, mixes: afterMixes, guests: afterGuests, stock: afterStock, inventory: afterInventory, admin: afterAdmin }[S.route];
    if (after) after();
  }

  document.addEventListener('click', (e) => {
    const v = e.target.closest('[data-venue]');
    if (v) { S.venue = v.dataset.venue; ls.set('venue', S.venue); S.mix = null; render(); checkSunday(); return; }
    const t = e.target.closest('.timer-pill');
    if (t) { timersModal(); }
  });

  // ================= ГЛАВНАЯ =================
  function vHome() {
    const inv = lastInv();
    const due = KM.inventoryDue(S.data.inventories, S.venue);
    const st = stockMap();
    const chain = KM.sortedInv(S.data.inventories, S.venue);
    const brandById = Object.fromEntries(venueBrands().map((b) => [b.id, b]));
    const low = venueFlavors().filter((f) => brandById[f.brandId] && brandById[f.brandId].kind === 'tob' && st[f.id] && st[f.id].stock < 40 && KM.usage(chain, f.id, 2).weekly > 15);
    const h = new Date().getHours();
    const hello = h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
    const shiftsToday = (S.data.shifts || []).filter((s) => s.venue === S.venue && s.date === KM.ymd(new Date()));
    return `
      <div class="stack">
        <div><div class="muted small">${hello}, ${esc(S.user.firstName || S.user.lastName)}</div><h1>${esc(S.venue)}</h1></div>
        <div class="stripes"></div>
        ${due ? `<div class="card" style="border-color:var(--accent)"><div class="row between wrap"><div><h3 class="accent">Необходимо заполнить инвенту</h3><div class="muted small">Воскресенье — пора посчитать остатки</div></div><a class="btn primary" href="#inventory">Заполнить</a></div></div>` : ''}
        <div class="grid two four">
          <button class="tile" data-go-shift="open"><span class="ico">${I.sun}</span><span class="t">Открыть смену</span></button>
          <button class="tile" data-go-shift="close"><span class="ico">${I.moon}</span><span class="t">Закрыть смену</span></button>
          <a class="tile hot" href="#order"><span class="ico">${I.order}</span><span class="t">Принять заказ</span></a>
          <a class="tile" href="#inventory"><span class="ico">${I.box}</span><span class="t">Инвента</span><span class="muted small">${inv ? 'последняя ' + KM.dmy(KM.fromYmd(inv.date)) : 'ещё не было'}</span></a>
        </div>
        ${S.timers.length ? `<div class="section"><h2>Таймеры</h2></div>${timersList()}` : ''}
        <div class="grid two">
          <div class="card"><div class="muted small">Смены сегодня</div><div class="head" style="font-size:20px;margin-top:4px">${shiftsToday.length ? shiftsToday.map((s) => (s.kind === 'open' ? 'Открытие' : 'Закрытие') + ' · ' + esc(s.responsible)).join('<br>') : '—'}</div></div>
          <a class="card" href="#stock" style="text-decoration:none;color:inherit"><div class="muted small">Заканчивается (&lt;40 г)</div><div class="head" style="font-size:20px;margin-top:4px">${low.length} поз.</div><div class="muted small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(low.slice(0, 4).map((f) => f.name).join(', '))}</div></a>
        </div>
      </div>`;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go-shift]');
    if (b) { S.shift = newShift(b.dataset.goShift); go('shift'); }
  });

  // ================= СМЕНА =================
  function newShift(kind) {
    const k = kind || (new Date().getHours() >= 4 && new Date().getHours() < 17 ? 'open' : 'close');
    return { kind: k, venue: S.venue, responsible: S.user.lastName || fullName(S.user), marks: KM.CHECKLISTS[k].items.map((x) => x[1]) };
  }
  function vShift() {
    if (!S.shift) S.shift = newShift();
    const sh = S.shift, cl = KM.CHECKLISTS[sh.kind];
    const d = KM.shiftDate(sh.kind);
    const moved = sh.kind === 'close' && new Date().getHours() < 4;
    const done = sh.marks.filter((m) => m && m !== 'Выкл').length;
    return `
      <div class="stack">
        <h1>Смена</h1>
        <div class="card stack">
          <div class="seg" data-g="kind">${[['open', 'Открытие'], ['close', 'Закрытие']].map(([k, t]) => `<button data-v="${k}" class="${sh.kind === k ? 'on' : ''}">${t}</button>`).join('')}</div>
          <div><div class="muted small" style="margin-bottom:6px">Заведение</div><div class="seg" data-g="venue">${KM.VENUES.map((v) => `<button data-v="${v}" class="${sh.venue === v ? 'on' : ''}">${v}</button>`).join('')}</div></div>
          <div class="grid two">
            <label class="f"><span>Ответственный</span><input class="input" id="shResp" value="${esc(sh.responsible)}"></label>
            <label class="f"><span>Дата в отчёте</span><input class="input" value="${KM.dmy(d)}" disabled></label>
          </div>
          ${moved ? '<div class="hint">Закрытие после полуночи — в отчёт ставится дата предыдущего дня.</div>' : ''}
        </div>
        <div class="section"><h2>${cl.title}</h2><span class="badge acc">${done}/${cl.items.length}</span></div>
        <div class="list" id="clList">
          ${cl.items.map(([t, def], i) => `<div class="cl-item" data-i="${i}"><span class="txt">${esc(t)}</span><span class="mark ${sh.marks[i] && sh.marks[i] !== 'Выкл' ? 'on' : ''}">${esc(sh.marks[i] || '—')}</span></div>`).join('')}
        </div>
        <div class="hint">Нажмите на пункт, чтобы снять или вернуть отметку.</div>
        <div class="sticky-actions"><button class="btn primary" id="shMake">Сформировать скрин</button></div>
      </div>`;
  }
  function afterShift() {
    const sh = S.shift;
    document.querySelectorAll('.seg[data-g] button').forEach((b) => b.addEventListener('click', () => {
      const g = b.parentElement.dataset.g;
      if (g === 'kind' && sh.kind !== b.dataset.v) { const resp = sh.responsible; S.shift = newShift(b.dataset.v); S.shift.venue = sh.venue; S.shift.responsible = resp; }
      if (g === 'venue') sh.venue = b.dataset.v;
      render();
    }));
    $('#shResp').addEventListener('input', (e) => { sh.responsible = e.target.value; });
    $('#clList').addEventListener('click', (e) => {
      const it = e.target.closest('.cl-item'); if (!it) return;
      const i = +it.dataset.i, def = KM.CHECKLISTS[sh.kind].items[i][1];
      if (def === 'Вкл') sh.marks[i] = sh.marks[i] === 'Вкл' ? 'Выкл' : 'Вкл';
      else sh.marks[i] = sh.marks[i] ? '' : def;
      const m = it.querySelector('.mark');
      m.textContent = sh.marks[i] || '—';
      m.classList.toggle('on', !!sh.marks[i] && sh.marks[i] !== 'Выкл');
      $('.section .badge').textContent = sh.marks.filter((x) => x && x !== 'Выкл').length + '/' + sh.marks.length;
    });
    $('#shMake').addEventListener('click', makeShot);
  }

  /** Рисуем «обрезанный скриншот» таблицы на canvas */
  function drawChecklist(sh) {
    const cl = KM.CHECKLISTS[sh.kind];
    const d = KM.shiftDate(sh.kind);
    const sc = 2, W = 560, colA = 430, rowH = 21, pad = 10;
    const rows = cl.items.length;
    const H = pad * 2 + rowH * 2 + 8 + rowH * rows + rowH * 2.2;
    const c = document.createElement('canvas');
    c.width = W * sc; c.height = H * sc;
    const x = c.getContext('2d');
    x.scale(sc, sc);
    x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#000'; x.fillStyle = '#000'; x.textBaseline = 'middle';
    const L = pad, R = W - pad;
    let y = pad;
    const cell = (x0, x1, y0, h, text, opts) => {
      opts = opts || {};
      x.font = `${opts.bold ? 'bold ' : ''}${opts.size || 12.5}px Arial, Helvetica, sans-serif`;
      x.textAlign = opts.align || 'left';
      const tx = opts.align === 'center' ? (x0 + x1) / 2 : x0 + 4;
      let t = String(text);
      while (x.measureText(t).width > x1 - x0 - 8 && t.length > 3) t = t.slice(0, -2) + '…';
      x.fillText(t, tx, y0 + h / 2 + 0.5);
    };
    // шапка
    x.lineWidth = 1;
    cell(L, R, y, rowH * 1.2, 'НАЗВАНИЕ ЗАВЕДЕНИЕ: ' + sh.venue, { align: 'center', size: 13 });
    y += rowH * 1.2;
    x.lineWidth = 1.5; x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke();
    const dateTxt = sh.kind === 'open' ? 'ДАТА ' + KM.dmy(d) : KM.dmy(d);
    cell(L, L + colA, y, rowH * 1.2, dateTxt, { align: 'center', size: 13 });
    cell(L + colA, R, y, rowH * 1.2, cl.title, { align: 'center', size: 13 });
    y += rowH * 1.2;
    const top = y;
    // строки
    cl.items.forEach(([t], i) => {
      cell(L, L + colA, y, rowH, t);
      const m = sh.marks[i] || '';
      cell(L + colA, R, y, rowH, m, { align: m === '+' ? 'center' : 'left', size: 13 });
      y += rowH;
    });
    // сетка
    x.lineWidth = 0.8;
    for (let i = 0; i <= rows; i++) { x.beginPath(); x.moveTo(L, top + i * rowH); x.lineTo(R, top + i * rowH); x.stroke(); }
    x.beginPath(); x.moveTo(L, top); x.lineTo(L, y); x.moveTo(L + colA, top - rowH * 1.2); x.lineTo(L + colA, y); x.stroke();
    x.lineWidth = 2; x.strokeRect(L, top - rowH * 1.2, R - L, y - top + rowH * 1.2);
    y += rowH * 0.9;
    cell(L, L + colA, y, rowH, `${cl.responsibleLabel}: ${sh.responsible || ''}`, { align: sh.kind === 'open' ? 'center' : 'left', size: 13 });
    return c;
  }

  async function makeShot() {
    const sh = S.shift;
    const canvas = drawChecklist(sh);
    const url = canvas.toDataURL('image/png');
    const d = KM.shiftDate(sh.kind);
    const fname = `${sh.kind === 'open' ? 'открытие' : 'закрытие'}_${sh.venue}_${KM.dmy(d)}.png`;
    try {
      await save('shifts', { id: uid(), kind: sh.kind, venue: sh.venue, date: KM.ymd(d), responsible: sh.responsible, userId: S.user.id, missed: KM.CHECKLISTS[sh.kind].items.filter((_, i) => !sh.marks[i] || sh.marks[i] === 'Выкл').map((x) => x[0]), at: new Date().toISOString() });
    } catch (e) { /* лог смены не критичен */ }
    modal(`
      <div class="mh"><h3>${sh.kind === 'open' ? 'Открытие' : 'Закрытие'} · ${esc(sh.venue)}</h3><button class="iconbtn" data-close>${I.close}</button></div>
      <img class="shot" src="${url}" alt="Скрин чек-листа">
      <div class="hint">Если кнопки ниже недоступны — зажмите картинку (или ПКМ) → «Сохранить/Копировать изображение».</div>
      <div class="grid two" style="margin-top:12px">
        <button class="btn primary" id="shShare">${I.tg} Поделиться</button>
        <button class="btn" id="shCopy">Копировать</button>
        ${API.mode === 'demo' ? '' : `<a class="btn" id="shDl" href="${url}" download="${esc(fname)}">Скачать PNG</a>`}
        <button class="btn ghost" data-close>Готово</button>
      </div>`, (w) => {
      w.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
      $('#shShare').addEventListener('click', async () => {
        try {
          const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
          const file = new File([blob], fname, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: fname });
          else throw new Error('no share');
        } catch (e) { if (e && e.name === 'AbortError') return; toast('Поделиться не поддерживается здесь — скачайте или скопируйте картинку', 'err'); }
      });
      $('#shCopy').addEventListener('click', async () => {
        try {
          const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          toast('Картинка скопирована — вставьте в чат', 'ok');
        } catch (e) { toast('Браузер не дал скопировать картинку — зажмите её и выберите «Копировать»', 'err'); }
      });
    });
  }

  // ================= ГОСТИ =================
  const GUEST_FIELDS = [
    ['name', 'Имя гостя', 'input'], ['venue', 'Заведение', 'venue'], ['phone', 'Телефон', 'input'],
    ['hookah', 'Модель кальяна', 'input'], ['likes', 'Табаки и вкусы', 'textarea'], ['dislikes', 'Нелюбимые вкусы', 'textarea'],
    ['bowl', 'Чаша', 'input'], ['strength', 'Крепость', 'strength'], ['heat', 'Жар', 'input'], ['notes', 'Примечания', 'textarea'],
  ];
  function vGuests() {
    const q = S.guestQ.trim().toLowerCase();
    let list = S.data.guests.slice();
    if (S.guestVenue !== 'all') list = list.filter((g) => g.venue === S.guestVenue);
    if (q) list = list.filter((g) => (g.name + ' ' + (g.phone || '')).toLowerCase().includes(q));
    list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return `
      <div class="stack">
        <div class="row between"><h1>Постоянные гости</h1><button class="btn primary sm" id="gAdd">${I.plus} Гость</button></div>
        <div class="search">${I.search}<input class="input" id="gSearch" placeholder="Поиск по имени" value="${esc(S.guestQ)}"></div>
        <div class="seg" id="gVenue">${[['all', 'Все'], ...KM.VENUES.map((v) => [v, v])].map(([k, t]) => `<button data-v="${k}" class="${S.guestVenue === k ? 'on' : ''}">${t}</button>`).join('')}</div>
        <div class="list" id="gList">${list.length ? list.map((g) => `
          <div class="li" data-id="${g.id}"><div class="avatar">${esc((g.name || '?').trim()[0] || '?')}</div>
            <div class="grow"><div class="title">${esc(g.name)}</div><div class="sub">${esc(g.likes || g.hookah || '')}</div></div>
            <span class="badge">${esc(g.venue || '')}</span></div>`).join('') : '<div class="empty">Никого не нашли</div>'}</div>
        <div class="muted small">Всего: ${list.length}</div>
      </div>`;
  }
  function afterGuests() {
    const s = $('#gSearch');
    s.addEventListener('input', () => { S.guestQ = s.value; const pos = s.selectionStart; render(); const n = $('#gSearch'); n.focus(); n.setSelectionRange(pos, pos); });
    $('#gVenue').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { S.guestVenue = b.dataset.v; render(); } });
    $('#gList').addEventListener('click', (e) => { const li = e.target.closest('.li'); if (li) guestCard(li.dataset.id); });
    $('#gAdd').addEventListener('click', () => guestForm(null));
  }
  function guestCard(id) {
    const g = S.data.guests.find((x) => x.id === id); if (!g) return;
    const w = modal(`
      <div class="mh"><h2>${esc(g.name)}</h2><button class="iconbtn" data-close>${I.close}</button></div>
      <dl class="kv">${GUEST_FIELDS.slice(1).filter(([k]) => g[k]).map(([k, t]) => `<dt>${t}</dt><dd>${esc(g[k])}</dd>`).join('')}</dl>
      ${(S.data.mixes || []).filter((m) => m.guestId === g.id).length ? `<div class="section"><h3>Понравившиеся миксы</h3></div>${(S.data.mixes || []).filter((m) => m.guestId === g.id).map(mixRow).join('')}` : ''}
      ${g.updatedBy ? `<div class="hint">Изменено: ${esc(g.updatedBy)}${g.updatedAt ? ' · ' + new Date(g.updatedAt).toLocaleDateString('ru-RU') : ''}</div>` : ''}
      <div class="grid two" style="margin-top:16px">
        <button class="btn primary" data-a="order">${I.order.replace('<svg ', '<svg width="18" height="18" ')} Принять заказ</button>
        <button class="btn" data-a="edit">${I.edit} Редактировать</button>
        <button class="btn danger" data-a="del">Удалить</button>
        <button class="btn ghost" data-close>Закрыть</button>
      </div>`);
    w.addEventListener('click', async (e) => {
      if (e.target.closest('[data-close]')) return closeModal();
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'edit') guestForm(g);
      if (a.dataset.a === 'order') { closeModal(); S.ord = newOrder(g); S.mix = null; go('order'); }
      if (a.dataset.a === 'del') { if (await confirmBox(`Удалить гостя «${g.name}»?`, 'Удалить')) { await remove('guests', g.id); toast('Удалено'); render(); } }
    });
  }
  function guestForm(g) {
    const isNew = !g;
    g = g || { venue: S.venue };
    const w = modal(`
      <div class="mh"><h2>${isNew ? 'Новый гость' : 'Редактирование'}</h2><button class="iconbtn" data-close>${I.close}</button></div>
      <form id="gForm" class="stack">
        ${GUEST_FIELDS.map(([k, t, type]) => {
          if (type === 'venue') return `<label class="f"><span>${t}</span><select class="input" name="${k}">${KM.VENUES.map((v) => `<option ${g.venue === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`;
          if (type === 'strength') return `<label class="f"><span>${t}</span><select class="input" name="${k}"><option value="">—</option>${KM.STRENGTHS.map((v) => `<option ${g.strength === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`;
          if (type === 'textarea') return `<label class="f"><span>${t}</span><textarea class="input" name="${k}">${esc(g[k])}</textarea></label>`;
          return `<label class="f"><span>${t}</span><input class="input" name="${k}" value="${esc(g[k])}" ${k === 'name' ? 'required' : ''} ${k === 'phone' ? 'inputmode="tel"' : ''}></label>`;
        }).join('')}
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Отмена</button><button class="btn primary" type="submit">Сохранить</button></div>
      </form>`);
    w.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
    $('#gForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const doc = { ...g, id: g.id || uid() };
      for (const [k] of GUEST_FIELDS) doc[k] = String(fd.get(k) || '').trim();
      doc.updatedBy = fullName(S.user);
      try { await save('guests', doc); closeModal(); toast('Сохранено', 'ok'); render(); } catch (er) { toast(er.message, 'err'); }
    });
  }

  // ================= ОСТАТКИ =================
  function brandBlocks(venue) {
    const flv = venueFlavors(venue);
    return venueBrands(venue).map((b) => ({ b, items: flv.filter((f) => f.brandId === b.id && !f.hidden) }));
  }
  function vStock() {
    const inv = lastInv();
    const st = stockMap();
    const chain = KM.sortedInv(S.data.inventories, S.venue);
    const q = S.stockQ.trim().toLowerCase();
    let blocks = brandBlocks().map(({ b, items }) => {
      let it = items.map((f) => ({ f, s: st[f.id] ? st[f.id].stock : null, u: b.kind === 'tob' ? KM.usage(chain, f.id, 2) : null }));
      if (q) it = it.filter((x) => (x.f.name + ' ' + b.name).toLowerCase().includes(q));
      if (S.stockLow) it = it.filter((x) => x.s != null && x.u && x.s < Math.max(40, x.u.weekly));
      return { b, it, total: it.reduce((a, x) => a + (b.kind === 'tob' ? x.s || 0 : 0), 0) };
    }).filter((x) => x.it.length);
    const open = !!q || S.stockLow;
    return `
      <div class="stack">
        <div class="row between wrap"><h1>Остатки · ${esc(S.venue)}</h1><a class="btn primary" href="#inventory">${I.box.replace('<svg ', '<svg width="18" height="18" ')} Заполнить инвенту</a></div>
        <div class="muted small">${inv ? `Последняя инвента: <b style="color:#fff">${KM.dmy(KM.fromYmd(inv.date))}</b>${inv.author ? ' · ' + esc(inv.author) : ''}` : 'Инвент ещё не было'}</div>
        <div class="search">${I.search}<input class="input" id="stQ" placeholder="Поиск вкуса или бренда" value="${esc(S.stockQ)}"></div>
        <label class="check"><input type="checkbox" id="stLow" ${S.stockLow ? 'checked' : ''}> Только то, что заканчивается</label>
        <div>${blocks.length ? blocks.map(({ b, it, total }) => `
          <details class="blk" ${open ? 'open' : ''}>
            <summary><span class="bn">${esc(b.name)}</span>${b.kind === 'tob' ? `<span class="badge">${fmtG(total)} г</span>` : ''}<span class="chev">${I.chev}</span></summary>
            ${b.kind === 'tob' ? `<div class="fl" style="padding-top:4px;padding-bottom:4px"><span class="muted small">${esc(b.category || '')} · шаг пополнения ${b.step || 40} г</span><span class="muted small">остаток</span><span class="muted small">в нед.</span></div>` : ''}
            ${it.map(({ f, s, u }) => `<div class="fl ${u && s != null && s < Math.max(40, u.weekly) ? 'low' : ''}"><div class="nm">${esc(f.name)}</div><span class="num st">${s == null ? '—' : fmtG(s) + (b.kind === 'tob' ? ' г' : ' ' + (f.unit || 'шт'))}</span><span class="num muted">${u ? fmtG(u.weekly) : ''}</span></div>`).join('')}
            <div class="row" style="padding:10px 14px;border-top:1px solid var(--line)"><button class="btn sm ghost" data-addfl="${b.id}">${I.plus} Вкус</button>${isAdmin() && b.kind === 'tob' ? `<button class="btn sm ghost" data-editbr="${b.id}">${I.edit} Бренд</button>` : ''}</div>
          </details>`).join('') : '<div class="empty">Ничего не найдено</div>'}</div>
        ${isAdmin() ? `<button class="btn ghost" id="addBrand">${I.plus} Новый бренд</button>` : ''}
      </div>`;
  }
  function afterStock() {
    const q = $('#stQ');
    q.addEventListener('input', () => { S.stockQ = q.value; const p = q.selectionStart; render(); const n = $('#stQ'); n.focus(); n.setSelectionRange(p, p); });
    $('#stLow').addEventListener('change', (e) => { S.stockLow = e.target.checked; render(); });
    document.querySelectorAll('[data-addfl]').forEach((b) => b.addEventListener('click', () => flavorForm(b.dataset.addfl)));
    document.querySelectorAll('[data-editbr]').forEach((b) => b.addEventListener('click', () => brandForm(S.data.brands.find((x) => x.id === b.dataset.editbr))));
    const ab = $('#addBrand'); if (ab) ab.addEventListener('click', () => brandForm(null));
  }
  function flavorForm(brandId, after) {
    const b = S.data.brands.find((x) => x.id === brandId);
    const w = modal(`
      <div class="mh"><h3>Новый вкус · ${esc(b.name)}</h3><button class="iconbtn" data-close>${I.close}</button></div>
      <form class="stack" id="flForm">
        <label class="f"><span>Название (можно с описанием в скобках)</span><input class="input" name="name" required></label>
        <label class="f"><span>Профиль вкуса (для подбора миксов)</span><div class="chips" id="flTags">${Object.entries(KM.TAGS).map(([k, t]) => `<button type="button" class="chip" data-t="${k}">${t.label}</button>`).join('')}</div></label>
        <div class="hint">Если не отметить — профиль определится по названию автоматически.</div>
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Отмена</button><button class="btn primary">Добавить</button></div>
      </form>`);
    w.querySelectorAll('[data-close]').forEach((x) => x.addEventListener('click', closeModal));
    $('#flTags').addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) c.classList.toggle('on'); });
    $('#flForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = new FormData(e.target).get('name').trim();
      const tags = [...document.querySelectorAll('#flTags .chip.on')].map((c) => c.dataset.t);
      const doc = { id: uid(), brandId, venue: b.venue, name, unit: b.kind === 'tob' ? 'г' : 'шт' };
      if (tags.length) doc.tags = tags;
      try { await save('flavors', doc); closeModal(); toast('Вкус добавлен', 'ok'); if (after) after(doc); else render(); } catch (er) { toast(er.message, 'err'); }
    });
  }
  function brandForm(b) {
    const isNew = !b;
    b = b || { venue: S.venue, kind: 'tob', step: 100 };
    const w = modal(`
      <div class="mh"><h3>${isNew ? 'Новый бренд' : esc(b.name)} · ${esc(b.venue)}</h3><button class="iconbtn" data-close>${I.close}</button></div>
      <form class="stack" id="brForm">
        <label class="f"><span>Название</span><input class="input" name="name" value="${esc(b.name)}" required></label>
        <label class="f"><span>Категория</span><input class="input" name="category" value="${esc(b.category)}" placeholder="Классика, Благородное сырьё…"></label>
        <div class="grid two">
          <label class="f"><span>Шаг пополнения, г</span><input class="input" name="step" type="number" min="40" step="5" value="${b.step || 40}"></label>
          <label class="f"><span>Крепость 1–5</span><input class="input" name="strength" type="number" min="1" max="5" value="${b.strength || KM.defaultBrandStrength(b.name || '')}"></label>
        </div>
        <div class="hint">Шаг — минимальная фасовка для дозаказа (не меньше 40 г). Крепость используется при подборе миксов.</div>
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Отмена</button><button class="btn primary">Сохранить</button></div>
      </form>`);
    w.querySelectorAll('[data-close]').forEach((x) => x.addEventListener('click', closeModal));
    $('#brForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const doc = { ...b, id: b.id || uid(), name: fd.get('name').trim(), category: fd.get('category').trim(), step: Math.max(40, +fd.get('step') || 40), strength: Math.min(5, Math.max(1, +fd.get('strength') || 3)) };
      try { await save('brands', doc); S.data.flavors.forEach((f) => { if (f.brandId === doc.id) delete f._p; }); closeModal(); toast('Сохранено', 'ok'); render(); } catch (er) { toast(er.message, 'err'); }
    });
  }

  // ================= ИНВЕНТА =================
  function invDraftKey() { return 'invdraft.' + S.venue; }
  function startInv() {
    const draft = ls.get(invDraftKey(), null);
    if (draft && draft.date === KM.ymd(new Date())) { S.inv = draft; return; }
    S.inv = { venue: S.venue, date: KM.ymd(new Date()), values: {}, orders: {} };
  }
  function vInventory() {
    if (!S.inv || S.inv.venue !== S.venue) { startInv(); S.invStep = 'fill'; }
    return S.invStep === 'calc' ? vInvCalc() : vInvFill();
  }
  function vInvFill() {
    const prev = stockMap();
    const blocks = brandBlocks();
    const all = blocks.reduce((a, x) => a + x.items.length, 0);
    const filled = Object.values(S.inv.values).filter((v) => v !== '' && v != null).length;
    return `
      <div class="stack">
        <div class="row between wrap"><h1>Инвента · ${esc(S.venue)}</h1><a class="btn ghost sm" href="#stock">Назад</a></div>
        <div class="card grid two">
          <label class="f"><span>Заполняет</span><input class="input" value="${esc(fullName(S.user))}" disabled></label>
          <label class="f"><span>Дата</span><input class="input" value="${KM.dmy(KM.fromYmd(S.inv.date))}" disabled></label>
        </div>
        <div><div class="row between small"><span class="muted">Заполнено</span><span id="invProg">${filled} / ${all}</span></div><div class="bar" style="margin-top:6px"><i id="invBar" style="width:${all ? (filled / all) * 100 : 0}%"></i></div></div>
        <div class="hint">Вписывайте фактический вес в граммах (аксессуары — в штуках). Серым — прошлый остаток. Черновик сохраняется автоматически.</div>
        <div id="invBlocks">${blocks.map(({ b, items }, bi) => {
          const n = items.filter((f) => S.inv.values[f.id] !== undefined && S.inv.values[f.id] !== '').length;
          return `<details class="blk" ${bi === 0 ? 'open' : ''} data-b="${b.id}">
            <summary><span class="bn">${esc(b.name)}</span><span class="badge ${n === items.length ? 'green' : ''}" data-cnt>${n}/${items.length}</span><span class="chev">${I.chev}</span></summary>
            ${items.map((f) => { const v = S.inv.values[f.id]; const p = prev[f.id] ? prev[f.id].stock : null; return `<div class="fl ${v !== undefined && v !== '' ? 'filled' : ''}"><div class="nm">${esc(f.name)}<small>было: ${p == null ? '—' : fmtG(p)}</small></div><span class="muted small">${b.kind === 'tob' ? 'г' : f.unit || 'шт'}</span><input class="input" inputmode="decimal" data-f="${f.id}" value="${v == null ? '' : esc(v)}" placeholder="${p == null ? '' : fmtG(p)}"></div>`; }).join('')}
            <div class="row" style="padding:10px 14px;border-top:1px solid var(--line)"><button class="btn sm ghost" data-zero="${b.id}">Пустые = 0</button><button class="btn sm ghost" data-addfl="${b.id}">${I.plus} Вкус</button></div>
          </details>`;
        }).join('')}</div>
        <div class="sticky-actions"><button class="btn primary" id="invCalc">Рассчитать заказ</button></div>
      </div>`;
  }
  function saveDraft() { ls.set(invDraftKey(), S.inv); }
  function afterInventory() {
    if (S.invStep === 'calc') return afterInvCalc();
    const root = $('#invBlocks');
    const all = root.querySelectorAll('input[data-f]').length;
    root.addEventListener('input', (e) => {
      const i = e.target.closest('input[data-f]'); if (!i) return;
      const v = i.value.replace(',', '.').replace(/[^\d.]/g, '');
      if (v !== i.value.replace(',', '.')) i.value = v;
      if (v === '') delete S.inv.values[i.dataset.f]; else S.inv.values[i.dataset.f] = v;
      i.closest('.fl').classList.toggle('filled', v !== '');
      const blk = i.closest('details');
      const ins = [...blk.querySelectorAll('input[data-f]')];
      const n = ins.filter((x) => x.value !== '').length;
      const c = blk.querySelector('[data-cnt]'); c.textContent = n + '/' + ins.length; c.classList.toggle('green', n === ins.length);
      const filled = Object.keys(S.inv.values).length;
      $('#invProg').textContent = filled + ' / ' + all; $('#invBar').style.width = (filled / all) * 100 + '%';
      saveDraft();
    });
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const ins = [...root.querySelectorAll('input[data-f]')];
      const i = ins.indexOf(e.target); if (i < 0) return;
      e.preventDefault();
      const nx = ins[i + 1]; if (nx) { const d = nx.closest('details'); if (!d.open) d.open = true; nx.focus(); }
    });
    root.querySelectorAll('[data-zero]').forEach((b) => b.addEventListener('click', () => {
      const blk = b.closest('details');
      blk.querySelectorAll('input[data-f]').forEach((i) => { if (i.value === '') { i.value = '0'; S.inv.values[i.dataset.f] = '0'; } });
      saveDraft(); render();
    }));
    root.querySelectorAll('[data-addfl]').forEach((b) => b.addEventListener('click', () => flavorForm(b.dataset.addfl)));
    $('#invCalc').addEventListener('click', async () => {
      const empty = all - Object.keys(S.inv.values).length;
      if (empty > 0) {
        const ok = await confirmBox(`Не заполнено позиций: ${empty}. Посчитать их как 0 г?`, 'Да, считать 0');
        if (!ok) return;
        root.querySelectorAll('input[data-f]').forEach((i) => { if (i.value === '') S.inv.values[i.dataset.f] = '0'; });
      }
      computeOrders();
      S.invStep = 'calc'; saveDraft(); render(); window.scrollTo(0, 0);
    });
  }
  function computeOrders() {
    const chainPrev = KM.sortedInv(S.data.inventories, S.venue).filter((i) => i.date < S.inv.date);
    const items = {};
    for (const [fid, v] of Object.entries(S.inv.values)) items[fid] = { stock: +v || 0 };
    const chain = chainPrev.concat([{ date: S.inv.date, items }]);
    const brandById = Object.fromEntries(venueBrands().map((b) => [b.id, b]));
    const st = settings();
    S.inv.calc = {};
    S.inv.orders = {};
    for (const f of venueFlavors()) {
      const b = brandById[f.brandId];
      if (!b || b.kind !== 'tob') continue;
      const u = KM.usage(chain, f.id, 2);
      const q = KM.suggestOrder(items[f.id] ? items[f.id].stock : 0, u, b.step, { coverWeeks: +st.coverWeeks || 1.5, reserve: st.reserve != null ? +st.reserve : 30, minStep: +st.minStep || 40 });
      S.inv.calc[f.id] = { spent: u.spent, days: u.days, weekly: Math.round(u.weekly) };
      if (q) S.inv.orders[f.id] = q;
    }
  }
  function vInvCalc() {
    const blocks = brandBlocks();
    let total = 0;
    const html = blocks.map(({ b, items }) => {
      const rows = items.filter((f) => b.kind !== 'tob' || S.inv.orders[f.id] || S.inv.showAll);
      if (!rows.length) return '';
      const sum = rows.reduce((a, f) => a + (+S.inv.orders[f.id] || 0), 0);
      if (b.kind === 'tob') total += sum;
      return `<details class="blk" open><summary><span class="bn">${esc(b.name)}</span>${b.kind === 'tob' ? `<span class="badge acc">${sum} г</span>` : ''}<span class="chev">${I.chev}</span></summary>
        <div class="fl" style="padding-top:4px;padding-bottom:4px"><span class="muted small">${b.kind === 'tob' ? 'остаток · расход за 2 нед.' : 'остаток'}</span><span></span><span class="muted small">заказ</span></div>
        ${rows.map((f) => { const c = S.inv.calc[f.id] || {}; return `<div class="fl"><div class="nm">${esc(f.name)}<small>${fmtG(+S.inv.values[f.id])} ${b.kind === 'tob' ? 'г · ушло ' + fmtG(c.spent) + ' г' + (c.days && c.days !== 14 ? ' за ' + c.days + ' дн.' : '') : f.unit || 'шт'}</small></div><span></span><input class="input" inputmode="numeric" data-o="${f.id}" value="${S.inv.orders[f.id] || ''}" placeholder="0" ${b.kind === 'tob' ? `step="${b.step || 40}"` : ''}></div>`; }).join('')}
      </details>`;
    }).join('');
    return `
      <div class="stack">
        <div class="row between wrap"><h1>Заказ · ${esc(S.venue)}</h1><button class="btn ghost sm" id="invBack">← К остаткам</button></div>
        <div class="card"><div class="row between"><div><div class="muted small">Итого табака к заказу</div><div class="head" style="font-size:28px" id="invTotal">${total} г</div></div><div class="muted small" style="text-align:right">${esc(fullName(S.user))}<br>${KM.dmy(KM.fromYmd(S.inv.date))}</div></div></div>
        <div class="hint">Расчёт: расход за 2 недели (было + заказ − стало) → нужно на ${settings().coverWeeks || 1.5} нед. + резерв ${settings().reserve != null ? settings().reserve : 30} г − остаток, округлено вверх до шага бренда (Nuar — 200 г, Deus парфюм — 40 г, и т.д.). Количества можно поправить.</div>
        <label class="check"><input type="checkbox" id="invAll" ${S.inv.showAll ? 'checked' : ''}> Показать все позиции</label>
        <div id="invOrders">${html || '<div class="empty">По расчёту дозаказ не нужен</div>'}</div>
        <div class="sticky-actions"><button class="btn primary" id="invSave">Сохранить инвенту</button></div>
      </div>`;
  }
  function afterInvCalc() {
    $('#invBack').addEventListener('click', () => { S.invStep = 'fill'; render(); });
    $('#invAll').addEventListener('change', (e) => { S.inv.showAll = e.target.checked; render(); });
    $('#invOrders').addEventListener('input', (e) => {
      const i = e.target.closest('input[data-o]'); if (!i) return;
      const v = i.value.replace(/[^\d]/g, ''); i.value = v;
      if (v === '' || v === '0') delete S.inv.orders[i.dataset.o]; else S.inv.orders[i.dataset.o] = +v;
      saveDraft();
      const brandById = Object.fromEntries(venueBrands().map((b) => [b.id, b]));
      const fl = Object.fromEntries(venueFlavors().map((f) => [f.id, f]));
      const t = Object.entries(S.inv.orders).reduce((a, [k, q]) => a + (fl[k] && brandById[fl[k].brandId].kind === 'tob' ? q : 0), 0);
      $('#invTotal').textContent = t + ' г';
    });
    $('#invSave').addEventListener('click', saveInventory);
  }
  async function saveInventory() {
    const existing = S.data.inventories.find((i) => i.venue === S.venue && i.date === S.inv.date);
    const items = {};
    for (const [fid, v] of Object.entries(S.inv.values)) items[fid] = { stock: +v || 0 };
    for (const [fid, q] of Object.entries(S.inv.orders)) { items[fid] = items[fid] || { stock: null }; items[fid].order = q; }
    const doc = { id: existing ? existing.id : uid(), venue: S.venue, date: S.inv.date, author: fullName(S.user), authorId: S.user.id, items };
    try {
      await save('inventories', doc);
      ls.del(invDraftKey());
      const text = buildOrderText(doc);
      S.inv = null; S.invStep = 'fill';
      sendModal(text);
      go('stock');
    } catch (er) { toast(er.message, 'err'); }
  }
  function buildOrderText(doc) {
    const brandById = Object.fromEntries(venueBrands(doc.venue).map((b) => [b.id, b]));
    const lines = [];
    for (const f of venueFlavors(doc.venue)) {
      const it = doc.items[f.id]; if (!it || !it.order) continue;
      const b = brandById[f.brandId];
      lines.push({ brand: b.name, name: f.name, qty: it.order, unit: b.kind === 'tob' ? 'г' : (f.unit || 'шт') });
    }
    return KM.orderText(doc.venue, KM.dmy(KM.fromYmd(doc.date)), doc.author, lines);
  }
  function tgLink(text) {
    const u = (settings().telegram || '').replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '').trim();
    return u ? 'https://t.me/' + encodeURIComponent(u) : 'https://t.me/share/url?url=' + encodeURIComponent(' ') + '&text=' + encodeURIComponent(text);
  }
  function sendModal(text) {
    const w = modal(`
      <div class="mh"><h2>Инвента сохранена</h2><button class="iconbtn" data-close>${I.close}</button></div>
      <textarea class="input" style="min-height:220px;font-size:13px" readonly id="ordTxt">${esc(text)}</textarea>
      <div class="hint">${settings().telegram ? 'Текст заказа скопируется, откроется чат со старшим КМ — просто вставьте сообщение.' : 'Ник старшего КМ не задан в настройках — откроется выбор чата в Telegram.'}</div>
      <div class="grid two" style="margin-top:12px">
        <a class="btn primary" id="ordTg" href="${tgLink(text)}" target="_blank" rel="noopener">${I.tg} Отправить старшему КМ</a>
        <button class="btn" id="ordCopy">Скопировать текст</button>
      </div>`);
    w.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
    $('#ordTg').addEventListener('click', () => { copyText(text); });
    $('#ordCopy').addEventListener('click', async () => toast((await copyText(text)) ? 'Скопировано' : 'Не удалось скопировать', 'ok'));
  }

  // напоминание об инвенте
  function checkSunday() {
    if (!S.data || !KM.inventoryDue(S.data.inventories, S.venue)) return;
    const key = 'sundayDismiss.' + S.venue + '.' + KM.ymd(new Date());
    try { if (sessionStorage.getItem(key)) return; } catch (e) { /* noop */ }
    if ($('#modal') || S.route === 'inventory') return;
    const w = modal(`
      <div class="stripes" style="margin-bottom:16px"></div>
      <h2 class="accent">Необходимо заполнить инвенту</h2>
      <p class="muted">Воскресенье, ${esc(S.venue)}. Заполнит: <b style="color:#fff">${esc(fullName(S.user))}</b>, дата ${KM.dmy(new Date())}.</p>
      <div class="grid two"><button class="btn ghost" data-x="later">Позже</button><button class="btn primary" data-x="go">Заполнить</button></div>`);
    w.addEventListener('click', (e) => {
      const b = e.target.closest('[data-x]'); if (!b) return;
      try { sessionStorage.setItem(key, '1'); } catch (er) { /* noop */ }
      closeModal();
      if (b.dataset.x === 'go') go('inventory');
    });
  }
  setInterval(checkSunday, 60000);

  // ================= ПРИЁМ ЗАКАЗА =================
  function guessFromGuest(g) {
    const o = {};
    const t = (g.likes + ' ' + g.strength).toLowerCase();
    if (/крепк/.test(t)) o.strength = 5; else if (/выше сред/.test(t)) o.strength = 4; else if (/ниже сред|лёгк|легк/.test(t)) o.strength = /ниже/.test(t) ? 2 : 1; else if (/средн/.test(t)) o.strength = 3;
    if (/кисл/.test(t)) o.sour = 75; if (/слад|десерт|не приторн/.test(t)) o.sour = /не приторн/.test(t) ? 45 : 25;
    const b = (g.bowl || '').toLowerCase();
    o.bowl = KM.BOWLS.find((x) => b.includes(x.toLowerCase().slice(0, 5))) || '';
    if (/грейпфрут|ананас|фрукт/.test(b)) o.bowl = 'Фрукт';
    const h = (g.hookah || '').toLowerCase();
    if (/матп|метп|mattp|мэтп|метр/.test(h)) o.hookah = 'Mattpear'; else if (/альф|alpha/.test(h)) o.hookah = 'AlphaHookah'; else if (/вук|wook/.test(h)) o.hookah = 'Wookah';
    if (/без диффуз/.test(h)) o.draw = 'Недиффузорная';
    const dis = (g.dislikes || '').toLowerCase();
    if (/мят/.test(dis)) o.mintNo = true;
    if (/холод/.test(dis)) o.coldNo = true;
    o.likeTags = Object.keys(KM.TAGS).filter((k) => !['mint', 'cold'].includes(k) && KM.TAGS[k].re.test(g.likes || ''));
    if (/супернов|холодок/.test(t) && !o.coldNo) o.cold = true;
    o.dislikeText = (g.dislikes || '').replace(/\bбез\b|\bнет\b|все остальн\S*|всё остальн\S*|по настроению|сам говорит|все сам говорит/gi, '');
    return o;
  }
  function newOrder(g) {
    const o = { guestId: g ? g.id : '', table: '', novice: false, likeBrands: [], dislikeBrands: [], likeTags: [], dislikeTags: [], baseTag: '', baseFlavor: '', strength: 3, sour: 50, bowl: '', heat: '', hookah: '', draw: 'Диффузорная', cold: false, mint: false, dislikeText: '' };
    if (g) Object.assign(o, guessFromGuest(g));
    return o;
  }
  function triChips(group, items, likes, dislikes) {
    return `<div class="chips" data-tri="${group}">${items.map(([k, t]) => `<button type="button" class="chip ${likes.includes(k) ? 'like' : dislikes.includes(k) ? 'dislike' : ''}" data-k="${esc(k)}">${esc(t)}</button>`).join('')}</div>`;
  }
  function vOrder() {
    if (!S.ord) S.ord = newOrder();
    if (S.mix) return vMix();
    const o = S.ord;
    const g = o.guestId && S.data.guests.find((x) => x.id === o.guestId);
    const tagItems = Object.entries(KM.TAGS).filter(([k]) => !['mint', 'cold'].includes(k)).map(([k, t]) => [k, t.label]);
    const brandItems = venueBrands().filter((b) => b.kind === 'tob').map((b) => [b.name, b.name]).filter((x, i, a) => a.findIndex((y) => y[0] === x[0]) === i);
    const seg = (name, opts, val) => `<div class="seg" data-seg="${name}">${opts.map((v) => `<button type="button" data-v="${esc(v)}" class="${val === v ? 'on' : ''}">${esc(v)}</button>`).join('')}</div>`;
    const baseF = o.baseFlavor && S.data.flavors.find((f) => f.id === o.baseFlavor);
    return `
      <div class="stack" id="ordRoot">
        <div class="row between wrap"><h1>Приём заказа</h1><span class="badge acc">${esc(S.venue)}</span></div>
        <div class="card stack">
          <div class="grid two">
            <label class="f"><span>Постоянный гость</span><select class="input" id="oGuest"><option value="">— новый гость —</option>${S.data.guests.filter((x) => x.venue === S.venue).concat(S.data.guests.filter((x) => x.venue !== S.venue)).map((x) => `<option value="${x.id}" ${o.guestId === x.id ? 'selected' : ''}>${esc(x.name)}${x.venue !== S.venue ? ' (' + esc(x.venue) + ')' : ''}</option>`).join('')}</select></label>
            <label class="f"><span>Стол / гость</span><input class="input" id="oTable" value="${esc(o.table)}" placeholder="напр. 7"></label>
          </div>
          ${g ? `<div class="small" style="border-left:3px solid var(--accent);padding-left:10px"><b>Любит:</b> ${esc(g.likes || '—')}<br><b>Не любит:</b> ${esc(g.dislikes || '—')}${g.bowl ? '<br><b>Чаша:</b> ' + esc(g.bowl) : ''}${g.notes ? '<br><b>Заметки:</b> ' + esc(g.notes) : ''}</div>` : ''}
          <button type="button" class="btn ${o.novice ? 'primary' : ''} block" id="oNovice">${o.novice ? '✓ Гость не разбирается' : 'Гость не разбирается'}</button>
        </div>

        ${o.novice ? '' : `<div class="card"><h3>Производители и бренды</h3><div class="hint" style="margin:4px 0 10px">Нажатие: ♥ любимый → ✕ нелюбимый → сброс</div>${triChips('brands', brandItems, o.likeBrands, o.dislikeBrands)}</div>`}

        <div class="card"><h3>Любимые и нелюбимые вкусы</h3><div class="hint" style="margin:4px 0 10px">Нажатие: ♥ любит → ✕ не любит → сброс</div>${triChips('tags', tagItems, o.likeTags, o.dislikeTags)}
          <label class="f" style="margin-top:12px"><span>Не любит (конкретно, через запятую)</span><input class="input" id="oDisText" value="${esc(o.dislikeText)}" placeholder="арбуз, банан, кокос"></label>
        </div>

        <div class="card"><h3>Какой вкус в основе</h3>
          <div class="chips" style="margin-top:10px" id="oBase">${tagItems.map(([k, t]) => `<button type="button" class="chip ${o.baseTag === k ? 'on' : ''}" data-k="${k}">${t}</button>`).join('')}</div>
          <div class="search" style="margin-top:12px">${I.search}<input class="input" id="oBaseQ" placeholder="или конкретный вкус из наличия…" value="${baseF ? esc(baseF.name) : ''}"></div>
          <div id="oBaseRes" class="list hidden" style="margin-top:6px;max-height:240px;overflow:auto"></div>
        </div>

        <div class="card stack">
          <div><h3>Крепость</h3><div style="margin-top:10px">${seg('strength', KM.STRENGTHS, KM.STRENGTHS[o.strength - 1])}</div></div>
          <div><h3>Шкала вкуса</h3><input type="range" min="0" max="100" step="5" id="oSour" value="${o.sour}" style="margin-top:12px"><div class="scale"><span>сладкий</span><span id="oSourV">${o.sour < 35 ? 'сладкий' : o.sour > 65 ? 'кислый' : 'кисло-сладкий'}</span><span>кислый</span></div></div>
          ${o.novice ? '' : `
          <div><h3>Чаша</h3><div style="margin-top:10px">${seg('bowl', KM.BOWLS, o.bowl)}</div></div>
          <div><h3>Жар</h3><div style="margin-top:10px">${seg('heat', KM.HEATS, o.heat)}</div></div>
          <div><h3>Кальян</h3><div style="margin-top:10px">${seg('hookah', KM.HOOKAHS[S.venue], o.hookah)}</div></div>`}
          <div><h3>Тяга</h3><div style="margin-top:10px">${seg('draw', KM.DRAWS, o.draw)}</div></div>
          <div class="row wrap" style="gap:22px"><label class="check"><input type="checkbox" id="oCold" ${o.cold ? 'checked' : ''}> Холодок</label><label class="check"><input type="checkbox" id="oMint" ${o.mint ? 'checked' : ''}> Мята</label></div>
        </div>
        <div class="sticky-actions"><button class="btn ghost" id="oReset" style="flex:0 0 auto">Сброс</button><button class="btn primary" id="oSend">Отправить</button></div>
      </div>`;
  }
  function afterOrder() {
    if (S.mix) return afterMix();
    const o = S.ord;
    $('#oGuest').addEventListener('change', (e) => { const g = S.data.guests.find((x) => x.id === e.target.value); const t = o.table; S.ord = newOrder(g); S.ord.table = t; render(); });
    $('#oTable').addEventListener('input', (e) => { o.table = e.target.value; });
    $('#oNovice').addEventListener('click', () => { o.novice = !o.novice; render(); });
    $('#oDisText').addEventListener('input', (e) => { o.dislikeText = e.target.value; });
    document.querySelectorAll('[data-tri]').forEach((wrap) => wrap.addEventListener('click', (e) => {
      const c = e.target.closest('.chip'); if (!c) return;
      const k = c.dataset.k;
      const [L, D] = wrap.dataset.tri === 'brands' ? ['likeBrands', 'dislikeBrands'] : ['likeTags', 'dislikeTags'];
      if (o[L].includes(k)) { o[L] = o[L].filter((x) => x !== k); o[D].push(k); c.className = 'chip dislike'; }
      else if (o[D].includes(k)) { o[D] = o[D].filter((x) => x !== k); c.className = 'chip'; }
      else { o[L].push(k); c.className = 'chip like'; }
    }));
    $('#oBase').addEventListener('click', (e) => {
      const c = e.target.closest('.chip'); if (!c) return;
      o.baseTag = o.baseTag === c.dataset.k ? '' : c.dataset.k;
      document.querySelectorAll('#oBase .chip').forEach((x) => x.classList.toggle('on', x.dataset.k === o.baseTag));
    });
    const bq = $('#oBaseQ'), br = $('#oBaseRes');
    bq.addEventListener('input', () => {
      const q = bq.value.trim().toLowerCase();
      if (!q) { o.baseFlavor = ''; br.classList.add('hidden'); return; }
      const st = stockMap();
      const brandById = Object.fromEntries(venueBrands().map((b) => [b.id, b]));
      const res = venueFlavors().filter((f) => brandById[f.brandId].kind === 'tob' && (f.name + ' ' + brandById[f.brandId].name).toLowerCase().includes(q)).slice(0, 30);
      br.innerHTML = res.length ? res.map((f) => { const s = st[f.id] ? st[f.id].stock : 0; return `<div class="li" data-f="${f.id}" style="${s < 12 ? 'opacity:.45' : ''}"><div class="grow"><div class="title">${esc(f.name)}</div><div class="sub">${esc(brandById[f.brandId].name)}</div></div><span class="badge ${s < 12 ? 'red' : ''}">${fmtG(s)} г</span></div>`; }).join('') : '<div class="empty">Нет совпадений</div>';
      br.classList.remove('hidden');
    });
    br.addEventListener('click', (e) => { const li = e.target.closest('[data-f]'); if (!li) return; o.baseFlavor = li.dataset.f; bq.value = S.data.flavors.find((f) => f.id === o.baseFlavor).name; br.classList.add('hidden'); });
    document.querySelectorAll('[data-seg]').forEach((wrap) => wrap.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const k = wrap.dataset.seg;
      if (k === 'strength') o.strength = KM.STRENGTHS.indexOf(b.dataset.v) + 1;
      else o[k] = o[k] === b.dataset.v && k !== 'draw' ? '' : b.dataset.v;
      wrap.querySelectorAll('button').forEach((x) => x.classList.toggle('on', k === 'strength' ? x.dataset.v === KM.STRENGTHS[o.strength - 1] : x.dataset.v === o[k]));
    }));
    $('#oSour').addEventListener('input', (e) => { o.sour = +e.target.value; $('#oSourV').textContent = o.sour < 35 ? 'сладкий' : o.sour > 65 ? 'кислый' : 'кисло-сладкий'; });
    $('#oCold').addEventListener('change', (e) => { o.cold = e.target.checked; });
    $('#oMint').addEventListener('change', (e) => { o.mint = e.target.checked; });
    $('#oReset').addEventListener('click', () => { S.ord = newOrder(); render(); });
    $('#oSend').addEventListener('click', submitOrder);
  }
  async function submitOrder() {
    const o = S.ord;
    const req = { ...o };
    if (o.novice) { req.likeBrands = []; req.dislikeBrands = []; req.bowl = ''; req.heat = ''; req.hookah = ''; }
    const brands = venueBrands();
    const res = KM.recommendMix(req, { brands, flavors: venueFlavors(), stock: stockMap() });
    if (res.error) return toast(res.error, 'err');
    const label = (o.table ? 'Стол ' + o.table : '') || (o.guestId ? (S.data.guests.find((g) => g.id === o.guestId) || {}).name : '') || 'Заказ';
    const timer = { id: uid(), label, venue: S.venue, end: Date.now() + 15 * 60000, mix: res.best.parts.map((p) => `${p.flavor} ${p.pct}%`).join(' + ') };
    S.timers.push(timer); ls.set('timers', S.timers);
    S.mix = { res, timerId: timer.id, req: o, label };
    try { await save('orders', { id: uid(), venue: S.venue, at: new Date().toISOString(), user: fullName(S.user), guestId: o.guestId, table: o.table, request: o, mix: res.best }); } catch (e) { /* не критично */ }
    unlockAudio();
    render(); window.scrollTo(0, 0);
  }
  function mixCard(m, title, big, likeIdx) {
    const liked = likeIdx != null && S.mix && S.mix.liked && S.mix.liked[likeIdx];
    return `<div class="${big ? 'mix' : 'card'}">
      <div class="row between"><h3 class="${big ? 'accent' : ''}">${title}</h3><span class="badge">${esc(m.strengthLabel)} · ${m.sour < 35 ? 'сладкий' : m.sour > 65 ? 'кислый' : 'кисло-сладкий'}</span></div>
      <div class="mix-bar">${m.parts.map((p) => `<i style="width:${p.pct}%"></i>`).join('')}</div>
      ${m.parts.map((p) => `<div class="mix-part"><span class="pct">${p.pct}%</span><div><div style="font-weight:600">${esc(p.flavor)}</div><div class="muted small">${esc(p.brand)} · в наличии ${fmtG(p.stock)} г${p.why && p.why.length ? ' · ' + esc(p.why.join('; ')) : ''}</div></div><span class="g">${p.grams} г</span></div>`).join('')}
      ${likeIdx != null ? `<button class="btn ${liked ? '' : big ? 'primary' : ''} block" style="margin-top:12px" data-like="${likeIdx}" ${liked ? 'disabled' : ''}>${liked ? '✓ В понравившихся' : I.heart.replace('<svg ', '<svg width="18" height="18" ') + ' Гостю понравилось'}</button>` : ''}
    </div>`;
  }
  function vMix() {
    const { res, label } = S.mix;
    const o = S.mix.req;
    const t = S.timers.find((x) => x.id === S.mix.timerId);
    return `
      <div class="stack">
        <div class="row between wrap"><h1>Микс · ${esc(label)}</h1><button class="btn ghost sm" id="mBack">← К заказу</button></div>
        <div class="card row between wrap">
          <div><div class="muted small">Таймер</div><div class="timer-big" id="mTimer">${t ? fmtLeft(t.end - Date.now()) : '—'}</div></div>
          <div class="stack" style="text-align:right"><div class="small"><span class="muted">Чаша:</span> ${esc(res.bowl)} · ${res.bowlGrams} г</div><div class="small"><span class="muted">Жар:</span> ${esc(res.heat)}</div>${o.hookah ? `<div class="small"><span class="muted">Кальян:</span> ${esc(o.hookah)}</div>` : ''}<div class="small"><span class="muted">Тяга:</span> ${esc(o.draw)}</div></div>
        </div>
        ${mixCard(res.best, S.mix.repeat ? esc(S.mix.repeat) : 'Лучший микс', true, S.mix.repeat ? null : 0)}
        ${res.tips.length ? `<div class="card small">${res.tips.map((x) => '• ' + esc(x)).join('<br>')}</div>` : ''}
        ${res.alternatives.length ? `<div class="section"><h2>Альтернативы</h2></div>${res.alternatives.map((a, i) => mixCard(a, 'Вариант ' + (i + 2), false, i + 1)).join('')}` : ''}
        <div class="grid two">
          <button class="btn" id="mCopy">Скопировать микс</button>
          ${o.guestId ? '' : '<button class="btn" id="mSaveGuest">В постоянные гости</button>'}
          <button class="btn primary" id="mNew">Новый заказ</button>
        </div>
      </div>`;
  }
  // ================= МИКСЫ (понравившиеся) =================
  function likeForm(idx) {
    const { res, req } = S.mix;
    const m = idx === 0 ? res.best : res.alternatives[idx - 1];
    const g = req.guestId && S.data.guests.find((x) => x.id === req.guestId);
    const auto = m.parts.map((p) => p.flavor.replace(/\s*\(.*$/, '')).join(' + ');
    const w = modal(`
      <div class="mh"><h3>Гостю понравилось</h3><button class="iconbtn" data-close>${I.close}</button></div>
      <div class="small muted" style="margin-bottom:12px">${m.parts.map((p) => `${esc(p.brand)} ${esc(p.flavor)} — ${p.pct}%`).join('<br>')}</div>
      <form class="stack" id="lkForm">
        <label class="f"><span>Название микса</span><input class="input" name="name" value="${esc(auto)}" required></label>
        <label class="f"><span>Гость</span><select class="input" name="guestId"><option value="">— без привязки к гостю —</option>${S.data.guests.slice().sort((a, b) => a.name.localeCompare(b.name, 'ru')).map((x) => `<option value="${x.id}" ${g && g.id === x.id ? 'selected' : ''}>${esc(x.name)} (${esc(x.venue)})</option>`).join('')}</select></label>
        <label class="f"><span>Заметка</span><input class="input" name="note" placeholder="напр. попросил чуть крепче / на гармошке лучше"></label>
        <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Отмена</button><button class="btn primary">${I.heart.replace('<svg ', '<svg width="16" height="16" ')} Сохранить</button></div>
      </form>`);
    w.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
    $('#lkForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const gid = fd.get('guestId');
      const gg = gid && S.data.guests.find((x) => x.id === gid);
      const doc = {
        id: uid(), venue: S.venue, name: String(fd.get('name')).trim(), note: String(fd.get('note') || '').trim(),
        guestId: gid || '', guestName: gg ? gg.name : (req.table && !/^\d+$/.test(req.table) ? req.table : ''),
        parts: m.parts.map((p) => ({ flavorId: p.flavorId, flavor: p.flavor, brand: p.brand, pct: p.pct })),
        bowl: res.bowl, heat: res.heat, hookah: req.hookah || '', draw: req.draw || '',
        strengthLabel: m.strengthLabel, sour: m.sour, author: fullName(S.user), authorId: S.user.id, createdAt: new Date().toISOString(),
      };
      try {
        await save('mixes', doc);
        S.mix.liked = S.mix.liked || {}; S.mix.liked[idx] = doc.id;
        closeModal(); toast('Микс добавлен в «Понравившиеся»', 'ok'); render();
      } catch (er) { toast(er.message, 'err'); }
    });
  }
  /** Хватает ли табака на микс в текущем заведении */
  function mixAvailability(mx, bowlGrams) {
    const st = stockMap();
    const ids = new Set(venueFlavors().map((f) => f.id));
    const byName = {};
    for (const f of venueFlavors()) byName[f.name.toLowerCase()] = f;
    const missing = [], resolved = [];
    for (const p of mx.parts) {
      let fid = ids.has(p.flavorId) ? p.flavorId : (byName[p.flavor.toLowerCase()] || {}).id;
      const have = fid && st[fid] ? st[fid].stock : 0;
      const need = Math.round(bowlGrams * p.pct / 100);
      if (!fid || have < need + 2) missing.push(p.flavor.replace(/\s*\(.*$/, ''));
      resolved.push({ ...p, flavorId: fid || p.flavorId, stock: have, grams: need });
    }
    return { missing, parts: resolved };
  }
  function mixesFor(list) {
    const q = S.mixQ.trim().toLowerCase();
    if (S.mixVenue === 'cur') list = list.filter((m) => m.venue === S.venue);
    if (q) list = list.filter((m) => [m.name, m.guestName, m.note, ...m.parts.map((p) => p.brand + ' ' + p.flavor)].join(' ').toLowerCase().includes(q));
    return list.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }
  function mixRow(m) {
    const bowlGrams = KM.BOWL_GRAMS[m.bowl] || 18;
    const av = mixAvailability(m, bowlGrams);
    return `<div class="card">
      <div class="row between" style="align-items:flex-start"><div style="min-width:0"><h3>${esc(m.name)}</h3><div class="muted small">${m.guestName ? '♥ ' + esc(m.guestName) + ' · ' : ''}${esc(m.venue)} · ${esc(m.author || '')}${m.createdAt ? ' · ' + new Date(m.createdAt).toLocaleDateString('ru-RU') : ''}</div></div>
        <span class="badge ${av.missing.length ? 'red' : 'green'}">${av.missing.length ? 'нет в наличии' : 'всё есть'}</span></div>
      <div class="mix-bar">${m.parts.map((p) => `<i style="width:${p.pct}%"></i>`).join('')}</div>
      <div class="small">${m.parts.map((p) => `<b class="accent">${p.pct}%</b> ${esc(p.brand)} · ${esc(p.flavor)}`).join('<br>')}</div>
      <div class="muted small" style="margin-top:6px">${[m.strengthLabel, m.bowl, m.heat, m.hookah].filter(Boolean).map(esc).join(' · ')}${m.note ? '<br>📝 ' + esc(m.note) : ''}${av.missing.length ? `<br><span style="color:var(--danger)">Не хватает в ${esc(S.venue)}: ${esc(av.missing.join(', '))}</span>` : ''}</div>
      <div class="row" style="margin-top:12px"><button class="btn primary sm" data-repeat="${m.id}">Повторить</button>${isAdmin() || m.authorId === S.user.id ? `<button class="btn danger sm" data-mdel="${m.id}">Удалить</button>` : ''}</div>
    </div>`;
  }
  function vMixes() {
    const list = mixesFor(S.data.mixes || []);
    return `
      <div class="stack">
        <div class="row between wrap"><h1>Понравившиеся миксы</h1><a class="btn primary sm" href="#order">${I.plus} Новый заказ</a></div>
        <div class="search">${I.search}<input class="input" id="mxQ" placeholder="Поиск: гость, вкус, бренд" value="${esc(S.mixQ)}"></div>
        <div class="seg" id="mxVenue">${[['cur', S.venue], ['all', 'Все заведения']].map(([k, t]) => `<button data-v="${k}" class="${S.mixVenue === k ? 'on' : ''}">${esc(t)}</button>`).join('')}</div>
        <div id="mxList">${list.length ? list.map(mixRow).join('') : '<div class="empty">Пока пусто. После подбора микса нажмите «Гостю понравилось».</div>'}</div>
      </div>`;
  }
  function afterMixes() {
    const q = $('#mxQ');
    q.addEventListener('input', () => { S.mixQ = q.value; const p = q.selectionStart; render(); const n = $('#mxQ'); n.focus(); n.setSelectionRange(p, p); });
    $('#mxVenue').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { S.mixVenue = b.dataset.v; render(); } });
  }
  function repeatMix(m) {
    const bowlGrams = KM.BOWL_GRAMS[m.bowl] || 18;
    const av = mixAvailability(m, bowlGrams);
    const label = m.guestName || m.name;
    const timer = { id: uid(), label, venue: S.venue, end: Date.now() + 15 * 60000, mix: m.parts.map((p) => `${p.flavor} ${p.pct}%`).join(' + ') };
    S.timers.push(timer); ls.set('timers', S.timers);
    S.ord = newOrder(m.guestId && S.data.guests.find((g) => g.id === m.guestId));
    S.mix = {
      repeat: m.name, label, timerId: timer.id,
      req: { ...S.ord, hookah: m.hookah, draw: m.draw || 'Диффузорная' },
      res: { best: { parts: av.parts.map((p) => ({ ...p, why: [] })), strengthLabel: m.strengthLabel || '—', sour: m.sour != null ? m.sour : 50 }, alternatives: [], bowl: m.bowl || 'Фанел', bowlGrams, heat: m.heat || KM.autoHeat(m.bowl), tips: av.missing.length ? ['Не хватает: ' + av.missing.join(', ') + ' — подберите замену или сделайте новый заказ.'] : [] },
    };
    unlockAudio();
    if (av.missing.length) toast('Не всё есть в наличии: ' + av.missing.join(', '), 'err');
    go('order');
  }
  document.addEventListener('click', async (e) => {
    const r = e.target.closest('[data-repeat]');
    if (r) { const m = (S.data.mixes || []).find((x) => x.id === r.dataset.repeat); if (m) { closeModal(); repeatMix(m); } return; }
    const d = e.target.closest('[data-mdel]');
    if (d) {
      const m = (S.data.mixes || []).find((x) => x.id === d.dataset.mdel); if (!m) return;
      if (await confirmBox(`Удалить микс «${m.name}»?`, 'Удалить')) { await remove('mixes', m.id); toast('Удалено'); closeModal(); render(); }
    }
  });

  function mixText() {
    const { res, label } = S.mix;
    return `${label}: ` + res.best.parts.map((p) => `${p.brand} ${p.flavor} — ${p.pct}% (${p.grams} г)`).join(' + ') + ` · ${res.bowl}, ${res.heat}`;
  }
  function afterMix() {
    $('#mBack').addEventListener('click', () => { S.mix = null; render(); });
    $('#mNew').addEventListener('click', () => { S.mix = null; S.ord = newOrder(); render(); });
    $('#mCopy').addEventListener('click', async () => toast((await copyText(mixText())) ? 'Скопировано' : 'Не удалось', 'ok'));
    document.querySelectorAll('[data-like]').forEach((b) => b.addEventListener('click', () => likeForm(+b.dataset.like)));
    const sg = $('#mSaveGuest');
    if (sg) sg.addEventListener('click', () => {
      const o = S.mix.req;
      const lab = (t) => KM.TAGS[t] ? KM.TAGS[t].label.toLowerCase() : t;
      guestForm({
        venue: S.venue, name: o.table && !/^\d+$/.test(o.table) ? o.table : '',
        likes: [o.likeTags.map(lab).join(', '), o.likeBrands.join(', '), o.baseTag ? 'основа: ' + lab(o.baseTag) : '', 'последний микс: ' + S.mix.res.best.parts.map((p) => `${p.flavor} ${p.pct}%`).join(' + ')].filter(Boolean).join('; '),
        dislikes: [o.dislikeTags.map(lab).join(', '), o.dislikeBrands.join(', '), o.dislikeText].filter(Boolean).join('; '),
        bowl: o.bowl, heat: o.heat, hookah: o.hookah, strength: KM.STRENGTHS[o.strength - 1],
        notes: [o.cold ? 'холодок' : '', o.mint ? 'мята' : '', o.draw].filter(Boolean).join(', '),
      });
    });
  }

  // ---------------- таймеры ----------------
  function fmtLeft(ms) {
    if (ms <= 0) return '00:00';
    const s = Math.ceil(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function timerPill() {
    if (!S.timers.length) return '';
    const next = S.timers.slice().sort((a, b) => a.end - b.end)[0];
    const done = next.end <= Date.now();
    return `<button class="timer-pill ${done ? 'done' : ''}" id="tPill">${done ? '⏰ ' + esc(next.label) + ' — время!' : '⏱ ' + fmtLeft(next.end - Date.now()) + ' · ' + esc(next.label)}${S.timers.length > 1 ? ' +' + (S.timers.length - 1) : ''}</button>`;
  }
  function timersList() {
    return `<div class="list">${S.timers.slice().sort((a, b) => a.end - b.end).map((t) => `<div class="li" style="cursor:default"><div class="grow"><div class="title">${esc(t.label)} · ${esc(t.venue)}</div><div class="sub">${esc(t.mix)}</div></div><span class="head" style="font-size:20px;${t.end <= Date.now() ? 'color:var(--danger)' : ''}" data-tleft="${t.id}">${fmtLeft(t.end - Date.now())}</span><button class="iconbtn" data-tdel="${t.id}" title="Убрать">${I.close}</button></div>`).join('')}</div>`;
  }
  function timersModal() {
    const w = modal(`<div class="mh"><h2>Таймеры</h2><button class="iconbtn" data-close>${I.close}</button></div><div id="tList">${timersList()}</div>`);
    w.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  }
  document.addEventListener('click', (e) => {
    const d = e.target.closest('[data-tdel]'); if (!d) return;
    S.timers = S.timers.filter((t) => t.id !== d.dataset.tdel); ls.set('timers', S.timers);
    const tl = $('#tList'); if (tl) tl.innerHTML = S.timers.length ? timersList() : '<div class="empty">Таймеров нет</div>';
    if (!$('#modal')) render(); else { const p = $('#tPill'); if (p) p.outerHTML = timerPill(); }
  });
  let audioCtx = null;
  function unlockAudio() { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch (e) { /* noop */ } }
  function beep() {
    try {
      if (!audioCtx) return;
      [0, 0.35, 0.7].forEach((t) => { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination); g.gain.setValueAtTime(0.25, audioCtx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.3); o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.32); });
    } catch (e) { /* noop */ }
  }
  setInterval(() => {
    if (!S.timers.length) return;
    for (const t of S.timers) {
      if (!t.fired && t.end <= Date.now()) {
        t.fired = true; ls.set('timers', S.timers);
        toast(`⏰ ${t.label}: прошло 15 минут — проверьте кальян`, 'ok'); beep();
        try { navigator.vibrate && navigator.vibrate([300, 150, 300]); } catch (e) { /* noop */ }
        try { if (window.Notification && Notification.permission === 'granted') new Notification('KM Box', { body: `${t.label}: прошло 15 минут` }); } catch (e) { /* noop */ }
      }
    }
    const p = $('#tPill'); if (p) p.outerHTML = timerPill();
    document.querySelectorAll('[data-tleft]').forEach((el) => { const t = S.timers.find((x) => x.id === el.dataset.tleft); if (t) { el.textContent = fmtLeft(t.end - Date.now()); if (t.end <= Date.now()) el.style.color = 'var(--danger)'; } });
    const mt = $('#mTimer'); if (mt && S.mix) { const t = S.timers.find((x) => x.id === S.mix.timerId); if (t) mt.textContent = fmtLeft(t.end - Date.now()); }
  }, 1000);

  // ================= НАСТРОЙКИ =================
  function vAdmin() {
    const st = settings();
    return `
      <div class="stack">
        <h1>Настройки</h1>
        <div class="card stack">
          <div class="row between wrap"><div><div class="head" style="font-size:20px">${esc(fullName(S.user))}</div><div class="muted small">логин ${esc(S.user.login)} · ${isAdmin() ? 'старший КМ (админ)' : 'кальянный мастер'}</div></div><button class="btn danger sm" id="aLogout">Выйти</button></div>
          <form class="grid two" id="aPass"><label class="f"><span>Текущий пароль</span><input class="input" type="password" name="old" required autocomplete="current-password"></label><label class="f"><span>Новый пароль</span><input class="input" type="password" name="new" required minlength="4" autocomplete="new-password"></label><button class="btn">Сменить пароль</button></form>
          ${window.Notification && Notification.permission !== 'granted' ? '<button class="btn ghost" id="aNotif">Включить уведомления таймеров</button>' : ''}
        </div>
        ${isAdmin() ? `
        <div class="card stack">
          <h3>Заказы и Telegram</h3>
          <form class="stack" id="aSet">
            <label class="f"><span>Telegram старшего КМ (ник)</span><input class="input" name="telegram" value="${esc(st.telegram)}" placeholder="@nickname"></label>
            <div class="grid three">
              <label class="f"><span>Запас, недель</span><input class="input" type="number" step="0.25" min="0.5" name="coverWeeks" value="${st.coverWeeks || 1.5}"></label>
              <label class="f"><span>Резерв, г</span><input class="input" type="number" step="5" min="0" name="reserve" value="${st.reserve != null ? st.reserve : 30}"></label>
              <label class="f"><span>Мин. шаг, г</span><input class="input" type="number" step="5" min="10" name="minStep" value="${st.minStep || 40}"></label>
            </div>
            <div class="hint">Заказ = расход в неделю (по последним 2 неделям) × «запас» + резерв − остаток, вверх до шага бренда. Шаг и крепость бренда — в «Остатках» → «Бренд».</div>
            <button class="btn primary">Сохранить</button>
          </form>
        </div>
        <div class="card"><div class="row between"><h3>Сотрудники</h3><button class="btn sm primary" id="aAddUser">${I.plus} Добавить</button></div><div id="aUsers" style="margin-top:10px" class="muted small">Загрузка…</div></div>` : ''}
        <div class="card stack">
          <h3>Данные</h3>
          <div class="row wrap"><button class="btn" id="aExport">Экспорт гостей (CSV)</button>${API.mode === 'demo' && isAdmin() ? '<button class="btn danger" id="aReset">Сбросить демо-данные</button>' : ''}</div>
          <div class="muted small">Режим: ${API.mode === 'demo' ? 'демо — данные в этом браузере' : 'сервер — общая база для всех КМ'}</div>
        </div>
      </div>`;
  }
  async function afterAdmin() {
    $('#aLogout').addEventListener('click', async () => { await API.logout(); S.user = null; S.data = null; renderLogin(); });
    $('#aPass').addEventListener('submit', async (e) => {
      e.preventDefault(); const fd = new FormData(e.target);
      try { await API.changePassword(fd.get('old'), fd.get('new')); toast('Пароль изменён', 'ok'); e.target.reset(); } catch (er) { toast(er.message, 'err'); }
    });
    const nb = $('#aNotif'); if (nb) nb.addEventListener('click', async () => { try { await Notification.requestPermission(); } catch (e) { /* noop */ } render(); });
    $('#aExport').addEventListener('click', async () => {
      const head = ['Заведение', 'Гость', 'Телефон', 'Модель кальяна', 'Табаки и вкусы', 'Не любимые вкусы', 'Чаша', 'Крепость', 'Жар', 'Примечания'];
      const keys = ['venue', 'name', 'phone', 'hookah', 'likes', 'dislikes', 'bowl', 'strength', 'heat', 'notes'];
      const csv = [head].concat(S.data.guests.map((g) => keys.map((k) => g[k] || ''))).map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\n');
      try {
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'гости.csv'; a.click();
      } catch (e) { /* noop */ }
      if (await copyText(csv)) toast('CSV скопирован (и скачан, если браузер разрешает)', 'ok');
    });
    const rs = $('#aReset'); if (rs) rs.addEventListener('click', async () => { if (await confirmBox('Сбросить все демо-данные к исходным?', 'Сбросить')) { API.resetDemo(); ['timers', 'invdraft.Авиатор', 'invdraft.Штаб'].forEach(ls.del); S.timers = []; S.data = await API.loadAll(); toast('Готово'); render(); } });
    if (!isAdmin()) return;
    $('#aSet').addEventListener('submit', async (e) => {
      e.preventDefault(); const fd = new FormData(e.target);
      const doc = { ...settings(), id: 'main', telegram: String(fd.get('telegram')).trim(), coverWeeks: +fd.get('coverWeeks') || 1.5, reserve: +fd.get('reserve'), minStep: Math.max(10, +fd.get('minStep') || 40) };
      try { S.data.settings = await API.put('settings', doc); toast('Сохранено', 'ok'); } catch (er) { toast(er.message, 'err'); }
    });
    $('#aAddUser').addEventListener('click', () => userForm(null));
    loadUsers();
  }
  async function loadUsers() {
    const box = $('#aUsers'); if (!box) return;
    try {
      const users = await API.listUsers();
      box.className = 'list';
      box.innerHTML = users.map((u) => `<div class="li" data-u='${esc(JSON.stringify(u))}'><div class="avatar">${esc((u.lastName || u.login)[0])}</div><div class="grow"><div class="title">${esc(fullName(u))}</div><div class="sub">${esc(u.login)} · ${u.role === 'admin' ? 'старший КМ' : 'КМ'}</div></div>${I.chev}</div>`).join('');
      box.onclick = (e) => { const li = e.target.closest('[data-u]'); if (li) userForm(JSON.parse(li.dataset.u)); };
    } catch (e) { box.textContent = e.message; }
  }
  function userForm(u) {
    const isNew = !u; u = u || { role: 'km' };
    const w = modal(`
      <div class="mh"><h3>${isNew ? 'Новый сотрудник' : esc(fullName(u))}</h3><button class="iconbtn" data-close>${I.close}</button></div>
      <form class="stack" id="uForm">
        <div class="grid two"><label class="f"><span>Имя</span><input class="input" name="firstName" value="${esc(u.firstName)}"></label><label class="f"><span>Фамилия (в отчётах)</span><input class="input" name="lastName" value="${esc(u.lastName)}" required></label></div>
        <div class="grid two"><label class="f"><span>Логин</span><input class="input" name="login" value="${esc(u.login)}" required autocapitalize="none"></label><label class="f"><span>${isNew ? 'Пароль' : 'Новый пароль (необязательно)'}</span><input class="input" name="password" type="text" ${isNew ? 'required' : ''} minlength="4" autocomplete="new-password"></label></div>
        <label class="f"><span>Роль</span><select class="input" name="role"><option value="km" ${u.role !== 'admin' ? 'selected' : ''}>Кальянный мастер</option><option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Старший КМ (админ)</option></select></label>
        <div class="row" style="justify-content:space-between">${isNew || u.id === S.user.id ? '<span></span>' : '<button type="button" class="btn danger" id="uDel">Удалить</button>'}<button class="btn primary">Сохранить</button></div>
      </form>`);
    w.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
    const del = $('#uDel'); if (del) del.addEventListener('click', async () => { closeModal(); if (await confirmBox(`Удалить ${fullName(u)}?`, 'Удалить')) { try { await API.deleteUser(u.id); loadUsers(); } catch (er) { toast(er.message, 'err'); } } });
    $('#uForm').addEventListener('submit', async (e) => {
      e.preventDefault(); const fd = new FormData(e.target);
      const doc = { id: u.id, firstName: fd.get('firstName').trim(), lastName: fd.get('lastName').trim(), login: fd.get('login').trim(), role: fd.get('role') };
      if (fd.get('password')) doc.password = fd.get('password');
      try { await API.saveUser(doc); closeModal(); toast('Сохранено', 'ok'); loadUsers(); } catch (er) { toast(er.message, 'err'); }
    });
  }

  // ---------------- старт ----------------
  boot().catch((e) => { document.getElementById('app').innerHTML = `<div class="login"><div class="box card"><h2>Не удалось загрузить</h2><p class="muted">${esc(e.message)}</p><button class="btn primary" onclick="location.reload()">Повторить</button></div></div>`; });
})();
