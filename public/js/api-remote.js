/* KM Box — работа с сервером (REST + токен) */
(function () {
  'use strict';
  const TOKEN_KEY = 'kmbox.token';
  const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } };
  const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) { /* noop */ } };

  async function req(method, url, body) {
    const headers = { 'Content-Type': 'application/json' };
    const t = getToken();
    if (t) headers.Authorization = 'Bearer ' + t;
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    let data = null;
    try { data = await res.json(); } catch (e) { /* пустой ответ */ }
    if (!res.ok) {
      const err = new Error((data && data.error) || ('Ошибка сервера ' + res.status));
      err.status = res.status;
      throw err;
    }
    return data;
  }

  window.API = {
    mode: 'server',
    async login(login, password) { const r = await req('POST', '/api/auth/login', { login, password }); setToken(r.token); return r.user; },
    async logout() { try { await req('POST', '/api/auth/logout'); } catch (e) { /* noop */ } setToken(null); },
    async me() { if (!getToken()) return null; try { return await req('GET', '/api/auth/me'); } catch (e) { if (e.status === 401) setToken(null); return null; } },
    changePassword: (oldPassword, newPassword) => req('POST', '/api/auth/password', { oldPassword, newPassword }),
    loadAll: () => req('GET', '/api/all'),
    put: (col, doc) => req('PUT', `/api/c/${col}/${encodeURIComponent(doc.id || 'new')}`, doc),
    del: (col, id) => req('DELETE', `/api/c/${col}/${encodeURIComponent(id)}`),
    listUsers: () => req('GET', '/api/users'),
    saveUser: (u) => req(u.id ? 'PUT' : 'POST', u.id ? `/api/users/${u.id}` : '/api/users', u),
    deleteUser: (id) => req('DELETE', `/api/users/${id}`),
  };
})();
