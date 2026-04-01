const {
  json,
  cors,
  isConfigured,
  isAuthConfigured,
  requireUser,
  supabaseRest,
} = require("./_lib/supabase");

function sanitizePlayer(player) {
  if (!player || typeof player !== "object") return null;
  return player;
}

function canWrite(profile) {
  return profile?.role === "admin" || profile?.save_permission === "owner_write";
}

function buildSaveId(userId, player) {
  return `${userId}:${player.cloudSaveId || player.id || player.name || "save"}`;
}

module.exports = async (req, res) => {
  cors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "GET" && req.query?.mode === "status") {
    return json(res, 200, {
      enabled: isConfigured(),
      authEnabled: isAuthConfigured(),
    });
  }

  if (!isConfigured()) {
    return json(res, 200, { enabled: false, players: [] });
  }

  const auth = await requireUser(req, res);
  if (!auth) return;

  if (req.method === "GET") {
    const isAdmin = auth.profile?.role === "admin";
    const query = isAdmin && req.query?.scope === "all"
      ? "game_saves?select=save_id,owner_id,player_name,player_data,updated_at&order=updated_at.desc"
      : `game_saves?owner_id=eq.${encodeURIComponent(auth.user.id)}&select=save_id,owner_id,player_name,player_data,updated_at&order=updated_at.desc`;

    const response = await supabaseRest(query);
    if (!response.ok) {
      return json(res, response.status, { error: "supabase_read_failed" });
    }
    const rows = await response.json();
    return json(res, 200, {
      enabled: true,
      players: rows
        .map(row => row.player_data)
        .filter(player => player && typeof player === "object"),
    });
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const player = sanitizePlayer(body.player);
    if (!player) {
      return json(res, 400, { error: "invalid_player" });
    }
    if (!canWrite(auth.profile)) {
      return json(res, 403, { error: "save_permission_denied", savePermission: auth.profile?.save_permission || "unknown" });
    }

    const response = await supabaseRest("game_saves?on_conflict=save_id", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          save_id: buildSaveId(auth.user.id, player),
          owner_id: auth.user.id,
          player_name: String(player.name || "未命名角色"),
          player_data: player,
          save_permission: auth.profile?.save_permission || "owner_write",
        },
      ]),
    });

    if (!response.ok) {
      const text = await response.text();
      return json(res, response.status, { error: "supabase_write_failed", detail: text });
    }

    return json(res, 200, { ok: true, enabled: true });
  }

  return json(res, 405, { error: "method_not_allowed" });
};
