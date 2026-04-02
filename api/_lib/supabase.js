const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAILS = String(process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(value => value.trim().toLowerCase())
  .filter(Boolean);

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function isAuthConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY);
}

function authHeader(req) {
  return req.headers.authorization || req.headers.Authorization || "";
}

function bearerToken(req) {
  const header = authHeader(req);
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

async function supabaseRest(path, options = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

async function supabaseAuth(path, options = {}) {
  return fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

async function getUserFromRequest(req) {
  const token = bearerToken(req);
  if (!token || !isAuthConfigured()) return null;
  const response = await supabaseAuth("user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;
  return response.json();
}

async function fetchProfileByUserId(userId) {
  const response = await supabaseRest(
    `user_profiles?user_id=eq.${encodeURIComponent(userId)}&select=user_id,email,display_name,role,save_permission,updated_at`
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0] || null;
}

async function upsertProfileFromUser(user) {
  const existing = await fetchProfileByUserId(user.id);
  const role = existing?.role || (ADMIN_EMAILS.includes(String(user.email || "").toLowerCase()) ? "admin" : "user");
  const savePermission = existing?.save_permission || "owner_write";
  const displayName = existing?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "";
  const response = await supabaseRest("user_profiles?on_conflict=user_id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify([{
      user_id: user.id,
      email: user.email,
      display_name: displayName,
      role,
      save_permission: savePermission,
    }]),
  });
  if (!response.ok) return existing;
  const rows = await response.json();
  return rows[0] || existing || null;
}

async function requireUser(req, res) {
  if (!isAuthConfigured()) {
    json(res, 503, { error: "supabase_auth_not_configured" });
    return null;
  }
  const user = await getUserFromRequest(req);
  if (!user) {
    json(res, 401, { error: "unauthorized" });
    return null;
  }
  const profile = await upsertProfileFromUser(user);
  return { user, profile };
}

async function requireAdmin(req, res) {
  const auth = await requireUser(req, res);
  if (!auth) return null;
  if (auth.profile?.role !== "admin") {
    json(res, 403, { error: "admin_required" });
    return null;
  }
  return auth;
}

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  json,
  cors,
  isConfigured,
  isAuthConfigured,
  supabaseRest,
  supabaseAuth,
  getUserFromRequest,
  fetchProfileByUserId,
  upsertProfileFromUser,
  requireUser,
  requireAdmin,
};
