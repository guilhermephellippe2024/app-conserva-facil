import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function keyFromDictionary(name: string) {
  const raw = Deno.env.get(name);
  if (!raw) return null;
  const keys = JSON.parse(raw) as Record<string, string>;
  return keys.default ?? Object.values(keys)[0] ?? null;
}

function publishableKey() {
  return keyFromDictionary("SUPABASE_PUBLISHABLE_KEYS") ?? requiredEnv("SUPABASE_ANON_KEY");
}

function secretKey() {
  return keyFromDictionary("SUPABASE_SECRET_KEYS") ?? requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

function adminClient() {
  return createClient(requiredEnv("SUPABASE_URL"), secretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function authenticatedUser(request: Request) {
  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;

  const client = createClient(requiredEnv("SUPABASE_URL"), publishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user;
}

const guaranteeDuration = 7 * 24 * 60 * 60 * 1000;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const user = await authenticatedUser(request);
    if (!user?.email) return json({ error: "Faça login novamente para continuar." }, 401);

    const payload = await request.json().catch(() => ({})) as { reason?: unknown };
    const reason = typeof payload.reason === "string" ? payload.reason.trim() : "";
    if (reason.length < 3 || reason.length > 1000) {
      return json({ error: "Informe o motivo do reembolso." }, 400);
    }

    const admin = adminClient();
    const { data: entitlement, error: entitlementError } = await admin
      .from("entitlements")
      .select("id, cakto_order_id, granted_at, status")
      .eq("customer_email", user.email.toLowerCase())
      .eq("status", "active")
      .order("granted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (entitlementError) throw entitlementError;
    if (!entitlement) return json({ error: "Não encontramos uma assinatura ativa para este e-mail." }, 404);

    const deadline = new Date(entitlement.granted_at).getTime() + guaranteeDuration;
    if (Date.now() > deadline) {
      return json({ error: "O prazo de 7 dias para reembolso foi encerrado." }, 422);
    }

    const { data: existing } = await admin
      .from("refund_requests")
      .select("status, requested_at")
      .eq("entitlement_id", entitlement.id)
      .maybeSingle();

    if (existing) {
      return json({ error: "O reembolso desta compra já foi solicitado.", request: existing }, 409);
    }

    const { data, error } = await admin
      .from("refund_requests")
      .insert({
        user_id: user.id,
        entitlement_id: entitlement.id,
        cakto_order_id: entitlement.cakto_order_id,
        reason,
      })
      .select("status, requested_at")
      .single();

    if (error) throw error;
    return json({ message: "Pedido de reembolso registrado.", request: data }, 201);
  } catch (error) {
    console.error("request-refund", error);
    return json({ error: "Não foi possível registrar o pedido de reembolso." }, 500);
  }
});
