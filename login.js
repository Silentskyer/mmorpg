const PUBLIC_CONFIG_ENDPOINT = "/api/public-config";
const PROFILE_ENDPOINT = "/api/profile";

const authApp = document.querySelector("#auth-app");
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") === "register" ? "register" : "login";

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
  authApp.innerHTML = html;
}

function renderMissingConfig() {
  setView(`
    <div class="auth-card">
      <h3>尚未啟用登入功能</h3>
      <p class="hint">目前站點還沒有成功讀到 Supabase 登入設定，所以無法建立帳號或登入。</p>
      <p class="hint">請在 Vercel 補上 <code>SUPABASE_URL</code>、<code>SUPABASE_ANON_KEY</code>、<code>SUPABASE_SERVICE_ROLE_KEY</code>，重新部署後再試。</p>
      <div class="inline-actions">
        <button class="primary" type="button" id="back-home">返回遊戲首頁</button>
      </div>
    </div>
  `);
  document.querySelector("#back-home").addEventListener("click", () => {
    window.location.href = "./index.html";
  });
}

function renderLoggedIn() {
  setView(`
    <div class="auth-card">
      <h3>已登入帳號</h3>
      <p><strong>${state.profile?.display_name || state.user?.email || ""}</strong></p>
      <p class="hint">${state.user?.email || ""}</p>
      <p class="hint">目前身分：${state.profile?.role === "admin" ? "管理者" : "一般使用者"}</p>
      <p class="hint">存檔權限：${state.profile?.save_permission || "owner_write"}</p>
      <div class="inline-actions">
        <button class="primary" type="button" id="enter-game">進入遊戲</button>
        <button class="secondary" type="button" id="do-logout">登出</button>
      </div>
    </div>
  `);
  document.querySelector("#enter-game").addEventListener("click", () => {
    window.location.href = "./index.html";
  });
  document.querySelector("#do-logout").addEventListener("click", async () => {
    await state.client.auth.signOut();
    state.session = null;
    state.user = null;
    state.profile = null;
    renderForm(mode);
  });
}

function renderForm(viewMode = "login") {
  const isLogin = viewMode === "login";
  setView(`
    <div class="auth-card">
      <h3>${isLogin ? "帳號登入" : "建立帳號"}</h3>
      <p class="hint">${isLogin ? "登入後即可讀取自己的角色與雲端存檔。" : "建立新帳號後，就能用相同信箱與密碼登入遊戲。"} </p>
      <div class="spacer"></div>
      <label>電子郵件</label>
      <input type="email" id="auth-email" placeholder="name@example.com">
      ${isLogin ? "" : `<label>顯示名稱</label><input type="text" id="auth-display-name" placeholder="玩家暱稱">`}
      <label>密碼</label>
      <input type="password" id="auth-password" placeholder="至少 6 碼">
      <div class="spacer"></div>
      <div class="inline-actions">
        <button class="primary" type="button" id="auth-submit">${isLogin ? "登入" : "註冊"}</button>
        <button class="secondary" type="button" id="auth-switch">${isLogin ? "前往註冊" : "前往登入"}</button>
        <button class="secondary" type="button" id="back-home">返回遊戲</button>
      </div>
      <p class="hint" id="auth-message"></p>
    </div>
  `);

  document.querySelector("#back-home").addEventListener("click", () => {
    window.location.href = "./index.html";
  });
  document.querySelector("#auth-switch").addEventListener("click", () => {
    const next = isLogin ? "register" : "login";
    window.location.href = `./login.html?mode=${next}`;
  });
  document.querySelector("#auth-submit").addEventListener("click", async () => {
    const email = document.querySelector("#auth-email").value.trim();
    const password = document.querySelector("#auth-password").value.trim();
    const displayName = document.querySelector("#auth-display-name")?.value.trim() || "";
    const message = document.querySelector("#auth-message");
    if (!email || !password) {
      message.textContent = "請輸入電子郵件與密碼。";
      return;
    }

    if (isLogin) {
      const { error } = await state.client.auth.signInWithPassword({ email, password });
      if (error) {
        message.textContent = error.message;
        return;
      }
      await hydrateSession();
      renderLoggedIn();
      return;
    }

    const { error } = await state.client.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
    if (error) {
      message.textContent = error.message;
      return;
    }
    message.textContent = "註冊成功。若 Supabase 有啟用信箱驗證，請先驗證後再登入。";
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
  if (state.user) {
    renderLoggedIn();
    return;
  }
  renderForm(mode);
}

init();
