const {
  json,
  cors,
  requireAdmin,
  supabaseRest,
} = require("./_lib/supabase");

function sanitizePlayer(player) {
  if (!player || typeof player !== "object" || Array.isArray(player)) return null;
  return player;
}

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
      "game_saves?select=save_id,owner_id,player_name,save_permission,updated_at,player_data&order=updated_at.desc"
    );
    if (!response.ok) {
      json(res, response.status, { error: "saves_read_failed" });
      return;
    }
    const saves = await response.json();
    json(res, 200, { saves });
    return;
  }

  if (req.method === "PATCH") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { saveId, player, savePermission } = body;
    const cleanPlayer = sanitizePlayer(player);
    if (!saveId || !cleanPlayer) {
      json(res, 400, { error: "missing_save_id_or_player" });
      return;
    }

    const patch = {
      player_name: String(cleanPlayer.name || "未命名角色"),
      player_data: cleanPlayer,
    };
    if (["owner_write", "read_only", "admin_only"].includes(savePermission)) {
      patch.save_permission = savePermission;
    }

    const response = await supabaseRest(`game_saves?save_id=eq.${encodeURIComponent(saveId)}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      const detail = await response.text();
      json(res, response.status, { error: "saves_update_failed", detail });
      return;
    }
    const rows = await response.json();
    json(res, 200, { save: rows[0] || null });
    return;
  }

  if (req.method === "DELETE") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const saveId = req.query?.saveId || body.saveId;
    if (!saveId) {
      json(res, 400, { error: "missing_save_id" });
      return;
    }
    const response = await supabaseRest(`game_saves?save_id=eq.${encodeURIComponent(saveId)}`, {
      method: "DELETE",
      headers: {
        Prefer: "return=representation",
      },
    });
    if (!response.ok) {
      const detail = await response.text();
      json(res, response.status, { error: "saves_delete_failed", detail });
      return;
    }
    json(res, 200, { ok: true });
    return;
  }

  json(res, 405, { error: "method_not_allowed" });
};
