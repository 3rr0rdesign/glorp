import { createClient } from "npm:@supabase/supabase-js@2";

const MAX_BODY_BYTES = 8_192;
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function getSecretKey() {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;

  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!keys) return "";

  try {
    const parsed = JSON.parse(keys) as Record<string, string>;
    return parsed.default ?? Object.values(parsed)[0] ?? "";
  } catch {
    return "";
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return json(405, { ok: false, message: "Method not allowed." });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return json(415, { ok: false, message: "JSON only." });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, message: "Request too large." });
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, message: "Request too large." });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, message: "Invalid JSON." });
  }

  const wallet = String(payload.wallet ?? "").trim().toLowerCase();
  const twitterHandle = String(payload.twitterHandle ?? "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();

  if (!/^0x[0-9a-f]{40}$/.test(wallet)) {
    return json(400, { ok: false, message: "Invalid EVM wallet." });
  }

  if (!/^[a-z0-9_]{1,15}$/.test(twitterHandle)) {
    return json(400, { ok: false, message: "Invalid X handle." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const secretKey = getSecretKey();
  if (!supabaseUrl || !secretKey) {
    console.error("Missing Supabase server configuration.");
    return json(500, { ok: false, message: "Server is not configured." });
  }

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: walletMatches, error: walletLookupError } = await admin
    .from("glorp_transmissions")
    .select("id, twitter_handle")
    .eq("wallet", wallet)
    .limit(1);

  if (walletLookupError) {
    console.error("Wallet lookup failed", { code: walletLookupError.code });
    return json(500, { ok: false, message: "Signal failed. Try again." });
  }

  const existingWallet = walletMatches?.[0];
  if (existingWallet) {
    if (existingWallet.twitter_handle === twitterHandle) {
      return json(200, {
        ok: true,
        alreadySubmitted: true,
        transmissionId: existingWallet.id,
      });
    }

    return json(409, {
      ok: false,
      code: "WALLET_EXISTS",
      message: "That wallet already transmitted.",
    });
  }

  const { data: twitterMatches, error: twitterLookupError } = await admin
    .from("glorp_transmissions")
    .select("id")
    .eq("twitter_handle", twitterHandle)
    .limit(1);

  if (twitterLookupError) {
    console.error("X handle lookup failed", { code: twitterLookupError.code });
    return json(500, { ok: false, message: "Signal failed. Try again." });
  }

  if (twitterMatches && twitterMatches.length > 0) {
    return json(409, {
      ok: false,
      code: "TWITTER_EXISTS",
      message: "That X account already transmitted.",
    });
  }

  const { data, error } = await admin.rpc("submit_glorp_transmission", {
    p_wallet: wallet,
    p_twitter_handle: twitterHandle,
  });

  if (error) {
    if (error.code === "23505") {
      const duplicateReason = [error.message, error.details, error.hint]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (duplicateReason.includes("twitter_exists")
        || duplicateReason.includes("glorp_twitter_unique")) {
        return json(409, {
          ok: false,
          code: "TWITTER_EXISTS",
          message: "That X account already transmitted.",
        });
      }

      const { data: existing } = await admin
        .from("glorp_transmissions")
        .select("id, twitter_handle")
        .eq("wallet", wallet)
        .maybeSingle();

      if (existing && existing.twitter_handle === twitterHandle) {
        return json(200, {
          ok: true,
          alreadySubmitted: true,
          transmissionId: existing.id,
        });
      }

      return json(409, {
        ok: false,
        code: "WALLET_EXISTS",
        message: "That wallet already transmitted.",
      });
    }

    console.error("Transmission insert failed", { code: error.code });
    return json(500, { ok: false, message: "Signal failed. Try again." });
  }

  return json(201, { ok: true, transmissionId: data });
});
