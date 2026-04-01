const { json, cors, requireUser } = require("./_lib/supabase");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const auth = await requireUser(req, res);
  if (!auth) return;

  json(res, 200, {
    user: {
      id: auth.user.id,
      email: auth.user.email,
    },
    profile: auth.profile,
  });
};
