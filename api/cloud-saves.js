const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseFetch(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return response;
}

function sanitizePlayer(player) {
  if (!player || typeof player !== "object") return null;
  return player;
}

module.exports = async (req, res) => {
  cors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === "GET" && req.query?.mode === "status") {
    return json(res, 200, { enabled: isConfigured() });
  }

  if (!isConfigured()) {
    return json(res, 200, { enabled: false, players: [] });
  }

  if (req.method === "GET") {
    const response = await supabaseFetch(
      "game_saves?select=save_id,player_name,player_data,updated_at&order=updated_at.desc"
    );
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
    const saveId = player.cloudSaveId || player.id || player.name;
    if (!saveId) {
      return json(res, 400, { error: "missing_save_id" });
    }

    const response = await supabaseFetch("game_saves?on_conflict=save_id", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          save_id: String(saveId),
          player_name: String(player.name || "未命名角色"),
          player_data: player,
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
