const PUBLIC_CONFIG_ENDPOINT = "/api/public-config";
const PROFILE_ENDPOINT = "/api/profile";
const ADMIN_USERS_ENDPOINT = "/api/admin-users";
const ADMIN_SAVES_ENDPOINT = "/api/admin-saves";

const adminApp = document.querySelector("#admin-app");

const state = {
  client: null,
  session: null,
  user: null,
  profile: null,
  config: null,
  users: [],
  saves: [],
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function numberValue(value, fallback = 0, min = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.floor(parsed));
}

function renderMissingConfig() {
  setView(`
    <div class="auth-card">
      <h3>尚未啟用後台</h3>
      <p class="hint">目前站點還沒有成功讀到 Supabase 登入設定，因此無法進入管理者後台。</p>
      <p class="hint">請先在 Vercel 設定 <code>SUPABASE_URL</code>、<code>SUPABASE_ANON_KEY</code>、<code>SUPABASE_SERVICE_ROLE_KEY</code>。</p>
      <div class="inline-actions">
        <button class="primary" type="button" id="to-login">前往登入頁</button>
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
      <h3>需要登入</h3>
      <p class="hint">請先以管理者帳號登入，才能使用後台管理功能。</p>
      <div class="inline-actions">
        <button class="primary" type="button" id="to-login">前往登入頁</button>
        <button class="secondary" type="button" id="to-game">返回遊戲</button>
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
      <h3>權限不足</h3>
      <p class="hint">你已登入，但目前帳號不是管理者，無法使用這個後台。</p>
      <p class="hint">目前帳號：${escapeHtml(state.profile?.display_name || state.user?.email || "")}</p>
      <div class="inline-actions">
        <button class="primary" type="button" id="to-game">返回遊戲</button>
        <button class="secondary" type="button" id="to-login">切換帳號</button>
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

function savePermissionLabel(value) {
  if (value === "read_only") return "唯讀";
  if (value === "admin_only") return "僅管理者可改";
  return "帳號本人可寫入";
}

function buildSaveCard(save) {
  const player = save.player_data || {};
  return `
    <div class="stat" data-save-card="${escapeHtml(save.save_id)}">
      <strong>${escapeHtml(player.name || save.player_name || "未命名角色")}</strong>
      <p>存檔 ID：${escapeHtml(save.save_id)}</p>
      <p>職業：${escapeHtml(player.className || "-")} / 種族：${escapeHtml(player.raceName || "-")}</p>
      <p>目前等級：${escapeHtml(player.level || 1)} / 職業等級：${escapeHtml(player.classLevel || 1)}</p>
      <p>存檔權限：${escapeHtml(savePermissionLabel(save.save_permission))}</p>
      <label>角色名稱</label>
      <input type="text" data-field="name" value="${escapeHtml(player.name || "")}">
      <div class="stat-grid">
        <div>
          <label>職業等級</label>
          <input type="text" data-field="classLevel" value="${escapeHtml(player.classLevel || 1)}">
        </div>
        <div>
          <label>經驗值</label>
          <input type="text" data-field="exp" value="${escapeHtml(player.exp || 0)}">
        </div>
        <div>
          <label>金幣</label>
          <input type="text" data-field="gold" value="${escapeHtml(player.gold || 0)}">
        </div>
        <div>
          <label>主線階段</label>
          <input type="text" data-field="storyStage" value="${escapeHtml(player.storyStage || 1)}">
        </div>
        <div>
          <label>技能點</label>
          <input type="text" data-field="skillPoints" value="${escapeHtml(player.skillPoints || 0)}">
        </div>
      </div>
      <div class="stat-grid">
        <div><label>HP</label><input type="text" data-field="hp" value="${escapeHtml(player.hp || 1)}"></div>
        <div><label>MP</label><input type="text" data-field="mp" value="${escapeHtml(player.mp || 0)}"></div>
        <div><label>最大 HP</label><input type="text" data-field="maxHp" value="${escapeHtml(player.maxHp || 1)}"></div>
        <div><label>最大 MP</label><input type="text" data-field="maxMp" value="${escapeHtml(player.maxMp || 0)}"></div>
        <div><label>攻擊</label><input type="text" data-field="attack" value="${escapeHtml(player.attack || 0)}"></div>
        <div><label>防禦</label><input type="text" data-field="defense" value="${escapeHtml(player.defense || 0)}"></div>
        <div><label>魔法</label><input type="text" data-field="magic" value="${escapeHtml(player.magic || 0)}"></div>
        <div><label>抵抗</label><input type="text" data-field="resistance" value="${escapeHtml(player.resistance || 0)}"></div>
        <div><label>速度</label><input type="text" data-field="speed" value="${escapeHtml(player.speed || 0)}"></div>
        <div><label>幸運</label><input type="text" data-field="luck" value="${escapeHtml(player.luck || 0)}"></div>
      </div>
      <div class="inline-actions">
        <button class="primary" type="button" data-save-update="${escapeHtml(save.save_id)}">儲存數值修改</button>
        <button class="secondary" type="button" data-save-delete="${escapeHtml(save.save_id)}">刪除此存檔</button>
      </div>
    </div>
  `;
}

function renderDashboard() {
  setView(`
    <div class="auth-card">
      <h3>管理者後台</h3>
      <p class="hint">目前登入：${escapeHtml(state.profile?.display_name || state.user?.email || "")}</p>
      <div class="inline-actions">
        <button class="secondary" type="button" id="refresh-btn">重新整理</button>
        <button class="secondary" type="button" id="logout-btn">登出</button>
        <button class="secondary" type="button" id="back-btn">返回遊戲</button>
      </div>

      <div class="spacer"></div>
      <h3>帳號權限管理</h3>
      <p class="hint">管理者可以調整其他帳號的身分與雲端存檔權限。</p>
      <div class="card-grid">
        ${state.users.map((user) => `
          <div class="stat">
            <strong>${escapeHtml(user.display_name || user.email)}</strong>
            <p>${escapeHtml(user.email)}</p>
            <label>角色身分</label>
            <select data-role-user="${escapeHtml(user.user_id)}">
              <option value="user" ${user.role === "user" ? "selected" : ""}>一般使用者</option>
              <option value="admin" ${user.role === "admin" ? "selected" : ""}>管理者</option>
            </select>
            <label>存檔權限</label>
            <select data-save-user="${escapeHtml(user.user_id)}">
              <option value="owner_write" ${user.save_permission === "owner_write" ? "selected" : ""}>帳號本人可寫入</option>
              <option value="read_only" ${user.save_permission === "read_only" ? "selected" : ""}>唯讀</option>
              <option value="admin_only" ${user.save_permission === "admin_only" ? "selected" : ""}>僅管理者可改</option>
            </select>
            <div class="inline-actions">
              <button class="primary" type="button" data-user-update="${escapeHtml(user.user_id)}">套用權限</button>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="spacer"></div>
      <h3>角色存檔管理</h3>
      <p class="hint">可直接調整任意角色的主要數值，或刪除整筆存檔。</p>
      <div class="card-grid">
        ${state.saves.map(buildSaveCard).join("")}
      </div>
    </div>
  `);

  document.querySelector("#refresh-btn").addEventListener("click", loadDashboardData);
  document.querySelector("#logout-btn").addEventListener("click", async () => {
    await state.client.auth.signOut();
    window.location.href = "./login.html";
  });
  document.querySelector("#back-btn").addEventListener("click", () => {
    window.location.href = "./index.html";
  });

  adminApp.querySelectorAll("[data-user-update]").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.userUpdate;
      const role = adminApp.querySelector(`[data-role-user="${userId}"]`).value;
      const savePermission = adminApp.querySelector(`[data-save-user="${userId}"]`).value;
      const result = await fetchJson(ADMIN_USERS_ENDPOINT, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ userId, role, savePermission }),
      });
      const message = document.createElement("p");
      message.className = `hint ${result.ok ? "" : "danger"}`.trim();
      message.textContent = result.ok ? "帳號權限已更新。" : "更新失敗。";
      button.closest(".stat")?.appendChild(message);
      setTimeout(() => message.remove(), 2200);
    });
  });

  adminApp.querySelectorAll("[data-save-update]").forEach((button) => {
    button.addEventListener("click", async () => {
      const saveId = button.dataset.saveUpdate;
      const save = state.saves.find((item) => item.save_id === saveId);
      if (!save) return;
      const card = button.closest("[data-save-card]");
      const player = structuredClone(save.player_data || {});
      const get = (field) => card.querySelector(`[data-field="${field}"]`)?.value ?? "";

      player.name = get("name").trim() || player.name || "未命名角色";
      player.classLevel = numberValue(get("classLevel"), player.classLevel || 1, 1);
      player.exp = numberValue(get("exp"), player.exp || 0, 0);
      player.gold = numberValue(get("gold"), player.gold || 0, 0);
      player.storyStage = numberValue(get("storyStage"), player.storyStage || 1, 1);
      player.skillPoints = numberValue(get("skillPoints"), player.skillPoints || 0, 0);
      player.maxHp = numberValue(get("maxHp"), player.maxHp || 1, 1);
      player.maxMp = numberValue(get("maxMp"), player.maxMp || 0, 0);
      player.hp = Math.min(numberValue(get("hp"), player.hp || 1, 0), player.maxHp);
      player.mp = Math.min(numberValue(get("mp"), player.mp || 0, 0), player.maxMp);
      player.attack = numberValue(get("attack"), player.attack || 0, 0);
      player.defense = numberValue(get("defense"), player.defense || 0, 0);
      player.magic = numberValue(get("magic"), player.magic || 0, 0);
      player.resistance = numberValue(get("resistance"), player.resistance || 0, 0);
      player.speed = numberValue(get("speed"), player.speed || 0, 0);
      player.luck = numberValue(get("luck"), player.luck || 0, 0);

      if (Array.isArray(player.classes) && player.classes.length) {
        const active = player.classes.find((entry) => entry.classCode === player.activeClassCode) || player.classes[0];
        if (active) {
          active.classLevel = player.classLevel;
          active.exp = player.exp;
          active.skillPoints = player.skillPoints;
        }
        player.level = player.classes.reduce((sum, entry) => sum + numberValue(entry.classLevel, 1, 1), 0);
      } else {
        player.level = player.classLevel;
      }

      const result = await fetchJson(ADMIN_SAVES_ENDPOINT, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ saveId, player }),
      });
      const message = document.createElement("p");
      message.className = `hint ${result.ok ? "" : "danger"}`.trim();
      message.textContent = result.ok ? "角色數值已更新。" : "角色存檔更新失敗。";
      card.appendChild(message);
      setTimeout(() => message.remove(), 2200);
      if (result.ok) await loadDashboardData();
    });
  });

  adminApp.querySelectorAll("[data-save-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const saveId = button.dataset.saveDelete;
      const save = state.saves.find((item) => item.save_id === saveId);
      const confirmed = window.confirm(`確定要刪除角色「${save?.player_name || save?.player_data?.name || saveId}」的存檔嗎？`);
      if (!confirmed) return;
      const result = await fetchJson(ADMIN_SAVES_ENDPOINT, {
        method: "DELETE",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ saveId }),
      });
      if (!result.ok) {
        window.alert("刪除失敗。");
        return;
      }
      await loadDashboardData();
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

async function loadDashboardData() {
  setView(`
    <div class="auth-card">
      <h3>管理者後台</h3>
      <p class="hint">正在讀取帳號與存檔資料...</p>
    </div>
  `);

  const [usersResult, savesResult] = await Promise.all([
    fetchJson(ADMIN_USERS_ENDPOINT, { headers: authHeaders() }),
    fetchJson(ADMIN_SAVES_ENDPOINT, { headers: authHeaders() }),
  ]);

  if (!usersResult.ok || !savesResult.ok) {
    setView(`
      <div class="auth-card">
        <h3>管理者後台</h3>
        <p class="danger">無法讀取後台資料，請稍後再試。</p>
      </div>
    `);
    return;
  }

  state.users = usersResult.payload.users || [];
  state.saves = savesResult.payload.saves || [];
  renderDashboard();
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

  await loadDashboardData();
}

init();
