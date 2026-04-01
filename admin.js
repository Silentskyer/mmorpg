const PUBLIC_CONFIG_ENDPOINT = "/api/public-config";
const PROFILE_ENDPOINT = "/api/profile";
const ADMIN_USERS_ENDPOINT = "/api/admin-users";

const adminApp = document.querySelector("#admin-app");

const state = {
  client: null,
  session: null,
  user: null,
  profile: null,
  config: null,
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }
  return { ok: response.ok, status: response.status, payload };
}

function authHeaders(extra = {}) {
  const token = state.session?.access_token || "";
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function setView(html) {
  adminApp.innerHTML = html;
}

function renderMissingConfig() {
  setView(`
    <div class="auth-card">
      <h3>\u5c1a\u672a\u555f\u7528\u5f8c\u53f0</h3>
      <p class="hint">\u76ee\u524d\u7ad9\u9ede\u9084\u6c92\u6709\u6210\u529f\u8b80\u5230 Supabase \u767b\u5165\u8a2d\u5b9a\uff0c\u56e0\u6b64\u7121\u6cd5\u9032\u5165\u7ba1\u7406\u8005\u5f8c\u53f0\u3002</p>
      <p class="hint">\u8acb\u5148\u5728 Vercel \u8a2d\u5b9a <code>SUPABASE_URL</code>\u3001<code>SUPABASE_ANON_KEY</code>\u3001<code>SUPABASE_SERVICE_ROLE_KEY</code>\u3002</p>
      <div class="inline-actions">
        <button class="primary" type="button" id="to-login">\u524d\u5f80\u767b\u5165\u9801</button>
      </div>
    </div>
  `);
  document.querySelector("#to-login").addEventListener("click", () => {
    window.location.href = "./login.html";
  });
}

function renderNeedLogin() {
  setView(`
    <div class="auth-card">
      <h3>\u9700\u8981\u767b\u5165</h3>
      <p class="hint">\u8acb\u5148\u4ee5\u7ba1\u7406\u8005\u5e33\u865f\u767b\u5165\uff0c\u624d\u80fd\u4f7f\u7528\u5f8c\u53f0\u7ba1\u7406\u529f\u80fd\u3002</p>
      <div class="inline-actions">
        <button class="primary" type="button" id="to-login">\u524d\u5f80\u767b\u5165\u9801</button>
        <button class="secondary" type="button" id="to-game">\u8fd4\u56de\u904a\u6232</button>
      </div>
    </div>
  `);
  document.querySelector("#to-login").addEventListener("click", () => {
    window.location.href = "./login.html";
  });
  document.querySelector("#to-game").addEventListener("click", () => {
    window.location.href = "./index.html";
  });
}

function renderForbidden() {
  setView(`
    <div class="auth-card">
      <h3>\u6b0a\u9650\u4e0d\u8db3</h3>
      <p class="hint">\u4f60\u5df2\u767b\u5165\uff0c\u4f46\u76ee\u524d\u5e33\u865f\u4e0d\u662f\u7ba1\u7406\u8005\uff0c\u7121\u6cd5\u4f7f\u7528\u9019\u500b\u5f8c\u53f0\u3002</p>
      <p class="hint">\u76ee\u524d\u5e33\u865f\uff1a${state.profile?.display_name || state.user?.email || ""}</p>
      <div class="inline-actions">
        <button class="primary" type="button" id="to-game">\u8fd4\u56de\u904a\u6232</button>
        <button class="secondary" type="button" id="to-login">\u5207\u63db\u5e33\u865f</button>
      </div>
    </div>
  `);
  document.querySelector("#to-game").addEventListener("click", () => {
    window.location.href = "./index.html";
  });
  document.querySelector("#to-login").addEventListener("click", async () => {
    if (state.client) await state.client.auth.signOut();
    window.location.href = "./login.html";
  });
}

async function renderAdminUsers() {
  setView(`
    <div class="auth-card">
      <h3>\u5e33\u865f\u7ba1\u7406</h3>
      <p class="hint">\u6b63\u5728\u8b80\u53d6\u4f7f\u7528\u8005\u6e05\u55ae...</p>
    </div>
  `);

  const { ok, payload } = await fetchJson(ADMIN_USERS_ENDPOINT, {
    headers: authHeaders(),
  });
  if (!ok) {
    setView(`
      <div class="auth-card">
        <h3>\u5e33\u865f\u7ba1\u7406</h3>
        <p class="danger">\u7121\u6cd5\u8b80\u53d6\u5e33\u865f\u8cc7\u6599\u3002</p>
      </div>
    `);
    return;
  }

  const users = payload.users || [];
  setView(`
    <div class="auth-card">
      <h3>\u5e33\u865f\u7ba1\u7406</h3>
      <p class="hint">\u7ba1\u7406\u8005\u53ef\u4ee5\u8abf\u6574\u5176\u4ed6\u5e33\u865f\u7684\u89d2\u8272\u8eab\u5206\uff0c\u4e26\u8a2d\u5b9a\u96f2\u7aef\u5b58\u6a94\u6b0a\u9650\u3002</p>
      <div class="inline-actions">
        <button class="secondary" type="button" id="logout-btn">\u767b\u51fa</button>
        <button class="secondary" type="button" id="back-btn">\u8fd4\u56de\u904a\u6232</button>
      </div>
      <div class="card-grid">
        ${users.map((user) => `
          <div class="stat">
            <strong>${user.display_name || user.email}</strong>
            <p>${user.email}</p>
            <label>\u89d2\u8272\u8eab\u5206</label>
            <select data-role-user="${user.user_id}">
              <option value="user" ${user.role === "user" ? "selected" : ""}>\u4e00\u822c\u4f7f\u7528\u8005</option>
              <option value="admin" ${user.role === "admin" ? "selected" : ""}>\u7ba1\u7406\u8005</option>
            </select>
            <label>\u5b58\u6a94\u6b0a\u9650</label>
            <select data-save-user="${user.user_id}">
              <option value="owner_write" ${user.save_permission === "owner_write" ? "selected" : ""}>\u5e33\u865f\u672c\u4eba\u53ef\u5beb\u5165</option>
              <option value="read_only" ${user.save_permission === "read_only" ? "selected" : ""}>\u552f\u8b80</option>
              <option value="admin_only" ${user.save_permission === "admin_only" ? "selected" : ""}>\u50c5\u7ba1\u7406\u8005\u53ef\u6539</option>
            </select>
            <div class="inline-actions">
              <button class="primary" type="button" data-admin-save="${user.user_id}">\u5957\u7528\u8a2d\u5b9a</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `);

  document.querySelector("#logout-btn").addEventListener("click", async () => {
    await state.client.auth.signOut();
    window.location.href = "./login.html";
  });
  document.querySelector("#back-btn").addEventListener("click", () => {
    window.location.href = "./index.html";
  });

  adminApp.querySelectorAll("[data-admin-save]").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.adminSave;
      const role = adminApp.querySelector(`[data-role-user="${userId}"]`).value;
      const savePermission = adminApp.querySelector(`[data-save-user="${userId}"]`).value;
      const result = await fetchJson(ADMIN_USERS_ENDPOINT, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ userId, role, savePermission }),
      });
      const message = document.createElement("p");
      message.className = `hint ${result.ok ? "" : "danger"}`.trim();
      message.textContent = result.ok ? "\u5e33\u865f\u8a2d\u5b9a\u5df2\u66f4\u65b0\u3002" : "\u66f4\u65b0\u5931\u6557\u3002";
      button.closest(".stat")?.appendChild(message);
      setTimeout(() => message.remove(), 2200);
    });
  });
}

async function hydrateSession() {
  const { data } = await state.client.auth.getSession();
  state.session = data?.session || null;
  state.user = data?.session?.user || null;
  if (!state.user) {
    state.profile = null;
    return;
  }
  const { ok, payload } = await fetchJson(PROFILE_ENDPOINT, {
    headers: authHeaders(),
  });
  state.profile = ok ? payload.profile || null : null;
}

async function init() {
  const { ok, payload } = await fetchJson(PUBLIC_CONFIG_ENDPOINT, { cache: "no-store" });
  if (!ok || !payload?.authEnabled || !globalThis.supabase?.createClient) {
    renderMissingConfig();
    return;
  }

  state.config = payload;
  state.client = globalThis.supabase.createClient(payload.supabaseUrl, payload.supabaseAnonKey);
  await hydrateSession();

  if (!state.user) {
    renderNeedLogin();
    return;
  }

  if (state.profile?.role !== "admin") {
    renderForbidden();
    return;
  }

  await renderAdminUsers();
}

init();
