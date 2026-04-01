const {
  json,
  cors,
  requireAdmin,
  supabaseRest,
} = require("./_lib/supabase");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const auth = await requireAdmin(req, res);
  if (!auth) return;

  if (req.method === "GET") {
    const response = await supabaseRest(
      "user_profiles?select=user_id,email,display_name,role,save_permission,updated_at&order=updated_at.desc"
    );
    if (!response.ok) {
      json(res, response.status, { error: "profiles_read_failed" });
      return;
    }
    json(res, 200, { users: await response.json() });
    return;
  }

  if (req.method === "PATCH") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { userId, role, savePermission } = body;
    if (!userId) {
      json(res, 400, { error: "missing_user_id" });
      return;
    }
    const patch = {};
    if (["user", "admin"].includes(role)) patch.role = role;
    if (["owner_write", "read_only", "admin_only"].includes(savePermission)) patch.save_permission = savePermission;
    const response = await supabaseRest(`user_profiles?user_id=eq.${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      const detail = await response.text();
      json(res, response.status, { error: "profiles_update_failed", detail });
      return;
    }
    const rows = await response.json();
    json(res, 200, { user: rows[0] || null });
    return;
  }

  json(res, 405, { error: "method_not_allowed" });
};
