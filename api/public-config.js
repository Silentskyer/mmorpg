const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  json,
  cors,
  isAuthConfigured,
  isConfigured,
} = require("./_lib/supabase");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  json(res, 200, {
    authEnabled: isAuthConfigured(),
    cloudEnabled: isConfigured(),
    supabaseUrl: isAuthConfigured() ? SUPABASE_URL : "",
    supabaseAnonKey: isAuthConfigured() ? SUPABASE_ANON_KEY : "",
  });
};
